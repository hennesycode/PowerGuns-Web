"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SiteShell } from "@/components/shared/SiteShell";
import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { useCartContext } from "@/context/CartContext";
import { PackagesModal } from "@/components/shared/PackagesModal";
import Link from "next/link";
import DecryptedText from "@/components/react-bits/DecryptedText";
import TextType from "@/components/react-bits/TextType";
import BlurText from "@/components/react-bits/BlurText";

export function HeroSection() {
  const { items } = useCartContext();
  const [packagesModal, setPackagesModal] = useState(false);
  const [phase, setPhase] = useState(0);
  const [line, setLine] = useState(0);
  const [buttonsIn, setButtonsIn] = useState(false);
  const descDoneFired = useRef(false);

  // Fase 0 → 1: al terminar el badge (DecryptedText secuencial ~2.5s)
  useEffect(() => {
    if (phase !== 0) return;
    const t = setTimeout(() => setPhase(1), 2800);
    return () => clearTimeout(t);
  }, [phase]);

  // Fase 1: h1 línea por línea
  const handleLine1Done = useCallback(() => {
    setTimeout(() => setLine(1), 250);
  }, []);

  const handleLine2Done = useCallback(() => {
    setTimeout(() => setLine(2), 250);
  }, []);

  const handleTypingDone = useCallback(() => {
    setTimeout(() => setPhase(2), 400);
  }, []);

  // Fase 2 → 3: al terminar la descripción (BlurText)
  const handleDescDone = useCallback(() => {
    if (descDoneFired.current) return;
    descDoneFired.current = true;
    setPhase(3);
  }, []);

  // Fase 3: activar la transición de los botones
  useEffect(() => {
    if (phase < 3) return;
    const raf = requestAnimationFrame(() => setButtonsIn(true));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  return (
    <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden bg-[#050403]">
      <HeroVideoBackground />

      {/* Reticle animation */}
      <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[680px] h-[680px] pointer-events-none hidden lg:block z-20">
        <div className="animate-[spin_22s_linear_infinite] w-full h-full origin-center flex items-center justify-center">
          <svg viewBox="0 0 680 680" fill="none" className="w-full h-full opacity-[.15]">
            <circle cx="340" cy="340" r="315" stroke="#C4871A" strokeWidth=".8" strokeDasharray="10 6" />
            <circle cx="340" cy="340" r="292" stroke="#C4871A" strokeWidth=".5" strokeDasharray="3 9" />
            <line x1="340" y1="28" x2="340" y2="52" stroke="#C4871A" strokeWidth="2" /><line x1="340" y1="628" x2="340" y2="652" stroke="#C4871A" strokeWidth="2" />
            <line x1="28" y1="340" x2="52" y2="340" stroke="#C4871A" strokeWidth="2" /><line x1="628" y1="340" x2="652" y2="340" stroke="#C4871A" strokeWidth="2" />
            <circle cx="340" cy="340" r="10" fill="#C4871A" opacity=".9" /><circle cx="340" cy="340" r="4" fill="#ffffff" />
            <line x1="340" y1="0" x2="340" y2="680" stroke="#C4871A" strokeWidth=".5" /><line x1="0" y1="340" x2="680" y2="340" stroke="#C4871A" strokeWidth=".5" />
            <rect x="306" y="306" width="68" height="68" fill="#080706" />
          </svg>
        </div>
      </div>

      <SiteShell className="relative z-30">
        {/* 1 — Badge: DecryptedText secuencial */}
        <div className="flex items-center gap-3.5 mb-5 font-['Rajdhani',sans-serif] font-bold text-xs tracking-[.35em] uppercase text-[#c4871a]">
          <span className="w-9 h-[1.5px] bg-[#c4871a]" />
          <DecryptedText
            text="Polígono de Tiro Certificado — Villavicencio, Meta"
            animateOn="view"
            sequential
            revealDirection="start"
            speed={50}
            maxIterations={30}
            className="text-[#c4871a]"
          />
        </div>

        {/* 2 — h1: una línea a la vez, cada una se queda */}
        {phase >= 1 && (
          <h1 className="font-heading font-black text-[clamp(72px,10vw,130px)] leading-[.88] uppercase tracking-[-.02em] text-white mb-7 drop-shadow-[0_2px_12px_rgba(0,0,0,.8)]">
            <span className="block">
              {line >= 0 && (
                <TextType key="l1" as="span" text={["APUNTA,"]} loop={false} typingSpeed={60} showCursor={false} onComplete={handleLine1Done} />
              )}
            </span>
            <span className="block text-[#c4871a]">
              {line >= 1 && (
                <TextType key="l2" as="span" text={["DISPARA,"]} loop={false} typingSpeed={60} showCursor={false} onComplete={handleLine2Done} />
              )}
            </span>
            <span className="block text-transparent [-webkit-text-stroke:2px_#c4871a] drop-shadow-none">
              {line >= 2 && (
                <TextType key="l3" as="span" text={["DOMINA."]} loop={false} typingSpeed={60} showCursor={false} onComplete={handleTypingDone} />
              )}
            </span>
          </h1>
        )}

        {/* 3 — Descripción: BlurText */}
        {phase >= 2 && (
          <BlurText
            text="Instalaciones de clase mundial con instructores certificados y el ambiente táctico más profesional de los llanos orientales."
            delay={30}
            animateBy="words"
            direction="top"
            threshold={0}
            stepDuration={0.2}
            className="font-light text-base leading-relaxed text-[#CFD1D4] max-w-[460px] mb-11 drop-shadow-[0_1px_6px_rgba(0,0,0,.7)]"
            onAnimationComplete={handleDescDone}
          />
        )}

        {/* 4 — Botones: state-based, jamás desaparecen */}
        {phase >= 3 && (
          <div
            className="flex gap-4 items-center flex-wrap transition-all duration-500 ease-out"
            style={{
              opacity: buttonsIn ? 1 : 0,
              transform: buttonsIn ? "translateY(0)" : "translateY(14px)",
            }}
          >
            <Link href={items.length > 0 ? "/reservas" : "/servicios"} className="bg-[#c4871a] text-[#080706] font-heading font-bold text-[15px] tracking-[.14em] uppercase px-9 py-4 tactical-clip-lg hover:bg-[#d4a244] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(196,135,26,.3)] transition-all duration-200 no-underline inline-block">
              RESERVAR TURNO
            </Link>
            <button
              type="button"
              onClick={() => setPackagesModal(true)}
              className="bg-transparent text-[#CFD1D4] font-heading font-semibold text-[15px] tracking-[.14em] uppercase border border-[#c4871a]/40 px-9 py-[15px] tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/7 transition-all duration-200 no-underline inline-block cursor-pointer"
            >
              VER PAQUETES
            </button>
          </div>
        )}
      </SiteShell>

      <PackagesModal open={packagesModal} onClose={() => setPackagesModal(false)} />

      <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent_100%)] opacity-50 z-30" />
    </section>
  );
}