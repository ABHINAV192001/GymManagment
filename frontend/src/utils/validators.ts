/**
 * Utility Validators for Application Security & Form Rules
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Email Address with domain rules (e.g. user@domain.com)
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const cleanEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: 'Please enter a valid email address with a domain (e.g., user@domain.com).' };
  }
  return { isValid: true };
}

/**
 * Validates Password Complexity Rules:
 * - Minimum 8 characters, Maximum 16 characters
 * - At least 1 Uppercase Letter (A-Z)
 * - At least 1 Lowercase Letter (a-z)
 * - At least 1 Number (0-9)
 * - At least 1 Special Character (!@#$%^&*...)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 16) {
    return { isValid: false, error: 'Password cannot exceed 16 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*).' };
  }
  return { isValid: true };
}

/**
 * Calculates Password Strength Score (0 to 4)
 */
export function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  return score;
}

/**
 * Validates Name (min 2 characters)
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  return { isValid: true };
}

/**
 * Sanitize User Inputs against HTML Injection (XSS) and Scripting Attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
