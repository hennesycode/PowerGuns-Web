"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { SiteShell } from "@/components/shared/SiteShell";

const INSTAGRAM_LINK = "https://www.instagram.com/powergunspoligono/";
const FACEBOOK_LINK = "https://www.facebook.com/powergunspoligono/";
const LINKEDIN_LINK = "https://www.linkedin.com/in/power-guns-poligono-8704b12a5";
const YOUTUBE_LINK = "https://www.youtube.com/@powergunspoligono";
const MAPS_LINK = "https://maps.app.goo.gl/aoPPrqEmKNNyweXe8";
const HENNESY_LINK = "https://hennesy.pro";

const quickLinks = [
  { label: "Consulta Certificados DCCAE", href: "/certificados-dccae/login" },
  { label: "Acerca de Nosotros", href: "/#nosotros" },
  { label: "Galería", href: "/galeria" },
  { label: "Contáctenos", href: "/contacto" },
  { label: "Mi Cuenta", href: "/login" },
  { label: "Política de Privacidad", href: "/politica-de-privacidad" },
];

const socials = [
  { label: "Instagram", href: INSTAGRAM_LINK, icon: MdiInstagram },
  { label: "Facebook", href: FACEBOOK_LINK, icon: MdiFacebook },
  { label: "LinkedIn", href: LINKEDIN_LINK, icon: MdiLinkedin },
  { label: "YouTube", href: YOUTUBE_LINK, icon: MdiYoutube },
];

