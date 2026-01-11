"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  icon: any;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  placeholder: string;
}

export default function CustomSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative group" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-[#335441] mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-white text-left px-4 py-3 rounded-xl border-2 border-[#E4D7B4] focus:outline-none focus:ring-2 focus:ring-[#335441] focus:border-[#335441] transition-all duration-200 hover:border-[#46704A] hover:shadow-md shadow-sm font-medium ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : "cursor-pointer"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={value ? "text-[#335441]" : "text-[#A9B782]"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-[#6B8F60] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#E4D7B4] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#A9B782] text-center">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-[#F9F6EE] transition-colors duration-150 flex items-center justify-between ${
                    value === option.value
                      ? "bg-[#F9F6EE] text-[#335441] font-semibold"
                      : "text-[#6B8F60]"
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-[#335441]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9f6ee;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a9b782;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b8f60;
        }
      `}</style>
    </div>
  );
}
