"use client";

import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/shared/SiteShell";
import { CONTACT } from "@/lib/constants";

export function InfoSpotlightSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInview(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const slide = isMobile ? 24 : 60;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080706] overflow-hidden"
    >
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-30" />

      <SiteShell>
        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Tarjeta izquierda: contacto ── */}
          <div
            className="relative border border-[#c4871a]/22 p-8 md:p-10 tactical-clip-lg overflow-hidden group"
            style={{
              opacity: inview ? 1 : 0,
              transform: inview ? "translateX(0)" : `translateX(-${slide}px)`,
              transition: "all 0.7s cubic-bezier(0.22, 0.61, 0.36, 1)",
              backgroundImage: "url('/card-contact-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#050403]/75 via-[#0F0D0B]/85 to-[#050403]/90 pointer-events-none" />
            {/* Número grande de fondo */}
            <span className="absolute -top-4 -right-2 font-heading font-black text-[110px] text-[#c4871a]/[0.05] leading-none pointer-events-none">
              01
            </span>

            <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-[.02em] mb-1 relative">
              <span className="text-[#c4871a]">POWER GUNS</span>{" "}
              <span className="text-white">POLIGONO</span>
            </h2>

            <div
              className="space-y-3 mt-6 relative"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(12px)",
                transition:
                  "opacity 0.5s ease-out 0.35s, transform 0.5s ease-out 0.35s",
              }}
            >
              {/* Dirección */}
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5 text-[#c4871a] flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#B2AAA7] mb-0.5">
                    Dirección
                  </div>
                  <div className="text-sm text-white leading-relaxed">
                    {CONTACT.address}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5 text-[#c4871a] flex-shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
                <div>
                  <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#B2AAA7] mb-0.5">
                    Correo
                  </div>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-sm text-white leading-relaxed hover:text-[#c4871a] transition-colors no-underline"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5 text-[#c4871a] flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.4 2 2 0 013.6 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.6a16 16 0 006 6l.97-.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <div>
                  <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#B2AAA7] mb-0.5">
                    Teléfono
                  </div>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="text-sm text-white leading-relaxed hover:text-[#c4871a] transition-colors no-underline"
                  >
                    {CONTACT.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tarjeta derecha: horario ── */}
          <div
            className="relative border border-[#c4871a]/22 p-8 md:p-10 tactical-clip-lg overflow-hidden group"
            style={{
              opacity: inview ? 1 : 0,
              transform: inview ? "translateX(0)" : `translateX(${slide}px)`,
              transition: "all 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.12s",
              backgroundImage: "url('/card-hours-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-gradient-to-bl from-[#050403]/75 via-[#0F0D0B]/85 to-[#050403]/90 pointer-events-none" />
            {/* Número grande de fondo */}
            <span className="absolute -top-4 -right-2 font-heading font-black text-[110px] text-[#c4871a]/[0.05] leading-none pointer-events-none">
              02
            </span>

            <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-[.02em] mb-1 relative">
              <span className="text-[#c4871a]">HORARIO</span>{" "}
              <span className="text-white">DE ATENCIÓN</span>
            </h2>

            <div
              className="space-y-4 mt-6 relative"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(12px)",
                transition:
                  "opacity 0.5s ease-out 0.35s, transform 0.5s ease-out 0.35s",
              }}
            >
              {/* Lunes – Sábado */}
              <div className="flex items-center justify-between border-b border-[#c4871a]/12 pb-3">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#c4871a] flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="font-['Rajdhani',sans-serif] font-semibold text-sm tracking-[.08em] uppercase text-[#B2AAA7]">
                    Lun – Sáb
                  </span>
                </div>
                <span className="font-heading font-bold text-sm text-white">
                  8:00 am – 6:00 pm
                </span>
              </div>

              {/* Domingo y festivos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#B63A2B] flex-shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="font-['Rajdhani',sans-serif] font-semibold text-sm tracking-[.08em] uppercase text-[#B2AAA7]">
                    Domingo y Festivos
                  </span>
                </div>
                <span className="font-heading font-bold text-sm text-[#B63A2B] uppercase tracking-wide">
                  Cerrado
                </span>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    </section>
  );
}