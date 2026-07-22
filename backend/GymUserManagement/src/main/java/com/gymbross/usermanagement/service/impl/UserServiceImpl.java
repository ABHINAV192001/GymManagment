package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.repository.TrainerRatingRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import com.gymbross.usermanagement.service.CalorieCalculatorService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
                private final com.gymbross.usermanagement.repository.FoodLogRepository foodLogRepository;
    private final com.gymbross.usermanagement.repository.WaterLogRepository waterLogRepository;
    private final TrainerRatingRepository trainerRatingRepository;
    private final CalorieCalculatorService calorieCalculatorService;



    @Override
    @Transactional(readOnly = true)
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
        long seed = selectedDate.toString().hashCode() + user.getId().hashCode();
        java.util.Random random = new java.util.Random(seed);

        // Calculate Age (Same as getProfile)
        Integer age = user.getAge();
        if (age == null && user.getDob() != null) {
            age = java.time.Period.between(user.getDob(), java.time.LocalDate.now()).getYears();
        }

        // Calculate Target Calories using domain service
        int targetCalories = calorieCalculatorService.calculateTargetCalories(user);

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
        // 1. Validate User Code (Referral)
        if (!"Unknown".equalsIgnoreCase(adminCode) && adminCode != null) {
            userRepository.findByUserCode(adminCode)
                    .orElseThrow(() -> new RuntimeException("Invalid User/Referral Code"));
        }

        // 2. Find Pending User by String & UserCode
        if (role == null)
            role = "USER";

        if ("USER".equalsIgnoreCase(role) || "PREMIUM_USER".equalsIgnoreCase(role) || "BRANCH_ADMIN".equalsIgnoreCase(role) || "ORG_ADMIN".equalsIgnoreCase(role)) {
            User user = userRepository.findByUserCode(userCode)
                    .orElseThrow(() -> new RuntimeException("User not found with code: " + userCode));
            return UserProfileDto.builder()
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .username(user.getUsername()) // This is the ID/Email usually
                    .role(user.getRole())
                    .plan(user.getPlan() != null ? user.getPlan().getName() : null)
                    .build();
        } else if ("TRAINER".equalsIgnoreCase(role)) {
            User trainer = userRepository.findByUserCode(userCode)
                    .orElseThrow(() -> new RuntimeException("User not found with code: " + userCode));
            return UserProfileDto.builder()
                    .name(trainer.getName())
                    .email(trainer.getEmail())
                    .phone(trainer.getPhone())
                    .username(trainer.getUsername())
                    .role("TRAINER")
                    .build();
        } else if ("STAFF".equalsIgnoreCase(role)) {
            User staff = userRepository.findByUserCode(userCode)
                    .orElseThrow(() -> new RuntimeException("User not found with code: " + userCode));
            return UserProfileDto.builder()
                    .name(staff.getName())
                    .email(staff.getEmail())
                    .phone(staff.getPhone())
                    .username(staff.getUsername())
                    .role(staff.getRole())
                    .build();
        }

        throw new RuntimeException("Invalid String: " + role);
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
    public void logWater(String username, com.gymbross.usermanagement.dto.WaterLogRequestDto request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.time.LocalDate logDate;
        try {
            logDate = request.getDate() != null ? java.time.LocalDate.parse(request.getDate()) : java.time.LocalDate.now();
        } catch (Exception e) {
            logDate = java.time.LocalDate.now();
        }

        com.gymbross.usermanagement.entity.WaterLog log = com.gymbross.usermanagement.entity.WaterLog.builder()
                .user(user)
                .amount(request.getAmount())
                .date(logDate)
                .build();

        waterLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
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
    public void deleteFoodLog(java.util.UUID id, String username) {
        com.gymbross.usermanagement.entity.FoodLog log = foodLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if (!log.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this log");
        }

        foodLogRepository.delete(log);
    }

    @Override
    @Transactional
    public void deleteWaterLog(java.util.UUID id, String username) {
        com.gymbross.usermanagement.entity.WaterLog log = waterLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Water Log not found"));

        if (!log.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this log");
        }

        waterLogRepository.delete(log);
    }
}
