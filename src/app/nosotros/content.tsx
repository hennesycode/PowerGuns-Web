"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/shared/SiteShell";
import { HomeFooter } from "@/components/home/HomeFooter";

const stats = [
  { value: "462+", label: "Prácticas Certificadas" },
  { value: "211+", label: "Certificados Emitidos" },
  { value: "708+", label: "Visitantes" },
  { value: "3", label: "Instructores" },
];

const features = [
  {
    title: "Tipo de Armas",
    text: "Ofrecemos entrenamiento de armas cortas y simulación virtual.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: "Competencias de Tiro Libre",
    text: "Contamos con simulador virtual de última generación, con capacidad para desarrollar competencias tipo gaming y prácticas controladas.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Clientes Corporativos",
    text: "Acompañamos a cuerpos de seguridad privada y empresas de vigilancia en procesos de práctica, certificación y entrenamiento.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "Comunidad",
    text: "Haz parte de nuestra comunidad y síguenos en redes sociales como @powergunspoligono en Instagram, Facebook y LinkedIn.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
  },
  {
    title: "Instalaciones de Vanguardia",
    text: "Contamos con un espacio diseñado para el disfrute de la práctica de tiro, con instalaciones modernas y medidas de seguridad para una experiencia profesional.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Simulador Virtual",
    text: "Somos un polígono con modalidad de simulación virtual, diseñada para prácticas recreativas, entrenamiento profesional y ejercicios adaptados a diferentes niveles de experiencia.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export function NosotrosPageContent() {
  const [heroInview, setHeroInview] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [statsInview, setStatsInview] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [introInview, setIntroInview] = useState(false);
  const introRef = useRef<HTMLDivElement | null>(null);
  const [featuresInview, setFeaturesInview] = useState(false);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeroInview(true); observer.unobserve(el); } },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsInview(true); observer.unobserve(el); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = introRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIntroInview(true); observer.unobserve(el); } },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = featuresRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFeaturesInview(true); observer.unobserve(el); } },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#050403]">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20 z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c4871a]/[0.015] rounded-full blur-[120px] pointer-events-none" />

        <SiteShell className="py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div
              style={{
                opacity: heroInview ? 1 : 0,
                transform: heroInview ? "translateY(0)" : "translateY(24px)",
                transition:
                  "opacity 0.65s cubic-bezier(0.22,0.61,0.36,1), transform 0.65s cubic-bezier(0.22,0.61,0.36,1)",
              }}
            >
              <span className="inline-block font-['Rajdhani',sans-serif] text-[10px] font-semibold uppercase tracking-[.22em] text-[#c4871a] border border-[#c4871a]/30 px-3 py-1 mb-4">
                Sobre Nosotros
              </span>

              <h1 className="font-heading font-black text-[clamp(36px,5vw,56px)] uppercase leading-[1.05] text-white mb-4">
                Nuestro <span className="text-[#c4871a]">Polígono</span>
                <br />
                Power Guns
              </h1>

              <p className="text-sm md:text-base text-[#B2AAA7] leading-relaxed max-w-[520px] mb-8">
                Entrenamiento, práctica y experiencias en un entorno
                profesional, seguro y controlado en Villavicencio, Meta.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/servicios"
                  className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-[#c4871a] text-[#080706] px-8 py-4 tactical-clip-lg hover:bg-[#d4a244] hover:-translate-y-0.5 transition-all no-underline"
                >
                  Reserva Ahora
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <a
                  href="https://maps.app.goo.gl/bxJjqN7H8GukNkzy7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-transparent text-[#CFD1D4] border border-[#c4871a]/40 px-8 py-4 tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/[0.07] transition-all no-underline"
                  aria-label="Abrir ubicación en Google Maps"
                >
                  Ver Ubicación
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>

            <div
              style={{
                opacity: heroInview ? 1 : 0,
                transform: heroInview ? "translateX(0)" : "translateX(32px)",
                transition:
                  "opacity 0.8s cubic-bezier(0.22,0.61,0.36,1) 0.15s, transform 0.8s cubic-bezier(0.22,0.61,0.36,1) 0.15s",
              }}
            >
              <div className="relative overflow-hidden border border-[#c4871a]/12 bg-[#171513]">
                <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#c4871a]/40 pointer-events-none z-10" />
                <img
                  src="/media/about-hero.png"
                  alt="Power Guns Polígono - Instalaciones de entrenamiento táctico"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,.1)_0%,transparent_50%,rgba(5,4,3,.2)_100%)] pointer-events-none" />
              </div>
            </div>
          </div>
        </SiteShell>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="relative bg-[#0F0D0B] border-y border-[#c4871a]/8 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(196,135,26,.03)_0%,transparent_50%,rgba(196,135,26,.03)_100%)] pointer-events-none" />
        <SiteShell className="py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={{
                  opacity: statsInview ? 1 : 0,
                  transform: statsInview ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.08}s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.08}s`,
                }}
              >
                <p className="font-heading font-black text-4xl md:text-5xl text-[#c4871a] mb-2">
                  {stat.value}
                </p>
                <p className="font-['Rajdhani',sans-serif] text-[10px] md:text-[11px] font-semibold uppercase tracking-[.18em] text-[#B2AAA7]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </SiteShell>
      </section>

      {/* Intro */}
      <section ref={introRef} className="py-16 md:py-24">
        <SiteShell>
          <div className="max-w-[760px] mx-auto">
            <h2
              className="font-heading font-black text-2xl md:text-3xl uppercase leading-[1.15] text-white mb-8 text-center"
              style={{
                opacity: introInview ? 1 : 0,
                transform: introInview ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1), transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
              }}
            >
              Bienvenidos a Nuestro Polígono{" "}
              <span className="text-[#c4871a]">Power Guns</span>
            </h2>

            <div className="space-y-5">
              {[
                "Power Guns es un polígono de armas cortas en recinto cerrado, especializado en entrenamiento táctico, práctica con armas de fuego, traumáticas y ejercicios virtuales. Prestamos nuestros servicios a personas naturales, departamentos de seguridad y empresas de seguridad privada, ofreciendo un ambiente seguro, profesional y altamente capacitado.",
                "Somos un nuevo concepto donde la práctica de tiro es más segura, ya sea en nuestro recinto cerrado con altos estándares de calidad o mediante nuestro simulador virtual de última tecnología.",
                "Power Guns ha sido creado pensando en las necesidades de todo tipo de usuarios, desde principiantes hasta tiradores con experiencia.",
              ].map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm md:text-base text-[#B2AAA7] leading-relaxed"
                  style={{
                    opacity: introInview ? 1 : 0,
                    transform: introInview ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.08}s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.08}s`,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </SiteShell>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-[#050403]">
        <div className="absolute left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-15" />
        <SiteShell>
          <h2
            className="font-heading font-black text-2xl md:text-3xl uppercase leading-[1.15] text-white mb-3 text-center"
            style={{
              opacity: featuresInview ? 1 : 0,
              transform: featuresInview ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1), transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            Nuestro <span className="text-[#c4871a]">Polígono</span>
          </h2>

          <div
            className="flex items-center justify-center gap-3 mt-3 mb-12"
            style={{
              opacity: featuresInview ? 1 : 0,
              transform: featuresInview ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.06s, transform 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.06s",
            }}
          >
            <span className="w-14 h-[1.5px] bg-[#c4871a]/50" />
            <span className="w-1.5 h-1.5 rotate-45 border border-[#c4871a]/60" />
            <span className="w-14 h-[1.5px] bg-[#c4871a]/50" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="bg-[#171513] border border-[#c4871a]/10 p-6 md:p-7 transition-all duration-300 hover:border-[#c4871a]/25 hover:-translate-y-0.5"
                style={{
                  opacity: featuresInview ? 1 : 0,
                  transform: featuresInview ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.06}s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.06}s, border-color 0.3s, translate 0.3s`,
                }}
              >
                <div className="w-10 h-10 bg-[#c4871a]/10 border border-[#c4871a]/25 flex items-center justify-center mb-4 text-[#c4871a]">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-sm md:text-base uppercase tracking-[.04em] text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#B2AAA7]">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </SiteShell>
      </section>

      {/* CTA */}
      <section className="relative py-16 md:py-24 bg-[#0F0D0B] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(196,135,26,.05)_0%,transparent_55%)] pointer-events-none" />
        <SiteShell>
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="font-heading font-black text-2xl md:text-3xl uppercase leading-[1.15] text-white mb-3">
              ¿Quieres ser parte de{" "}
              <span className="text-[#c4871a]">Nuestra Comunidad</span>?
            </h2>
            <p className="text-sm md:text-base text-[#B2AAA7] mb-8">
              Mantente actualizado sobre eventos, novedades y servicios de Power
              Guns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-[#c4871a] text-[#080706] px-8 py-4 tactical-clip-lg hover:bg-[#d4a244] transition-all no-underline"
              >
                Conoce Nuestros Servicios
              </Link>
              <a
                href="https://www.instagram.com/powergunspoligono/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase bg-transparent text-[#CFD1D4] border border-[#c4871a]/40 px-8 py-4 tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/[0.07] transition-all no-underline"
                aria-label="Síguenos en Instagram"
              >
                Síguenos en Instagram
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 010 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                </svg>
              </a>
            </div>
          </div>
        </SiteShell>
      </section>

      <HomeFooter />
    </div>
  );
}
