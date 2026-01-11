"use client";

import { Check } from "lucide-react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function CustomCheckbox({
  checked,
  onChange,
  disabled,
}: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
        checked
          ? "bg-gradient-to-br from-[#335441] to-[#46704A] border-[#335441] shadow-md"
          : "bg-white border-[#E4D7B4] hover:border-[#335441]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </button>
  );
}
