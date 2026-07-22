package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.AdminDashboardDtos;
import com.gymbross.usermanagement.repository.OrganizationRepository;
import com.gymbross.usermanagement.repository.BranchRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.AdminService;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.service.OtpService;
import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.Gym.GymCommonServices.security.CurrentTenantResolver;
import com.Gym.GymCommonServices.security.TenantAccessGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

        private final UserRepository userRepository;
                        private final OrganizationRepository organizationRepository;
        private final BranchRepository branchRepository;
                private final OtpService otpService;
        private final TenantAccessGuard tenantAccessGuard;
        private final CurrentTenantResolver currentTenantResolver;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
        private final com.gymbross.usermanagement.repository.RbacRoleRepository rbacRoleRepository;
        @jakarta.persistence.PersistenceContext
        private jakarta.persistence.EntityManager entityManager;

        @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
        private String frontendUrl;

        @Override
        public List<AdminDashboardDtos.UserDetailDto> getAllUsers(java.util.UUID organizationId, java.util.UUID branchId) {
                List<User> users;
                if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                } else {
                        Organization org = organizationRepository.findById(organizationId)
                                        .orElseThrow(() -> new RuntimeException("Organization not found"));
                        users = userRepository.findByOrganizationId(org.getId());
                }

                java.util.UUID currentUserId = null;
                boolean canViewAll = false;
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                        if (auth.getPrincipal() instanceof User) {
                                currentUserId = ((User) auth.getPrincipal()).getId();
                        }
                        canViewAll = auth.getAuthorities().stream()
                                        .anyMatch(a -> a.getAuthority().equals("ORG_ADMIN") || a.getAuthority().equals("ROLE_ORG_ADMIN") || a.getAuthority().equals("USERS:VIEW_ALL"));
                }
                
                final java.util.UUID loggedInUserId = currentUserId;
                final boolean hasFullAccess = canViewAll;

                return users.stream()
                                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                                // This endpoint backs the Members Directory - the org owner (ORG_ADMIN) is
                                // not a gym member and must never appear in this list, even for themselves.
                                .filter(user -> user.getRoles() == null
                                                || user.getRoles().stream().noneMatch(r -> "ORG_ADMIN".equalsIgnoreCase(r.getName())))
                                .filter(user -> hasFullAccess || loggedInUserId == null || loggedInUserId.equals(user.getCreatedBy()) || loggedInUserId.equals(user.getId()))
                                .map(this::mapToUserDetailDto)
                                .collect(Collectors.toList());
        }

        @Override
        public List<AdminDashboardDtos.StaffTrackingDto> getAllStaff(java.util.UUID organizationId, java.util.UUID branchId, java.util.UUID currentUserId) {
                List<User> users;

                if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                } else {
                        Organization org = organizationRepository.findById(organizationId)
                                        .orElseThrow(() -> new RuntimeException("Organization not found"));
                        users = userRepository.findByOrganizationId(org.getId());
                }

                users = users.stream()
                                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                                .filter(u -> u.getStaffProfile() != null || "TRAINER".equalsIgnoreCase(u.getRole()) || "STAFF".equalsIgnoreCase(u.getRole()) || "EMPLOYEE".equalsIgnoreCase(u.getRole()) || "BRANCH_ADMIN".equalsIgnoreCase(u.getRole()))
                                .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                                .collect(Collectors.toList());

                return users.stream().map(this::mapStaffToDto).collect(Collectors.toList());
        }

        // --- USER CRUD ---

        @Override
        public void createUser(AdminDashboardDtos.UserDetailDto userDto, java.util.UUID organizationId, java.util.UUID branchId) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                Branch branch = null;
                if (branchId != null) {
                        // Branch User context
                        branch = branchRepository.findById(branchId)
                                        .orElseThrow(() -> new RuntimeException("Branch not found"));
                } else if (userDto.getBranchId() != null) {
                        // Org User context - specified branch
                        branch = branchRepository.findById(userDto.getBranchId())
                                        .orElseThrow(() -> new RuntimeException("Specified Branch not found"));
                }

                if (userDto.getName() == null && (userDto.getFirstName() != null || userDto.getLastName() != null)) {
                        String fullName = (userDto.getFirstName() != null ? userDto.getFirstName() : "") + " " +
                                        (userDto.getLastName() != null ? userDto.getLastName() : "");
                        userDto.setName(fullName.trim());
                }

                if (userDto.getName() == null) {
                        throw new RuntimeException("User name is required");
                }

                User trainer = null;
                // Prefer User Code for lookup
                if (userDto.getTrainerCode() != null && !userDto.getTrainerCode().trim().isEmpty()) {
                        System.out.println("DEBUG: Looking up trainer by CODE: '" + userDto.getTrainerCode() + "'");
                        trainer = userRepository.findByOrganizationId(org.getId()).stream()
                                        .filter(t -> t.getTrainerCode()
                                                        .equalsIgnoreCase(userDto.getTrainerCode().trim()))
                                        .findFirst()
                                        .orElse(null);
                }
                // Fallback to Name if Code is missing (for backward compatibility or UI quirks)
                else if (userDto.getTrainerName() != null && !userDto.getTrainerName().trim().isEmpty()) {
                        System.out.println("DEBUG: Looking up trainer by NAME: '" + userDto.getTrainerName() + "'");
                        trainer = userRepository.findByOrganizationId(org.getId()).stream()
                                        .filter(t -> t.getName().trim()
                                                        .equalsIgnoreCase(userDto.getTrainerName().trim()))
                                        .findFirst()
                                        .orElse(null);
                }

                if (trainer != null) {
                        System.out.println("DEBUG: User Found: " + trainer.getName() + " ("
                                        + trainer.getTrainerCode() + ")");
                } else {
                        System.out.println("DEBUG: User NOT Found.");
                }

                User user = User.builder()
                                .name(userDto.getName())
                                .email(userDto.getEmail())
                                .phone(userDto.getPhone())
                                .dob(userDto.getDob())
                                .organization(org)
                                .branch(branch)
                                .userCode("USER-" + System.currentTimeMillis())
                                .username(userDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .isActive(true)
                                .isEmailVerified(false)
                                .passwordHash("$2a$10$wN35gE42tD1yH86P8V8K3OlFmYj0.d1rFqR2k06L2Xv6H7F0E5D5m") // Default password: Password123
                                .build();
                user.setAmountPaid(userDto.getAmountPaid());
                user.setAttendanceCount(0);
                user.setStartDate(userDto.getStartDate());
                String requestedRole = (userDto.getRole() != null && !userDto.getRole().trim().isEmpty()) 
                        ? userDto.getRole().trim() 
                        : "EMPLOYEE";
                if ("ORG_ADMIN".equalsIgnoreCase(requestedRole) || "ADMIN".equalsIgnoreCase(requestedRole)) {
                        String userEmail = userDto.getEmail() != null ? userDto.getEmail() : "";
                        String orgEmail = org.getOwnerEmail() != null ? org.getOwnerEmail() : "";
                        if (!userEmail.equalsIgnoreCase(orgEmail)) {
                                throw new IllegalArgumentException("The ORG_ADMIN role is strictly reserved for the registered organization owner email (" + orgEmail + ").");
                        }
                }
                
                com.gymbross.usermanagement.entity.RbacRole rbacRole = rbacRoleRepository
                        .findByNameAndOrgId(requestedRole, org.getId())
                        .or(() -> rbacRoleRepository.findByNameAndOrgIdIsNull(requestedRole))
                        .orElseGet(() -> {
                                return rbacRoleRepository.save(com.gymbross.usermanagement.entity.RbacRole.builder()
                                        .name(requestedRole)
                                        .orgId(org.getId())
                                        .isActive(true)
                                        .isDeleted(false)
                                        .build());
                        });

                user.getRoles().clear();
                user.getRoles().add(entityManager.getReference(com.Gym.GymCommonServices.entity.RbacRole.class, rbacRole.getId()));
                user.setTrainer(trainer);

                if (userDto.getAccessibleBranchIds() != null && !userDto.getAccessibleBranchIds().isEmpty()) {
                        String jsonBranchIds = userDto.getAccessibleBranchIds().stream()
                                        .map(id -> "\"" + id.toString() + "\"")
                                        .collect(Collectors.joining(",", "[", "]"));
                        user.setAccessibleBranchIds(jsonBranchIds);
                }

                if (Boolean.TRUE.equals(userDto.getIsStaff())) {
                        user.setStaffCode("STF-" + System.currentTimeMillis());
                        com.Gym.GymCommonServices.entity.StaffProfile staffProfile = com.Gym.GymCommonServices.entity.StaffProfile.builder()
                                        .user(user)
                                        .salary(userDto.getAmountPaid() != null ? userDto.getAmountPaid() : java.math.BigDecimal.ZERO)
                                        .startDate(userDto.getStartDate() != null ? userDto.getStartDate() : java.time.LocalDate.now())
                                        .build();
                        staffProfile.setOrgId(org.getId());
                        user.setStaffProfile(staffProfile);
                }

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User) {
                        user.setCreatedBy(((User) auth.getPrincipal()).getId());
                }

                userRepository.save(user);

                // Send Invite & OTP Email for verification and password setup
                if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                        String adminCode = "Unknown";
                        if (branch != null) {
                                adminCode = userRepository.findTopByBranchId(branch.getId())
                                                .map(User::getAdminCode).orElse("Unknown");
                        }
                        String inviteLink = frontendUrl + "/auth/register/join?u=" + user.getUserCode() 
                                        + "&ref=" + adminCode + "&role=" + user.getRole()
                                        + "&email=" + java.net.URLEncoder.encode(user.getEmail().trim(), java.nio.charset.StandardCharsets.UTF_8);
                        otpService.sendOtp(user.getEmail().trim(), user.getPhone(), "REGISTER", inviteLink);
                }
        }

        @Override
        public AdminDashboardDtos.UserDetailDto getUserById(java.util.UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);
                return mapToUserDetailDto(user);
        }

        @Override
        public void updateUser(java.util.UUID userId, AdminDashboardDtos.UserDetailDto userDto) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);

                user.setName(userDto.getName());
                user.setEmail(userDto.getEmail());
                user.setPhone(userDto.getPhone());
                user.setDob(userDto.getDob());
                user.setAmountPaid(userDto.getAmountPaid());
                user.setStartDate(userDto.getStartDate());
                user.setAttendanceCount(userDto.getAttendanceCount());
                if (userDto.getAccessibleBranchIds() != null) {
                        String jsonBranchIds = userDto.getAccessibleBranchIds().stream()
                                        .map(id -> "\"" + id.toString() + "\"")
                                        .collect(Collectors.joining(",", "[", "]"));
                        user.setAccessibleBranchIds(jsonBranchIds);
                }
                if (userDto.getRole() != null) {
                        String reqRole = userDto.getRole();
                        if ("ORG_ADMIN".equalsIgnoreCase(reqRole) || "ADMIN".equalsIgnoreCase(reqRole)) {
                                String uEmail = user.getEmail() != null ? user.getEmail() : (userDto.getEmail() != null ? userDto.getEmail() : "");
                                String oEmail = user.getOrganization() != null ? user.getOrganization().getOwnerEmail() : "";
                                if (!uEmail.equalsIgnoreCase(oEmail)) {
                                        throw new IllegalArgumentException("The ORG_ADMIN role is strictly reserved for the registered organization owner email (" + oEmail + ").");
                                }
                        }
                        user.setRole(reqRole);
                }

                // User Lookup: Prefer Code, then Name
                if (userDto.getTrainerCode() != null && !userDto.getTrainerCode().trim().isEmpty()) {
                        System.out.println("DEBUG: Update User - Looking up trainer by CODE: '"
                                        + userDto.getTrainerCode() + "'");
                        User trainer = userRepository.findByOrganizationId(user.getOrganization().getId())
                                        .stream()
                                        .filter(t -> t.getTrainerCode()
                                                        .equalsIgnoreCase(userDto.getTrainerCode().trim()))
                                        .findFirst()
                                        .orElse(null);
                        if (trainer != null) {
                                user.setTrainer(trainer);
                                System.out.println("DEBUG: User assigned via Code: " + trainer.getName());
                        } else {
                                System.out.println("DEBUG: User with Code '" + userDto.getTrainerCode()
                                                + "' NOT found.");
                        }
                } else if (userDto.getTrainerName() != null && !userDto.getTrainerName().trim().isEmpty()) {
                        System.out.println("DEBUG: Update User - Looking up trainer by NAME: '"
                                        + userDto.getTrainerName() + "'");
                        User trainer = userRepository.findByOrganizationId(user.getOrganization().getId())
                                        .stream()
                                        .filter(t -> t.getName().trim()
                                                        .equalsIgnoreCase(userDto.getTrainerName().trim()))
                                        .findFirst()
                                        .orElse(null);
                        if (trainer != null) {
                                user.setTrainer(trainer);
                                System.out.println("DEBUG: User assigned via Name: " + trainer.getName());
                        } else {
                                System.out.println("DEBUG: User with Name '" + userDto.getTrainerName()
                                                + "' NOT found.");
                        }
                } else {
                        // If trainerName is explicitly null or empty, remove the trainer?
                        // Or logic might differ based on requirement. Assuming if not provided, don't
                        // change or if empty clears it.
                        // Given frontend always sends it if hasTrainer, or null if not.
                        // If role is USER (not PREMIUM), probably should clear trainer.
                        if (!"PREMIUM_USER".equals(userDto.getRole())) {
                                user.setTrainer(null);
                        }
                }

                userRepository.save(user);
        }

        @Override
        public void removeUser(java.util.UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);
                user.softDelete();
                user.setIsDeleted(true);
                userRepository.save(user);
        }

        // --- TRAINER CRUD ---

        @Override
        public void createTrainer(AdminDashboardDtos.TrainerDetailDto trainerDto, java.util.UUID organizationId, java.util.UUID branchId) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                Branch branch = null;
                if (branchId != null) {
                        branch = branchRepository.findById(branchId)
                                        .orElseThrow(() -> new RuntimeException("Branch not found"));
                } else if (trainerDto.getBranchId() != null) {
                        branch = branchRepository.findById(trainerDto.getBranchId())
                                        .orElseThrow(() -> new RuntimeException("Specified Branch not found"));
                }

                if (trainerDto.getName() == null
                                && (trainerDto.getFirstName() != null || trainerDto.getLastName() != null)) {
                        String fullName = (trainerDto.getFirstName() != null ? trainerDto.getFirstName() : "") + " " +
                                        (trainerDto.getLastName() != null ? trainerDto.getLastName() : "");
                        trainerDto.setName(fullName.trim());
                }

                if (trainerDto.getName() == null) {
                        throw new RuntimeException("User name is required");
                }

                User trainer = User.builder()
                                .name(trainerDto.getName())
                                .email(trainerDto.getEmail())
                                .phone(trainerDto.getPhone())
                                .organization(org)
                                .branch(branch)
                                .username(trainerDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .build();
                trainer.setShiftTimings(trainerDto.getShiftTimings());
                trainer.setStartDate(trainerDto.getStartDate());
                trainer.setExperience(trainerDto.getExperience());
                trainer.setIsPersonalTrainer(trainerDto.getIsPersonalTrainer());
                trainer.setTrainerCode("TRN-" + System.currentTimeMillis());

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User) {
                        trainer.setCreatedBy(((User) auth.getPrincipal()).getId());
                }

                userRepository.save(trainer);
        }

        @Override
        public AdminDashboardDtos.TrainerDetailDto getTrainerById(java.util.UUID trainerId) {
                User trainer = userRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(trainer);
                return mapToTrainerDetailDto(trainer);
        }

        @Override
        public void updateTrainer(java.util.UUID trainerId, AdminDashboardDtos.TrainerDetailDto trainerDto) {
                User trainer = userRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(trainer);

                trainer.setName(trainerDto.getName());
                trainer.setEmail(trainerDto.getEmail());
                trainer.setPhone(trainerDto.getPhone());
                trainer.setStartDate(trainerDto.getStartDate());
                trainer.setShiftTimings(trainerDto.getShiftTimings());
                trainer.setIsPersonalTrainer(trainerDto.getIsPersonalTrainer());
                trainer.setExperience(trainerDto.getExperience());

                userRepository.save(trainer);
        }

        @Override
        public void removeTrainer(java.util.UUID trainerId) {
                User trainer = userRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(trainer);
                trainer.softDelete();
                trainer.setIsDeleted(true);
                userRepository.save(trainer);
        }

        private void assertCallerOwnsOrgOf(Organization organization) {
                java.util.UUID resourceOrgId = organization != null ? organization.getId() : null;
                tenantAccessGuard.assertOwnedByOrg(resourceOrgId, currentTenantResolver.getOrganizationId());
        }

        /**
         * Same visibility rule as getAllUsers(): ORG_ADMIN (or a role explicitly
         * granted USERS:VIEW_ALL) can access any user in their org; everyone else
         * may only access users they personally created, or themselves. Applies to
         * users, staff, and trainers alike - they're all User rows.
         */
        private void assertCallerCanAccessUser(User user) {
                assertCallerOwnsOrgOf(user.getOrganization());

                java.util.UUID loggedInUserId = null;
                boolean hasFullAccess = false;
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                        if (auth.getPrincipal() instanceof User) {
                                loggedInUserId = ((User) auth.getPrincipal()).getId();
                        }
                        hasFullAccess = auth.getAuthorities().stream()
                                        .anyMatch(a -> a.getAuthority().equals("ORG_ADMIN") || a.getAuthority().equals("ROLE_ORG_ADMIN") || a.getAuthority().equals("USERS:VIEW_ALL"));
                }

                if (hasFullAccess || loggedInUserId == null
                                || loggedInUserId.equals(user.getId()) || loggedInUserId.equals(user.getCreatedBy())) {
                        return;
                }
                throw new RuntimeException("User not found");
        }

        // --- STAFF CRUD ---

        @Override
        public void createStaff(AdminDashboardDtos.StaffDetailDto staffDto, java.util.UUID organizationId, java.util.UUID branchId) {
                System.out.println("DEBUG: createStaff called for: " + staffDto.getName());
                System.out.println("DEBUG: createStaff String received: '" + staffDto.getRole() + "'");

                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                Branch branch = null;
                if (branchId != null) {
                        branch = branchRepository.findById(branchId)
                                        .orElseThrow(() -> new RuntimeException("Branch not found"));
                } else if (staffDto.getBranchId() != null) {
                        branch = branchRepository.findById(staffDto.getBranchId())
                                        .orElseThrow(() -> new RuntimeException("Specified Branch not found"));
                }

                if (staffDto.getName() == null && (staffDto.getFirstName() != null || staffDto.getLastName() != null)) {
                        String fullName = (staffDto.getFirstName() != null ? staffDto.getFirstName() : "") + " " +
                                        (staffDto.getLastName() != null ? staffDto.getLastName() : "");
                        staffDto.setName(fullName.trim());
                }

                if (staffDto.getName() == null) {
                        throw new RuntimeException("User name is required");
                }

                if ("TRAINER".equalsIgnoreCase(staffDto.getRole())) {
                        System.out.println("DEBUG: String matches TRAINER. Redirecting to createTrainer.");
                        AdminDashboardDtos.TrainerDetailDto trainerDto = AdminDashboardDtos.TrainerDetailDto.builder()
                                        .name(staffDto.getName())
                                        .email(staffDto.getEmail())
                                        .phone(staffDto.getPhone())
                                        .startDate(staffDto.getStartDate())
                                        .shiftTimings(staffDto.getShiftTimings())
                                        .isPersonalTrainer(true)
                                        .experience(staffDto.getExperience())
                                        .branchId(branch != null ? branch.getId() : (org != null ? org.getId() : null))
                                        .build();
                        createTrainer(trainerDto, organizationId, branchId);
                        return;
                }

                User staff = User.builder()
                                .name(staffDto.getName())
                                .email(staffDto.getEmail())
                                .phone(staffDto.getPhone())
                                .organization(org)
                                .branch(branch)
                                .username(staffDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .build();
                staff.setShiftTimings(staffDto.getShiftTimings());
                staff.setStartDate(staffDto.getStartDate());
                staff.setExperience(staffDto.getExperience());
                staff.setStaffCode("STF-" + System.currentTimeMillis());

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User) {
                        staff.setCreatedBy(((User) auth.getPrincipal()).getId());
                }

                userRepository.save(staff);
        }

        @Override
        public AdminDashboardDtos.StaffDetailDto getStaffById(java.util.UUID staffId) {
                User staff = userRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(staff);
                return mapToStaffDetailDto(staff);
        }

        @Override
        public void updateStaff(java.util.UUID staffId, AdminDashboardDtos.StaffDetailDto staffDto) {
                User staff = userRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(staff);

                staff.setName(staffDto.getName());
                staff.setEmail(staffDto.getEmail());
                staff.setPhone(staffDto.getPhone());
                staff.setSalary(staffDto.getSalary());
                staff.setStartDate(staffDto.getStartDate());
                staff.setShiftTimings(staffDto.getShiftTimings());
                staff.setExperience(staffDto.getExperience());
                if (staffDto.getRole() != null) {
                        staff.setRole(staffDto.getRole());
                }
                staff.setExperience(staffDto.getExperience());

                userRepository.save(staff);
        }

        @Override
        public void removeStaff(java.util.UUID staffId) {
                User staff = userRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(staff);
                staff.softDelete();
                staff.setIsDeleted(true);
                userRepository.save(staff);
        }

        @Override
        public void assignTrainer(java.util.UUID userId, String trainerName) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);

                // Potential issue: Multiple trainers with same name? Ideally use ID.
                // For now, finding first match in same org.
                User trainer = userRepository.findAll().stream()
                                .filter(t -> t.getName().equalsIgnoreCase(trainerName)
                                                && t.getOrganization().getId().equals(user.getOrganization().getId()))
                                // Enforce same branch if user has branch
                                .filter(t -> user.getBranch() == null || (t.getBranch() != null
                                                && t.getBranch().getId().equals(user.getBranch().getId())))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("User not found: " + trainerName));

                user.setTrainer(trainer);
                userRepository.save(user);
        }

        @Override
        public void updateDietPlan(java.util.UUID userId, List<String> dietDetails) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);

                List<UserDietPlan> plans = dietDetails.stream()
                                .map(food -> UserDietPlan.builder()
                                                .foodName(food)
                                                .user(user)
                                                .build())
                                .collect(Collectors.toList());

                if (user.getDietPlans() != null) {
                        user.getDietPlans().clear();
                        user.getDietPlans().addAll(plans);
                } else {
                        user.setDietPlans(plans);
                }

                userRepository.save(user);
        }

        @Override
        public void updateStaffPaymentStatus(java.util.UUID staffId, String status) {
                User staff = userRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(staff);
                staff.setPaymentStatus(status);
                userRepository.save(staff);
        }

        @Override
        public void updateTrainerPaymentStatus(java.util.UUID trainerId, String status) {
                User trainer = userRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(trainer);
                trainer.setPaymentStatus(status);
                userRepository.save(trainer);
        }

        @Override
        public AdminDashboardDtos.DashboardStatsDto getDashboardStats(java.util.UUID organizationId, java.util.UUID branchId) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                List<User> users;
                List<User> trainers;
                List<User> staff;

                if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                        trainers = userRepository.findByBranchId(branchId);
                        staff = userRepository.findByBranchId(branchId);
                } else {
                        users = userRepository.findByOrganizationId(org.getId());
                        trainers = userRepository.findByOrganizationId(org.getId());
                        staff = userRepository.findByOrganizationId(org.getId());
                }

                // 1. Total Members
                long totalMembers = users.stream().filter(u -> !Boolean.TRUE.equals(u.getIsDeleted())).count();

                // 2. Active User (Trainers + General User)
                long activeTrainersCount = trainers.stream().filter(t -> !Boolean.TRUE.equals(t.getIsDeleted()))
                                .count();
                long activeStaffCount = staff.stream().filter(s -> !Boolean.TRUE.equals(s.getIsDeleted())).count();
                long totalActiveStaff = activeTrainersCount + activeStaffCount;

                // 3. Revenue (Mock logic for now - sum of amountPaid from all active users)
                // In real app, this should be a Transaction table query for current month.
                BigDecimal totalRevenue = users.stream()
                                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()) && u.getAmountPaid() != null)
                                .map(User::getAmountPaid)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // 4. Pending Renewals (Users with endDate within next 7 days)
                LocalDate today = LocalDate.now();
                LocalDate nextWeek = today.plusDays(7);
                long pendingRenewals = users.stream()
                                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                                .filter(u -> {
                                        LocalDate endDate = calculateEndDate(u.getStartDate(), (u.getPlan() != null ? u.getPlan().getName() : null));
                                        return endDate != null && !endDate.isBefore(today)
                                                        && endDate.isBefore(nextWeek);
                                })
                                .count();

                // 5. Recent Activity (Last 5 users created)
                List<AdminDashboardDtos.ActivityLogDto> activities = users.stream()
                                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                                .sorted((u1, u2) -> {
                                        // Sort by ID descending as proxy for recency if createdDate not reliable or
                                        // similar
                                        // Ideally use createdAt but User entity might not have it exposed or populated
                                        // in all records.
                                        // Assuming ID is auto-increment.
                                        return u2.getId().compareTo(u1.getId());
                                })
                                .limit(5)
                                .map(u -> AdminDashboardDtos.ActivityLogDto.builder()
                                                .id(u.getId())
                                                .message("New member registered: " + u.getName())
                                                .type("REGISTRATION")
                                                .userInitials(getInitials(u.getName()))
                                                .timeAgo("Recently") // Placeholder, implementing real timeAgo logic
                                                                     // requires Duration
                                                .build())
                                .collect(Collectors.toList());

                return AdminDashboardDtos.DashboardStatsDto.builder()
                                .totalMembers(totalMembers)
                                .memberGrowth("+5%") // Mock
                                .activeTrainers(totalActiveStaff)
                                .trainerGrowth("0%") // Mock
                                .monthlyRevenue(totalRevenue)
                                .revenueGrowth("+10%") // Mock
                                .pendingRenewals(pendingRenewals)
                                .renewalTrend("up") // Mock
                                .recentActivity(activities)
                                .build();
        }

        @Override
        public List<AdminDashboardDtos.BranchDto> getBranches(java.util.UUID organizationId, java.util.UUID branchId, User currentUser) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                List<Branch> branches;
                boolean isOrgAdmin = currentUser != null && currentUser.getRoles() != null 
                                && currentUser.getRoles().stream().anyMatch(r -> "ORG_ADMIN".equalsIgnoreCase(r.getName()));

                if (isOrgAdmin) {
                        // Org Admin always sees ALL branches of the organization
                        branches = branchRepository.findByOrganizationId(org.getId());
                } else if (currentUser != null) {
                        java.util.Set<java.util.UUID> allowedBranchIds = new java.util.HashSet<>();
                        if (currentUser.getBranch() != null) {
                                allowedBranchIds.add(currentUser.getBranch().getId());
                        }
                        allowedBranchIds.addAll(currentUser.getAccessibleBranchUUIDs());
                        if (allowedBranchIds.isEmpty() && branchId != null) {
                                allowedBranchIds.add(branchId);
                        }

                        if (!allowedBranchIds.isEmpty()) {
                                branches = branchRepository.findAllById(allowedBranchIds);
                        } else {
                                branches = branchRepository.findByOrganizationId(org.getId());
                        }
                } else {
                        branches = branchRepository.findByOrganizationId(org.getId());
                }

                return branches.stream()
                                .map(branch -> {
                                        User branchAdmin = userRepository.findTopByBranchId(branch.getId())
                                                        .orElse(null);
                                        return AdminDashboardDtos.BranchDto.builder()
                                                        .id(branch.getId())
                                                        .name(branch.getName())
                                                        .branchCode(branch.getBranchCode())
                                                        .adminEmail(branch.getAdminEmail())
                                                        .adminEmailVerified(branchAdmin != null
                                                                        ? branchAdmin.getIsEmailVerified()
                                                                        : false)
                                                        .memberCount(userRepository.countByBranchId(branch.getId()))
                                                        .status(branchAdmin != null && Boolean.TRUE
                                                                        .equals(branchAdmin.getIsActive()) ? "Active"
                                                                                        : "Setup")
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        @Override
        public void resendAdminVerification(java.util.UUID branchId) {
                User branchAdmin = userRepository.findTopByBranchId(branchId)
                                .orElseThrow(() -> new RuntimeException("Branch User not found"));

                // Trigger OTP/Verification Email via OtpService
                otpService.sendOtp(branchAdmin.getEmail(), branchAdmin.getPhone(), "REGISTER");
        }

        private String getInitials(String name) {
                if (name == null || name.isEmpty())
                        return "U";
                String[] parts = name.trim().split("\\s+");
                if (parts.length == 1)
                        return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
                return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
        }

        private AdminDashboardDtos.UserDetailDto mapToUserDetailDto(User user) {
                return AdminDashboardDtos.UserDetailDto.builder()
                                .id(user.getId())
                                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                                .accessibleBranchIds(user.getAccessibleBranchUUIDs())
                                .userCode(user.getUserCode())
                                .username(user.getUsername())
                                .name(user.getName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .dob(user.getDob())
                                .plan((user.getPlan() != null ? user.getPlan().getName() : null))
                                .amountPaid(user.getAmountPaid())
                                .trainerName(user.getTrainer() != null ? user.getTrainer().getName() : null)
                                .trainerCode(user.getTrainer() != null ? user.getTrainer().getTrainerCode() : null)
                                .startDate(user.getStartDate())
                                .endDate(calculateEndDate(user.getStartDate(), (user.getPlan() != null ? user.getPlan().getName() : null)))
                                .attendanceCount(user.getAttendanceCount())
                                .isActive(user.getIsActive())
                                .isEmailVerified(user.getIsEmailVerified())
                                .status(Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Expired")
                                .role(user.getRole() != null ? user.getRole() : null)
                                .build();
        }

        private LocalDate calculateEndDate(LocalDate startDate, String plan) {
                if (startDate == null || plan == null)
                        return null;
                // Simple logic based on plan string (enhance as needed)
                if (plan.contains("3months"))
                        return startDate.plusMonths(4);
                if (plan.contains("12months"))
                        return startDate.plusMonths(16);
                return startDate.plusMonths(1); // Default
        }

        private AdminDashboardDtos.StaffTrackingDto mapStaffToDto(User staff) {
                boolean isTrainer = "TRAINER".equalsIgnoreCase(staff.getRole());
                return AdminDashboardDtos.StaffTrackingDto.builder()
                                .id(staff.getId())
                                .code(staff.getStaffCode() != null ? staff.getStaffCode() : staff.getUserCode())
                                .username(staff.getUsername())
                                .role(staff.getRole() != null ? staff.getRole() : "STAFF")
                                .entityType(isTrainer ? "TRAINER" : "STAFF")
                                .paymentStatus(staff.getPaymentStatus() != null ? staff.getPaymentStatus() : "Pending")
                                .name(staff.getName())
                                .email(staff.getEmail())
                                .phoneNumber(staff.getPhone())
                                .salary(staff.getSalary() != null ? staff.getSalary() : java.math.BigDecimal.ZERO)
                                .startedDate(staff.getStartDate())
                                .shiftTimings(staff.getShiftTimings())
                                .isPersonalTrainer(isTrainer)
                                .customerNames(Collections.emptyList())
                                .accessibleBranchIds(staff.getAccessibleBranchUUIDs())
                                .build();
        }

        private AdminDashboardDtos.StaffDetailDto mapToStaffDetailDto(User staff) {
                return AdminDashboardDtos.StaffDetailDto.builder()
                                .id(staff.getId())
                                .branchId(staff.getBranch() != null ? staff.getBranch().getId() : null)
                                .staffCode(staff.getStaffCode())
                                .username(staff.getUsername())
                                .name(staff.getName())
                                .email(staff.getEmail())
                                .phone(staff.getPhone())
                                .salary(staff.getSalary())
                                .startDate(staff.getStartDate())
                                .shiftTimings(staff.getShiftTimings())
                                .role(staff.getRole())
                                .experience(staff.getExperience())
                                .build();
        }

        private AdminDashboardDtos.TrainerDetailDto mapToTrainerDetailDto(User trainer) {
                return AdminDashboardDtos.TrainerDetailDto.builder()
                                .id(trainer.getId())
                                .branchId(trainer.getBranch() != null ? trainer.getBranch().getId() : null)
                                .trainerCode(trainer.getTrainerCode())
                                .username(trainer.getUsername())
                                .name(trainer.getName())
                                .email(trainer.getEmail())
                                .phone(trainer.getPhone())
                                .salary(trainer.getSalary())
                                .startDate(trainer.getStartDate())
                                .shiftTimings(trainer.getShiftTimings())
                                .isPersonalTrainer(trainer.getIsPersonalTrainer())
                                .experience(trainer.getExperience())
                                .build();
        }
}
