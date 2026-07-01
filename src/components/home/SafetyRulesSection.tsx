"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SiteShell } from "@/components/shared/SiteShell";

const rules = [
  {
    text: "Es responsabilidad de la empresa usuaria y/o del personal a cargo entregar las instalaciones en el mismo estado de orden y aseo en que las recibió.",
  },
  {
    text: "Es responsabilidad del personal de la empresa usuaria cumplir y velar por las medidas de seguridad en cada actividad que desarrollen.",
  },
  {
    text: "Es responsabilidad de la empresa usuaria haber planeado con anterioridad el evento y verificar que se cumple con todo lo requerido en seguridad y logística.",
  },
  {
    text: "Antes del inicio de la actividad el encargado deberá firmar el libro de tiro y los formatos establecidos por Power Guns Polígono S.A.S.",
  },
  {
    text: "Todos los asistentes al polígono deben contar con EPS y ARL; es responsabilidad de la empresa usuaria verificar y comprobar que los participantes cumplen con estos requisitos.",
  },
  {
    text: "Los alumnos que se encuentren desarrollando cursos establecidos por la S.V.S.P en los ciclos de Fundamentación, Reentrenamiento, profundización y/o especialización y que no están laborando al momento del entrenamiento y no cuentan con EPS y/o ARL, deben extremar y cumplir con todas las medidas de seguridad que le sean necesarias y que hayan sido emitidas por el instructor, por la academia y/o la empresa que realice la capacitación; esta determinará las medidas adicionales que requiera para el desarrollo del entrenamiento a realizar.",
  },
  {
    text: "Está prohibido el ingreso al polígono de menores de edad.",
  },
  {
    text: "Dando cumplimiento a la ley de habeas data, la empresa y/o el personal a cargo de la actividad son los únicos autorizados para tomar fotografías y videos de su entrenamiento; ninguna persona externa sin el consentimiento del encargado podrá tomar fotografías o grabar videos, tampoco podrá publicar los mismos sin la previa autorización en redes sociales.",
  },
  {
    text: "Cualquier persona que se encuentre dentro de las instalaciones del polígono y que identifique una falla de seguridad podrá dar la voz de alto al fuego, o alto a los ejercicios que se estén desarrollando en pro de evitar situaciones de riesgo.",
  },
  {
    text: "Los instructores que realicen capacitaciones que sean reguladas por la S.V.S.P. deberán estar registrados ante la página de esta, dando cumplimiento con la resolución 3166 de 2010 y estar inscritos en la plataforma de RENOVA.",
  },
];

const INITIAL_VISIBLE = 5;

