"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleUserUpdated(event: Event) {
      const updated = (event as CustomEvent<AuthUser>).detail;
      if (updated?.id) setUser(updated);
    }

    window.addEventListener("admin:user-updated", handleUserUpdated);
    return () => window.removeEventListener("admin:user-updated", handleUserUpdated);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  };

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
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 hover:bg-[#c4871a]/5 px-2 py-1.5 -mr-2 transition-colors"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 bg-[#c4871a]/15 border border-[#c4871a]/30 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt={fullName} width={32} height={32} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="font-heading font-bold text-xs text-[#c4871a]">{initials || "PG"}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white leading-tight">
                {fullName || "Administrador"}
              </div>
              <div className="font-['Rajdhani',sans-serif] text-[10px] uppercase tracking-[.15em] text-[#B2AAA7]">
                {user?.role || "Admin"}
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-3.5 h-3.5 text-[#B2AAA7] transition-transform ${profileOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#171513] border border-[#c4871a]/20 shadow-2xl py-2" role="menu">
              <Link
                href="/dashboard/perfil"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#B2AAA7] hover:text-white hover:bg-[#c4871a]/8 transition-colors no-underline font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]"
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#B63A2B] hover:bg-[#B63A2B]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em] disabled:opacity-50"
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                {loggingOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
