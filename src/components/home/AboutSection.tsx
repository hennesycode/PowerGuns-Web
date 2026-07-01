"use client";

import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/shared/SiteShell";
import { TacticalButton } from "@/components/shared/TacticalButton";
import TrueFocus from "@/components/TrueFocus/TrueFocus";
import GlareHover from "@/components/GlareHover/GlareHover";

const cards = [
  {
    title: "CERTIFICADO PARA ADQUISICIÓN DE ARMA",
    text: "Como polígono Tipo Uno (1), se expiden certificados para el manejo de armas para personas naturales y ejercicios defensivos.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "POLÍGONO POWER GUNS",
    text: "Pon a prueba tus habilidades en nuestro centro de entrenamiento, simulador virtual y área de tiro cubierta para práctica libre o deportiva.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: "OTROS SERVICIOS",
    text: "Certificación de tiro para personal de seguridad privada\nCursos de defensa personal\nCursos de seguridad\nEventos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
];

export function AboutSection() {
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
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-[#050403] overflow-hidden"
    >
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />

      {/* Glow decorativo central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c4871a]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <SiteShell>
        {/* Título */}
        <div
          className="text-center mb-6"
          style={{
            opacity: inview ? 1 : 0,
            transform: inview ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.7s cubic-bezier(0.22,0.61,0.36,1), transform 0.7s cubic-bezier(0.22,0.61,0.36,1)",
          }}
        >
          <TrueFocus
            sentence="ACERCA DE|NUESTRO POLÍGONO"
            separator="|"
            blurAmount={3}
            borderColor="#c4871a"
            glowColor="rgba(196, 135, 26, 0.65)"
            animationDuration={0.8}
            pauseBetweenAnimations={2.5}
            activeColor="#c4871a"
          />
          {/* Separador táctico */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="w-12 h-[1.5px] bg-[#c4871a]/40" />
            <span className="w-2 h-2 rotate-45 border border-[#c4871a]/50" />
            <span className="w-12 h-[1.5px] bg-[#c4871a]/40" />
          </div>
        </div>

        {/* Texto descriptivo */}
        <p
          className="text-center text-sm md:text-base text-[#B2AAA7] max-w-[720px] mx-auto leading-relaxed mb-12 md:mb-16"
          style={{
            opacity: inview ? 1 : 0,
            transform: inview ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.12s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.12s",
          }}
        >
          Power Guns es un polígono de armas cortas en recinto cerrado,
          especializado en entrenamiento táctico y práctica con armas de fuego,
          traumáticas y ejercicios virtuales. Ofrecemos un ambiente seguro,
          profesional y controlado para personas naturales, departamentos de
          seguridad y empresas de seguridad privada.
        </p>

        {/* Grid de tarjetas */}
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 mb-12 md:mb-16">
          {cards.map((card, i) => (
            <GlareHover
              key={card.title}
              className="relative bg-[#171513] border border-[#c4871a]/12 p-8 md:p-10 tactical-clip-lg overflow-hidden group transition-all duration-300 hover:bg-[#26231F] hover:border-[#c4871a]/25"
              glareColor="#c4871a"
              glareOpacity={0.18}
              glareAngle={-35}
              glareSize={280}
              transitionDuration={800}
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.7s cubic-bezier(0.22,0.61,0.36,1) ${0.24 + i * 0.1}s, transform 0.7s cubic-bezier(0.22,0.61,0.36,1) ${0.24 + i * 0.1}s`,
              }}
            >
              {/* Línea izquierda hover */}
              <span className="absolute top-0 left-0 w-[2px] h-0 bg-[#c4871a] transition-all duration-400 group-hover:h-full z-[3]" />

              {/* Número decorativo */}
              <span className="absolute -top-4 -right-2 font-heading font-black text-[80px] text-[#c4871a]/[0.05] leading-none pointer-events-none select-none z-[3]">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icono */}
              <div className="w-12 h-12 bg-[#c4871a]/10 border border-[#c4871a]/25 flex items-center justify-center mb-6 tactical-clip relative z-[2]">
                <span className="text-[#c4871a]">{card.icon}</span>
              </div>

              {/* Título */}
              <h3 className="font-heading font-bold text-lg md:text-xl uppercase tracking-[.04em] text-white mb-4 relative z-[2]">
                {card.title}
              </h3>

              {/* Texto */}
              <p className="text-sm leading-relaxed text-[#B2AAA7] relative z-[2] whitespace-pre-line">
                {card.text}
              </p>
            </GlareHover>
          ))}
        </div>

        {/* Botón */}
        <div
          className="text-center"
          style={{
            opacity: inview ? 1 : 0,
            transform: inview ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.5s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.5s",
          }}
        >
          <TacticalButton href="/nosotros">
            MÁS ACERCA DE NOSOTROS
          </TacticalButton>
        </div>
      </SiteShell>
    </section>
  );
}
