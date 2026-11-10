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
    private final com.Gym.GymCommonServices.service.AppUrlService appUrlService;

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

        String userEmail = user.getEmail() != null ? user.getEmail() : "";
        String goal = user.getGoal() != null ? user.getGoal().toUpperCase() : "GENERAL FITNESS";

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
        String portalLink = appUrlService.buildFrontendUrl("/member-portal");
        String htmlContent = buildNotificationBundleHtmlEmail(userName, todayFormatted, dto, portalLink);

        log.info("Dispatching Daily Routine Notification Bundle HTML email to: {}", recipient);
        emailService.sendHtmlEmail(recipient, subject, htmlContent);

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

    private String buildNotificationBundleHtmlEmail(String name, String date, NotificationBundleDto bundle, String portalLink) {
        StringBuilder workoutHtml = new StringBuilder();
        if (bundle.getWorkoutReminder() != null && Boolean.TRUE.equals(bundle.getWorkoutReminder().getEnabled())) {
            workoutHtml.append("<div style=\"background-color:#141417; border:1px solid #27272a; border-radius:12px; padding:18px; margin-bottom:18px;\">\n")
                    .append("  <div style=\"font-size:14px; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;\">🏋️‍♂️ 1. Today's Workout Routine</div>\n")
                    .append("  <div style=\"font-size:13px; color:#f4f4f5; margin-bottom:6px;\"><strong>Focus Split:</strong> <span style=\"color:#38bdf8; font-weight:700;\">")
                    .append(bundle.getWorkoutReminder().getSplitFocus() != null ? bundle.getWorkoutReminder().getSplitFocus() : "General Fitness").append("</span></div>\n")
                    .append("  <div style=\"font-size:13px; color:#a1a1aa; margin-bottom:6px;\"><strong>Scheduled Time:</strong> ")
                    .append(bundle.getWorkoutReminder().getPreferredTime() != null ? bundle.getWorkoutReminder().getPreferredTime() : "Flexible").append("</div>\n");

            if (Boolean.TRUE.equals(bundle.getWorkoutReminder().getIncludeWarmup())) {
                workoutHtml.append("  <div style=\"font-size:12px; color:#e4e4e7; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); padding:8px 12px; border-radius:8px; margin:8px 0;\">🔥 <strong>Warm-up:</strong> 5 mins treadmill dynamic stretch + rotator cuff activation</div>\n");
            }

            if (bundle.getWorkoutReminder().getTargetExercises() != null && !bundle.getWorkoutReminder().getTargetExercises().isEmpty()) {
                workoutHtml.append("  <div style=\"font-size:12px; color:#a1a1aa; margin-top:8px;\"><strong>Planned Exercises:</strong>\n")
                        .append("    <ul style=\"margin:6px 0 0 0; padding-left:18px; color:#d4d4d8;\">\n");
                for (String ex : bundle.getWorkoutReminder().getTargetExercises()) {
                    workoutHtml.append("      <li style=\"margin-bottom:3px;\">").append(ex).append("</li>\n");
                }
                workoutHtml.append("    </ul>\n  </div>\n");
            }
            workoutHtml.append("</div>\n");
        }

        StringBuilder dietHtml = new StringBuilder();
        if (bundle.getDietReminder() != null && Boolean.TRUE.equals(bundle.getDietReminder().getEnabled())) {
            dietHtml.append("<div style=\"background-color:#141417; border:1px solid #27272a; border-radius:12px; padding:18px; margin-bottom:18px;\">\n")
                    .append("  <div style=\"font-size:14px; font-weight:800; color:#34d399; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;\">🥗 2. Diet & Macro Targets</div>\n")
                    .append("  <div style=\"font-size:13px; color:#f4f4f5; margin-bottom:8px;\"><strong>Daily Target:</strong> <span style=\"font-size:16px; font-weight:900; color:#34d399;\">")
                    .append(bundle.getDietReminder().getDailyCalorieTarget()).append(" kcal</span></div>\n")
                    .append("  <table role=\"presentation\" width=\"100%\" cellspacing=\"4\" cellpadding=\"0\" style=\"margin:10px 0;\">\n")
                    .append("    <tr>\n")
                    .append("      <td align=\"center\" style=\"background:#064e3b; border:1px solid #059669; border-radius:8px; padding:8px 4px;\"><div style=\"font-size:11px; color:#a7f3d0;\">Protein</div><div style=\"font-size:14px; font-weight:800; color:#ffffff;\">")
                    .append(bundle.getDietReminder().getProteinTargetGrams()).append("g</div></td>\n")
                    .append("      <td align=\"center\" style=\"background:#1e3a8a; border:1px solid #2563eb; border-radius:8px; padding:8px 4px;\"><div style=\"font-size:11px; color:#bfdbfe;\">Carbs</div><div style=\"font-size:14px; font-weight:800; color:#ffffff;\">")
                    .append(bundle.getDietReminder().getCarbsTargetGrams()).append("g</div></td>\n")
                    .append("      <td align=\"center\" style=\"background:#78350f; border:1px solid #d97706; border-radius:8px; padding:8px 4px;\"><div style=\"font-size:11px; color:#fde68a;\">Fats</div><div style=\"font-size:14px; font-weight:800; color:#ffffff;\">")
                    .append(bundle.getDietReminder().getFatTargetGrams()).append("g</div></td>\n")
                    .append("    </tr>\n")
                    .append("  </table>\n")
                    .append("  <div style=\"font-size:12px; color:#a1a1aa; line-height:1.6; margin-top:8px;\">\n")
                    .append("    • <strong>Breakfast (").append(bundle.getDietReminder().getBreakfastTime()).append("):</strong> Oatmeal with whey protein, chia seeds & banana<br/>\n")
                    .append("    • <strong>Lunch (").append(bundle.getDietReminder().getLunchTime()).append("):</strong> Grilled chicken/paneer with brown rice & veggies<br/>\n")
                    .append("    • <strong>Evening Snack (").append(bundle.getDietReminder().getSnackTime()).append("):</strong> Greek yogurt with raw almonds & berries<br/>\n")
                    .append("    • <strong>Dinner (").append(bundle.getDietReminder().getDinnerTime()).append("):</strong> Salmon or tofu stir-fry with quinoa & avocado salad\n")
                    .append("  </div>\n")
                    .append("</div>\n");
        }

        StringBuilder waterHtml = new StringBuilder();
        if (bundle.getWaterReminder() != null && Boolean.TRUE.equals(bundle.getWaterReminder().getEnabled())) {
            double logged = bundle.getWaterReminder().getCurrentLoggedLiters() != null ? bundle.getWaterReminder().getCurrentLoggedLiters() : 0.0;
            double target = bundle.getWaterReminder().getDailyTargetLiters() != null ? bundle.getWaterReminder().getDailyTargetLiters() : 3.5;
            int pct = bundle.getWaterReminder().getPercentageCompleted() != null ? bundle.getWaterReminder().getPercentageCompleted() : 0;
            int interval = bundle.getWaterReminder().getIntervalHours() != null ? bundle.getWaterReminder().getIntervalHours() : 1;
            double remaining = Math.max(0, target - logged);

            waterHtml.append("<div style=\"background-color:#141417; border:1px solid #27272a; border-radius:12px; padding:18px; margin-bottom:18px;\">\n")
                    .append("  <div style=\"font-size:14px; font-weight:800; color:#60a5fa; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;\">💧 3. Hydration & Water Timer</div>\n")
                    .append("  <div style=\"font-size:13px; color:#f4f4f5; margin-bottom:6px;\"><strong>Logged Water:</strong> <span style=\"color:#60a5fa; font-weight:800;\">")
                    .append(String.format("%.1f", logged)).append("L / ").append(String.format("%.1f", target)).append("L</span> (").append(pct).append("% Completed)</div>\n")
                    .append("  <div style=\"background-color:#27272a; border-radius:6px; height:8px; overflow:hidden; margin:8px 0 12px 0;\">\n")
                    .append("    <div style=\"background:linear-gradient(90deg, #3b82f6, #60a5fa); width:").append(Math.min(100, Math.max(0, pct))).append("%; height:100%; border-radius:6px;\"></div>\n")
                    .append("  </div>\n")
                    .append("  <div style=\"font-size:12px; color:#93c5fd;\">⏰ Reminder frequency: Every ").append(interval).append(" hour(s) | ")
                    .append(remaining > 0 ? "Drink 1 glass of water now (" + String.format("%.1f", remaining) + "L remaining today)" : "Daily water goal reached! 🎉")
                    .append("</div>\n")
                    .append("</div>\n");
        }

        StringBuilder walkHtml = new StringBuilder();
        if (bundle.getWalkReminder() != null && Boolean.TRUE.equals(bundle.getWalkReminder().getEnabled())) {
            int interval = bundle.getWalkReminder().getIntervalHours() != null ? bundle.getWalkReminder().getIntervalHours() : 1;
            int stepTarget = bundle.getWalkReminder().getDailyStepTarget() != null ? bundle.getWalkReminder().getDailyStepTarget() : 10000;

            walkHtml.append("<div style=\"background-color:#141417; border:1px solid #27272a; border-radius:12px; padding:18px; margin-bottom:22px;\">\n")
                    .append("  <div style=\"font-size:14px; font-weight:800; color:#fbbf24; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;\">🚶‍♂️ 4. Movement & Daily Steps</div>\n")
                    .append("  <div style=\"font-size:13px; color:#f4f4f5; margin-bottom:6px;\"><strong>Daily Target:</strong> <span style=\"color:#fbbf24; font-weight:800;\">")
                    .append(stepTarget).append(" Steps</span></div>\n")
                    .append("  <div style=\"font-size:12px; color:#a1a1aa;\">Hourly desk breaks: Every ").append(interval).append(" hour(s) • Evening walk scheduled at ").append(bundle.getWalkReminder().getWalkTime()).append("</div>\n")
                    .append("</div>\n");
        }

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Daily Fitness Digest</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:36px 12px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:620px; background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);\">\n" +
                "          <!-- Cyan / Teal Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #0284c7 0%, #0d9488 50%, #2563eb 100%); padding: 32px 24px; text-align: center;\">\n" +
                "              <div style=\"display:inline-block; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.3); padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:800; color:#ffffff; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;\">\n" +
                "                🔔 DAILY FITNESS & ROUTINE DIGEST\n" +
                "              </div>\n" +
                "              <h1 style=\"margin:0; color:#ffffff; font-size:25px; font-weight:900; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS FITNESS</h1>\n" +
                "              <p style=\"margin:6px 0 0 0; color:#e0f2fe; font-size:14px; font-weight:600;\">" + date + " • Personalized Schedule</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Body -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:32px 28px;\">\n" +
                "              <h2 style=\"margin:0 0 10px 0; color:#ffffff; font-size:22px; font-weight:700;\">Ready to Crush Today, " + name + "? ⚡</h2>\n" +
                "              <p style=\"margin:0 0 24px 0; color:#a1a1aa; font-size:14px; line-height:1.6;\">\n" +
                "                Here is your customized routine for today. Follow your meal targets, stay hydrated, and complete your planned workout to maintain your streak!\n" +
                "              </p>\n" +
                "\n" +
                workoutHtml.toString() +
                dietHtml.toString() +
                waterHtml.toString() +
                walkHtml.toString() +
                "              <!-- Standalone Action Button -->\n" +
                "              <div style=\"text-align:center; margin:28px 0 16px 0;\">\n" +
                "                <a href=\"" + portalLink + "\" style=\"display:inline-block; background:linear-gradient(135deg, #0284c7 0%, #0d9488 100%); color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:15px 36px; border-radius:10px; box-shadow:0 4px 16px rgba(2, 132, 199, 0.4); letter-spacing:0.3px;\">\n" +
                "                  ⚡ Open Member Portal & Log Activity\n" +
                "                </a>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Security Note -->\n" +
                "              <div style=\"padding-top:16px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">\n" +
                "                🔒 Track your routine, view calories, and log workouts anytime on the GymBross Member Portal.\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color:#09090b; padding:20px 24px; text-align:center; border-top:1px solid #27272a; font-size:12px; color:#71717a;\">\n" +
                "              © 2026 GymBross Inc. All rights reserved. • High Performance Fitness Operations\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }
}
