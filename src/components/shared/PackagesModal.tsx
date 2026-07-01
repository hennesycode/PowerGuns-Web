"use client";

import { useEffect } from "react";

interface PackagesModalProps {
  open: boolean;
  onClose: () => void;
}

export function PackagesModal({ open, onClose }: PackagesModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="packages-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md border border-[#c4871a]/25 bg-[#0F0D0B] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center border border-[#c4871a]/30 bg-[#c4871a]/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-[#c4871a]">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          </svg>
        </div>

        <h2
          id="packages-modal-title"
          className="font-heading text-xl font-black uppercase tracking-[.04em] text-white md:text-2xl"
        >
          Módulo próximamente
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#B2AAA7]">
          Estamos preparando esta sección para ofrecerte una mejor experiencia.
        </p>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-7 w-full bg-[#c4871a] py-3.5 font-heading text-sm font-bold uppercase tracking-[.14em] text-[#080706] transition-all hover:bg-[#d4a244]"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
