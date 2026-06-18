"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-[#080808]/97 border-b border-[#c4871a]/20 backdrop-blur-xl py-3"
          : "bg-gradient-to-b from-[#080808]/92 to-transparent py-4 md:py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 md:px-8 lg:px-18">
        <Link href="/" className="flex items-center gap-3 text-white no-underline">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#c4871a]/35 bg-[#111111] flex items-center justify-center overflow-hidden">
            <span className="font-heading font-extrabold text-[#c4871a] text-xs">PG</span>
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
                className="font-['Rajdhani',sans-serif] font-semibold text-xs tracking-[.2em] uppercase text-[#c8c8c8] hover:text-[#c4871a] transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:h-[1.5px] after:w-0 after:bg-[#c4871a] after:transition-all hover:after:w-full no-underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link
            href="/reservas"
            className="bg-[#c4871a] text-[#080808] font-heading font-bold text-xs tracking-[.15em] uppercase px-6 py-2.5 tactical-clip hover:bg-[#d4a244] transition-colors no-underline inline-block"
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#080808]/98 border-b border-[#c4871a]/20 px-4 pb-6 pt-2">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-['Rajdhani',sans-serif] font-semibold text-sm tracking-[.2em] uppercase text-[#c8c8c8] hover:text-[#c4871a] transition-colors no-underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/reservas"
                onClick={() => setMenuOpen(false)}
                className="bg-[#c4871a] text-[#080808] font-heading font-bold text-xs tracking-[.15em] uppercase px-5 py-2 tactical-clip hover:bg-[#d4a244] transition-colors no-underline inline-block mt-2"
              >
                RESERVAR AHORA
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
