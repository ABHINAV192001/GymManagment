import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Floating Label Input Component
 * Supported props:
 * - label: Label text
 * - type: input type (text, password, etc)
 * - error: error message string
 * - id: unique id
 * - register: form hook register function
 * - ...others: passed to input
 */
export default function Input({
    label,
    type = "text",
    error,
    id,
    className = "",
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className={`gm-float ${error ? 'error' : ''} ${className}`}>
            <input
                type={isPassword && showPassword ? "text" : type}
                id={id}
                placeholder=" "
                className="gm-input-hover"
                {...props}
            />
            <label htmlFor={id}>{label}</label>

            {isPassword && (
                <div
                    className="gm-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    role="button"
                    tabIndex={-1}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
            )}

            {error && <div className="gm-error-text">{error}</div>}
        </div>
    );
}
