"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { SiteShell } from "@/components/shared/SiteShell";
import { CartButton } from "@/components/cart/CartButton";


const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
}

function UserAccess() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user;
  const href = isAuthenticated ? "/dashboard" : "/login";
  const label = isAuthenticated ? "Ir al dashboard" : "Iniciar sesión o registrarse";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  if (loading) {
    return (
      <div className="w-9 h-9 md:w-[38px] md:h-[38px] rounded-full border border-[#c4871a]/10 bg-[#0F0D0B] animate-pulse" />
    );
  }

  return (
    <Link
      href={href}
      className="relative flex items-center justify-center no-underline group"
      aria-label={label}
    >
      {/* Icon / Avatar */}
      <div
        className={`w-9 h-9 md:w-[38px] md:h-[38px] rounded-full border bg-[#0F0D0B] flex items-center justify-center overflow-hidden transition-all duration-200 ${
          isAuthenticated
            ? "border-[#c4871a]/30 group-hover:border-[#c4871a] group-hover:shadow-[0_0_8px_rgba(196,135,26,0.35)]"
            : "border-[#c4871a]/20 group-hover:border-[#c4871a]/50"
        }`}
      >
        {isAuthenticated ? (
          user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading font-bold text-xs text-[#c4871a]">
              {getInitials(fullName)}
            </span>
          )
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#B2AAA7] group-hover:text-[#c4871a] transition-colors duration-200">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </div>

      {/* Tooltip (desktop only) */}
      <div className="hidden lg:block absolute top-full right-0 mt-3 min-w-max opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-200 z-50">
        <div className="bg-[#0F0D0B] border border-[#c4871a]/25 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          {isAuthenticated ? (
            <>
              <div className="font-['Rajdhani',sans-serif] text-xs tracking-[.12em] uppercase text-white whitespace-nowrap">
                {fullName}
              </div>
              <div className="font-['Rajdhani',sans-serif] text-[10px] tracking-[.18em] uppercase text-[#c4871a]">
                {user.role}
              </div>
            </>
          ) : (
            <div className="font-['Rajdhani',sans-serif] text-xs tracking-[.12em] uppercase text-[#CFD1D4] whitespace-nowrap">
              Inicio de sesión / Registro
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const desktopLinkClass = (href: string) =>
    `font-['Rajdhani',sans-serif] font-semibold text-xs tracking-[.2em] uppercase transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:h-[1.5px] after:bg-[#c4871a] after:transition-all no-underline ${
      isActive(href)
        ? "text-[#c4871a] after:w-full"
        : "text-[#CFD1D4] hover:text-[#c4871a] after:w-0 hover:after:w-full"
    }`;

  const mobileLinkClass = (href: string) =>
    `font-['Rajdhani',sans-serif] font-semibold text-sm tracking-[.2em] uppercase transition-colors no-underline ${
      isActive(href) ? "text-[#c4871a]" : "text-[#CFD1D4] hover:text-[#c4871a]"
    }`;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-[#080706]/97 border-b border-[#c4871a]/20 backdrop-blur-xl py-3"
          : "bg-gradient-to-b from-[#080706]/92 to-transparent py-4 md:py-5"
      }`}
    >
      <SiteShell className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white no-underline">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#c4871a]/35 bg-[#0F0D0B] flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Power Guns" className="w-full h-full object-contain" />
          </div>
          <div className="font-heading font-extrabold text-xs md:text-sm leading-tight uppercase tracking-widest">
            POWER <span className="text-[#c4871a]">GUNS</span>
            <br />
            POLÍGONO S.A.S
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex gap-8 items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={desktopLinkClass(link.href)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

        <div className="flex items-center gap-2 md:gap-3">
          <CartButton />
          <UserAccess />
          <div className="hidden lg:block">
            <Link
              href="/reservas"
              className="bg-[#c4871a] text-[#080706] font-heading font-bold text-xs tracking-[.15em] uppercase px-6 py-2.5 tactical-clip hover:bg-[#d4a244] transition-colors no-underline inline-block"
            >
              RESERVAR AHORA
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-1 p-2"
            aria-label="Menú"
          >
            <span className={`block w-6 h-0.5 bg-[#c4871a] transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-6 h-0.5 bg-[#c4871a] transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-[#c4871a] transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </SiteShell>

      {/* Mobile menu */}
      {menuOpen && (
        <SiteShell className="pb-6 pt-2">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLinkClass(link.href)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/reservas"
                onClick={() => setMenuOpen(false)}
                className="bg-[#c4871a] text-[#080706] font-heading font-bold text-xs tracking-[.15em] uppercase px-5 py-2 tactical-clip hover:bg-[#d4a244] transition-colors no-underline inline-block mt-2"
              >
                RESERVAR AHORA
              </Link>
            </li>
          </ul>
        </SiteShell>
      )}
    </nav>
    </>
  );
}