export function SafetyRulesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleRules = expanded ? rules : rules.slice(0, INITIAL_VISIBLE);
  const hasMore = rules.length > INITIAL_VISIBLE;

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

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="normas"
      className="relative py-16 md:py-24 bg-[#050403] overflow-hidden"
    >
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />

      {/* Glow decorativo esquina */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c4871a]/[0.015] rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4" />

      <SiteShell>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Columna izquierda: contenido */}
          <div>
            {/* Eyebrow */}
            <div
              className="mb-4"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1), transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
              }}
            >
              <span className="inline-block font-['Rajdhani',sans-serif] text-[10px] font-semibold uppercase tracking-[.22em] text-[#c4871a] border border-[#c4871a]/30 px-3 py-1">
                Protocolos y Seguridad
              </span>
            </div>

            {/* Título principal */}
            <h2
              className="font-heading font-black text-[clamp(32px,4.5vw,52px)] uppercase leading-[1.05] text-white mb-2"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.06s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.06s",
              }}
            >
              Normas de<br />
              <span className="text-[#c4871a]">Seguridad</span>
            </h2>

            {/* Separador táctico */}
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
                Reglamentación
              </span>
            </div>

            {/* Texto introductorio */}
            <p
              className="text-sm md:text-base text-[#B2AAA7] leading-relaxed max-w-[600px] mb-10"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.14s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.14s",
              }}
            >
              Conoce las disposiciones y lineamientos que garantizan una
              experiencia segura, organizada y profesional dentro de nuestras
              instalaciones.
            </p>

            {/* Lista de normas */}
            <ul className="space-y-0">
              {visibleRules.map((rule, i) => (
                <li
                  key={i}
                  className={`flex gap-4 items-start py-4 ${
                    i < visibleRules.length - 1 ? "border-b border-[#c4871a]/8" : ""
                  }`}
                  style={{
                    opacity: inview ? 1 : 0,
                    transform: inview ? "translateY(0)" : "translateY(24px)",
                    transition: `opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.18 + i * 0.06}s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.18 + i * 0.06}s`,
                  }}
                >
                  {/* Número */}
                  <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center border border-[#c4871a]/25 bg-[#c4871a]/5 text-[#c4871a] font-heading font-bold text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* Texto */}
                  <p className="text-[13px] md:text-sm leading-relaxed text-[#B2AAA7] pt-0.5">
                    {rule.text}
                  </p>
                </li>
              ))}
            </ul>

            {/* Botón y texto CTA */}
            <div
              className="mt-8"
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.55s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.55s",
              }}
            >
              {hasMore && (
                <button
                  type="button"
                  onClick={toggleExpand}
                  className="inline-flex items-center gap-3 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-transparent text-[#CFD1D4] border border-[#c4871a]/40 px-8 py-4 tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/[0.07] transition-all duration-200"
                >
                  {expanded ? "Ver menos" : "Más información"}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-4 h-4 transition-transform duration-300 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
              {!expanded && hasMore && (
                <p className="mt-3 text-[11px] text-[#5B5A59] font-['Rajdhani',sans-serif] tracking-[.1em] uppercase">
                  Consulta la reglamentación completa antes de programar tu
                  entrenamiento o actividad.
                </p>
              )}
            </div>
          </div>

          {/* Columna derecha: imagen */}
          <div
            className="relative"
            style={{
              opacity: inview ? 1 : 0,
              transform: inview ? "translateX(0)" : "translateX(32px)",
              transition:
                "opacity 0.8s cubic-bezier(0.22,0.61,0.36,1) 0.22s, transform 0.8s cubic-bezier(0.22,0.61,0.36,1) 0.22s",
            }}
          >
            <div className="relative lg:sticky lg:top-28">
              {/* Marco decorativo */}
              <div className="relative overflow-hidden border border-[#c4871a]/12 bg-[#171513]">
                {/* Marcas de esquina tácticas */}
                <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#c4871a]/40 pointer-events-none z-10" />

                {/* Imagen - 9:16 en desktop, oculta en mobile */}
                <img
                  src="/media/safety-rules-portrait.png"
                  alt="Normas de seguridad - Power Guns Polígono"
                  className="hidden md:block w-full h-auto object-cover"
                  loading="lazy"
                />

                {/* Imagen - 1:1 solo en mobile */}
                <img
                  src="/media/safety-rules-square.png"
                  alt="Reglamentación Power Guns - Protocolos de seguridad"
                  className="md:hidden w-full h-auto object-cover"
                  loading="lazy"
                />

                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,.15)_0%,transparent_40%,rgba(5,4,3,.25)_100%)] pointer-events-none" />
              </div>

              {/* Badge flotante */}
              <div className="absolute -bottom-3 -left-3 bg-[#080706] border border-[#c4871a]/30 px-5 py-3 z-10">
                <span className="block font-heading font-black text-xs uppercase tracking-[.15em] text-[#c4871a]">
                  Seguridad
                </span>
                <span className="block font-['Rajdhani',sans-serif] text-[10px] uppercase tracking-[.2em] text-[#5B5A59] mt-0.5">
                  Protocolo Clase A
                </span>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    </section>
  );
}
