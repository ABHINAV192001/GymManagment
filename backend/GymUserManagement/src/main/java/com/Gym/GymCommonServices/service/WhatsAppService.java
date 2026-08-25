package com.Gym.GymCommonServices.service;

/**
 * Service interface for dispatching WhatsApp notifications via Twilio.
 */
public interface WhatsAppService {

    /**
     * Sends a raw message to a WhatsApp recipient.
     *
     * @param toPhoneNumber Recipient phone number (local or E.164 format)
     * @param messageBody Text body with optional WhatsApp markdown formatting (*bold*, _italic_)
     * @return true if successfully dispatched to Twilio, false otherwise
     */
    boolean sendWhatsAppMessage(String toPhoneNumber, String messageBody);

    /**
     * Sends an account creation / welcome notification to a newly registered user or organization.
     *
     * @param toPhoneNumber Recipient phone number
     * @param name User full name
     * @param email User login email
     * @param temporaryPasswordOrLink Setup password link or temporary credentials
     * @param role User assigned role (e.g. ORG_ADMIN, MEMBER, TRAINER)
     * @return true if message successfully sent
     */
    boolean sendAccountCreatedNotification(String toPhoneNumber, String name, String email, String temporaryPasswordOrLink, String role);

    /**
     * Sends an OTP authentication / verification code over WhatsApp.
     *
     * @param toPhoneNumber Recipient phone number
     * @param name User name
     * @param otpCode 6-digit one-time password
     * @param expiryMinutes Validity in minutes (e.g. 15)
     * @param verificationLink Direct action verification link
     * @return true if message successfully sent
     */
    boolean sendOtpNotification(String toPhoneNumber, String name, String otpCode, int expiryMinutes, String verificationLink);

    /**
     * Sends a general broadcast or system alert to a user.
     *
     * @param toPhoneNumber Recipient phone number
     * @param title Alert title
     * @param message Alert body
     * @return true if message successfully sent
     */
    boolean sendGeneralNotification(String toPhoneNumber, String title, String message);

    /**
     * Sends a personalized workout or diet reminder notification.
     *
     * @param toPhoneNumber Recipient phone number
     * @param name User name
     * @param reminderType WORKOUT, DIET, WATER, or WALK
     * @param content Formatted details
     * @return true if message successfully sent
     */
    boolean sendWorkoutAndDietReminder(String toPhoneNumber, String name, String reminderType, String content);
}
