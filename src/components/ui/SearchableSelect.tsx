"use client";

import { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  label,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-label={label}
        aria-expanded={open}
        className={`w-full px-3 py-2.5 bg-[#080706] border border-[#3C3A37] text-left text-sm transition-colors focus:outline-none focus:border-[#c4871a]/50 ${
          disabled ? "text-[#5B5A59] cursor-not-allowed opacity-60" : value ? "text-white" : "text-[#5B5A59]"
        }`}
      >
        {value || placeholder}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-[#171513] border border-[#c4871a]/15 shadow-2xl max-h-56 overflow-y-auto" role="listbox">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={`Buscar ${label.toLowerCase()}`}
            className="sticky top-0 w-full px-3 py-2 bg-[#0F0D0B] border-b border-[#c4871a]/10 text-white text-sm focus:outline-none placeholder:text-[#5B5A59]"
            placeholder={`Buscar ${label.toLowerCase()}...`}
            autoFocus
          />
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-xs text-[#5B5A59] text-center">
              Sin resultados
            </p>
          ) : (
            filtered.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setSearch("");
                }}
                aria-selected={option === value}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-[#c4871a]/10 ${
                  option === value ? "text-[#c4871a]" : "text-[#B2AAA7]"
                }`}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
