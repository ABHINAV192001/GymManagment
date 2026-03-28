/**
 * Card Component
 * Container with standard styling
 */
export default function Card({ children, className = "", title, action }) {
    return (
        <div className={`gm-card ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-6">
                    {title && <h3 className="text-xl font-bold mb-0">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