export function HomeFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inview, setInview] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneF, setPhoneF] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

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
      { threshold: 0.06 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setPhoneF(value.replace(/\D/g, "").slice(0, 10));
  }, []);

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error("Ingresa tu nombre");
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Ingresa un correo válido");
        return;
      }
      if (!accepted) {
        toast.error("Debes aceptar el procesamiento de tus datos");
        return;
      }
      setSaving(true);
      setTimeout(() => {
        toast.success("Solicitud de suscripción recibida.");
        setName("");
        setEmail("");
        setPhoneF("");
        setAccepted(false);
        setSaving(false);
      }, 600);
    },
    [name, email, accepted],
  );

  return (
    <footer ref={sectionRef} className="bg-[#050403]">
      {/* Franja Instagram */}
      <a
        href={INSTAGRAM_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#c4871a] py-5 text-center no-underline transition-colors hover:bg-[#d6a244]"
        aria-label="Siguenos en Instagram"
      >
        <p
          className="font-heading font-bold text-sm md:text-base uppercase tracking-[.18em] text-[#080706]"
          style={{
            opacity: inview ? 1 : 0,
            transform: inview ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.1s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.1s",
          }}
        >
          Síguenos en Instagram @powergunspoligono
        </p>
      </a>

      {/* Cuerpo del footer */}
      <div className="border-t border-[#c4871a]/8">
        <SiteShell className="py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">
            {/* Col 1 — Logo */}
            <div
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.12s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.12s",
              }}
            >
              <Link href="/" className="inline-block no-underline mb-4">
                <div className="w-14 h-14 rounded-full border border-[#c4871a]/30 bg-[#0F0D0B] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(196,135,26,.12)]">
                  <Image
                    src="/logo.jpg"
                    alt="Power Guns Polígono S.A.S."
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-2 font-heading font-extrabold text-sm uppercase tracking-widest text-white">
                  POWER <span className="text-[#c4871a]">GUNS</span>
                </div>
              </Link>
              <p className="text-sm text-[#B2AAA7] leading-relaxed max-w-[280px]">
                El polígono de tiro más completo de los Llanos Orientales.
                Seguridad, profesionalismo y la mejor experiencia de tiro
                deportivo en Villavicencio, Meta.
              </p>
            </div>

            {/* Col 2 — Contáctenos + Horario */}
            <div
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.2s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.2s",
              }}
            >
              <h4 className="font-heading font-bold text-xs uppercase tracking-[.2em] text-[#c4871a] mb-5">
                Contáctenos
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-sm text-[#B2AAA7] hover:text-[#c4871a] transition-colors no-underline"
                    aria-label="Abrir dirección en Google Maps"
                  >
                    <span className="mt-0.5 shrink-0 text-[#c4871a]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span>
                      Calle 34 # 41 - 34 Barrio Barzal Alto - Villavicencio, Meta
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:poligonopowerguns@gmail.com"
                    className="flex items-start gap-3 text-sm text-[#B2AAA7] hover:text-[#c4871a] transition-colors no-underline"
                    aria-label="Enviar correo a Power Guns"
                  >
                    <span className="mt-0.5 shrink-0 text-[#c4871a]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span>poligonopowerguns@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:3057138140"
                    className="flex items-start gap-3 text-sm text-[#B2AAA7] hover:text-[#c4871a] transition-colors no-underline"
                    aria-label="Llamar a Power Guns"
                  >
                    <span className="mt-0.5 shrink-0 text-[#c4871a]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6.5-6.5A19.79 19.79 0 011.61 3.4 2 2 0 013.6 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.6a16 16 0 006 6l.97-.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </span>
                    <span>305 713 8140</span>
                  </a>
                </li>
              </ul>

              <div className="mt-8">
                <h4 className="font-heading font-bold text-xs uppercase tracking-[.2em] text-[#c4871a] mb-4">
                  Horario de Atención
                </h4>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex justify-between gap-4 text-[#B2AAA7]">
                    <span>LUN - SÁB</span>
                    <span className="text-white font-semibold">8:00 am - 6:00 pm</span>
                  </li>
                  <li className="flex justify-between gap-4 text-[#B2AAA7]">
                    <span>DOMINGO</span>
                    <span className="text-[#B63A2B] font-semibold">CERRADO</span>
                  </li>
                  <li className="flex justify-between gap-4 text-[#B2AAA7]">
                    <span>FESTIVOS</span>
                    <span className="text-[#B63A2B] font-semibold">CERRADO</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Col 3 — Acceso Información + Redes */}
            <div
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.28s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.28s",
              }}
            >
              <h4 className="font-heading font-bold text-xs uppercase tracking-[.2em] text-[#c4871a] mb-5">
                Acceso Información
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#B2AAA7] hover:text-[#c4871a] transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <h4 className="font-heading font-bold text-xs uppercase tracking-[.2em] text-[#c4871a] mb-4">
                  Síguenos
                </h4>
                <div className="flex gap-2.5">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 border border-[#c4871a]/20 bg-[#0F0D0B] flex items-center justify-center text-[#B2AAA7] transition-all duration-200 hover:bg-[#c4871a]/15 hover:border-[#c4871a]/50 hover:text-[#c4871a] hover:-translate-y-0.5"
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 4 — Suscríbete */}
            <div
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.36s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.36s",
              }}
            >
              <h4 className="font-heading font-bold text-xs uppercase tracking-[.2em] text-[#c4871a] mb-5">
                Suscríbete
              </h4>
              <p className="text-sm text-[#B2AAA7] mb-5 leading-relaxed">
                Suscríbete a nuestro boletín para recibir novedades, promociones
                y eventos especiales.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3.5">
                <div>
                  <label htmlFor="footer-name" className="sr-only">
                    Nombre
                  </label>
                  <input
                    id="footer-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full border border-[#3C3A37] bg-[#080706] px-3 py-3 text-sm text-white placeholder-[#5B5A59] focus:border-[#c4871a]/60 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="footer-email" className="sr-only">
                    Correo electrónico
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    className="w-full border border-[#3C3A37] bg-[#080706] px-3 py-3 text-sm text-white placeholder-[#5B5A59] focus:border-[#c4871a]/60 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="footer-phone" className="sr-only">
                    Teléfono
                  </label>
                  <input
                    id="footer-phone"
                    type="text"
                    inputMode="numeric"
                    value={phoneF}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Teléfono (opcional)"
                    className="w-full border border-[#3C3A37] bg-[#080706] px-3 py-3 text-sm text-white placeholder-[#5B5A59] focus:border-[#c4871a]/60 focus:outline-none transition-colors"
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 shrink-0 accent-[#c4871a]"
                  />
                  <span className="text-[11px] text-[#B2AAA7] leading-snug">
                    Estoy de acuerdo al procesamiento de mi información según la
                    ley de habeas data.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#c4871a] text-[#080706] font-heading font-bold text-sm uppercase tracking-[.12em] py-3.5 transition-all hover:bg-[#d6a244] disabled:opacity-60"
                >
                  {saving ? "Enviando..." : "Enviar"}
                </button>
              </form>
            </div>
          </div>
        </SiteShell>

        {/* Copyright */}
        <div className="border-t border-[#c4871a]/10">
          <SiteShell className="py-6">
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <p className="text-xs text-[#5B5A59] tracking-[.06em]">
                POWER GUNS © {new Date().getFullYear()}. TODOS LOS DERECHOS
                RESERVADOS.
              </p>
              <p className="text-xs text-[#5B5A59]">
                Página desarrollada por{" "}
                <a
                  href={HENNESY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c4871a] hover:text-[#d6a244] transition-colors no-underline font-semibold"
                >
                  HENNESY
                </a>
              </p>
            </div>
          </SiteShell>
        </div>
      </div>
    </footer>
  );
}

function MdiInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 010 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
    </svg>
  );
}

function MdiFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  );
}

function MdiLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function MdiYoutube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  );
}
