
/**
 * Cookie management utilities
 */

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days (default 7)
 */
export const setCookie = (name, value, days = 7) => {
    if (typeof document === 'undefined') return;

    // Default to 7 days if null or undefined is passed explicitly
    const expiryDays = (days === null || days === undefined) ? 7 : days;

    let expires = "";
    if (expiryDays) {
        const date = new Date();
        date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // SameSite=Lax and Path=/ to ensure cookie is sent to all routes and middleware
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

/**
 * Get a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export const getCookie = (name) => {
    if (typeof document === 'undefined') return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Remove a cookie
 * @param {string} name - Cookie name
 */
export const removeCookie = (name) => {
    if (typeof document === 'undefined') return;

    // Use same attributes as setCookie to ensure reliable deletion
    document.cookie = name + '=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
