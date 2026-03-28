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
import com.gymbross.usermanagement.dto.AuthDtos.AuthResponse;
import com.gymbross.usermanagement.dto.AuthDtos.BranchRequest;
import com.gymbross.usermanagement.dto.AuthDtos.LoginRequest;
import com.gymbross.usermanagement.dto.AuthDtos.RegisterRequest;
import com.gymbross.usermanagement.dto.AuthDtos.RegisterResponse;
import com.gymbross.usermanagement.dto.RegisterPremiumUserDto;
import com.gymbross.usermanagement.dto.RegisterStaffDto;
import com.gymbross.usermanagement.dto.RegisterTrainerDto;
import com.gymbross.usermanagement.dto.RegisterUserDto;
import com.gymbross.usermanagement.repository.AdminRepository;
import com.gymbross.usermanagement.repository.BranchRepository;
import com.gymbross.usermanagement.repository.OrganizationRepository;
import com.gymbross.usermanagement.repository.PremiumUserRepository;
import com.gymbross.usermanagement.repository.StaffRepository;
import com.gymbross.usermanagement.repository.TrainerRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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

        // ✅ REGISTER ORGANIZATION (NO JWT)
        @Transactional
        public RegisterResponse registerOrganization(RegisterRequest request) {

                String orgCode = "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                String orgUsername = UsernameGenerator.generateOrganizationUsername(request.getName());

                if (organizationRepository.existsByOwnerEmail(request.getOwnerEmail())) {
                        throw new RuntimeException("Organization with this email already exists");
                }
                if (adminRepository.existsByEmail(request.getOwnerEmail())) {
                        throw new RuntimeException("Email already active as Admin");
                }
                if (userRepository.existsByEmail(request.getOwnerEmail())) {
                        throw new RuntimeException("Email already active as User");
                }

                Organization organization = Organization.builder()
                                .name(request.getName())
                                .ownerEmail(request.getOwnerEmail())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .orgCode(orgCode)
                                .username(orgUsername)
                                .build();
                organization = organizationRepository.save(organization);

                // BRANCH
                Branch firstBranch = null;
                if (request.getBranches() != null) {
                        for (BranchRequest br : request.getBranches()) {
                                String branchCode = orgCode + "-BR" +
                                                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

                                Branch branch = Branch.builder()
                                                .branchCode(branchCode)
                                                .name(br.getName())
                                                .adminEmail(br.getAdminEmail())
                                                .passwordHash(passwordEncoder.encode(br.getPassword()))
                                                .organization(organization)
                                                .username(
                                                                UsernameGenerator.generateOrganizationUsername(
                                                                                br.getName()))
                                                .build();
                                branch = branchRepository.save(branch);

                                if (firstBranch == null) {
                                        firstBranch = branch;
                                }

                                Admin branchAdmin = Admin.builder()
                                                .email(br.getAdminEmail())
                                                .username(
                                                                UsernameGenerator.generateUserUsername(
                                                                                br.getAdminEmail().split("@")[0]))
                                                .passwordHash(branch.getPasswordHash())
                                                .role(Role.BRANCH_ADMIN)
                                                .organization(organization)
                                                .branch(branch)
                                                .adminCode("ADM-" + UUID.randomUUID().toString().substring(0, 8))
                                                .build();
                                adminRepository.save(branchAdmin);
                                adminRepository.flush();

                                // Send Verification Link to Branch Admin
                                otpService.sendOtp(br.getAdminEmail(), null, "REGISTER");
                        }
                }

                // ORG ADMIN (Saved after branch to link it)
                if (firstBranch == null) {
                        throw new RuntimeException("At least one branch must be created to register an organization.");
                }

                String adminCode = "ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                String adminUsername = UsernameGenerator.generateUserUsername(
                                request.getOwnerEmail().split("@")[0]);

                Admin orgAdmin = Admin.builder()
                                .email(request.getOwnerEmail())
                                .username(adminUsername)
                                .passwordHash(organization.getPasswordHash())
                                .role(Role.ORG_ADMIN)
                                .organization(organization)
                                .branch(firstBranch) // Link to first branch
                                .adminCode(adminCode)
                                .build();
                adminRepository.save(orgAdmin);
                adminRepository.flush();

                // Send OTP to Org Admin
                otpService.sendOtp(request.getOwnerEmail(), request.getPhone(), "REGISTER");

                return RegisterResponse.builder()
                                .message("Organization registered successfully. Please check your email for OTP verification.")
                                .organizationId(organization.getId())
                                .organizationCode(orgCode)
                                .build();
        }

        // ✅ REGISTER USER
        @Transactional
        @SuppressWarnings("null")
        public String registerUser(RegisterUserDto request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                Organization org = organizationRepository.findById(request.getOrgId())
                                .orElseThrow(() -> new RuntimeException("Organization not found"));
                Branch branch = branchRepository.findById(request.getBranchId())
                                .orElseThrow(() -> new RuntimeException("Branch not found"));

                String userCode = UsernameGenerator.generateCode("USR");
                String username = UsernameGenerator.generateUserUsername(request.getName());

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                // logic if entity allows? No, entity needs object.
                                .organization(org)
                                .branch(branch)
                                .userCode(userCode)
                                .username(username)
                                .role(Role.USER)
                                .startDate(request.getStartDate())
                                .dob(request.getDob())
                                .amountPaid(request.getAmountPaid())
                                .plan(request.getPlan())
                                .isActive(false)
                                .isEmailVerified(false)
                                .isPhoneVerified(false)
                                .isDeleted(false)
                                .build();

                // Find Branch Admin for Referral Code
                String adminCode = "Unknown";
                Admin admin = adminRepository.findTopByBranchId(request.getBranchId()).orElse(null);
                if (admin != null)
                        adminCode = admin.getAdminCode();

                String inviteLink = "http://localhost:3000/auth/register/join?u=" + userCode + "&ref=" + adminCode
                                + "&role=USER";

                userRepository.save(user);
                otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
                return "User registered successfully";
        }

        // ✅ REGISTER TRAINER
        @Transactional
        public String registerTrainer(RegisterTrainerDto request) {
                if (trainerRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                Organization org = organizationRepository.findById(request.getOrgId())
                                .orElseThrow(() -> new RuntimeException("Organization not found"));
                Branch branch = branchRepository.findById(request.getBranchId())
                                .orElseThrow(() -> new RuntimeException("Branch not found"));

                String trainerCode = UsernameGenerator.generateCode("TRN");
                String username = UsernameGenerator.generateUserUsername(request.getName());

                Trainer trainer = Trainer.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .organization(org)
                                .branch(branch)
                                .trainerCode(trainerCode)
                                .username(username)
                                .salary(request.getSalary())
                                .shiftTimings(request.getShiftTimings())
                                .startDate(request.getStartDate())
                                .isPersonalTrainer(request.getIsPersonalTrainer())
                                .isActive(false)
                                .isEmailVerified(false)
                                .isPhoneVerified(false)
                                .isDeleted(false)
                                .build();

                // Find Branch Admin for Referral Code
                String adminCode = "Unknown";
                Admin admin = adminRepository.findTopByBranchId(request.getBranchId()).orElse(null);
                if (admin != null)
                        adminCode = admin.getAdminCode();

                String inviteLink = "http://localhost:3000/auth/register/join?u=" + trainerCode + "&ref=" + adminCode
                                + "&role=TRAINER";

                trainerRepository.save(trainer);
                otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
                return "Trainer registered successfully";
        }

        // ✅ REGISTER STAFF
        @Transactional
        public String registerStaff(RegisterStaffDto request) {
                if (staffRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                Organization org = organizationRepository.findById(request.getOrgId())
                                .orElseThrow(() -> new RuntimeException("Organization not found"));
                Branch branch = branchRepository.findById(request.getBranchId())
                                .orElseThrow(() -> new RuntimeException("Branch not found"));

                String staffCode = UsernameGenerator.generateCode("STF");
                String username = UsernameGenerator.generateUserUsername(request.getName());

                Staff staff = Staff.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .organization(org)
                                .branch(branch)
                                .staffCode(staffCode)
                                .username(username)
                                .salary(request.getSalary())
                                .shiftTimings(request.getShiftTimings())
                                .role(request.getRole() != null ? request.getRole().name() : "CLEANER")
                                .startDate(request.getStartDate())
                                .isActive(false)
                                .isEmailVerified(false)
                                .isPhoneVerified(false)
                                .isDeleted(false)
                                .build();

                // Find Branch Admin for Referral Code
                String adminCode = "Unknown";
                Admin admin = adminRepository.findTopByBranchId(request.getBranchId()).orElse(null);
                if (admin != null)
                        adminCode = admin.getAdminCode();

                String inviteLink = "http://localhost:3000/auth/register/join?u=" + staffCode + "&ref=" + adminCode
                                + "&role=STAFF";

                staffRepository.save(staff);
                otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER", inviteLink);
                return "Staff registered successfully";
        }

        // ✅ REGISTER PREMIUM USER
        @Transactional
        public String registerPremiumUser(RegisterPremiumUserDto request) {
                if (premiumUserRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                Organization org = organizationRepository.findById(request.getOrgId())
                                .orElseThrow(() -> new RuntimeException("Organization not found"));
                Branch branch = branchRepository.findById(request.getBranchId())
                                .orElseThrow(() -> new RuntimeException("Branch not found"));

                Trainer trainer = null;
                if (request.getTrainerId() != null) {
                        trainer = trainerRepository.findById(request.getTrainerId()).orElse(null);
                }

                String premiumCode = UsernameGenerator.generateCode("PRM");
                String username = UsernameGenerator.generateUserUsername(request.getName());

                PremiumUser premiumUser = PremiumUser.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .organization(org)
                                .branch(branch)
                                .premiumCode(premiumCode)
                                .username(username)
                                .plan(request.getPlan())
                                .trainer(trainer)
                                .startDate(request.getStartDate())
                                .isEmailVerified(false)
                                .isPhoneVerified(false)
                                .build();

                premiumUserRepository.save(premiumUser);
                otpService.sendOtp(request.getEmail(), request.getPhone(), "REGISTER");
                return "Premium User registered successfully";
        }

        // ✅ LOGIN (JWT GENERATED HERE)
        public AuthResponse login(LoginRequest request) {

                String identifier = request.getIdentifier(); // Raw input
                System.out.println("@@@ DEBUG: Login Attempt for: '" + identifier + "' @@@");

                String actualUsername;

                UserDetails userDetails;
                Long orgId;
                Long branchId = null;
                Role role;

                // Try Admin (Email, Username, AdminCode, OrgCode)
                // Note: Using findTopByEmailIgnoreCase defined in repository
                Optional<Admin> adminOpt = adminRepository.findTopByEmailIgnoreCase(identifier);
                System.out.println("DEBUG: Admin lookup by emailIgnoreCase (" + identifier + ") found: "
                                + adminOpt.isPresent());

                if (adminOpt.isEmpty()) {
                        adminOpt = adminRepository.findByUsername(identifier);
                        System.out.println("DEBUG: Admin lookup by username found: " + adminOpt.isPresent());
                }
                if (adminOpt.isEmpty()) {
                        adminOpt = adminRepository.findByAdminCode(identifier);
                        System.out.println("DEBUG: Admin lookup by adminCode found: " + adminOpt.isPresent());
                }
                if (adminOpt.isEmpty()) {
                        adminOpt = adminRepository.findByOrganizationOrgCode(identifier);
                        System.out.println("DEBUG: Admin lookup by orgCode found: " + adminOpt.isPresent());
                }

                if (adminOpt.isPresent()) {
                        Admin admin = adminOpt.get();
                        userDetails = admin;
                        actualUsername = admin.getUsername(); // Resolve actual username
                        orgId = admin.getOrganization().getId();
                        if (admin.getBranch() != null) {
                                branchId = admin.getBranch().getId();
                        }
                        role = admin.getRole();
                        System.out.println("DEBUG: Found Admin: " + actualUsername);
                } else {
                        // Try User (Email, Username, UserCode) - Use findTopByEmail for consistency if
                        // identifying by email
                        Optional<User> userOpt = Optional.empty();
                        // For email, use findTop
                        if (identifier.contains("@")) {
                                userOpt = userRepository.findTopByEmailIgnoreCase(identifier);
                                System.out.println("DEBUG: User lookup by emailIgnoreCase (" + identifier + ") found: "
                                                + userOpt.isPresent());
                        }
                        // Fallback or username check
                        if (userOpt.isEmpty()) {
                                userOpt = userRepository.findByUsername(identifier);
                                System.out.println("DEBUG: User lookup by username found: " + userOpt.isPresent());
                        }
                        if (userOpt.isEmpty()) {
                                userOpt = userRepository.findByUserCode(identifier);
                                System.out.println("DEBUG: User lookup by userCode found: " + userOpt.isPresent());
                        }

                        if (userOpt.isPresent()) {
                                User user = userOpt.get();
                                userDetails = user;
                                actualUsername = user.getUsername(); // Resolve actual username
                                orgId = user.getOrganization().getId();
                                branchId = user.getBranch() != null ? user.getBranch().getId() : null;
                                role = user.getRole();
                                System.out.println("DEBUG: Found User: " + actualUsername);
                        } else {
                                // Try Trainer
                                Optional<Trainer> trainerOpt = trainerRepository.findTopByEmailIgnoreCase(identifier);
                                if (trainerOpt.isEmpty()) {
                                        trainerOpt = trainerRepository.findByUsername(identifier);
                                }
                                if (trainerOpt.isEmpty()) {
                                        trainerOpt = trainerRepository.findByTrainerCode(identifier);
                                }

                                if (trainerOpt.isPresent()) {
                                        Trainer trainer = trainerOpt.get();
                                        userDetails = trainer;
                                        actualUsername = trainer.getUsername();
                                        orgId = trainer.getOrganization().getId();
                                        branchId = trainer.getBranch() != null ? trainer.getBranch().getId() : null;
                                        role = Role.TRAINER;
                                        System.out.println("DEBUG: Found Trainer: " + actualUsername);
                                } else {
                                        // Try Staff
                                        Optional<Staff> staffOpt = staffRepository.findTopByEmailIgnoreCase(identifier);
                                        if (staffOpt.isEmpty()) {
                                                staffOpt = staffRepository.findByUsername(identifier);
                                        }
                                        if (staffOpt.isEmpty()) {
                                                staffOpt = staffRepository.findByStaffCode(identifier);
                                        }

                                        if (staffOpt.isPresent()) {
                                                Staff staff = staffOpt.get();
                                                userDetails = staff;
                                                actualUsername = staff.getUsername();
                                                orgId = staff.getOrganization().getId();
                                                branchId = staff.getBranch() != null ? staff.getBranch().getId() : null;
                                                try {
                                                        role = Role.valueOf(staff.getRole().toUpperCase());
                                                } catch (Exception e) {
                                                        role = Role.ADMIN; // Fallback for staff
                                                }
                                                System.out.println("DEBUG: Found Staff: " + actualUsername);
                                        } else {
                                                // Try PremiumUser
                                                Optional<PremiumUser> premiumOpt = premiumUserRepository
                                                                .findTopByEmailIgnoreCase(identifier);
                                                if (premiumOpt.isEmpty()) {
                                                        premiumOpt = premiumUserRepository.findByUsername(identifier);
                                                }
                                                if (premiumOpt.isEmpty()) {
                                                        premiumOpt = premiumUserRepository
                                                                        .findByPremiumCode(identifier);
                                                }

                                                if (premiumOpt.isPresent()) {
                                                        PremiumUser premiumUser = premiumOpt.get();
                                                        userDetails = premiumUser;
                                                        actualUsername = premiumUser.getUsername();
                                                        orgId = premiumUser.getOrganization().getId();
                                                        branchId = premiumUser.getBranch() != null
                                                                        ? premiumUser.getBranch().getId()
                                                                        : null;
                                                        role = Role.PREMIUM_USER;
                                                        System.out.println(
                                                                        "DEBUG: Found PremiumUser: " + actualUsername);
                                                } else {
                                                        System.out.println("@@@ DEBUG: Identifier '" + identifier
                                                                        + "' NOT FOUND in Admin, User, Trainer, Staff, or PremiumUser tables. @@@");
                                                        throw new RuntimeException(
                                                                        "User or Organization not found with identifier: "
                                                                                        + identifier);
                                                }
                                        }
                                }
                        }
                }

                // Authenticate with the RESOLVED username (because loadUserByUsername expects a
                // valid username)
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                actualUsername, request.getPassword()));

                Map<String, Object> claims = new HashMap<>();
                claims.put("role", role.name());
                claims.put("organizationId", orgId);
                if (branchId != null)
                        claims.put("branchId", branchId);

                String token = jwtUtil.generateToken(claims, userDetails);
                System.out.println("AuthService: Generated Token for: " + actualUsername + ", Role: " + role
                                + ", OrgId: " + orgId);

                return AuthResponse.builder()
                                .token(token)
                                .role(role.name())
                                .organizationId(orgId)
                                .branchId(branchId)
                                .isOnboardingCompleted(userDetails instanceof User
                                                ? ((User) userDetails).getIsOnboardingCompleted()
                                                : true)
                                .build();
        }

        public void verifyOrganizationOtp(Long orgId, String otpCode) {
                Organization org = organizationRepository.findById(orgId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));
                otpService.verifyOtp(org.getOwnerEmail(), otpCode, "REGISTER");
        }

        public void resendOrganizationOtp(Long orgId) {
                Organization org = organizationRepository.findById(orgId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));
                otpService.sendOtp(org.getOwnerEmail(), org.getPhone(), "REGISTER");
        }

        // ✅ COMPLETE REGISTRATION (FROM INVITE LINK)
        @Transactional
        public String completeRegistration(
                        com.gymbross.usermanagement.dto.AuthDtos.CompleteRegistrationRequest request) {
                // 1. Verify Admin Code (Referral)
                adminRepository.findByAdminCode(request.getAdminCode())
                                .orElseThrow(() -> new RuntimeException("Invalid Admin/Referral Code"));

                String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
                String encodedPassword = passwordEncoder.encode(request.getPassword());

                if ("USER".equals(role)) {
                        User user = userRepository.findByUserCode(request.getUserCode())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "User not found with code: " + request.getUserCode()));

                        otpService.verifyOtp(user.getEmail(), request.getOtp(), "REGISTER");

                        user.setPasswordHash(encodedPassword);
                        user.setIsActive(true);
                        user.setIsEmailVerified(true);
                        userRepository.save(user);
                        return "User registration completed successfully.";

                } else if ("TRAINER".equals(role)) {
                        Trainer trainer = trainerRepository.findByTrainerCode(request.getUserCode())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Trainer not found with code: " + request.getUserCode()));

                        otpService.verifyOtp(trainer.getEmail(), request.getOtp(), "REGISTER");

                        trainer.setPasswordHash(encodedPassword);
                        trainer.setIsActive(true);
                        trainer.setIsEmailVerified(true);
                        trainerRepository.save(trainer);
                        return "Trainer registration completed successfully.";

                } else if ("STAFF".equals(role)) {
                        Staff staff = staffRepository.findByStaffCode(request.getUserCode())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Staff not found with code: " + request.getUserCode()));

                        otpService.verifyOtp(staff.getEmail(), request.getOtp(), "REGISTER");

                        staff.setPasswordHash(encodedPassword);
                        staff.setIsActive(true);
                        staff.setIsEmailVerified(true);
                        staffRepository.save(staff);
                        return "Staff registration completed successfully.";
                }

                throw new RuntimeException("Invalid Role: " + role);
        }

        // ✅ RESEND INVITE
        @Transactional
        public String resendInvite(com.gymbross.usermanagement.dto.AuthDtos.ResendInviteRequest request) {
                String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
                String email = null;
                String phone = null;
                Long branchId = null;

                if ("USER".equals(role)) {
                        User user = userRepository.findByUserCode(request.getUserCode())
                                        .orElseThrow(() -> new RuntimeException("User not found"));
                        email = user.getEmail();
                        phone = user.getPhone();
                        branchId = user.getBranch() != null ? user.getBranch().getId() : null;
                } else if ("TRAINER".equals(role)) {
                        Trainer trainer = trainerRepository.findByTrainerCode(request.getUserCode())
                                        .orElseThrow(() -> new RuntimeException("Trainer not found"));
                        email = trainer.getEmail();
                        phone = trainer.getPhone();
                        branchId = trainer.getBranch() != null ? trainer.getBranch().getId() : null;
                } else if ("STAFF".equals(role)) {
                        Staff staff = staffRepository.findByStaffCode(request.getUserCode())
                                        .orElseThrow(() -> new RuntimeException("Staff not found"));
                        email = staff.getEmail();
                        phone = staff.getPhone();
                        branchId = staff.getBranch() != null ? staff.getBranch().getId() : null;
                } else {
                        throw new RuntimeException("Invalid Role");
                }

                String adminCode = "Unknown";
                if (branchId != null) {
                        Admin admin = adminRepository.findTopByBranchId(branchId).orElse(null);
                        if (admin != null)
                                adminCode = admin.getAdminCode();
                }

                String inviteLink = "http://localhost:3000/auth/register/join?u=" + request.getUserCode() + "&ref="
                                + adminCode + "&role=" + role;

                otpService.sendOtp(email, phone, "REGISTER", inviteLink);
                return "Invite resent successfully";
        }

        @Transactional
        public void forgotPassword(com.gymbross.usermanagement.dto.AuthDtos.ForgotPasswordRequest request) {
                String email = request.getEmail();
                // Check if user exists in any table
                boolean exists = userRepository.existsByEmailIgnoreCase(email) ||
                                adminRepository.existsByEmailIgnoreCase(email) ||
                                trainerRepository.existsByEmailIgnoreCase(email) ||
                                staffRepository.existsByEmailIgnoreCase(email) ||
                                organizationRepository.existsByOwnerEmailIgnoreCase(email);

                if (!exists) {
                        throw new RuntimeException("No account found with this email");
                }

                // Send FORGOT_PASSWORD OTP
                otpService.sendOtp(email, null, "FORGOT_PASSWORD");
        }

        @Transactional
        public void resetPassword(com.gymbross.usermanagement.dto.AuthDtos.ResetPasswordRequest request) {
                String email = request.getEmail();
                String otp = request.getOtp();
                String newPassword = request.getNewPassword();

                // 1. Verify OTP
                otpService.verifyOtp(email, otp, "FORGOT_PASSWORD");

                // 2. Update Password in all applicable tables
                String encodedPassword = passwordEncoder.encode(newPassword);
                boolean updated = false;

                Optional<User> userOpt = userRepository.findTopByEmailIgnoreCase(email);
                if (userOpt.isPresent()) {
                        userOpt.get().setPasswordHash(encodedPassword);
                        userRepository.save(userOpt.get());
                        updated = true;
                }

                Optional<Admin> adminOpt = adminRepository.findTopByEmailIgnoreCase(email);
                if (adminOpt.isPresent()) {
                        adminOpt.get().setPasswordHash(encodedPassword);
                        adminRepository.save(adminOpt.get());
                        updated = true;
                }

                Optional<Trainer> trainerOpt = trainerRepository.findTopByEmailIgnoreCase(email);
                if (trainerOpt.isPresent()) {
                        trainerOpt.get().setPasswordHash(encodedPassword);
                        trainerRepository.save(trainerOpt.get());
                        updated = true;
                }

                Optional<Staff> staffOpt = staffRepository.findTopByEmailIgnoreCase(email);
                if (staffOpt.isPresent()) {
                        staffOpt.get().setPasswordHash(encodedPassword);
                        staffRepository.save(staffOpt.get());
                        updated = true;
                }

                Optional<Organization> orgOpt = organizationRepository.findTopByOwnerEmailIgnoreCase(email);
                if (orgOpt.isPresent()) {
                        orgOpt.get().setPasswordHash(encodedPassword);
                        organizationRepository.save(orgOpt.get());
                        updated = true;
                }

                if (!updated) {
                        throw new RuntimeException("Failed to reset password. User not found.");
                }
        }
}
