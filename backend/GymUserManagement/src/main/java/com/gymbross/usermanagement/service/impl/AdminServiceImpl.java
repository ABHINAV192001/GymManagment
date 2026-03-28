package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.Staff;
import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.Trainer;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.AdminDashboardDtos;
import com.gymbross.usermanagement.repository.OrganizationRepository;
import com.gymbross.usermanagement.repository.BranchRepository;
import com.gymbross.usermanagement.repository.StaffRepository;
import com.gymbross.usermanagement.repository.TrainerRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.AdminService;
import com.Gym.GymCommonServices.entity.Admin;
import com.gymbross.usermanagement.repository.AdminRepository;
import com.gymbross.usermanagement.service.OtpService;
import com.Gym.GymCommonServices.entity.UserDietPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        private final StaffRepository staffRepository;
        private final TrainerRepository trainerRepository;
        private final OrganizationRepository organizationRepository;
        private final BranchRepository branchRepository;
        private final AdminRepository adminRepository;
        private final OtpService otpService;

        @Override
        public List<AdminDashboardDtos.UserDetailDto> getAllUsers(Long organizationId, Long branchId) {
                List<User> users;
                if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                } else {
                        Organization org = organizationRepository.findById(organizationId)
                                        .orElseThrow(() -> new RuntimeException("Organization not found"));
                        users = userRepository.findByOrganizationId(org.getId());
                }

                return users.stream()
                                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                                .map(this::mapToUserDetailDto)
                                .collect(Collectors.toList());
        }

        @Override
        public List<AdminDashboardDtos.StaffTrackingDto> getAllStaff(Long organizationId, Long branchId) {
                List<Staff> staffs;
                List<Trainer> trainers;

                if (branchId != null) {
                        staffs = staffRepository.findByBranchId(branchId);
                        trainers = trainerRepository.findByBranchId(branchId);
                } else {
                        Organization org = organizationRepository.findById(organizationId)
                                        .orElseThrow(() -> new RuntimeException("Organization not found"));
                        staffs = staffRepository.findByOrganizationId(org.getId());
                        trainers = trainerRepository.findByOrganizationId(org.getId());
                }

                staffs = staffs.stream().filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                                .collect(Collectors.toList());
                trainers = trainers.stream().filter(t -> !Boolean.TRUE.equals(t.getIsDeleted()))
                                .collect(Collectors.toList());

                List<AdminDashboardDtos.StaffTrackingDto> result = new ArrayList<>();

                result.addAll(staffs.stream().map(this::mapStaffToDto).collect(Collectors.toList()));
                result.addAll(trainers.stream().map(this::mapTrainerToDto).collect(Collectors.toList()));

                return result;
        }

        // --- USER CRUD ---

        @Override
        public void createUser(AdminDashboardDtos.UserDetailDto userDto, Long organizationId, Long branchId) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                Branch branch = null;
                if (branchId != null) {
                        // Branch Admin context
                        branch = branchRepository.findById(branchId)
                                        .orElseThrow(() -> new RuntimeException("Branch not found"));
                } else if (userDto.getBranchId() != null) {
                        // Org Admin context - specified branch
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

                Trainer trainer = null;
                // Prefer Trainer Code for lookup
                if (userDto.getTrainerCode() != null && !userDto.getTrainerCode().trim().isEmpty()) {
                        System.out.println("DEBUG: Looking up trainer by CODE: '" + userDto.getTrainerCode() + "'");
                        trainer = trainerRepository.findByOrganizationId(org.getId()).stream()
                                        .filter(t -> t.getTrainerCode()
                                                        .equalsIgnoreCase(userDto.getTrainerCode().trim()))
                                        .findFirst()
                                        .orElse(null);
                }
                // Fallback to Name if Code is missing (for backward compatibility or UI quirks)
                else if (userDto.getTrainerName() != null && !userDto.getTrainerName().trim().isEmpty()) {
                        System.out.println("DEBUG: Looking up trainer by NAME: '" + userDto.getTrainerName() + "'");
                        trainer = trainerRepository.findByOrganizationId(org.getId()).stream()
                                        .filter(t -> t.getName().trim()
                                                        .equalsIgnoreCase(userDto.getTrainerName().trim()))
                                        .findFirst()
                                        .orElse(null);
                }

                if (trainer != null) {
                        System.out.println("DEBUG: Trainer Found: " + trainer.getName() + " ("
                                        + trainer.getTrainerCode() + ")");
                } else {
                        System.out.println("DEBUG: Trainer NOT Found.");
                }

                User user = User.builder()
                                .name(userDto.getName())
                                .email(userDto.getEmail())
                                .phone(userDto.getPhone())
                                .dob(userDto.getDob())
                                .plan(userDto.getPlan())
                                .amountPaid(userDto.getAmountPaid())
                                .attendanceCount(0)
                                .startDate(userDto.getStartDate())
                                .organization(org)
                                .branch(branch)
                                .userCode("USER-" + System.currentTimeMillis())
                                .username(userDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .isActive(true)
                                .isEmailVerified(false)
                                .role(com.Gym.GymCommonServices.entity.Role
                                                .valueOf(userDto.getRole() != null ? userDto.getRole() : "USER"))
                                .trainer(trainer)
                                .build();

                userRepository.save(user);
        }

        @Override
        public AdminDashboardDtos.UserDetailDto getUserById(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return mapToUserDetailDto(user);
        }

        @Override
        public void updateUser(Long userId, AdminDashboardDtos.UserDetailDto userDto) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setName(userDto.getName());
                user.setEmail(userDto.getEmail());
                user.setPhone(userDto.getPhone());
                user.setDob(userDto.getDob());
                user.setPlan(userDto.getPlan());
                user.setAmountPaid(userDto.getAmountPaid());
                user.setStartDate(userDto.getStartDate());
                user.setStartDate(userDto.getStartDate());
                user.setAttendanceCount(userDto.getAttendanceCount());
                if (userDto.getRole() != null) {
                        user.setRole(com.Gym.GymCommonServices.entity.Role.valueOf(userDto.getRole()));
                }

                // Trainer Lookup: Prefer Code, then Name
                if (userDto.getTrainerCode() != null && !userDto.getTrainerCode().trim().isEmpty()) {
                        System.out.println("DEBUG: Update User - Looking up trainer by CODE: '"
                                        + userDto.getTrainerCode() + "'");
                        Trainer trainer = trainerRepository.findByOrganizationId(user.getOrganization().getId())
                                        .stream()
                                        .filter(t -> t.getTrainerCode()
                                                        .equalsIgnoreCase(userDto.getTrainerCode().trim()))
                                        .findFirst()
                                        .orElse(null);
                        if (trainer != null) {
                                user.setTrainer(trainer);
                                System.out.println("DEBUG: Trainer assigned via Code: " + trainer.getName());
                        } else {
                                System.out.println("DEBUG: Trainer with Code '" + userDto.getTrainerCode()
                                                + "' NOT found.");
                        }
                } else if (userDto.getTrainerName() != null && !userDto.getTrainerName().trim().isEmpty()) {
                        System.out.println("DEBUG: Update User - Looking up trainer by NAME: '"
                                        + userDto.getTrainerName() + "'");
                        Trainer trainer = trainerRepository.findByOrganizationId(user.getOrganization().getId())
                                        .stream()
                                        .filter(t -> t.getName().trim()
                                                        .equalsIgnoreCase(userDto.getTrainerName().trim()))
                                        .findFirst()
                                        .orElse(null);
                        if (trainer != null) {
                                user.setTrainer(trainer);
                                System.out.println("DEBUG: Trainer assigned via Name: " + trainer.getName());
                        } else {
                                System.out.println("DEBUG: Trainer with Name '" + userDto.getTrainerName()
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
        public void removeUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                user.setIsDeleted(true);
                userRepository.save(user);
        }

        // --- TRAINER CRUD ---

        @Override
        public void createTrainer(AdminDashboardDtos.TrainerDetailDto trainerDto, Long organizationId, Long branchId) {
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
                        throw new RuntimeException("Trainer name is required");
                }

                Trainer trainer = Trainer.builder()
                                .name(trainerDto.getName())
                                .email(trainerDto.getEmail())
                                .phone(trainerDto.getPhone())
                                .salary(trainerDto.getSalary())
                                .startDate(trainerDto.getStartDate())
                                .shiftTimings(trainerDto.getShiftTimings())
                                .isPersonalTrainer(trainerDto.getIsPersonalTrainer())
                                .organization(org)
                                .branch(branch)
                                .trainerCode("TRN-" + System.currentTimeMillis())
                                .username(trainerDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .experience(trainerDto.getExperience())
                                .build();
                trainerRepository.save(trainer);
        }

        @Override
        public AdminDashboardDtos.TrainerDetailDto getTrainerById(Long trainerId) {
                Trainer trainer = trainerRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                return mapToTrainerDetailDto(trainer);
        }

        @Override
        public void updateTrainer(Long trainerId, AdminDashboardDtos.TrainerDetailDto trainerDto) {
                Trainer trainer = trainerRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));

                trainer.setName(trainerDto.getName());
                trainer.setEmail(trainerDto.getEmail());
                trainer.setPhone(trainerDto.getPhone());
                trainer.setSalary(trainerDto.getSalary());
                trainer.setStartDate(trainerDto.getStartDate());
                trainer.setShiftTimings(trainerDto.getShiftTimings());
                trainer.setIsPersonalTrainer(trainerDto.getIsPersonalTrainer());
                trainer.setExperience(trainerDto.getExperience());

                trainerRepository.save(trainer);
        }

        @Override
        public void removeTrainer(Long trainerId) {
                Trainer trainer = trainerRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                trainer.setIsDeleted(true);
                trainerRepository.save(trainer);
        }

        // --- STAFF CRUD ---

        @Override
        public void createStaff(AdminDashboardDtos.StaffDetailDto staffDto, Long organizationId, Long branchId) {
                System.out.println("DEBUG: createStaff called for: " + staffDto.getName());
                System.out.println("DEBUG: createStaff Role received: '" + staffDto.getRole() + "'");

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
                        throw new RuntimeException("Staff name is required");
                }

                if ("TRAINER".equalsIgnoreCase(staffDto.getRole())) {
                        System.out.println("DEBUG: Role matches TRAINER. Redirecting to createTrainer.");
                        AdminDashboardDtos.TrainerDetailDto trainerDto = AdminDashboardDtos.TrainerDetailDto.builder()
                                        .name(staffDto.getName())
                                        .email(staffDto.getEmail())
                                        .phone(staffDto.getPhone())
                                        .salary(staffDto.getSalary())
                                        .startDate(staffDto.getStartDate())
                                        .shiftTimings(staffDto.getShiftTimings())
                                        .isPersonalTrainer(true)
                                        .experience(staffDto.getExperience())
                                        .branchId(branch != null ? branch.getId() : (org != null ? org.getId() : null))
                                        .build();
                        createTrainer(trainerDto, organizationId, branchId);
                        return;
                }

                Staff staff = Staff.builder()
                                .name(staffDto.getName())
                                .email(staffDto.getEmail())
                                .phone(staffDto.getPhone())
                                .salary(staffDto.getSalary())
                                .startDate(staffDto.getStartDate())
                                .shiftTimings(staffDto.getShiftTimings())
                                .role(staffDto.getRole())
                                .organization(org)
                                .branch(branch)
                                .staffCode("STF-" + System.currentTimeMillis())
                                .username(staffDto.getName().replaceAll("\\s+", "") + System.currentTimeMillis())
                                .experience(staffDto.getExperience())
                                .build();
                staffRepository.save(staff);
        }

        @Override
        public AdminDashboardDtos.StaffDetailDto getStaffById(Long staffId) {
                Staff staff = staffRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("Staff not found"));
                return mapToStaffDetailDto(staff);
        }

        @Override
        public void updateStaff(Long staffId, AdminDashboardDtos.StaffDetailDto staffDto) {
                Staff staff = staffRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("Staff not found"));

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

                staffRepository.save(staff);
        }

        @Override
        public void removeStaff(Long staffId) {
                Staff staff = staffRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("Staff not found"));
                staff.setIsDeleted(true);
                staffRepository.save(staff);
        }

        @Override
        public void assignTrainer(Long userId, String trainerName) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Potential issue: Multiple trainers with same name? Ideally use ID.
                // For now, finding first match in same org.
                Trainer trainer = trainerRepository.findAll().stream()
                                .filter(t -> t.getName().equalsIgnoreCase(trainerName)
                                                && t.getOrganization().getId().equals(user.getOrganization().getId()))
                                // Enforce same branch if user has branch
                                .filter(t -> user.getBranch() == null || (t.getBranch() != null
                                                && t.getBranch().getId().equals(user.getBranch().getId())))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Trainer not found: " + trainerName));

                user.setTrainer(trainer);
                userRepository.save(user);
        }

        @Override
        public void updateDietPlan(Long userId, List<String> dietDetails) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

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
        public void updateStaffPaymentStatus(Long staffId, String status) {
                Staff staff = staffRepository.findById(staffId)
                                .orElseThrow(() -> new RuntimeException("Staff not found"));
                staff.setPaymentStatus(status);
                staffRepository.save(staff);
        }

        @Override
        public void updateTrainerPaymentStatus(Long trainerId, String status) {
                Trainer trainer = trainerRepository.findById(trainerId)
                                .orElseThrow(() -> new RuntimeException("Trainer not found"));
                trainer.setPaymentStatus(status);
                trainerRepository.save(trainer);
        }

        @Override
        public AdminDashboardDtos.DashboardStatsDto getDashboardStats(Long organizationId, Long branchId) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                List<User> users;
                List<Trainer> trainers;
                List<Staff> staff;

                if (branchId != null) {
                        users = userRepository.findByBranchId(branchId);
                        trainers = trainerRepository.findByBranchId(branchId);
                        staff = staffRepository.findByBranchId(branchId);
                } else {
                        users = userRepository.findByOrganizationId(org.getId());
                        trainers = trainerRepository.findByOrganizationId(org.getId());
                        staff = staffRepository.findByOrganizationId(org.getId());
                }

                // 1. Total Members
                long totalMembers = users.stream().filter(u -> !Boolean.TRUE.equals(u.getIsDeleted())).count();

                // 2. Active Staff (Trainers + General Staff)
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
                                        LocalDate endDate = calculateEndDate(u.getStartDate(), u.getPlan());
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
        public List<AdminDashboardDtos.BranchDto> getBranches(Long organizationId) {
                Organization org = organizationRepository.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found"));

                return branchRepository.findByOrganizationId(org.getId()).stream()
                                .map(branch -> {
                                        Admin branchAdmin = adminRepository.findTopByBranchId(branch.getId())
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
        public void resendAdminVerification(Long branchId) {
                Admin branchAdmin = adminRepository.findTopByBranchId(branchId)
                                .orElseThrow(() -> new RuntimeException("Branch Admin not found"));

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
                                .userCode(user.getUserCode())
                                .username(user.getUsername())
                                .name(user.getName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .dob(user.getDob())
                                .plan(user.getPlan())
                                .amountPaid(user.getAmountPaid())
                                // user.getTrainer().getName() : null) // Modified to prevent lazy init if
                                // needed, but entity should be fetched.
                                .trainerName(user.getTrainer() != null ? user.getTrainer().getName() : null)
                                .trainerCode(user.getTrainer() != null ? user.getTrainer().getTrainerCode() : null) // Added
                                                                                                                    // trainerCode
                                .startDate(user.getStartDate())
                                .endDate(calculateEndDate(user.getStartDate(), user.getPlan()))
                                .attendanceCount(user.getAttendanceCount())
                                .isActive(user.getIsActive())
                                .isEmailVerified(user.getIsEmailVerified())
                                .status(Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Expired")
                                .role(user.getRole() != null ? user.getRole().name() : null)
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

        private AdminDashboardDtos.StaffTrackingDto mapStaffToDto(Staff staff) {
                return AdminDashboardDtos.StaffTrackingDto.builder()
                                .id(staff.getId())
                                .code(staff.getStaffCode()) // Added
                                .role(staff.getRole() != null ? staff.getRole() : "STAFF") // Added
                                .entityType("STAFF") // Added for payment status update
                                .paymentStatus(staff.getPaymentStatus() != null ? staff.getPaymentStatus() : "Pending") // Added
                                .name(staff.getName())
                                .email(staff.getEmail())
                                .phoneNumber(staff.getPhone())
                                .salary(staff.getSalary())
                                .startedDate(staff.getStartDate())
                                .shiftTimings(staff.getShiftTimings())
                                .isPersonalTrainer("TRAINER".equalsIgnoreCase(staff.getRole()))
                                .customerNames(Collections.emptyList())
                                .build();
        }

        private AdminDashboardDtos.StaffDetailDto mapToStaffDetailDto(Staff staff) {
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

        private AdminDashboardDtos.StaffTrackingDto mapTrainerToDto(Trainer trainer) {
                return AdminDashboardDtos.StaffTrackingDto.builder()
                                .id(trainer.getId())
                                .code(trainer.getTrainerCode()) // Added
                                .role("TRAINER") // Added
                                .entityType("TRAINER") // Added
                                .paymentStatus(trainer.getPaymentStatus() != null ? trainer.getPaymentStatus()
                                                : "Pending") // Added
                                .name(trainer.getName())
                                .email(trainer.getEmail())
                                .phoneNumber(trainer.getPhone())
                                .salary(trainer.getSalary())
                                .startedDate(trainer.getStartDate())
                                .shiftTimings(trainer.getShiftTimings())
                                .isPersonalTrainer(true) // Force true for Trainer entities
                                .customerNames(Collections.emptyList()) // Fetch allocated users if needed
                                .build();
        }

        private AdminDashboardDtos.TrainerDetailDto mapToTrainerDetailDto(Trainer trainer) {
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
