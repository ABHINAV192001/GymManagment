package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.StaffProfile;
import com.Gym.GymCommonServices.entity.MemberProfile;
import com.Gym.GymCommonServices.entity.RbacRole;
import com.Gym.GymCommonServices.entity.RbacPermission;
import com.Gym.GymCommonServices.util.UsernameGenerator;
import com.gymbross.usermanagement.dto.AuthDtos.*;
import com.gymbross.usermanagement.dto.RegisterPremiumUserDto;
import com.gymbross.usermanagement.dto.RegisterStaffDto;
import com.gymbross.usermanagement.dto.RegisterTrainerDto;
import com.gymbross.usermanagement.dto.RegisterUserDto;
import com.gymbross.usermanagement.entity.RefreshToken;
import com.Gym.GymCommonServices.exception.DuplicateResourceException;
import com.Gym.GymCommonServices.exception.ResourceNotFoundException;
import com.Gym.GymCommonServices.exception.UnauthorizedException;
import com.gymbross.usermanagement.repository.*;
import com.Gym.GymCommonServices.security.TokenRevocationService;
import com.Gym.GymCommonServices.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsService userDetailsService;
    private final RbacRoleRepository rbacRoleRepository;
    private final RbacService rbacService;
    private final TokenRevocationService tokenRevocationService;
    private final jakarta.persistence.EntityManager entityManager;
    private final AuditLogService auditLogService;
    private final com.Gym.GymCommonServices.service.WhatsAppService whatsAppService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public RegisterResponse registerOrganization(RegisterRequest request) {
        log.info("Registering organization: {}", request.getName());
        String orgCode = "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String orgUsername = UsernameGenerator.generateOrganizationUsername(request.getName());

        if (organizationRepository.existsByOwnerEmail(request.getOwnerEmail())) {
            throw new DuplicateResourceException("Organization with this email already exists");
        }

        Organization organization = Organization.builder()
                .name(request.getName())
                .ownerEmail(request.getOwnerEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .orgCode(orgCode)
                .username(orgUsername)
                .isActive(false)
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .state(request.getState())
                .city(request.getCity())
                .pincode(request.getPincode())
                .gst(request.getGst())
                .ownerName(request.getOwnerName())
                .pan(request.getPan())
                .ownerContactEmail(request.getOwnerContactEmail())
                .phone(request.getPhone())
                .build();
        organization = organizationRepository.save(organization);

        User orgAdmin = User.builder()
                .name(request.getOwnerName())
                .email(request.getOwnerEmail())
                .username(UsernameGenerator.generateUserUsername(request.getOwnerEmail().split("@")[0]))
                .passwordHash(organization.getPasswordHash())
                .organization(organization)
                .branch(null)
                .userCode("ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .isActive(false)
                .build();
        
        // Seed ORG_ADMIN role with all permissions for the new organization
        com.gymbross.usermanagement.entity.RbacRole orgAdminRole = com.gymbross.usermanagement.entity.RbacRole.builder()
                .name("ORG_ADMIN")
                .orgId(organization.getId())
                .isActive(true)
                .isDeleted(false)
                .build();
        orgAdminRole = rbacService.createRole(orgAdminRole, organization.getId());
        rbacService.setRolePermissions(orgAdminRole.getId(), rbacService.getAllAvailablePermissions(), organization.getId());

        // Seed EMPLOYEE role with zero permissions for the new organization
        com.gymbross.usermanagement.entity.RbacRole employeeRole = com.gymbross.usermanagement.entity.RbacRole.builder()
                .name("EMPLOYEE")
                .orgId(organization.getId())
                .isActive(true)
                .isDeleted(false)
                .build();
        employeeRole = rbacService.createRole(employeeRole, organization.getId());
        rbacService.setRolePermissions(employeeRole.getId(), java.util.Collections.emptySet(), organization.getId());

        // Link the owner to the ORG_ADMIN role so their JWT carries the role and all permissions
        assignRoleToUser(orgAdmin, orgAdminRole.getId());
        userRepository.save(orgAdmin);

        otpService.sendOtp(request.getOwnerEmail(), request.getPhone(), "REGISTER");

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            whatsAppService.sendAccountCreatedNotification(
                    request.getPhone(),
                    request.getOwnerName(),
                    request.getOwnerEmail(),
                    null,
                    "ORGANIZATION_ADMIN"
            );
        }

        return RegisterResponse.builder()
                .message("Organization registered successfully. Check email and WhatsApp for OTP.")
                .organizationId(organization.getId())
                .organizationCode(orgCode)
                .build();
    }

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final java.time.Duration LOCKOUT_DURATION = java.time.Duration.ofMinutes(15);

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for identifier: {}", request.getIdentifier());
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getIdentifier());

            if (userDetails instanceof com.Gym.GymCommonServices.common.AuthenticatablePrincipal principal
                    && principal.isCurrentlyLocked()) {
                throw new UnauthorizedException("Account temporarily locked due to repeated failed login attempts. Try again later.");
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userDetails.getUsername(), request.getPassword())
            );

            recordLoginOutcome(userDetails, true);

            if (userDetails instanceof User user) {
                auditLogService.logAction(user.getId(), user.getOrganization() != null ? user.getOrganization().getId() : null, 
                        "USER_LOGIN", "User logged in successfully");
            }

            Map<String, Object> claims = generateClaims(userDetails);
            String accessToken = jwtUtil.generateToken(claims, userDetails);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());

            return buildAuthResponse(userDetails, claims, accessToken, refreshToken.getToken());
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new UnauthorizedException("Account temporarily locked due to repeated failed login attempts. Try again later.");
        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new UnauthorizedException("Please verify your account (check your email/OTP) before logging in.");
        } catch (BadCredentialsException e) {
            try {
                recordLoginOutcome(userDetailsService.loadUserByUsername(request.getIdentifier()), false);
            } catch (Exception lookupFailure) {
                log.debug("Could not record failed login attempt: {}", lookupFailure.getMessage());
            }
            throw new UnauthorizedException("Invalid username or password");
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new UnauthorizedException("Invalid username or password");
        }
    }

    public AuthResponse refreshAccessToken(TokenRefreshRequest request) {
        log.info("Refreshing access token");
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(refreshToken -> {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(refreshToken.getUserEmail());
                    Map<String, Object> claims = generateClaims(userDetails);
                    String accessToken = jwtUtil.generateToken(claims, userDetails);
                    
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());
                    
                    return buildAuthResponse(userDetails, claims, accessToken, newRefreshToken.getToken());
                })
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
    }

    @Transactional
    public void logout(String email, String accessToken) {
        log.info("Logging out user: {}", email);
        refreshTokenService.deleteByUserEmail(email);
        if (accessToken != null) {
            try {
                tokenRevocationService.revoke(jwtUtil.extractJti(accessToken), jwtUtil.extractExpirationInstant(accessToken));
            } catch (Exception e) {
                log.debug("Logout: could not parse access token for revocation: {}", e.getMessage());
            }
        }
    }

    public void verifyEmailOtp(String email, String otpCode) {
        otpService.verifyOtp(email, otpCode, "REGISTER");
    }

    public void resendOtp(ResendOtpRequest request) {
        log.info("Resending OTP for: {}", request.getEmail());
        String otpType = request.getOtpType() != null ? request.getOtpType() : "REGISTER";
        otpService.sendOtp(request.getEmail(), request.getPhone(), otpType);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Initiating forgot password for: {}", request.getEmail());
        boolean exists = userRepository.existsByEmailIgnoreCase(request.getEmail());

        if (exists) {
            otpService.sendOtp(request.getEmail(), null, "FORGOT_PASSWORD");
        } else {
            throw new ResourceNotFoundException("No account found with this email");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        validatePasswordStrength(request.getNewPassword());
        otpService.verifyOtp(request.getEmail(), request.getOtp(), "FORGOT_PASSWORD");
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email"));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public String registerUser(RegisterUserDto request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        User user = User.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .gender(request.getGender())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .userCode(UsernameGenerator.generateCode("USR"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .isActive(false).isDeleted(false).build();

        assignDefaultUserRole(user);
        userRepository.save(user);
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER");
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            whatsAppService.sendAccountCreatedNotification(request.getPhone(), request.getName(), request.getEmail(), null, "MEMBER");
        }
        return "User registered successfully";
    }

    @Transactional
    public String registerTrainer(RegisterTrainerDto request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) throw new DuplicateResourceException("Email already exists");
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        User trainer = User.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .userCode(UsernameGenerator.generateCode("TRN"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .isActive(false).isDeleted(false).build();

        StaffProfile profile = StaffProfile.builder()
                .user(trainer)
                .userId(trainer.getId())
                .isPersonalTrainer(true)
                .build();
        trainer.setStaffProfile(profile);

        userRepository.save(trainer);
        // We omit the adminCode part for invite link right now
        String inviteLink = frontendUrl + "/auth/register/join?u=" + trainer.getUserCode() + "&ref=Unknown&role=TRAINER";
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            whatsAppService.sendAccountCreatedNotification(request.getPhone(), request.getName(), request.getEmail(), inviteLink, "TRAINER");
        }
        return "User registered successfully";
    }

    @Transactional
    public String registerStaff(RegisterStaffDto request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) throw new DuplicateResourceException("Email already exists");
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        User staff = User.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .userCode(UsernameGenerator.generateCode("STF"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .isActive(false).isDeleted(false).build();

        StaffProfile profile = StaffProfile.builder()
                .user(staff)
                .userId(staff.getId())
                .isPersonalTrainer(false)
                .build();
        staff.setStaffProfile(profile);

        userRepository.save(staff);
        String inviteLink = frontendUrl + "/auth/register/join?u=" + staff.getUserCode() + "&ref=Unknown&role=STAFF";
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            whatsAppService.sendAccountCreatedNotification(request.getPhone(), request.getName(), request.getEmail(), inviteLink, "STAFF");
        }
        return "User registered successfully";
    }

    @Transactional
    public String registerPremiumUser(RegisterPremiumUserDto request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) throw new DuplicateResourceException("Email already exists");
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        User pu = User.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .gender(request.getGender())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .userCode(UsernameGenerator.generateCode("PRM"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .isActive(true).isEmailVerified(false).build();

        MemberProfile profile = MemberProfile.builder()
                .user(pu)
                .userId(pu.getId())
                .build();
        pu.setMemberProfile(profile);

        assignDefaultUserRole(pu);
        userRepository.save(pu);
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER");
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            whatsAppService.sendAccountCreatedNotification(request.getPhone(), request.getName(), request.getEmail(), null, "PREMIUM_MEMBER");
        }
        return "Premium User registered successfully";
    }

    @Transactional
    public String completeRegistration(CompleteRegistrationRequest request) {
        validatePasswordStrength(request.getPassword());
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = null;
        if (request.getUserCode() != null && !request.getUserCode().trim().isEmpty()) {
            user = userRepository.findByUserCode(request.getUserCode().trim()).orElse(null);
        }
        if (user == null && request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user = userRepository.findTopByEmail(request.getEmail().trim()).orElse(null);
        }
        if (user == null && request.getUserCode() != null && request.getUserCode().contains("@")) {
            user = userRepository.findTopByEmail(request.getUserCode().trim()).orElse(null);
        }

        if (user == null) {
            throw new ResourceNotFoundException("User not found for registration verification");
        }

        otpService.verifyOtp(user.getEmail(), request.getOtp(), "REGISTER");
        user.setPasswordHash(encodedPassword);
        user.setIsActive(true);
        user.setIsEmailVerified(true);
        userRepository.save(user);

        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            whatsAppService.sendGeneralNotification(
                    user.getPhone(),
                    "Account Activated Successfully",
                    "Congratulations " + user.getName() + "! Your GYMBROSS account is now fully activated. Log in to start your fitness journey."
            );
        }

        return "Registration completed successfully";
    }

    public static void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (!Character.isWhitespace(c)) hasSpecial = true;
        }

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            throw new IllegalArgumentException("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
        }
    }

    @Transactional
    public String resendInvite(ResendInviteRequest request) {
        User user = userRepository.findByUserCode(request.getUserCode())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String roleStr = user.getRoles().isEmpty() ? "USER" : user.getRoles().iterator().next().getName();
        String inviteLink = frontendUrl + "/auth/register/join?u=" + user.getUserCode() 
                + "&ref=Unknown&role=" + roleStr;
        otpService.sendOtp(user.getEmail(), user.getPhone(), "REGISTER", inviteLink);
        return "Invite email resent successfully";
    }

    private void recordLoginOutcome(UserDetails userDetails, boolean success) {
        if (!(userDetails instanceof com.Gym.GymCommonServices.common.AuthenticatablePrincipal principal)) {
            return;
        }
        if (success) {
            principal.setFailedLoginAttempts(0);
            principal.setLockedUntil(null);
        } else {
            int attempts = principal.getFailedLoginAttempts() + 1;
            principal.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                principal.setLockedUntil(java.time.Instant.now().plus(LOCKOUT_DURATION));
            }
        }
        
        if (userDetails instanceof User user) {
            userRepository.save(user);
        }
    }

    /** Links a user to an RBAC role (roles table) via the user_roles join table. */
    private void assignRoleToUser(User user, java.util.UUID roleId) {
        user.getRoles().add(entityManager.getReference(RbacRole.class, roleId));
    }

    /** Assigns the global default USER role (seeded by V11), if present. */
    private void assignDefaultUserRole(User user) {
        rbacRoleRepository.findByNameAndOrgIdIsNull("USER")
                .ifPresentOrElse(
                        role -> assignRoleToUser(user, role.getId()),
                        () -> log.warn("Global USER role not found; {} registered without a role", user.getEmail()));
    }

    private Map<String, Object> generateClaims(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        String role = "USER";
        java.util.UUID orgId = null;
        java.util.UUID branchId = null;

        if (userDetails instanceof User) {
            User user = (User) userDetails;
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                role = user.getRoles().iterator().next().getName();
            }
            orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
            branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        }

        claims.put("role", role);
        claims.put("organizationId", orgId);
        claims.put("branchId", branchId);

        // Load permissions
        Set<String> permissions = new HashSet<>();
        if ("ORG_ADMIN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role)) {
            permissions.add("*");
        } else if (userDetails instanceof User user) {
            if (user.getRoles() != null) {
                for (RbacRole r : user.getRoles()) {
                    if (r.getPermissions() != null) {
                        for (RbacPermission p : r.getPermissions()) {
                            if (p.getSubModule() != null) {
                                permissions.add(p.getSubModule());
                            }
                        }
                    }
                }
            }
        }
        claims.put("permissions", permissions);

        return claims;
    }

    @SuppressWarnings("unchecked")
    private AuthResponse buildAuthResponse(UserDetails userDetails, Map<String, Object> claims, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .role((String) claims.get("role"))
                .build();
    }
}
