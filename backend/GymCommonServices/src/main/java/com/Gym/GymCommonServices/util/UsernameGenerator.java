package com.Gym.GymCommonServices.util;

import java.util.Random;

/**
 * Utility class for generating usernames based on organization/user names
 */
public class UsernameGenerator {

    private static final Random RANDOM = new Random();

    /**
     * Generates username for organization
     * Format: first 4 letters of org name (or less if shorter) + 4-digit random
     * number
     * Example: "GymBross" -> "GYMB1234"
     * 
     * @param organizationName the name of the organization
     * @return generated username
     */
    public static String generateOrganizationUsername(String organizationName) {
        if (organizationName == null || organizationName.trim().isEmpty()) {
            throw new IllegalArgumentException("Organization name cannot be null or empty");
        }

        // Remove spaces and special characters, take first 4 letters (or less)
        String cleanedName = organizationName.replaceAll("[^a-zA-Z]", "");
        int length = Math.min(4, cleanedName.length());
        String prefix = cleanedName.substring(0, length).toUpperCase();

        // Generate 4-digit random number
        int randomNumber = 1000 + RANDOM.nextInt(9000); // Range: 1000-9999

        return prefix + randomNumber;
    }

    /**
     * Generates username for users (admin, staff, premium users, etc.)
     * Format: first name + 4-digit random number
     * Example: "John" -> "John1234"
     * 
     * @param firstName the first name of the user
     * @return generated username
     */
    public static String generateUserUsername(String firstName) {
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name cannot be null or empty");
        }

        // Remove spaces and special characters from first name
        String cleanedName = firstName.replaceAll("[^a-zA-Z]", "");

        if (cleanedName.isEmpty()) {
            throw new IllegalArgumentException("First name must contain at least one letter");
        }

        // Capitalize first letter, rest lowercase
        String formattedName = cleanedName.substring(0, 1).toUpperCase()
                + cleanedName.substring(1).toLowerCase();

        // Generate 4-digit random number
        int randomNumber = 1000 + RANDOM.nextInt(9000); // Range: 1000-9999

        return formattedName + randomNumber;
    }

    /**
     * Generates a unique code with prefix
     * Format: PREFIX-XXXXXXXX (8 random uppercase alphanumeric characters)
     * 
     * @param prefix the prefix for the code
     * @return generated code
     */
    public static String generateCode(String prefix) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder(prefix);
        code.append("-");

        for (int i = 0; i < 8; i++) {
            code.append(characters.charAt(RANDOM.nextInt(characters.length())));
        }

        return code.toString();
    }
}
