import Link from "next/link";
import { SITE, HOURS } from "@/lib/constants";

const footerLinks = {
  services: [
    { label: "Tiro con Pistola", href: "#" },
    { label: "Tiro con Rifle", href: "#" },
    { label: "Defensa Personal", href: "#" },
    { label: "Eventos Corporativos", href: "#" },
  ],
  packages: [
    { label: "Iniciación", href: "#" },
    { label: "Táctico", href: "#" },
    { label: "Elite", href: "#" },
    { label: "Grupal / Evento", href: "#" },
  ],
  info: [
    { label: "Nosotros", href: "#" },
    { label: "Seguridad y Normas", href: "#" },
    { label: "Galería", href: "#" },
    { label: "Política de Privacidad", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#c4871a]/20 pt-14 pb-6 px-4 md:px-8 lg:px-18">
      {/* Dashed accent */}
      <div className="h-[3px] mb-8 opacity-30 bg-[repeating-linear-gradient(90deg,#c4871a_0,#c4871a_8px,transparent_8px,transparent_18px)]" />

      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-10">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-4 no-underline">
            <div className="w-10 h-10 rounded-full border border-[#c4871a]/30 bg-[#111111] flex items-center justify-center">
              <span className="font-heading font-extrabold text-[#c4871a] text-xs">PG</span>
            </div>
            <div className="font-heading font-extrabold text-xs leading-tight uppercase tracking-widest text-white">
              POWER <span className="text-[#c4871a]">GUNS</span>
              <br />
              POLÍGONO S.A.S
            </div>
          </Link>
          <p className="text-[#8a8a8a] text-sm leading-relaxed">
            El polígono de tiro más completo de los Llanos Orientales. Seguridad, profesionalismo y
            la mejor experiencia de tiro deportivo en {SITE.city}.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-['Rajdhani',sans-serif] font-bold text-[10px] tracking-[.3em] uppercase text-[#c4871a] mb-4">
            Servicios
          </h4>
          <ul className="flex flex-col gap-2.5">
            {footerLinks.services.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[#8a8a8a] text-sm hover:text-[#c4871a] transition-colors no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Packages */}
        <div>
          <h4 className="font-['Rajdhani',sans-serif] font-bold text-[10px] tracking-[.3em] uppercase text-[#c4871a] mb-4">
            Paquetes
          </h4>
          <ul className="flex flex-col gap-2.5">
            {footerLinks.packages.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[#8a8a8a] text-sm hover:text-[#c4871a] transition-colors no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-['Rajdhani',sans-serif] font-bold text-[10px] tracking-[.3em] uppercase text-[#c4871a] mb-4">
            Información
          </h4>
          <ul className="flex flex-col gap-2.5">
            {footerLinks.info.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[#8a8a8a] text-sm hover:text-[#c4871a] transition-colors no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl border-t border-[#c4871a]/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[#8a8a8a]/55 text-xs">
          &copy; {new Date().getFullYear()} Power Guns Polígono S.A.S. · {SITE.city}, {SITE.country}
        </p>
        <div className="flex gap-2.5">
          {["Instagram", "Facebook", "WhatsApp"].map((s) => (
            <a
              key={s}
              href="#"
              aria-label={s}
              className="w-8 h-8 bg-[#c4871a]/8 border border-[#c4871a]/20 flex items-center justify-center hover:bg-[#c4871a]/22 transition-colors no-underline"
            >
              <span className="text-[#c4871a] text-xs font-bold">{s.charAt(0)}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
