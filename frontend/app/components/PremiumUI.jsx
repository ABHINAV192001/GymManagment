
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticWrapper - High-fidelity interactive wrapper for buttons and icons
 */
export const MagneticWrapper = ({ children, strength = 0.5 }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouse = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) * strength;
        const y = (clientY - (top + height / 2)) * strength;
        setPosition({ x, y });
    };
    return (
        <motion.div
            onMouseMove={handleMouse}
            onMouseLeave={() => setPosition({ x: 0, y: 0 })}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
};

/**
 * TiltWrapper - Sub-degree 3D tilt interaction for large containers
 */
export const TiltWrapper = ({ children, className = "", strength = 3 }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const handleMouse = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - (left + width / 2)) / (width / 2)) * strength;
        const y = ((clientY - (top + height / 2)) / (height / 2)) * -strength;
        setTilt({ x, y });
    };
    return (
        <motion.div
            onMouseMove={handleMouse}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            animate={{ rotateX: tilt.y, rotateY: tilt.x }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d', willChange: 'transform' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggeredText - Fluid letter-by-letter entrance animation
 */
export const StaggeredText = ({ text, className = "" }) => {
    if (!text) return null;
    const letters = text.split("");
    return (
        <div className={className}>
            {letters.map((letter, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.012, duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="inline-block"
                >
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </div>
    );
};
