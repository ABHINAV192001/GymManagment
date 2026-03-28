import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';

/**
 * Primary Button Component
 * Supported props:
 * - href: if present, renders as Link
 * - onClick: click handler
 * - disabled: disabled state
 * - loading: showing spinner
 * - variant: 'primary' (default) | 'outline' | 'text' | 'danger'
 * - className: additional classes
 * - type: 'button' | 'submit' | 'reset'
 */
export default function Button({
    children,
    href,
    onClick,
    disabled = false,
    loading = false,
    variant = 'primary',
    className = '',
    type = 'button',
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "gm-primary-btn",
        outline: "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--bg-dark)] px-6 py-3",
        text: "gm-text-btn bg-transparent hover:underline px-4 py-2",
        danger: "bg-red-500 text-white hover:bg-red-600 px-6 py-3 rounded-xl",
    };

    const combinedClass = `${baseStyles} ${variants[variant] || variants.primary} ${className}`;

    const content = (
        <>
            {loading && <FaSpinner className="animate-spin mr-2" />}
            {children}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={combinedClass} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={combinedClass}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
}
