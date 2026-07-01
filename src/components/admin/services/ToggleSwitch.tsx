"use client";

import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label?: string;
}

export function ToggleSwitch({
  checked,
  disabled,
  onChange,
  label,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || "Activar o desactivar servicio"}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#c4871a]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#171513]",
        checked
          ? "bg-[#c4871a]"
          : "bg-[#3C3A37]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center h-4 w-4 rounded-full bg-white transition-all duration-200 shadow-sm",
          checked ? "translate-x-[18px]" : "translate-x-[2px]",
          disabled && "shadow-none",
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="#c4871a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-2.5 w-2.5"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </span>
    </button>
  );
}
