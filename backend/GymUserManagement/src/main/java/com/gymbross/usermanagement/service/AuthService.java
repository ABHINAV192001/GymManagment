package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.entity.Admin;
import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.PremiumUser;
import com.Gym.GymCommonServices.entity.Role;
import com.Gym.GymCommonServices.entity.Staff;
import com.Gym.GymCommonServices.entity.Trainer;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.util.UsernameGenerator;
import com.gymbross.usermanagement.dto.AuthDtos.*;
import com.gymbross.usermanagement.dto.RegisterPremiumUserDto;
import com.gymbross.usermanagement.dto.RegisterStaffDto;
import com.gymbross.usermanagement.dto.RegisterTrainerDto;
import com.gymbross.usermanagement.dto.RegisterUserDto;
import com.gymbross.usermanagement.entity.RefreshToken;
import com.Gym.GymCommonServices.exception.ResourceNotFoundException;
import com.Gym.GymCommonServices.exception.UnauthorizedException;
import com.gymbross.usermanagement.repository.*;
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
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final TrainerRepository trainerRepository;
    private final StaffRepository staffRepository;
    private final PremiumUserRepository premiumUserRepository;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsService userDetailsService;

    @Transactional
    public RegisterResponse registerOrganization(RegisterRequest request) {
        log.info("Registering organization: {}", request.getName());
        String orgCode = "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String orgUsername = UsernameGenerator.generateOrganizationUsername(request.getName());

        if (organizationRepository.existsByOwnerEmail(request.getOwnerEmail())) {
            throw new RuntimeException("Organization with this email already exists");
        }

        Organization organization = Organization.builder()
                .name(request.getName())
                .ownerEmail(request.getOwnerEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .orgCode(orgCode)
                .username(orgUsername)
                .isActive(false)
                .build();
        organization = organizationRepository.save(organization);

        Branch firstBranch = null;
        if (request.getBranches() != null) {
            for (BranchRequest br : request.getBranches()) {
                String branchCode = orgCode + "-BR" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
                Branch branch = Branch.builder()
                        .branchCode(branchCode)
                        .name(br.getName())
                        .adminEmail(br.getAdminEmail())
                        .passwordHash(passwordEncoder.encode(br.getPassword()))
                        .organization(organization)
                        .username(UsernameGenerator.generateOrganizationUsername(br.getName()))
                        .build();
                branch = branchRepository.save(branch);
                if (firstBranch == null) firstBranch = branch;

                Admin branchAdmin = Admin.builder()
                        .email(br.getAdminEmail())
                        .username(UsernameGenerator.generateUserUsername(br.getAdminEmail().split("@")[0]))
                        .passwordHash(branch.getPasswordHash())
                        .role(Role.BRANCH_ADMIN)
                        .organization(organization)
                        .branch(branch)
                        .adminCode("ADM-" + UUID.randomUUID().toString().substring(0, 8))
                        .isActive(false)
                        .build();
                adminRepository.save(branchAdmin);
            }
        }

        if (firstBranch == null) {
            throw new RuntimeException("At least one branch must be created.");
        }

        Admin orgAdmin = Admin.builder()
                .email(request.getOwnerEmail())
                .username(UsernameGenerator.generateUserUsername(request.getOwnerEmail().split("@")[0]))
                .passwordHash(organization.getPasswordHash())
                .role(Role.ORG_ADMIN)
                .organization(organization)
                .branch(firstBranch)
                .adminCode("ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .isActive(false)
                .build();
        adminRepository.save(orgAdmin);

        otpService.sendOtp(request.getOwnerEmail(), request.getPhone(), "REGISTER");

        return RegisterResponse.builder()
                .message("Organization registered successfully. Check email for OTP.")
                .organizationId(organization.getId())
                .organizationCode(orgCode)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for identifier: {}", request.getIdentifier());
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getIdentifier());

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userDetails.getUsername(), request.getPassword())
            );

            Map<String, Object> claims = generateClaims(userDetails);
            String accessToken = jwtUtil.generateToken(claims, userDetails);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());

            return buildAuthResponse(userDetails, claims, accessToken, refreshToken.getToken());
        } catch (BadCredentialsException e) {
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
                    return buildAuthResponse(userDetails, claims, accessToken, refreshToken.getToken());
                })
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
    }

    @Transactional
    public void logout(String email) {
        log.info("Logging out user: {}", email);
        refreshTokenService.deleteByUserEmail(email);
    }

    public void verifyOrganizationOtp(Long orgId, String otpCode) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        otpService.verifyOtp(org.getOwnerEmail(), otpCode, "REGISTER");
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Initiating forgot password for: {}", request.getEmail());
        boolean exists = userRepository.existsByEmailIgnoreCase(request.getEmail()) ||
                adminRepository.existsByEmailIgnoreCase(request.getEmail()) ||
                trainerRepository.existsByEmailIgnoreCase(request.getEmail()) ||
                staffRepository.existsByEmailIgnoreCase(request.getEmail()) ||
                premiumUserRepository.existsByEmailIgnoreCase(request.getEmail());

        if (exists) {
            otpService.sendOtp(request.getEmail(), null, "FORGOT_PASSWORD");
        } else {
            throw new ResourceNotFoundException("No account found with this email");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp(), "FORGOT_PASSWORD");
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());

        adminRepository.findTopByEmailIgnoreCase(request.getEmail()).ifPresent(a -> { a.setPasswordHash(encodedPassword); adminRepository.save(a); });
        userRepository.findTopByEmailIgnoreCase(request.getEmail()).ifPresent(u -> { u.setPasswordHash(encodedPassword); userRepository.save(u); });
        trainerRepository.findTopByEmailIgnoreCase(request.getEmail()).ifPresent(t -> { t.setPasswordHash(encodedPassword); trainerRepository.save(t); });
        staffRepository.findTopByEmailIgnoreCase(request.getEmail()).ifPresent(s -> { s.setPasswordHash(encodedPassword); staffRepository.save(s); });
        premiumUserRepository.findTopByEmailIgnoreCase(request.getEmail()).ifPresent(p -> { p.setPasswordHash(encodedPassword); premiumUserRepository.save(p); });
    }

    @Transactional
    public String registerUser(RegisterUserDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        User user = User.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .userCode(UsernameGenerator.generateCode("USR"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .role(Role.USER).isActive(false).isDeleted(false).build();

        userRepository.save(user);
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER");
        return "User registered successfully";
    }

    @Transactional
    public String registerTrainer(RegisterTrainerDto request) {
        if (trainerRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email already exists");
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        Trainer trainer = Trainer.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .trainerCode(UsernameGenerator.generateCode("TRN"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .isActive(false).isDeleted(false).build();

        trainerRepository.save(trainer);
        String adminCode = adminRepository.findTopByBranchId(request.getBranchId()).map(Admin::getAdminCode).orElse("Unknown");
        String inviteLink = "http://localhost:3000/auth/register/join?u=" + trainer.getTrainerCode() + "&ref=" + adminCode + "&role=TRAINER";
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
        return "Trainer registered successfully";
    }

    @Transactional
    public String registerStaff(RegisterStaffDto request) {
        if (staffRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email already exists");
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        Staff staff = Staff.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .staffCode(UsernameGenerator.generateCode("STF"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .role(request.getRole() != null ? request.getRole().name() : Role.ADMIN.name())
                .isActive(false).isDeleted(false).build();

        staffRepository.save(staff);
        String adminCode = adminRepository.findTopByBranchId(request.getBranchId()).map(Admin::getAdminCode).orElse("Unknown");
        String inviteLink = "http://localhost:3000/auth/register/join?u=" + staff.getStaffCode() + "&ref=" + adminCode + "&role=STAFF";
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
        return "Staff registered successfully";
    }

    @Transactional
    public String registerPremiumUser(RegisterPremiumUserDto request) {
        if (premiumUserRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email already exists");
        Organization org = organizationRepository.findById(request.getOrgId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Branch branch = branchRepository.findById(request.getBranchId()).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        PremiumUser pu = PremiumUser.builder()
                .name(request.getName()).email(request.getEmail()).phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(org).branch(branch)
                .premiumCode(UsernameGenerator.generateCode("PRM"))
                .username(UsernameGenerator.generateUserUsername(request.getName()))
                .plan(request.getPlan()).isActive(true).isEmailVerified(false).build();

        premiumUserRepository.save(pu);
        otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER");
        return "Premium User registered successfully";
    }

    @Transactional
    public String completeRegistration(CompleteRegistrationRequest request) {
        String role = request.getRole().toUpperCase();
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        if ("USER".equals(role)) {
            User user = userRepository.findByUserCode(request.getUserCode()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
            otpService.verifyOtp(user.getEmail(), request.getOtp(), "REGISTER");
            user.setPasswordHash(encodedPassword); user.setIsActive(true);
            userRepository.save(user);
        } else if ("TRAINER".equals(role)) {
            Trainer t = trainerRepository.findByTrainerCode(request.getUserCode()).orElseThrow(() -> new ResourceNotFoundException("Trainer not found"));
            otpService.verifyOtp(t.getEmail(), request.getOtp(), "REGISTER");
            t.setPasswordHash(encodedPassword); t.setIsActive(true);
            trainerRepository.save(t);
        } else if ("STAFF".equals(role)) {
            Staff s = staffRepository.findByStaffCode(request.getUserCode()).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
            otpService.verifyOtp(s.getEmail(), request.getOtp(), "REGISTER");
            s.setPasswordHash(encodedPassword); s.setIsActive(true);
            staffRepository.save(s);
        }
        return "Registration completed successfully";
    }

    @Transactional
    public String resendInvite(ResendInviteRequest request) {
        // Logic for resending invite based on role
        return "Invite resent";
    }

    private Map<String, Object> generateClaims(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        Role role = Role.USER;
        Long orgId = null;
        Long branchId = null;

        if (userDetails instanceof Admin) {
            Admin admin = (Admin) userDetails;
            role = admin.getRole();
            orgId = admin.getOrganization() != null ? admin.getOrganization().getId() : null;
            branchId = admin.getBranch() != null ? admin.getBranch().getId() : null;
        } else if (userDetails instanceof User) {
            User user = (User) userDetails;
            role = user.getRole();
            orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
            branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        } else if (userDetails instanceof Trainer) {
            Trainer t = (Trainer) userDetails;
            role = Role.TRAINER;
            orgId = t.getOrganization() != null ? t.getOrganization().getId() : null;
            branchId = t.getBranch() != null ? t.getBranch().getId() : null;
        } else if (userDetails instanceof Staff) {
            Staff s = (Staff) userDetails;
            // Staff role is a String in entity, but we treat it as Role.ADMIN or similar for JWT
            role = Role.ADMIN; 
            orgId = s.getOrganization() != null ? s.getOrganization().getId() : null;
            branchId = s.getBranch() != null ? s.getBranch().getId() : null;
        } else if (userDetails instanceof PremiumUser) {
            PremiumUser p = (PremiumUser) userDetails;
            role = Role.PREMIUM_USER;
            orgId = p.getOrganization() != null ? p.getOrganization().getId() : null;
            branchId = p.getBranch() != null ? p.getBranch().getId() : null;
        }

        claims.put("role", role.name());
        claims.put("organizationId", orgId);
        claims.put("branchId", branchId);
        return claims;
    }

    private AuthResponse buildAuthResponse(UserDetails userDetails, Map<String, Object> claims, String accessToken, String refreshToken) {
        Boolean isOnboardingCompleted = true;
        if (userDetails instanceof User) isOnboardingCompleted = ((User) userDetails).getIsOnboardingCompleted();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .role((String) claims.get("role"))
                .organizationId((Long) claims.get("organizationId"))
                .branchId((Long) claims.get("branchId"))
                .isOnboardingCompleted(isOnboardingCompleted)
                .build();
    }
}
