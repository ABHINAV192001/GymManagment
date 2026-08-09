import React, { useEffect, useState, useRef } from 'react';
import { Accessibility, Eye, Type, Keyboard } from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface A11yProps {
  settings: AccessibilitySettings;
  onChange: (s: AccessibilitySettings) => void;
}

export const KeyboardShortcutsList: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 mt-4 text-xs">
      <h4 className="font-semibold flex items-center gap-2 mb-2 text-zinc-800 dark:text-zinc-200" id="shortcuts-title">
        <Keyboard className="w-4 h-4" /> Keyboard Shortcuts (Alt + Key)
      </h4>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-zinc-600 dark:text-zinc-400" aria-labelledby="shortcuts-title">
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + D</kbd> Dashboard</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + M</kbd> Members</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + B</kbd> Branches</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + S</kbd> Settings</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + C</kbd> Chat Hub</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + A</kbd> Accounts & Ledger</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + K</kbd> Workouts & Diets</li>
        <li><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono font-bold text-[10px]">Alt + T</kbd> Attendance Desk</li>
      </ul>
    </div>
  );
};

export const A11yControls: React.FC<A11yProps> = ({ settings, onChange, announcements }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Apply typography, high-contrast, and dark mode classes directly to doc element
  useEffect(() => {
    const root = document.documentElement;

    // Reset themes
    root.classList.remove('dark', 'light', 'high-contrast-dark', 'high-contrast-light');
    
    // Apply theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'high-contrast-dark') {
      root.classList.add('dark', 'high-contrast-dark');
    } else if (settings.theme === 'high-contrast-light') {
      root.classList.add('high-contrast-light');
    } else {
      root.classList.add('light');
    }

    // Apply dyslexia font support
    if (settings.dyslexicFont) {
      root.style.setProperty('--font-sans', '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive, sans-serif');
    } else {
      root.style.removeProperty('--font-sans');
    }

    // Apply root scaling factor
    if (settings.fontSize === 'sm') {
      root.style.fontSize = '14px';
    } else if (settings.fontSize === 'lg') {
      root.style.fontSize = '18px';
    } else if (settings.fontSize === 'xl') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [settings]);

  return (
    <div className="relative" id="a11y-control-panel" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls="a11y-panel-body"
        aria-label="Accessibility Settings Panel"
      >
        <Accessibility className="w-4 h-4 text-blue-500" />
        <span>Accessibility Controls</span>
      </button>

      {isOpen && (
        <div 
          id="a11y-panel-body"
          className="absolute right-0 top-12 z-50 w-80 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-heading"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 id="a11y-heading" className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-blue-500" />
              <span>Accessibility Preferences</span>
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close panel"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            {/* Visual contrast styles */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-zinc-400" /> Visual Theme & Contrast
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'light', label: 'Light Theme' },
                  { key: 'dark', label: 'Dark Theme' },
                  { key: 'high-contrast-light', label: 'HC Light' },
                  { key: 'high-contrast-dark', label: 'HC Dark' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onChange({ ...settings, theme: item.key as any })}
                    className={`px-2 py-1.5 text-xs rounded border text-left flex items-center justify-between ${
                      settings.theme === item.key
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                    aria-label={`Switch theme to ${item.label}`}
                  >
                    <span>{item.label}</span>
                    {settings.theme === item.key && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Text scaling factor */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-zinc-400" /> Dynamic Text Scaling
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { key: 'sm', label: 'Small' },
                  { key: 'base', label: 'Normal' },
                  { key: 'lg', label: 'Large' },
                  { key: 'xl', label: 'X-Large' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onChange({ ...settings, fontSize: item.key as any })}
                    className={`px-1 py-1 rounded border text-center text-[11px] ${
                      settings.fontSize === item.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                    aria-label={`Set font scale to ${item.label}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

             {/* Accessibility features togglers */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Dyslexic Friendly Font</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.dyslexicFont}
                  onChange={(e) => onChange({ ...settings, dyslexicFont: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-zinc-300 dark:border-zinc-700 rounded focus:ring-blue-500"
                  aria-label="Toggle dyslexic friendly font layout"
                />
              </label>
            </div>

            {/* Keyboard layout helper */}
            <KeyboardShortcutsList />
          </div>
        </div>
      )}
    </div>
  );
};
