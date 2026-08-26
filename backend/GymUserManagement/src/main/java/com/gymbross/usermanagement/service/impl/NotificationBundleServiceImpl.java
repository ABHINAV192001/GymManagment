package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.service.EmailService;
import com.gymbross.usermanagement.dto.NotificationBundleDto;
import com.gymbross.usermanagement.entity.WaterLog;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.repository.WaterLogRepository;
import com.gymbross.usermanagement.service.CalorieCalculatorService;
import com.gymbross.usermanagement.service.NotificationBundleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationBundleServiceImpl implements NotificationBundleService {

    private final UserRepository userRepository;
    private final WaterLogRepository waterLogRepository;
    private final CalorieCalculatorService calorieCalculatorService;
    private final EmailService emailService;
    private final com.Gym.GymCommonServices.service.WhatsAppService whatsAppService;

    // In-memory cache for user preferences
    private final ConcurrentHashMap<String, NotificationBundleDto> userPreferencesCache = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public NotificationBundleDto getNotificationBundle(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        // Check if user already customized preferences
        if (userPreferencesCache.containsKey(username)) {
            NotificationBundleDto cached = userPreferencesCache.get(username);
            // Refresh live water stats
            enrichWithLiveStats(user, cached);
            return cached;
        }

        // Build personalized initial bundle
        int targetCalories = calorieCalculatorService.calculateTargetCalories(user);
        if (targetCalories <= 0) targetCalories = 2200;

        int proteinGrams = (int) Math.round((targetCalories * 0.30) / 4.0);
        int carbsGrams = (int) Math.round((targetCalories * 0.45) / 4.0);
        int fatGrams = (int) Math.round((targetCalories * 0.25) / 9.0);

        String userEmail = user.getEmail() != null ? user.getEmail() : "user@gymbross.com";
        String goal = user.getGoal() != null ? user.getGoal().toUpperCase() : "FITNESS & STRENGTH";

        NotificationBundleDto bundle = NotificationBundleDto.builder()
                .enabled(true)
                .recipientEmail(userEmail)
                .workoutReminder(NotificationBundleDto.WorkoutReminderDto.builder()
                        .enabled(true)
                        .preferredTime("07:00")
                        .splitFocus("Full Body & Core Power (" + goal + ")")
                        .includeWarmup(true)
                        .includeMotivation(true)
                        .targetExercises(Arrays.asList(
                                "Barbell Bench Press - 4 Sets x 10 Reps",
                                "Incline Dumbbell Press - 3 Sets x 12 Reps",
                                "Seated Cable Rows - 4 Sets x 12 Reps",
                                "Standing Overhead Barbell Press - 3 Sets x 10 Reps",
                                "Hanging Leg Raises - 3 Sets x 15 Reps"
                        ))
                        .build())
                .dietReminder(NotificationBundleDto.DietReminderDto.builder()
                        .enabled(true)
                        .breakfastTime("08:30")
                        .lunchTime("13:00")
                        .snackTime("17:00")
                        .dinnerTime("20:30")
                        .dailyCalorieTarget(targetCalories)
                        .proteinTargetGrams(proteinGrams)
                        .carbsTargetGrams(carbsGrams)
                        .fatTargetGrams(fatGrams)
                        .suggestMealIdeas(true)
                        .dietPlanName(user.getPlan() != null ? user.getPlan().getName() + " Metabolic Diet" : "Custom High-Protein Diet")
                        .build())
                .waterReminder(NotificationBundleDto.WaterReminderDto.builder()
                        .enabled(true)
                        .intervalHours(1) // Every 1 hour
                        .startTime("08:00")
                        .endTime("22:00")
                        .dailyTargetLiters(3.5)
                        .currentLoggedLiters(0.0)
                        .percentageCompleted(0)
                        .alertIfBelowTarget(true)
                        .build())
                .walkReminder(NotificationBundleDto.WalkReminderDto.builder()
                        .enabled(true)
                        .intervalHours(1) // Hourly desk break
                        .walkTime("18:30") // Daily evening walk
                        .dailyStepTarget(10000)
                        .reminderType("BOTH")
                        .build())
                .build();

        enrichWithLiveStats(user, bundle);
        userPreferencesCache.put(username, bundle);
        return bundle;
    }

    private void enrichWithLiveStats(User user, NotificationBundleDto bundle) {
        if (bundle == null || user == null) return;

        double totalWaterMl = waterLogRepository.findByUserAndDate(user, LocalDate.now())
                .stream()
                .mapToDouble(WaterLog::getAmount)
                .sum();
        double currentLiters = Math.round((totalWaterMl / 1000.0) * 100.0) / 100.0;
        double targetLiters = bundle.getWaterReminder() != null && bundle.getWaterReminder().getDailyTargetLiters() != null
                ? bundle.getWaterReminder().getDailyTargetLiters() : 3.5;
        int percentage = (int) Math.min(100, Math.round((currentLiters / targetLiters) * 100));

        if (bundle.getWaterReminder() != null) {
            bundle.getWaterReminder().setCurrentLoggedLiters(currentLiters);
            bundle.getWaterReminder().setPercentageCompleted(percentage);
        }
    }

    @Override
    @Transactional
    public NotificationBundleDto saveNotificationBundle(String username, NotificationBundleDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        enrichWithLiveStats(user, dto);
        userPreferencesCache.put(username, dto);
        log.info("Saved Notification Routine Bundle for user: {}", username);
        return dto;
    }

    @Override
    public void sendNotificationBundleEmail(String username, NotificationBundleDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        enrichWithLiveStats(user, dto);

        String recipient = dto.getRecipientEmail() != null && !dto.getRecipientEmail().trim().isEmpty()
                ? dto.getRecipientEmail() : user.getEmail();

        if (recipient == null || !recipient.contains("@")) {
            throw new IllegalArgumentException("Invalid email address for notification bundle delivery: " + recipient);
        }

        String todayFormatted = LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy"));
        String userName = user.getName() != null ? user.getName() : username;

        String subject = "🔔 Your GymBross Daily Fitness & Routine Digest - " + todayFormatted;
        String body = buildEmailBody(userName, todayFormatted, dto);

        log.info("Dispatching Daily Routine Notification Bundle to email: {}", recipient);
        emailService.sendEmail(recipient, subject, body);

        // Also dispatch to WhatsApp if user has a phone number
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            StringBuilder waMsg = new StringBuilder();
            waMsg.append("📅 *Today's Fitness Plan (").append(todayFormatted).append(")*\n\n");
            
            if (dto.getWorkoutReminder() != null && Boolean.TRUE.equals(dto.getWorkoutReminder().getEnabled())) {
                waMsg.append("🏋️‍♂️ *Workout:* ").append(dto.getWorkoutReminder().getSplitFocus())
                     .append(" at ").append(dto.getWorkoutReminder().getPreferredTime()).append("\n");
            }
            if (dto.getDietReminder() != null && Boolean.TRUE.equals(dto.getDietReminder().getEnabled())) {
                waMsg.append("🥗 *Diet Target:* ").append(dto.getDietReminder().getDailyCalorieTarget()).append(" kcal (")
                     .append(dto.getDietReminder().getProteinTargetGrams()).append("g Protein)\n");
            }
            if (dto.getWaterReminder() != null && Boolean.TRUE.equals(dto.getWaterReminder().getEnabled())) {
                waMsg.append("💧 *Water Target:* ").append(dto.getWaterReminder().getDailyTargetLiters()).append("L\n");
            }
            if (dto.getWalkReminder() != null && Boolean.TRUE.equals(dto.getWalkReminder().getEnabled())) {
                waMsg.append("🚶‍♂️ *Daily Steps:* ").append(dto.getWalkReminder().getDailyStepTarget()).append(" steps\n");
            }
            waMsg.append("\n👉 Log your progress in the GymBross Member Portal!");

            whatsAppService.sendWorkoutAndDietReminder(user.getPhone(), userName, "WORKOUT", waMsg.toString());
        }
    }

    private String buildEmailBody(String name, String date, NotificationBundleDto bundle) {
        StringBuilder sb = new StringBuilder();
        sb.append("====================================================\n");
        sb.append("      GYMBROSS - DAILY ROUTINE & NOTIFICATION BUNDLE\n");
        sb.append("====================================================\n\n");
        sb.append("Hello ").append(name).append(",\n");
        sb.append("Here is your personalized daily routine and fitness plan for today (").append(date).append("):\n\n");

        // 1. Workout Section
        if (bundle.getWorkoutReminder() != null && Boolean.TRUE.equals(bundle.getWorkoutReminder().getEnabled())) {
            sb.append("🏋️‍♂️ 1. TODAY'S WORKOUT ROUTINE\n");
            sb.append("----------------------------------------------------\n");
            sb.append(" • Scheduled Workout Time: ").append(bundle.getWorkoutReminder().getPreferredTime()).append("\n");
            sb.append(" • Split Focus: ").append(bundle.getWorkoutReminder().getSplitFocus()).append("\n");
            if (Boolean.TRUE.equals(bundle.getWorkoutReminder().getIncludeWarmup())) {
                sb.append(" • Warm-up: 5 mins treadmill dynamic stretch + rotator cuff activation\n");
            }
            if (bundle.getWorkoutReminder().getTargetExercises() != null) {
                sb.append(" • Planned Exercises:\n");
                for (String ex : bundle.getWorkoutReminder().getTargetExercises()) {
                    sb.append("    - ").append(ex).append("\n");
                }
            }
            sb.append("\n");
        }

        // 2. Diet Section
        if (bundle.getDietReminder() != null && Boolean.TRUE.equals(bundle.getDietReminder().getEnabled())) {
            sb.append("🥗 2. DIET & NUTRITION ('WHAT TO EAT')\n");
            sb.append("----------------------------------------------------\n");
            sb.append(" • Daily Target: ").append(bundle.getDietReminder().getDailyCalorieTarget()).append(" kcal\n");
            sb.append(" • Target Macros: Protein: ").append(bundle.getDietReminder().getProteinTargetGrams()).append("g | ");
            sb.append("Carbs: ").append(bundle.getDietReminder().getCarbsTargetGrams()).append("g | ");
            sb.append("Fats: ").append(bundle.getDietReminder().getFatTargetGrams()).append("g\n");
            sb.append(" • Meal Schedule:\n");
            sb.append("    - Breakfast (").append(bundle.getDietReminder().getBreakfastTime()).append("): Oatmeal with whey protein, chia seeds & banana\n");
            sb.append("    - Lunch (").append(bundle.getDietReminder().getLunchTime()).append("): Grilled chicken/paneer breast with brown rice & broccoli\n");
            sb.append("    - Evening Snack (").append(bundle.getDietReminder().getSnackTime()).append("): Greek yogurt with raw almonds & berries\n");
            sb.append("    - Dinner (").append(bundle.getDietReminder().getDinnerTime()).append("): Salmon or tofu stir-fry with quinoa & avocado salad\n\n");
        }

        // 3. Hydration Section
        if (bundle.getWaterReminder() != null && Boolean.TRUE.equals(bundle.getWaterReminder().getEnabled())) {
            double logged = bundle.getWaterReminder().getCurrentLoggedLiters() != null ? bundle.getWaterReminder().getCurrentLoggedLiters() : 0.0;
            double target = bundle.getWaterReminder().getDailyTargetLiters() != null ? bundle.getWaterReminder().getDailyTargetLiters() : 3.5;
            int pct = bundle.getWaterReminder().getPercentageCompleted() != null ? bundle.getWaterReminder().getPercentageCompleted() : 0;
            int interval = bundle.getWaterReminder().getIntervalHours() != null ? bundle.getWaterReminder().getIntervalHours() : 1;

            sb.append("💧 3. HYDRATION LEVEL & WATER TIMER\n");
            sb.append("----------------------------------------------------\n");
            sb.append(" • Current Logged Water: ").append(logged).append("L / ").append(target).append("L (").append(pct).append("% Completed)\n");
            sb.append(" • Recurring Drink Timer: Every ").append(interval).append(" Hour(s) between ").append(bundle.getWaterReminder().getStartTime()).append(" - ").append(bundle.getWaterReminder().getEndTime()).append("\n");
            double remaining = Math.max(0, target - logged);
            String actionMsg = remaining > 0 
                    ? "Drink 1 glass of water now (" + String.format("%.2f", remaining) + "L remaining today)!" 
                    : "Daily goal achieved! Great job staying hydrated.";
            sb.append(" • Hydration Action: ").append(actionMsg).append("\n\n");
        }

        // 4. Walk & Movement Section
        if (bundle.getWalkReminder() != null && Boolean.TRUE.equals(bundle.getWalkReminder().getEnabled())) {
            int interval = bundle.getWalkReminder().getIntervalHours() != null ? bundle.getWalkReminder().getIntervalHours() : 1;
            int stepTarget = bundle.getWalkReminder().getDailyStepTarget() != null ? bundle.getWalkReminder().getDailyStepTarget() : 10000;

            sb.append("🚶‍♂️ 4. MOVEMENT & WALK REMINDER\n");
            sb.append("----------------------------------------------------\n");
            sb.append(" • Hourly Desk Break: Stand up & take a 5-10 minute walk every ").append(interval).append(" Hour(s)\n");
            sb.append(" • Daily Evening Walk: Scheduled at ").append(bundle.getWalkReminder().getWalkTime()).append("\n");
            sb.append(" • Daily Target Steps: ").append(stepTarget).append(" Steps\n\n");
        }

        sb.append("----------------------------------------------------\n");
        sb.append("Stay consistent, hit your targets, and achieve your goals today!\n");
        sb.append("Log your meals, workouts, and water on: http://localhost:3000/member-portal\n");
        sb.append("— GymBross Fitness & Health System\n");

        return sb.toString();
    }
}
