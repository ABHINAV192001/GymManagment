
"use client";

import { FaTimes } from "react-icons/fa";

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-slate-900/50 backdrop-blur-md z-10">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-gray-200">
                    {children}
                </div>

                <style jsx>{`
                    .glass-panel {
                        background: var(--glass-bg, rgba(30, 41, 59, 0.9));
                        backdrop-filter: blur(24px);
                        -webkit-backdrop-filter: blur(24px);
                        border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
                        border-radius: 24px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                `}</style>
            </div>
        </div>
    );
}
