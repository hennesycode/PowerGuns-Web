"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteShell } from "@/components/shared/SiteShell";
import { POLYGON_ADDRESS } from "@/lib/constants";

const MAPS_LINK = "https://maps.app.goo.gl/aoPPrqEmKNNyweXe8";

const mapEmbedUrl = `https://maps.google.com/maps?width=100%25&height=100%25&hl=es&q=${encodeURIComponent(POLYGON_ADDRESS)}&t=k&z=18&ie=UTF8&iwloc=B&output=embed`;

export function LocationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);

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
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ubicacion"
      className="relative py-16 md:py-24 bg-[#050403] overflow-hidden"
    >
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />

      {/* Glow fondo */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#c4871a]/[0.015] rounded-full blur-[130px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <SiteShell>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Columna izquierda: texto + botones */}
          <div>
            {/* Eyebrow */}
            <div
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1), transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
              }}
            >
              <span className="inline-block font-['Rajdhani',sans-serif] text-[10px] font-semibold uppercase tracking-[.22em] text-[#c4871a] border border-[#c4871a]/30 px-3 py-1 mb-4">
                Ubicación
              </span>
            </div>

            {/* Título */}
            <h2
              className="font-heading font-black text-[clamp(32px,4.5vw,52px)] uppercase leading-[1.05] text-white mb-2"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.06s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.06s",
              }}
            >
              Dónde<br />
              <span className="text-[#c4871a]">Estamos</span>
            </h2>

            {/* Separador */}
            <div
              className="flex items-center gap-3 mt-3 mb-6"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.1s, transform 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.1s",
              }}
            >
              <span className="w-14 h-[1.5px] bg-[#c4871a]/50" />
              <span className="w-1.5 h-1.5 rotate-45 border border-[#c4871a]/60" />
              <span className="font-['Rajdhani',sans-serif] text-[11px] font-semibold uppercase tracking-[.18em] text-[#5B5A59]">
                Villavicencio, Meta
              </span>
            </div>

            {/* Texto grande */}
            <p
              className="text-xl md:text-2xl lg:text-3xl text-[#B2AAA7] leading-snug font-heading font-bold uppercase tracking-[.03em] max-w-[480px] mb-5"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.12s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.12s",
              }}
            >
              Nuestro polígono está ubicado en Villavicencio, Meta
            </p>

            {/* Dirección */}
            <div
              className="flex items-start gap-3 mb-8"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.18s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.18s",
              }}
            >
              <span className="flex-shrink-0 mt-0.5 text-[#c4871a]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <p className="text-sm md:text-base text-[#B2AAA7] leading-relaxed">
                {POLYGON_ADDRESS}
              </p>
            </div>

            {/* Botones */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.26s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.26s",
              }}
            >
              {/* RESERVA AHORA */}
              <Link
                href="/#servicios"
                className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-[#c4871a] text-[#080706] px-8 py-4 tactical-clip-lg hover:bg-[#d4a244] hover:-translate-y-0.5 transition-all no-underline"
              >
                Reserva ahora
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* CÓMO LLEGAR */}
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-transparent text-[#CFD1D4] border border-[#c4871a]/40 px-8 py-4 tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/[0.07] transition-all no-underline"
                aria-label="Abrir ubicación en Google Maps"
              >
                Cómo llegar
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columna derecha: mapa */}
          <div
            className="relative"
            style={{
              opacity: inview ? 1 : 0,
              transform: inview ? "translateX(0)" : "translateX(32px)",
              transition:
                "opacity 0.8s cubic-bezier(0.22,0.61,0.36,1) 0.18s, transform 0.8s cubic-bezier(0.22,0.61,0.36,1) 0.18s",
            }}
          >
            {/* Contenedor del mapa con marco premium */}
            <div className="relative overflow-hidden border border-[#c4871a]/12 bg-[#0F0D0B]">
              {/* Marcas de esquina tácticas */}
              <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#c4871a]/40 pointer-events-none z-20" />
              <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#c4871a]/40 pointer-events-none z-20" />
              <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#c4871a]/40 pointer-events-none z-20" />
              <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#c4871a]/40 pointer-events-none z-20" />

              {/* Mapa iframe */}
              <div className="relative w-full h-[320px] sm:h-[400px] md:h-[440px] lg:h-[480px]">
                <iframe
                  src={mapEmbedUrl}
                  title="Power Guns Polígono - Ubicación en Villavicencio, Meta"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ border: 0 }}
                  tabIndex={-1}
                  aria-hidden="true"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Overlay oscuro sutil para integrar con el diseño */}
                <div className="absolute inset-0 pointer-events-none bg-[#050403]/20" />

                {/* Capa decorativa de scanlines/dots estilo táctico */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #c4871a 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />

                {/* Pin con logo Power Guns */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+18px)] pointer-events-none z-10">
                  {/* Pulse exterior */}
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#c4871a]/20 animate-ping" />

                  {/* Círculo exterior */}
                  <span className="relative flex items-center justify-center w-11 h-11 rounded-full border-2 border-[#c4871a] bg-[#080706] shadow-[0_0_24px_rgba(196,135,26,.35)]">
                    {/* Logo */}
                    <Image
                      src="/logo.jpg"
                      alt="Power Guns"
                      width={28}
                      height={28}
                      className="w-7 h-7 object-contain rounded-full"
                    />
                  </span>

                  {/* Punta de gota */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#c4871a]" />
                </div>
              </div>
            </div>

            {/* Pie de mapa */}
            <div className="flex items-center justify-between mt-3 text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">
              <span className="font-['Rajdhani',sans-serif] font-semibold">
                Barzal Alto · Villavicencio, Meta
              </span>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c4871a] hover:text-[#d6a244] no-underline transition-colors font-['Rajdhani',sans-serif] font-semibold"
                aria-label="Abrir en Google Maps"
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </SiteShell>
    </section>
  );
}
