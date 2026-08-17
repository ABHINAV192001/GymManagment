package com.Gym.GymCommonServices.security;

import java.util.regex.Pattern;

/**
 * XSS & HTML Injection Sanitizer Utility.
 * 
 * Sanitizes incoming untrusted text payloads to prevent Stored XSS, Reflected XSS,
 * and malicious script injection into database entities or responses.
 */
public final class XssSanitizer {

    private static final Pattern[] XSS_PATTERNS = new Pattern[]{
        // Script fragments: <script> ... </script> or standalone <script...
        Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("src[\r\n]*=[\r\n]*\\\'(.*?)\\\'", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("src[\r\n]*=[\r\n]*\\\"(.*?)\\\"", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<script(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
        // Event handlers (onload, onerror, onclick, onmouseover, etc.)
        Pattern.compile("onload(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onerror(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onclick(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onmouseover(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("<iframe(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("</iframe>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<object(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("</object>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<embed(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("</embed>", Pattern.CASE_INSENSITIVE)
    };

    private XssSanitizer() {
        // Utility class
    }

    /**
     * Sanitizes a string by stripping dangerous scripts, event handlers, and tags.
     *
     * @param value The raw input string
     * @return Sanitized safe string
     */
    public static String sanitize(String value) {
        if (value == null) {
            return null;
        }

        String cleanValue = value;
        for (Pattern pattern : XSS_PATTERNS) {
            cleanValue = pattern.matcher(cleanValue).replaceAll("");
        }

        // Strip lone tags like <script or <iframe if left open
        cleanValue = cleanValue.replaceAll("<script", "").replaceAll("<iframe", "").replaceAll("<embed", "");

        return cleanValue;
    }
}
