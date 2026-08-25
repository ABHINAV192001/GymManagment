package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.StaffProfile;
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
import com.Gym.GymCommonServices.exception.ResourceNotFoundException;
import com.Gym.GymCommonServices.exception.DuplicateResourceException;
import com.Gym.GymCommonServices.exception.UnauthorizedException;
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
        private final com.Gym.GymCommonServices.service.EmailService emailService;
        private final com.Gym.GymCommonServices.service.WhatsAppService whatsAppService;
        private final TenantAccessGuard tenantAccessGuard;
        private final CurrentTenantResolver currentTenantResolver;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
        private final com.gymbross.usermanagement.repository.RbacRoleRepository rbacRoleRepository;
        private final com.gymbross.usermanagement.repository.PlanRepository planRepository;
        private final com.gymbross.usermanagement.repository.AttendanceLogRepository attendanceLogRepository;
        private final com.gymbross.usermanagement.repository.PaymentRepository paymentRepository;
        private final com.gymbross.usermanagement.repository.StaffProfileRepository staffProfileRepository;
        private final com.gymbross.usermanagement.service.AuditLogService auditLogService;
        @jakarta.persistence.PersistenceContext
        private jakarta.persistence.EntityManager entityManager;

        @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
        private String frontendUrl;

        @Override
        public List<AdminDashboardDtos.UserDetailDto> getAllUsers(java.util.UUID organizationId, java.util.UUID branchId) {
                return getAllUsers(organizationId, branchId, null, null, null, null, null, null, null);
        }

        @Override
        public List<AdminDashboardDtos.UserDetailDto> getAllUsers(
                        java.util.UUID organizationId,
                        java.util.UUID branchId,
                        String search,
                        String role,
                        String status,
                        Boolean isStaff,
                        java.util.UUID filterBranchId,
                        String startDateFrom,
                        String startDateTo) {
                List<User> users;
                
                // 1. Resolve Organization ID and currentUserId from Security Context
                java.util.UUID targetOrgId = organizationId;
                java.util.UUID currentUserId = null;
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User currentUser) {
                        if (targetOrgId == null && currentUser.getOrganization() != null) {
                                targetOrgId = currentUser.getOrganization().getId();
                        }
                        currentUserId = currentUser.getId();
                }

                // 2. Fetch Users based on Explicit Branch Filter or Organization ID
                if (filterBranchId != null) {
                        users = userRepository.findByBranchId(filterBranchId);
                } else if (targetOrgId != null) {
                        users = userRepository.findByOrganizationId(targetOrgId);
                } else if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                } else {
                        users = userRepository.findAll();
                }

                final java.util.UUID loggedInId = currentUserId;
                return users.stream()
                                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                                .filter(user -> loggedInId == null || !user.getId().equals(loggedInId))
                                .filter(user -> user.getRoles() == null
                                                || user.getRoles().stream().noneMatch(r -> "ORG_ADMIN".equalsIgnoreCase(r.getName())))
                                // 1. Search Query (Name, Phone, Email, UserCode)
                                .filter(user -> {
                                        if (search == null || search.trim().isEmpty()) return true;
                                        String q = search.trim().toLowerCase();
                                        return (user.getName() != null && user.getName().toLowerCase().contains(q)) ||
                                               (user.getPhone() != null && user.getPhone().contains(q)) ||
                                               (user.getEmail() != null && user.getEmail().toLowerCase().contains(q)) ||
                                               (user.getUserCode() != null && user.getUserCode().toLowerCase().contains(q));
                                })
                                // 2. Role Filter
                                .filter(user -> {
                                        if (role == null || role.trim().isEmpty() || "ALL".equalsIgnoreCase(role.trim())) return true;
                                        return user.getRole() != null && user.getRole().equalsIgnoreCase(role.trim());
                                })
                                // 3. Active / Inactive Status Filter
                                .filter(user -> {
                                        if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status.trim())) return true;
                                        if ("ACTIVE".equalsIgnoreCase(status.trim())) return Boolean.TRUE.equals(user.getIsActive());
                                        if ("INACTIVE".equalsIgnoreCase(status.trim())) return !Boolean.TRUE.equals(user.getIsActive());
                                        return true;
                                })
                                // 4. Staff-wise Filter
                                .filter(user -> {
                                        if (isStaff == null) return true;
                                        boolean userIsStaff = user.getStaffProfile() != null || (user.getStaffCode() != null && user.getStaffCode().startsWith("STF-"));
                                        return userIsStaff == isStaff;
                                })
                                // 5. Date Range: Joined From
                                .filter(user -> {
                                        if (startDateFrom == null || startDateFrom.trim().isEmpty()) return true;
                                        if (user.getStartDate() == null) return false;
                                        try {
                                                java.time.LocalDate fromDate = java.time.LocalDate.parse(startDateFrom.trim());
                                                return !user.getStartDate().isBefore(fromDate);
                                        } catch (Exception e) {
                                                return true;
                                        }
                                })
                                // 6. Date Range: Joined To
                                .filter(user -> {
                                        if (startDateTo == null || startDateTo.trim().isEmpty()) return true;
                                        if (user.getStartDate() == null) return false;
                                        try {
                                                java.time.LocalDate toDate = java.time.LocalDate.parse(startDateTo.trim());
                                                return !user.getStartDate().isAfter(toDate);
                                        } catch (Exception e) {
                                                return true;
                                        }
                                })
                                .map(this::mapToUserSummaryDto)
                                .collect(Collectors.toList());
        }

        @Override
        public List<AdminDashboardDtos.StaffTrackingDto> getAllStaff(java.util.UUID organizationId, java.util.UUID branchId, java.util.UUID currentUserId) {
                List<User> users;

                // Resolve organizationId from SecurityContext if not passed in JWT attribute
                java.util.UUID targetOrgId = organizationId;
                if (targetOrgId == null) {
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        if (auth != null && auth.getPrincipal() instanceof User currentUser && currentUser.getOrganization() != null) {
                                targetOrgId = currentUser.getOrganization().getId();
                        }
                }

                if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                } else if (targetOrgId != null) {
                        Organization org = organizationRepository.findById(targetOrgId)
                                        .orElseThrow(() -> new RuntimeException("Organization not found"));
                        users = userRepository.findByOrganizationId(org.getId());
                } else {
                        return java.util.Collections.emptyList();
                }

                users = users.stream()
                                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                                .filter(u -> {
                                    // Primary: has a StaffProfile row
                                    if (u.getStaffProfile() != null) return true;
                                    // Legacy: userCode starts with STF- (old format)
                                    if (u.getUserCode() != null && u.getUserCode().startsWith("STF-")) return true;
                                    // Legacy: role is TRAINER or STAFF variant
                                    String role = u.getRole();
                                    if (role != null) {
                                        String r = role.toUpperCase();
                                        if (r.contains("TRAINER") || r.contains("STAFF") || r.contains("MANAGER") || r.contains("RECEPTIONIST") || r.contains("ADMIN") || r.contains("OWNER")) return true;
                                    }
                                    return false;
                                })
                                .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                                .collect(Collectors.toList());

                return users.stream().map(this::mapStaffToDto).collect(Collectors.toList());
        }

        // --- USER CRUD ---

        @Override
        public void createUser(AdminDashboardDtos.UserDetailDto userDto, java.util.UUID organizationId, java.util.UUID branchId) {
                Organization org = null;
                if (organizationId != null) {
                        org = organizationRepository.findById(organizationId).orElse(null);
                }

                Branch branch = null;
                java.util.UUID targetBranchId = branchId != null ? branchId : userDto.getBranchId();
                if (targetBranchId != null) {
                        branch = branchRepository.findById(targetBranchId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Specified Branch not found"));
                        if (org == null) {
                                org = branch.getOrganization();
                        }
                }

                if (org == null) {
                        org = organizationRepository.findAll().stream().findFirst()
                                        .orElseThrow(() -> new ResourceNotFoundException("Organization not found. Please ensure an organization exists."));
                }

                if (userDto.getName() == null && (userDto.getFirstName() != null || userDto.getLastName() != null)) {
                        String fullName = (userDto.getFirstName() != null ? userDto.getFirstName() : "") + " " +
                                        (userDto.getLastName() != null ? userDto.getLastName() : "");
                        userDto.setName(fullName.trim());
                }

                if (userDto.getName() == null || userDto.getName().trim().isEmpty()) {
                        throw new IllegalArgumentException("User name is required");
                }

                validateExistingUserByEmailOrPhone(userDto.getEmail(), userDto.getPhone());

                User trainer = null;
                // Prefer User Code for lookup
                if (userDto.getTrainerCode() != null && !userDto.getTrainerCode().trim().isEmpty()) {
                        String searchCode = userDto.getTrainerCode().trim();
                        System.out.println("DEBUG: Looking up trainer by CODE: '" + searchCode + "'");
                        trainer = userRepository.findByOrganizationId(org.getId()).stream()
                                        .filter(t -> (t.getTrainerCode() != null && t.getTrainerCode().equalsIgnoreCase(searchCode))
                                                        || (t.getStaffCode() != null && t.getStaffCode().equalsIgnoreCase(searchCode))
                                                        || (t.getUserCode() != null && t.getUserCode().equalsIgnoreCase(searchCode))
                                                        || (t.getId() != null && t.getId().toString().equalsIgnoreCase(searchCode)))
                                        .findFirst()
                                        .orElse(null);
                }
                // Fallback to Name if Code is missing (for backward compatibility or UI quirks)
                else if (userDto.getTrainerName() != null && !userDto.getTrainerName().trim().isEmpty()) {
                        System.out.println("DEBUG: Looking up trainer by NAME: '" + userDto.getTrainerName() + "'");
                        trainer = userRepository.findByOrganizationId(org.getId()).stream()
                                        .filter(t -> t.getName() != null && t.getName().trim()
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

                boolean isEmailVerified = Boolean.TRUE.equals(userDto.getIsEmailVerified());
                boolean isActive = Boolean.TRUE.equals(userDto.getIsActive()) && isEmailVerified;

                User user = User.builder()
                                .name(userDto.getName())
                                .email(userDto.getEmail())
                                .phone(userDto.getPhone())
                                .gender(userDto.getGender())
                                .dob(userDto.getDob())
                                .organization(org)
                                .branch(branch)
                                .userCode("USER-" + System.currentTimeMillis())
                                .username(userDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .isActive(isActive)
                                .isEmailVerified(isEmailVerified)
                                .passwordHash("$2a$10$wN35gE42tD1yH86P8V8K3OlFmYj0.d1rFqR2k06L2Xv6H7F0E5D5m") // Default password: Password123
                                .build();
                user.setAmountPaid(userDto.getAmountPaid());
                user.setAttendanceCount(0);
                
                LocalDate startDate = userDto.getStartDate() != null ? userDto.getStartDate() : LocalDate.now();
                user.setStartDate(startDate);

                if (userDto.getPlan() != null && !userDto.getPlan().trim().isEmpty()) {
                        String planNameOrId = userDto.getPlan().trim();
                        com.gymbross.usermanagement.entity.Plan planEntity = null;
                        try {
                                java.util.UUID pId = java.util.UUID.fromString(planNameOrId);
                                planEntity = planRepository.findByIdAndOrganizationIdAndIsDeletedFalse(pId, org.getId()).orElse(null);
                        } catch (Exception ignored) {}

                        if (planEntity == null) {
                                List<com.gymbross.usermanagement.entity.Plan> plans = planRepository.findByNameAndOrganizationIdAndIsDeletedFalse(planNameOrId, org.getId());
                                if (!plans.isEmpty()) planEntity = plans.get(0);
                        }

                        LocalDate endDate = null;
                        if (planEntity != null && planEntity.getDurationDays() > 0) {
                                endDate = startDate.plusDays(planEntity.getDurationDays());
                        } else {
                                endDate = calculateEndDate(startDate, planNameOrId);
                        }
                        user.setEndDate(endDate);
                } else {
                        user.setEndDate(startDate.plusDays(30));
                }
                boolean isStaffRequested = Boolean.TRUE.equals(userDto.getIsStaff());
                String requestedRole = (userDto.getRole() != null && !userDto.getRole().trim().isEmpty()) 
                        ? userDto.getRole().trim() 
                        : (isStaffRequested ? "EMPLOYEE" : "USER");

                if ("ORG_ADMIN".equalsIgnoreCase(requestedRole) || "ADMIN".equalsIgnoreCase(requestedRole)) {
                        String userEmail = userDto.getEmail() != null ? userDto.getEmail() : "";
                        String orgEmail = org.getOwnerEmail() != null ? org.getOwnerEmail() : "";
                        if (!userEmail.equalsIgnoreCase(orgEmail)) {
                                throw new IllegalArgumentException("The ORG_ADMIN role is strictly reserved for the registered organization owner email (" + orgEmail + ").");
                        }
                }
                
                final String finalRole = requestedRole;
                final Organization finalOrg = org;
                com.gymbross.usermanagement.entity.RbacRole rbacRole = rbacRoleRepository
                        .findByNameAndOrgId(finalRole, finalOrg.getId())
                        .or(() -> rbacRoleRepository.findByNameAndOrgIdIsNull(finalRole))
                        .orElseGet(() -> {
                                return rbacRoleRepository.save(com.gymbross.usermanagement.entity.RbacRole.builder()
                                        .name(finalRole)
                                        .orgId(finalOrg.getId())
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

                if (isStaffRequested) {
                        user.setStaffCode("STF-" + System.currentTimeMillis());
                        com.Gym.GymCommonServices.entity.StaffProfile staffProfile = com.Gym.GymCommonServices.entity.StaffProfile.builder()
                                        .user(user)
                                        .salary(userDto.getAmountPaid() != null ? userDto.getAmountPaid() : java.math.BigDecimal.ZERO)
                                        .startDate(userDto.getStartDate() != null ? userDto.getStartDate() : java.time.LocalDate.now())
                                        .build();
                        staffProfile.setOrgId(org.getId());
                        user.setStaffProfile(staffProfile);
                } else {
                        user.setStaffProfile(null);
                }

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User) {
                        user.setCreatedBy(((User) auth.getPrincipal()).getId());
                }

                User savedUser = userRepository.save(user);

                if (savedUser.getAmountPaid() != null && savedUser.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
                        try {
                                com.gymbross.usermanagement.entity.Payment payment = com.gymbross.usermanagement.entity.Payment.builder()
                                        .userId(savedUser.getId())
                                        .memberId(savedUser.getId())
                                        .organizationId(org.getId())
                                        .branchId(branch != null ? branch.getId() : null)
                                        .amount(savedUser.getAmountPaid())
                                        .paymentDate(savedUser.getStartDate() != null ? savedUser.getStartDate() : LocalDate.now())
                                        .status("COMPLETED")
                                        .paymentMethod("UPI")
                                        .paymentType("MEMBERSHIP")
                                        .referenceNo("REG-" + System.currentTimeMillis())
                                        .notes("Registration subscription payment for plan: " + (userDto.getPlan() != null ? userDto.getPlan() : "Standard Membership"))
                                        .build();
                                paymentRepository.save(payment);
                        } catch (Exception e) {
                                System.err.println("Failed to auto-create payment on user creation: " + e.getMessage());
                        }
                }

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
                        try {
                                otpService.sendOtp(user.getEmail().trim(), user.getPhone(), "REGISTER", inviteLink);
                        } catch (Exception e) {
                                System.err.println("Warning: otpService error during member creation: " + e.getMessage());
                                try {
                                        emailService.sendEmail(
                                                user.getEmail().trim(),
                                                "Set Password & Join GymBross",
                                                "Hello " + user.getName() + ",\n\nWelcome to GymBross! Your account has been registered. Please click the link below to set your password:\n" + inviteLink
                                        );
                                } catch (Exception mailEx) {
                                        System.err.println("Failed to send welcome email fallback: " + mailEx.getMessage());
                                }
                        }
                }

                auditLogService.logAction(savedUser.getId(), org.getId(), "USER_CREATED", "User created: " + savedUser.getName());
        }

        @Override
        public String resendUserInvite(java.util.UUID userId) {
                return resendUserInvite(userId, null);
        }

        @Override
        @Transactional(readOnly = true)
        public String resendUserInvite(java.util.UUID userId, String clientOrigin) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

                if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                        throw new IllegalArgumentException("User does not have a valid email address.");
                }

                String adminCode = "Unknown";
                try {
                        if (user.getBranch() != null) {
                                adminCode = userRepository.findTopByBranchId(user.getBranch().getId())
                                                .map(User::getAdminCode).orElse("Unknown");
                        }
                } catch (Exception e) {
                        System.out.println("Notice: Could not resolve adminCode for invite link: " + e.getMessage());
                }

                String role = "MEMBER";
                try {
                        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                                role = user.getRoles().iterator().next().getName();
                        }
                } catch (Exception e) {
                        System.out.println("Notice: Could not resolve user role for invite link: " + e.getMessage());
                }

                String baseUrl = null;
                if (clientOrigin != null && !clientOrigin.trim().isEmpty()) {
                        baseUrl = clientOrigin.trim();
                        int queryIdx = baseUrl.indexOf("?");
                        if (queryIdx != -1) baseUrl = baseUrl.substring(0, queryIdx);
                        int pathIdx = baseUrl.indexOf("/", 8);
                        if (pathIdx != -1) baseUrl = baseUrl.substring(0, pathIdx);
                }
                if (baseUrl == null || baseUrl.isEmpty()) {
                        baseUrl = (frontendUrl != null && !frontendUrl.trim().isEmpty()) ? frontendUrl.trim() : "https://gymmanagment-wi3u.onrender.com";
                }
                if (baseUrl.endsWith("/")) {
                        baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
                }

                String inviteLink = baseUrl + "/auth/register/join?u=" + user.getUserCode()
                                + "&ref=" + adminCode + "&role=" + role
                                + "&email=" + java.net.URLEncoder.encode(user.getEmail().trim(), java.nio.charset.StandardCharsets.UTF_8);

                try {
                        otpService.sendOtp(user.getEmail().trim(), user.getPhone(), "REGISTER", inviteLink);
                } catch (Exception e) {
                        System.err.println("Resend OTP warning: " + e.getMessage() + ". Attempting direct email notification...");
                        try {
                                emailService.sendEmail(
                                        user.getEmail().trim(),
                                        "Set Your Password - GymBross Account Invitation",
                                        "Hello " + user.getName() + ",\n\nPlease click the link below to set your password and access your GymBross account:\n\n" + inviteLink
                                );
                        } catch (Exception mailEx) {
                                System.err.println("Direct email fallback notice: " + mailEx.getMessage());
                        }
                }

                if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                        try {
                                whatsAppService.sendAccountCreatedNotification(
                                        user.getPhone().trim(),
                                        user.getName() != null ? user.getName() : "Member",
                                        user.getEmail().trim(),
                                        inviteLink,
                                        role
                                );
                        } catch (Exception waEx) {
                                System.err.println("Direct WhatsApp invite notification notice: " + waEx.getMessage());
                        }
                }

                return inviteLink;
        }

        @Override
        public AdminDashboardDtos.UserDetailDto getUserById(java.util.UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);
                return mapToUserDetailDto(user);
        }

        @Override
        public AdminDashboardDtos.UserDetailDto getUserByCode(String userCode) {
                User user = userRepository.findByUserCode(userCode)
                                .orElseThrow(() -> new RuntimeException("User not found with code: " + userCode));
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
                user.setGender(userDto.getGender());
                user.setDob(userDto.getDob());
                user.setAmountPaid(userDto.getAmountPaid());
                user.setStartDate(userDto.getStartDate());
                user.setAttendanceCount(userDto.getAttendanceCount());
                if (userDto.getEndDate() != null) {
                        user.setEndDate(userDto.getEndDate());
                }
                if (userDto.getPlan() != null && !userDto.getPlan().trim().isEmpty() && user.getOrganization() != null) {
                        com.gymbross.usermanagement.entity.Plan planEntity = planRepository
                                .findByNameAndOrganizationIdAndIsDeletedFalse(userDto.getPlan().trim(), user.getOrganization().getId())
                                .stream().findFirst().orElse(null);
                        if (planEntity != null) {
                                user.setPlan(entityManager.getReference(com.Gym.GymCommonServices.entity.Plan.class, planEntity.getId()));
                        }
                }
                if (userDto.getStatus() != null) {
                        if ("Inactive".equalsIgnoreCase(userDto.getStatus()) || "Expired".equalsIgnoreCase(userDto.getStatus())) {
                                user.setIsActive(false);
                        } else if ("Active".equalsIgnoreCase(userDto.getStatus())) {
                                user.setIsActive(true);
                        }
                }
                if (userDto.getBranchId() != null) {
                        Branch b = branchRepository.findById(userDto.getBranchId())
                                        .orElseThrow(() -> new IllegalArgumentException("Branch not found with ID: " + userDto.getBranchId()));
                        user.setBranch(b);
                }
                if (userDto.getAccessibleBranchIds() != null) {
                        String jsonBranchIds = userDto.getAccessibleBranchIds().stream()
                                        .map(id -> "\"" + id.toString() + "\"")
                                        .collect(Collectors.joining(",", "[", "]"));
                        user.setAccessibleBranchIds(jsonBranchIds);
                }
                if (userDto.getRole() != null && !userDto.getRole().trim().isEmpty()) {
                        String reqRole = userDto.getRole().trim();
                        if ("ORG_ADMIN".equalsIgnoreCase(reqRole) || "ADMIN".equalsIgnoreCase(reqRole)) {
                                String uEmail = user.getEmail() != null ? user.getEmail() : (userDto.getEmail() != null ? userDto.getEmail() : "");
                                String oEmail = user.getOrganization() != null ? user.getOrganization().getOwnerEmail() : "";
                                if (!uEmail.equalsIgnoreCase(oEmail)) {
                                        throw new IllegalArgumentException("The ORG_ADMIN role is strictly reserved for the registered organization owner email (" + oEmail + ").");
                                }
                        }
                        
                        final String finalRole = reqRole;
                        java.util.UUID orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
                        com.gymbross.usermanagement.entity.RbacRole rbacRole = rbacRoleRepository
                                .findByNameAndOrgId(finalRole, orgId)
                                .or(() -> rbacRoleRepository.findByNameAndOrgIdIsNull(finalRole))
                                .orElseGet(() -> {
                                        return rbacRoleRepository.save(com.gymbross.usermanagement.entity.RbacRole.builder()
                                                .name(finalRole)
                                                .orgId(orgId)
                                                .isActive(true)
                                                .isDeleted(false)
                                                .build());
                                });

                        // Native SQL: reliably swap the role in user_roles join table.
                        // (Hibernate collection ops are unreliable here because the two
                        //  RbacRole entity classes have different equals/hashCode.)
                        entityManager.createNativeQuery(
                                "DELETE FROM user_roles WHERE user_id = :uid")
                                .setParameter("uid", user.getId())
                                .executeUpdate();
                        entityManager.createNativeQuery(
                                "INSERT INTO user_roles (user_id, role_id, assigned_at, created_at) " +
                                "VALUES (:uid, :rid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
                                .setParameter("uid", user.getId())
                                .setParameter("rid", rbacRole.getId())
                                .executeUpdate();
                        // Refresh so the in-memory roles Set reflects the DB change
                        entityManager.flush();
                        entityManager.refresh(user);
                }

                // User Lookup: Prefer Code, then Name
                if (userDto.getTrainerCode() != null && !userDto.getTrainerCode().trim().isEmpty()) {
                        String searchCode = userDto.getTrainerCode().trim();
                        System.out.println("DEBUG: Update User - Looking up trainer by CODE: '"
                                        + searchCode + "'");
                        User trainer = userRepository.findByOrganizationId(user.getOrganization().getId())
                                        .stream()
                                        .filter(t -> (t.getTrainerCode() != null && t.getTrainerCode().equalsIgnoreCase(searchCode))
                                                        || (t.getStaffCode() != null && t.getStaffCode().equalsIgnoreCase(searchCode))
                                                        || (t.getUserCode() != null && t.getUserCode().equalsIgnoreCase(searchCode))
                                                        || (t.getId() != null && t.getId().toString().equalsIgnoreCase(searchCode)))
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
                                        .filter(t -> t.getName() != null && t.getName().trim()
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

                if (userDto.getAmountPaid() != null && userDto.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
                        try {
                                com.gymbross.usermanagement.entity.Payment payment = com.gymbross.usermanagement.entity.Payment.builder()
                                        .userId(user.getId())
                                        .memberId(user.getId())
                                        .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
                                        .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                                        .amount(userDto.getAmountPaid())
                                        .paymentDate(user.getStartDate() != null ? user.getStartDate() : LocalDate.now())
                                        .status("COMPLETED")
                                        .paymentMethod("UPI")
                                        .paymentType("MEMBERSHIP")
                                        .referenceNo("UPD-" + System.currentTimeMillis())
                                        .notes("Updated subscription plan payment: " + (userDto.getPlan() != null ? userDto.getPlan() : "Membership Plan"))
                                        .build();
                                paymentRepository.save(payment);
                        } catch (Exception e) {
                                System.err.println("Failed to auto-create payment on user update: " + e.getMessage());
                        }
                }

                auditLogService.logAction(user.getId(), user.getOrganization() != null ? user.getOrganization().getId() : null, 
                        "USER_UPDATED", "User updated: " + user.getName());
        }

        @Override
        public void removeUser(java.util.UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(user);
                
                // Prevent user from deleting their own account
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    if (auth.getPrincipal() instanceof User currentLoggedIn) {
                        if (currentLoggedIn.getId().equals(user.getId())) {
                            throw new IllegalArgumentException("You cannot delete your own user account.");
                        }
                    } else if (auth.getName() != null) {
                        if (auth.getName().equalsIgnoreCase(user.getEmail()) || auth.getName().equalsIgnoreCase(user.getUsername())) {
                            throw new IllegalArgumentException("You cannot delete your own user account.");
                        }
                    }
                }
                
                if (user.getStaffProfile() != null) {
                    staffProfileRepository.delete(user.getStaffProfile());
                    user.setStaffProfile(null); // Detach to ensure JPA cascades appropriately
                }
                
                user.softDelete();
                user.setIsDeleted(true);
                userRepository.save(user);

                auditLogService.logAction(user.getId(), user.getOrganization() != null ? user.getOrganization().getId() : null, 
                        "USER_DELETED", "User deleted: " + user.getName());
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

                validateExistingUserByEmailOrPhone(trainerDto.getEmail(), trainerDto.getPhone());

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
                if (Boolean.TRUE.equals(trainerDto.getIsPersonalTrainer())) {
                        if (trainerDto.getPtTrainerPercentage() != null) {
                                trainer.setPtTrainerPercentage(trainerDto.getPtTrainerPercentage());
                        } else if (branch != null && branch.getDefaultPtTrainerPercentage() != null) {
                                trainer.setPtTrainerPercentage(branch.getDefaultPtTrainerPercentage());
                        }
                }
                trainer.setTrainerCode("TRN-" + System.currentTimeMillis());

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User) {
                        trainer.setCreatedBy(((User) auth.getPrincipal()).getId());
                }

                userRepository.save(trainer);

                auditLogService.logAction(trainer.getId(), trainer.getOrganization() != null ? trainer.getOrganization().getId() : null, 
                        "TRAINER_CREATED", "Trainer created: " + trainer.getName());
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
                if (trainerDto.getPtTrainerPercentage() != null) {
                        trainer.setPtTrainerPercentage(trainerDto.getPtTrainerPercentage());
                }

                userRepository.save(trainer);

                auditLogService.logAction(trainer.getId(), trainer.getOrganization() != null ? trainer.getOrganization().getId() : null, 
                        "TRAINER_UPDATED", "Trainer updated: " + trainer.getName());
        }

        @Override
        public void removeTrainer(java.util.UUID trainerId) {
                User trainer = userRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(trainer);
                
                if (trainer.getStaffProfile() != null) {
                    staffProfileRepository.delete(trainer.getStaffProfile());
                    trainer.setStaffProfile(null);
                }
                
                trainer.softDelete();
                trainer.setIsDeleted(true);
                userRepository.save(trainer);

                auditLogService.logAction(trainer.getId(), trainer.getOrganization() != null ? trainer.getOrganization().getId() : null, 
                        "TRAINER_DELETED", "Trainer deleted: " + trainer.getName());
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
        public AdminDashboardDtos.StaffDetailDto createStaff(AdminDashboardDtos.StaffDetailDto staffDto, java.util.UUID organizationId, java.util.UUID branchId) {
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
                                        .isPersonalTrainer(staffDto.getIsPersonalTrainer() != null ? staffDto.getIsPersonalTrainer() : true)
                                        .ptTrainerPercentage(staffDto.getPtTrainerPercentage())
                                        .experience(staffDto.getExperience())
                                        .branchId(branch != null ? branch.getId() : (org != null ? org.getId() : null))
                                        .build();
                        createTrainer(trainerDto, organizationId, branchId);
                        return AdminDashboardDtos.StaffDetailDto.builder().build(); // Or fetch and map to StaffDetailDto
                }

                User staff;
                if (staffDto.getUserId() != null) {
                        staff = userRepository.findById(staffDto.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found for ID: " + staffDto.getUserId()));
                } else {
                        validateExistingUserByEmailOrPhone(staffDto.getEmail(), staffDto.getPhone());
                        String defaultPassword = passwordEncoder.encode("GymStaff@123");
                        staff = User.builder()
                                        .name(staffDto.getName())
                                        .email(staffDto.getEmail())
                                        .phone(staffDto.getPhone())
                                        .organization(org)
                                        .username(staffDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                        .passwordHash(defaultPassword)
                                        .userCode("STF-" + System.currentTimeMillis())
                                        .isActive(true)
                                        .isEmailVerified(true)
                                        .isDeleted(false)
                                        .build();
                }

                staff.setBranch(branch);
                staff.setShiftTimings(staffDto.getShiftTimings());
                staff.setStartDate(staffDto.getStartDate());
                staff.setExperience(staffDto.getExperience());
                staff.setStaffCode("STF-" + System.currentTimeMillis());
                staff.setRole(staffDto.getRole() != null ? staffDto.getRole() : "STAFF");
                
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User) {
                        staff.setCreatedBy(((User) auth.getPrincipal()).getId());
                }

                staff = userRepository.save(staff);

                com.Gym.GymCommonServices.entity.StaffProfile staffProfile = com.Gym.GymCommonServices.entity.StaffProfile.builder()
                        .user(staff)
                        .orgId(organizationId)
                        .salary(staffDto.getSalary() != null ? staffDto.getSalary() : java.math.BigDecimal.ZERO)
                        .isPersonalTrainer(staffDto.getIsPersonalTrainer() != null ? staffDto.getIsPersonalTrainer() : false)
                        .ptTrainerPercentage(staffDto.getPtTrainerPercentage())
                        .experienceYears(staffDto.getExperience())
                        .shiftTimings(staffDto.getShiftTimings())
                        .startDate(staffDto.getStartDate())
                        .build();
                staff.setStaffProfile(staffProfile);

                staff = userRepository.save(staff);

                auditLogService.logAction(staff.getId(), staff.getOrganization() != null ? staff.getOrganization().getId() : null, 
                        "STAFF_CREATED", "Staff created: " + staff.getName());

                return AdminDashboardDtos.StaffDetailDto.builder()
                        .id(staff.getId())
                        .name(staff.getName())
                        .email(staff.getEmail())
                        .phone(staff.getPhone())
                        .staffCode(staff.getStaffCode())
                        .build();
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
                
                if (staffDto.getIsPersonalTrainer() != null) {
                        staff.setIsPersonalTrainer(staffDto.getIsPersonalTrainer());
                        if (staffDto.getIsPersonalTrainer()) {
                                if (staffDto.getPtTrainerPercentage() != null) {
                                        staff.setPtTrainerPercentage(staffDto.getPtTrainerPercentage());
                                }
                        }
                }

                userRepository.save(staff);

                auditLogService.logAction(staff.getId(), staff.getOrganization() != null ? staff.getOrganization().getId() : null, 
                        "STAFF_UPDATED", "Staff updated: " + staff.getName());
        }

        @Override
        public void removeStaff(java.util.UUID staffId) {
                User staff = userRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                assertCallerCanAccessUser(staff);
                
                if (staff.getStaffProfile() != null) {
                    staffProfileRepository.delete(staff.getStaffProfile());
                    staff.setStaffProfile(null);
                }
                
                staff.softDelete();
                staff.setIsDeleted(true);
                userRepository.save(staff);

                auditLogService.logAction(staff.getId(), staff.getOrganization() != null ? staff.getOrganization().getId() : null, 
                        "STAFF_DELETED", "Staff deleted: " + staff.getName());
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
                                        LocalDate endDate = u.getEndDate() != null ? u.getEndDate() : calculateEndDate(u.getStartDate(), (u.getPlan() != null ? u.getPlan().getName() : null));
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

        private AdminDashboardDtos.UserDetailDto mapToUserSummaryDto(User user) {
                String planName = (user.getPlan() != null ? user.getPlan().getName() : null);
                LocalDate startDate = user.getStartDate();
                LocalDate endDate = user.getEndDate();

                if (endDate == null && startDate != null) {
                        endDate = calculateEndDate(startDate, planName);
                }

                boolean isEmailVerified = Boolean.TRUE.equals(user.getIsEmailVerified());
                boolean isExpired = (endDate != null && LocalDate.now().isAfter(endDate));
                boolean effectiveIsActive = Boolean.TRUE.equals(user.getIsActive()) && isEmailVerified && !isExpired;
                String statusText = !isEmailVerified ? "Pending Email Verification" : (isExpired ? "Expired" : (effectiveIsActive ? "Active" : "Inactive"));

                return AdminDashboardDtos.UserDetailDto.builder()
                                .id(user.getId())
                                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                                .accessibleBranchIds(user.getAccessibleBranchUUIDs())
                                .userCode(user.getUserCode())
                                .username(user.getUsername())
                                .name(user.getName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .gender(user.getGender())
                                .dob(user.getDob())
                                .plan(planName)
                                .amountPaid(user.getAmountPaid())
                                .trainerName(user.getTrainer() != null ? user.getTrainer().getName() : null)
                                .trainerCode(user.getTrainer() != null ? (user.getTrainer().getTrainerCode() != null ? user.getTrainer().getTrainerCode() : (user.getTrainer().getStaffCode() != null ? user.getTrainer().getStaffCode() : user.getTrainer().getUserCode())) : null)
                                .startDate(startDate)
                                .endDate(endDate)
                                .attendanceCount(user.getAttendanceCount() != null ? user.getAttendanceCount() : 0)
                                .isActive(effectiveIsActive)
                                .isEmailVerified(user.getIsEmailVerified())
                                .status(statusText)
                                .role(user.getRole() != null ? user.getRole() : null)
                                .isStaff(user.getStaffProfile() != null || (user.getStaffCode() != null && user.getStaffCode().startsWith("STF-")))
                                .attendanceLogs(null)
                                .build();
        }

        private AdminDashboardDtos.UserDetailDto mapToUserDetailDto(User user) {
                String planName = (user.getPlan() != null ? user.getPlan().getName() : null);
                LocalDate startDate = user.getStartDate();
                LocalDate endDate = user.getEndDate();

                if (endDate == null && startDate != null) {
                        endDate = calculateEndDate(startDate, planName);
                }

                boolean isEmailVerified = Boolean.TRUE.equals(user.getIsEmailVerified());
                boolean isExpired = (endDate != null && LocalDate.now().isAfter(endDate));
                boolean effectiveIsActive = Boolean.TRUE.equals(user.getIsActive()) && isEmailVerified && !isExpired;
                String statusText = !isEmailVerified ? "Pending Email Verification" : (isExpired ? "Expired" : (effectiveIsActive ? "Active" : "Inactive"));

                List<com.gymbross.usermanagement.entity.AttendanceLog> logs = attendanceLogRepository.findByEntityIdOrderByCheckInTimeDesc(user.getId());
                List<com.gymbross.usermanagement.dto.AttendanceDtos.AttendanceLogResponseDto> logDtos = (logs != null && !logs.isEmpty())
                                ? logs.stream().map(log -> com.gymbross.usermanagement.dto.AttendanceDtos.AttendanceLogResponseDto.builder()
                                                .id(log.getId())
                                                .branchId(log.getBranchId())
                                                .entityType(log.getEntityType())
                                                .entityId(log.getEntityId())
                                                .entityName(user.getName())
                                                .entityCode(user.getUserCode())
                                                .checkInTime(log.getCheckInTime())
                                                .checkOutTime(log.getCheckOutTime())
                                                .method(log.getMethod())
                                                .status(log.getStatus())
                                                .build()).collect(Collectors.toList())
                                : new ArrayList<>();

                int calculatedAttendanceCount = logDtos.size();

                String fullName = user.getName() != null ? user.getName().trim() : "";
                String[] nameParts = fullName.split("\\s+", 2);
                String firstName = nameParts.length > 0 ? nameParts[0] : "";
                String lastName = nameParts.length > 1 ? nameParts[1] : "";

                return AdminDashboardDtos.UserDetailDto.builder()
                                .id(user.getId())
                                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                                .branchName(user.getBranch() != null ? user.getBranch().getName() : "Headquarters")
                                .accessibleBranchIds(user.getAccessibleBranchUUIDs())
                                .userCode(user.getUserCode())
                                .username(user.getUsername())
                                .name(user.getName())
                                .firstName(firstName)
                                .lastName(lastName)
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .gender(user.getGender())
                                .dob(user.getDob())
                                .plan(planName)
                                .amountPaid(user.getAmountPaid())
                                .salary(user.getSalary() != null ? user.getSalary() : (user.getStaffProfile() != null ? user.getStaffProfile().getSalary() : BigDecimal.ZERO))
                                .trainerName(user.getTrainer() != null ? user.getTrainer().getName() : null)
                                .trainerCode(user.getTrainer() != null ? (user.getTrainer().getTrainerCode() != null ? user.getTrainer().getTrainerCode() : (user.getTrainer().getStaffCode() != null ? user.getTrainer().getStaffCode() : user.getTrainer().getUserCode())) : null)
                                .startDate(startDate)
                                .endDate(endDate)
                                .attendanceCount(calculatedAttendanceCount > 0 ? calculatedAttendanceCount : (user.getAttendanceCount() != null ? user.getAttendanceCount() : 0))
                                .isActive(effectiveIsActive)
                                .isEmailVerified(user.getIsEmailVerified())
                                .status(statusText)
                                .role(user.getRole() != null ? user.getRole() : null)
                                .isStaff(user.getStaffProfile() != null || (user.getStaffCode() != null && user.getStaffCode().startsWith("STF-")))
                                .attendanceLogs(logDtos)
                                .build();
        }

        private LocalDate calculateEndDate(LocalDate startDate, String planName) {
                if (startDate == null)
                        return null;
                if (planName == null || planName.trim().isEmpty())
                        return startDate.plusDays(30);

                String lower = planName.toLowerCase().trim();
                if (lower.contains("120") || lower.contains("4 month") || lower.contains("4-month") || lower.contains("4month")) {
                        return startDate.plusDays(120);
                }
                if (lower.contains("90") || lower.contains("3 month") || lower.contains("3months") || lower.contains("3month")) {
                        return startDate.plusDays(90);
                }
                if (lower.contains("180") || lower.contains("6 month") || lower.contains("6months") || lower.contains("6month")) {
                        return startDate.plusDays(180);
                }
                if (lower.contains("365") || lower.contains("12 month") || lower.contains("12months") || lower.contains("1 year")) {
                        return startDate.plusDays(365);
                }
                if (lower.contains("30") || lower.contains("1 month") || lower.contains("1month")) {
                        return startDate.plusDays(30);
                }
                return startDate.plusDays(120); // Default to 120 days / 4 months if unspecified
        }

        private AdminDashboardDtos.StaffTrackingDto mapStaffToDto(User staff) {
                boolean isTrainer = "TRAINER".equalsIgnoreCase(staff.getRole());
                return AdminDashboardDtos.StaffTrackingDto.builder()
                                .id(staff.getId())
                                .branchId(staff.getBranch() != null ? staff.getBranch().getId() : null)
                                .branchName(staff.getBranch() != null ? staff.getBranch().getName() : null)
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
                                .isPersonalTrainer(staff.getIsPersonalTrainer())
                                .ptTrainerPercentage(staff.getPtTrainerPercentage())
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
                                .ptTrainerPercentage(trainer.getPtTrainerPercentage())
                                .build();
        }

        private void validateExistingUserByEmailOrPhone(String email, String phone) {
                User existingUser = null;
                if (email != null && !email.trim().isEmpty()) {
                        existingUser = userRepository.findTopByEmailIgnoreCase(email.trim()).orElse(null);
                }
                if (existingUser == null && phone != null && !phone.trim().isEmpty()) {
                        existingUser = userRepository.findTopByPhone(phone.trim()).orElse(null);
                }

                if (existingUser != null) {
                        boolean isActive = Boolean.TRUE.equals(existingUser.getIsActive());
                        boolean isEmailVerified = Boolean.TRUE.equals(existingUser.getIsEmailVerified());

                        if (isActive && isEmailVerified) {
                                throw new DuplicateResourceException("User with this email or phone number already belongs to this organization.");
                        } else {
                                throw new DuplicateResourceException("User with this email or phone number belongs to this organization but is deactivated or pending verification.");
                        }
                }
        }
}
