package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Admin;
import com.Gym.GymCommonServices.entity.Staff;
import com.Gym.GymCommonServices.entity.Trainer;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.repository.AdminRepository;
import com.gymbross.usermanagement.repository.StaffRepository;
import com.gymbross.usermanagement.repository.TrainerRepository;
import com.gymbross.usermanagement.repository.TrainerRatingRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final TrainerRepository trainerRepository;
    private final StaffRepository staffRepository;
    private final AdminRepository adminRepository;
    private final com.gymbross.usermanagement.repository.FoodLogRepository foodLogRepository;
    private final com.gymbross.usermanagement.repository.WaterLogRepository waterLogRepository;
    private final TrainerRatingRepository trainerRatingRepository;

    public UserProfileDto getProfile(String username) {
        // Try User (Member)
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            Integer age = user.getAge();
            if (age == null && user.getDob() != null) {
                age = java.time.Period.between(user.getDob(), java.time.LocalDate.now()).getYears();
            }

            // Calculate Calories (Simplified logic similar to dashboard)
            int targetCalories = calculateTargetCalories(user, age);

            // Determine End Date (Mock logic: Start Date + 1 Year for now if plan exists)
            java.time.LocalDate endDate = null;
            if (user.getStartDate() != null) {
                endDate = user.getStartDate().plusYears(1);
            }

            return UserProfileDto.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .role(user.getRole() != null ? user.getRole().name() : "USER")
                    .userCode(user.getUserCode())
                    .dob(user.getDob())
                    .age(age)
                    .plan(user.getPlan())
                    .startDate(user.getStartDate())
                    .endDate(endDate)
                    .isActive(user.getIsActive())
                    .trainerName(user.getTrainer() != null ? user.getTrainer().getName() : null)
                    .trainerId(user.getTrainer() != null ? user.getTrainer().getId() : null)
                    .hasTrainer(user.getTrainer() != null)
                    .height(user.getHeight())
                    .weight(user.getWeight())
                    .gender(user.getGender())
                    .activityLevel(user.getActivityLevel())
                    .goal(user.getGoal())
                    .dailyCalorieTarget(targetCalories)
                    .workoutPlanName(user.getPlan() != null ? user.getPlan() + " Workout" : "Standard Routine")
                    .build();
        }

        // Try Trainer
        Optional<Trainer> trainerOpt = trainerRepository.findByUsername(username);
        if (trainerOpt.isPresent()) {
            Trainer trainer = trainerOpt.get();
            return UserProfileDto.builder()
                    .id(trainer.getId())
                    .username(trainer.getUsername())
                    .name(trainer.getName())
                    .email(trainer.getEmail())
                    .phone(trainer.getPhone())
                    .role("TRAINER")
                    .experience(trainer.getExperience())
                    .isPersonalTrainer(trainer.getIsPersonalTrainer())
                    .shiftTimings(trainer.getShiftTimings())
                    .averageRating(trainerRatingRepository.getAverageRating(trainer.getId()))
                    .build();
        }

        // Try Staff
        Optional<Staff> staffOpt = staffRepository.findByUsername(username);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            return UserProfileDto.builder()
                    .id(staff.getId())
                    .username(staff.getUsername())
                    .name(staff.getName())
                    .email(staff.getEmail())
                    .phone(staff.getPhone())
                    .role(staff.getRole()) // Staff role is string
                    .staffRole(staff.getRole())
                    .paymentStatus(staff.getPaymentStatus())
                    .shiftTimings(staff.getShiftTimings())
                    .build();
        }

        // Try Admin
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return UserProfileDto.builder()
                    .id(admin.getId())
                    .username(admin.getUsername())
                    .name(admin.getName() != null ? admin.getName() : admin.getUsername())
                    .email(admin.getEmail())
                    .phone(admin.getPhone())
                    .userCode(admin.getAdminCode())
                    .dob(admin.getDob())
                    .gender(admin.getGender())
                    .isActive(admin.getIsActive())
                    .role(admin.getRole().name())
                    .build();
        }

        throw new RuntimeException("User not found with username: " + username);
    }

    private int calculateTargetCalories(User user, Integer age) {
        double weight = user.getWeight() != null ? user.getWeight() : 70.0;
        double height = user.getHeight() != null ? user.getHeight() : 170.0;
        int userAge = age != null ? age : (user.getAge() != null ? user.getAge() : 25);
        String gender = user.getGender() != null ? user.getGender() : "Male";

        double bmr;
        if ("Female".equalsIgnoreCase(gender)) {
            bmr = (10 * weight) + (6.25 * height) - (5 * userAge) - 161;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * userAge) + 5;
        }

        double multiplier = 1.2;
        String activityLevel = user.getActivityLevel() != null ? user.getActivityLevel().toLowerCase() : "sedentary";
        switch (activityLevel) {
            case "light":
                multiplier = 1.375;
                break;
            case "moderate":
                multiplier = 1.55;
                break;
            case "active":
                multiplier = 1.725;
                break;
            case "very_active":
                multiplier = 1.9;
                break;
        }

        int targetCalories = (int) (bmr * multiplier);
        String goal = user.getGoal() != null ? user.getGoal().toLowerCase() : "maintain";
        if (goal.contains("loss") || goal.contains("cut")) {
            targetCalories -= 500;
        } else if (goal.contains("gain") || goal.contains("bulk")) {
            targetCalories += 500;
        }
        return targetCalories;
    }

    @Override
    @Transactional
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        // Try User
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (dto.getName() != null)
                user.setName(dto.getName());
            if (dto.getEmail() != null)
                user.setEmail(dto.getEmail());
            if (dto.getPhone() != null)
                user.setPhone(dto.getPhone());
            if (dto.getDob() != null)
                user.setDob(dto.getDob());
            if (dto.getHeight() != null)
                user.setHeight(dto.getHeight());
            if (dto.getWeight() != null)
                user.setWeight(dto.getWeight());
            if (dto.getGender() != null)
                user.setGender(dto.getGender());
            if (dto.getActivityLevel() != null)
                user.setActivityLevel(dto.getActivityLevel());
            if (dto.getGoal() != null)
                user.setGoal(dto.getGoal());
            // Age is calculated from DOB usually, but if provided directly:
            if (dto.getAge() != null) {
                user.setAge(dto.getAge());
            }

            if (dto.getPlan() != null)
                user.setPlan(dto.getPlan());

            userRepository.save(user);
            return getProfile(username);
        }

        // Try Trainer
        Optional<Trainer> trainerOpt = trainerRepository.findByUsername(username);
        if (trainerOpt.isPresent()) {
            Trainer trainer = trainerOpt.get();
            if (dto.getName() != null)
                trainer.setName(dto.getName());
            if (dto.getEmail() != null)
                trainer.setEmail(dto.getEmail());
            if (dto.getPhone() != null)
                trainer.setPhone(dto.getPhone());
            if (dto.getExperience() != null)
                trainer.setExperience(dto.getExperience());
            if (dto.getShiftTimings() != null)
                trainer.setShiftTimings(dto.getShiftTimings());
            // isPersonalTrainer is Boolean, check null?
            if (dto.getIsPersonalTrainer() != null)
                trainer.setIsPersonalTrainer(dto.getIsPersonalTrainer());

            trainerRepository.save(trainer);
            return getProfile(username);
        }

        // Try Staff
        Optional<Staff> staffOpt = staffRepository.findByUsername(username);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            if (dto.getName() != null)
                staff.setName(dto.getName());
            if (dto.getEmail() != null)
                staff.setEmail(dto.getEmail());
            if (dto.getPhone() != null)
                staff.setPhone(dto.getPhone());
            if (dto.getShiftTimings() != null)
                staff.setShiftTimings(dto.getShiftTimings());

            staffRepository.save(staff);
            return getProfile(username);
        }

        // Try Admin
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Admin updates if needed
            if (dto.getName() != null)
                admin.setName(dto.getName());
            if (dto.getEmail() != null)
                admin.setEmail(dto.getEmail());
            if (dto.getPhone() != null)
                admin.setPhone(dto.getPhone());
            if (dto.getDob() != null)
                admin.setDob(dto.getDob());
            if (dto.getGender() != null)
                admin.setGender(dto.getGender());

            adminRepository.save(admin);
            return getProfile(username);
        }

        throw new RuntimeException("User not found to update");
    }

    @Override
    @Transactional
    public void toggleUserStatus(String username, boolean isActive) {
        // Try User
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(isActive);
            userRepository.save(user);
        }
    }

    @Override
    public com.gymbross.usermanagement.dto.DashboardDto getDashboardStats(String username, String date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Parse Date or Default to Today
        java.time.LocalDate selectedDate;
        if (date == null || date.isEmpty()) {
            selectedDate = java.time.LocalDate.now();
        } else {
            try {
                selectedDate = java.time.LocalDate.parse(date);
            } catch (Exception e) {
                selectedDate = java.time.LocalDate.now();
            }
        }

        // Use Date Hash to seed Random for deterministic "History"
        long seed = selectedDate.toString().hashCode() + user.getId();
        java.util.Random random = new java.util.Random(seed);

        // Calculate Age (Same as getProfile)
        Integer age = user.getAge();
        if (age == null && user.getDob() != null) {
            age = java.time.Period.between(user.getDob(), java.time.LocalDate.now()).getYears();
        }

        // Calculate Target Calories using shared logic
        int targetCalories = calculateTargetCalories(user, age);

        double weight = user.getWeight() != null ? user.getWeight() : 70.0;
        double height = user.getHeight() != null ? user.getHeight() : 170.0;

        // Calculate Real Totals from FoodLog
        int currentCalories = 0;
        int currentCarbs = 0;
        int currentProtein = 0;
        int currentFat = 0;

        java.util.List<com.gymbross.usermanagement.entity.FoodLog> logs = foodLogRepository.findByUserAndDate(user,
                selectedDate);
        for (com.gymbross.usermanagement.entity.FoodLog log : logs) {
            double quantity = log.getQuantity() != null ? log.getQuantity() : 1.0;
            com.Gym.GymCommonServices.entity.Food food = log.getFood();

            if (food.getCalories() != null)
                currentCalories += (int) (food.getCalories() * quantity);
            if (food.getProtein() != null)
                currentProtein += (int) (food.getProtein() * quantity);
            if (food.getCarbohydrates() != null)
                currentCarbs += (int) (food.getCarbohydrates() * quantity);
            if (food.getFat() != null)
                currentFat += (int) (food.getFat() * quantity);
        }

        // --- Recalculate Steps, Water, and Target Macros (Restored) ---
        // Steps (Default to 0 until we have a tracker)
        int steps = 0;

        // Water (Fetch from Repository)
        double water = waterLogRepository.findByUserAndDate(user, selectedDate).stream()
                .mapToDouble(com.gymbross.usermanagement.entity.WaterLog::getAmount)
                .sum();

        // Macronutrient Split (40/30/30 generic split)
        int targetCarbs = (int) ((targetCalories * 0.4) / 4);
        int targetProtein = (int) ((targetCalories * 0.3) / 4);
        int targetFat = (int) ((targetCalories * 0.3) / 9);

        // Date & Workout Logic
        String dateStr = selectedDate.format(java.time.format.DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        long epochDays = selectedDate.toEpochDay();
        String[] rotation = { "Push Day", "Pull Day", "Leg Day" };
        String workoutDay = rotation[(int) (epochDays % 3)];

        return com.gymbross.usermanagement.dto.DashboardDto.builder()
                .calories(com.gymbross.usermanagement.dto.DashboardDto.Calories.builder().current(currentCalories)
                        .target(targetCalories).build())
                .macros(com.gymbross.usermanagement.dto.DashboardDto.Macros.builder()
                        .carbs(new com.gymbross.usermanagement.dto.DashboardDto.MacroDetail(currentCarbs, targetCarbs))
                        .protein(new com.gymbross.usermanagement.dto.DashboardDto.MacroDetail(currentProtein,
                                targetProtein))
                        .fat(new com.gymbross.usermanagement.dto.DashboardDto.MacroDetail(currentFat, targetFat))
                        .build())
                .activity(com.gymbross.usermanagement.dto.DashboardDto.Activity.builder()
                        .steps(new com.gymbross.usermanagement.dto.DashboardDto.ActivityDetail(steps, 10000, "steps"))
                        .water(new com.gymbross.usermanagement.dto.DashboardDto.ActivityDetail(water, 3.0, "liters"))
                        .build())
                .today(com.gymbross.usermanagement.dto.DashboardDto.Today.builder().date(dateStr).workoutDay(workoutDay)
                        .workoutPlan("Push Pull Legs").build())
                .biometrics(com.gymbross.usermanagement.dto.DashboardDto.Biometrics.builder().height(height)
                        .weight(weight).build())
                .build();
    }

    @Override
    public java.util.List<Object> getAttendanceHistory(String username) {
        return new java.util.ArrayList<>();
    }

    @Override
    public java.util.List<Object> getSubscriptionHistory(String username) {
        return new java.util.ArrayList<>();
    }

    @Override
    public UserProfileDto getInviteDetails(String userCode, String adminCode, String role) {
        // 1. Validate Admin Code (Referral)
        adminRepository.findByAdminCode(adminCode)
                .orElseThrow(() -> new RuntimeException("Invalid Admin/Referral Code"));

        // 2. Find Pending User by Role & UserCode
        if (role == null)
            role = "USER";

        if ("USER".equalsIgnoreCase(role)) {
            User user = userRepository.findByUserCode(userCode)
                    .orElseThrow(() -> new RuntimeException("User not found with code: " + userCode));
            return UserProfileDto.builder()
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .username(user.getUsername()) // This is the ID/Email usually
                    .role("USER")
                    .plan(user.getPlan())
                    .build();
        } else if ("TRAINER".equalsIgnoreCase(role)) {
            Trainer trainer = trainerRepository.findByTrainerCode(userCode)
                    .orElseThrow(() -> new RuntimeException("Trainer not found with code: " + userCode));
            return UserProfileDto.builder()
                    .name(trainer.getName())
                    .email(trainer.getEmail())
                    .phone(trainer.getPhone())
                    .username(trainer.getUsername())
                    .role("TRAINER")
                    .build();
        } else if ("STAFF".equalsIgnoreCase(role)) {
            Staff staff = staffRepository.findByStaffCode(userCode)
                    .orElseThrow(() -> new RuntimeException("Staff not found with code: " + userCode));
            return UserProfileDto.builder()
                    .name(staff.getName())
                    .email(staff.getEmail())
                    .phone(staff.getPhone())
                    .username(staff.getUsername())
                    .role(staff.getRole())
                    .build();
        }

        throw new RuntimeException("Invalid Role: " + role);
    }

    @Override
    @Transactional
    public void submitOnboarding(String username, com.gymbross.usermanagement.dto.OnboardingDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        user.setAge(dto.getAge());
        user.setGender(dto.getGender());
        user.setHeight(dto.getHeight());
        user.setWeight(dto.getWeight());
        user.setActivityLevel(dto.getActivityLevel());
        user.setGoal(dto.getGoal());
        user.setIsOnboardingCompleted(true);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void logWater(String username, double amount, String date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.time.LocalDate logDate;
        try {
            logDate = java.time.LocalDate.parse(date);
        } catch (Exception e) {
            logDate = java.time.LocalDate.now();
        }

        com.gymbross.usermanagement.entity.WaterLog log = com.gymbross.usermanagement.entity.WaterLog.builder()
                .user(user)
                .amount(amount)
                .date(logDate)
                .build();

        waterLogRepository.save(log);
    }

    @Override
    public com.gymbross.usermanagement.dto.DailyLogDto getDailyLog(String username, String date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.time.LocalDate selectedDate;
        try {
            selectedDate = java.time.LocalDate.parse(date);
        } catch (Exception e) {
            selectedDate = java.time.LocalDate.now();
        }

        // 1. Fetch Food Logs
        java.util.List<com.gymbross.usermanagement.entity.FoodLog> logs = foodLogRepository.findByUserAndDate(user,
                selectedDate);

        java.util.List<com.gymbross.usermanagement.dto.FoodLogDto> foodLogDtos = new java.util.ArrayList<>();
        int totalCalories = 0;
        int totalCarbs = 0;
        int totalProtein = 0;
        int totalFat = 0;

        for (com.gymbross.usermanagement.entity.FoodLog log : logs) {
            double quantity = log.getQuantity() != null ? log.getQuantity() : 1.0;
            com.Gym.GymCommonServices.entity.Food food = log.getFood();

            // Assuming quantity is now serving multiplier.
            // If servingUnit in log is used, logic would go here. For now, flat multiplier.
            String portionName = quantity + " serving(s)";
            if (log.getServingUnit() != null) {
                portionName = quantity + " " + log.getServingUnit();
            }

            double itemCalories = food.getCalories() != null ? food.getCalories() * quantity : 0;
            double itemProtein = food.getProtein() != null ? food.getProtein() * quantity : 0;
            double itemCarbs = food.getCarbohydrates() != null ? food.getCarbohydrates() * quantity : 0;
            double itemFat = food.getFat() != null ? food.getFat() * quantity : 0;

            totalCalories += itemCalories;
            totalProtein += itemProtein;
            totalCarbs += itemCarbs;
            totalFat += itemFat;

            foodLogDtos.add(com.gymbross.usermanagement.dto.FoodLogDto.builder()
                    .id(log.getId())
                    .foodName(food.getFoodName()) // Updated from description
                    .quantity(quantity)
                    .portionName(portionName)
                    .calories(itemCalories)
                    .protein(itemProtein)
                    .carbs(itemCarbs)
                    .fat(itemFat)
                    .mealType(log.getMealType())
                    .build());
        }

        // 2. Fetch Water Logs
        java.util.List<com.gymbross.usermanagement.entity.WaterLog> waterLogEntities = waterLogRepository
                .findByUserAndDate(user, selectedDate);
        double water = waterLogEntities.stream()
                .mapToDouble(com.gymbross.usermanagement.entity.WaterLog::getAmount)
                .sum();

        java.util.List<com.gymbross.usermanagement.dto.WaterLogDto> waterLogDtos = waterLogEntities.stream()
                .map(wl -> com.gymbross.usermanagement.dto.WaterLogDto.builder()
                        .id(wl.getId())
                        .amount(wl.getAmount())
                        .loggedAt(wl.getDate().atStartOfDay()) // Using date as best effort since entity might not have
                                                               // time
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return com.gymbross.usermanagement.dto.DailyLogDto.builder()
                .foodLogs(foodLogDtos)
                .waterLogs(waterLogDtos)
                .totalWater(water)
                .totalCalories(totalCalories)
                .totalProtein(totalProtein)
                .totalCarbs(totalCarbs)
                .totalFat(totalFat)
                .build();
    }

    @Override
    @Transactional
    public void deleteFoodLog(Long id, String username) {
        com.gymbross.usermanagement.entity.FoodLog log = foodLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if (!log.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this log");
        }

        foodLogRepository.delete(log);
    }

    @Override
    @Transactional
    public void deleteWaterLog(Long id, String username) {
        com.gymbross.usermanagement.entity.WaterLog log = waterLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Water Log not found"));

        if (!log.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this log");
        }

        waterLogRepository.delete(log);
    }
}
