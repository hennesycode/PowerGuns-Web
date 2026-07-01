"use client";

import { useState, useEffect } from "react";

interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
}

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Topbar({ onMenuToggle, title = "Dashboard" }: TopbarProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = getInitials(fullName);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-[#080706]/80 backdrop-blur-md border-b border-[#c4871a]/10">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-[#B2AAA7] hover:text-white transition-colors p-1"
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="font-heading font-bold text-lg md:text-xl uppercase tracking-[.04em] text-white">
          {title}
        </h1>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative text-[#B2AAA7] hover:text-white transition-colors p-1"
          aria-label="Notificaciones"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#c4871a] rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#c4871a]/15 border border-[#c4871a]/30 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading font-bold text-xs text-[#c4871a]">{initials || "PG"}</span>
            )}
          </div>
          <div className="hidden sm:block">
            <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white leading-tight">
              {fullName || "Administrador"}
            </div>
            <div className="font-['Rajdhani',sans-serif] text-[10px] uppercase tracking-[.15em] text-[#B2AAA7]">
              {user?.role || "Admin"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
