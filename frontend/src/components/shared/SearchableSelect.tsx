import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  required = false,
  id,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(term)) ||
      opt.value.toLowerCase().includes(term)
    );
  });

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`relative flex items-center border rounded-xl bg-white dark:bg-zinc-900 transition shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800' : 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600'
        } ${isOpen ? 'ring-2 ring-blue-500/40 border-blue-500' : 'border-zinc-300 dark:border-zinc-700'}`}
        onClick={handleOpen}
      >
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
        
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          disabled={disabled}
          placeholder={isOpen ? (selectedOption ? selectedOption.label : placeholder) : placeholder}
          required={required && !value}
          value={isOpen ? searchQuery : (selectedOption ? selectedOption.label : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled && !isOpen) {
              setIsOpen(true);
              setSearchQuery('');
            }
          }}
          className="w-full text-xs pl-8 pr-12 py-2.5 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium"
        />

        <div className="absolute right-2.5 flex items-center gap-1 text-zinc-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md transition"
              aria-label="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
        </div>
      </div>

      {/* Floating Searchable Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-zinc-400 italic">No matching results found</div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  className={`px-3 py-2 flex items-center justify-between transition cursor-pointer ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="block font-medium truncate">{opt.label}</span>
                    {opt.sublabel && <span className="text-[10px] text-zinc-400 block font-mono truncate">{opt.sublabel}</span>}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

