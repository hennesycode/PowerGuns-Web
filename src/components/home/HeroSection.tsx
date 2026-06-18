import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden bg-[#080808]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_65%_50%,rgba(196,135,26,.07)_0%,transparent_65%),radial-gradient(ellipse_40%_50%_at_15%_85%,rgba(196,135,26,.04)_0%,transparent_55%),#080808]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(196,135,26,.04) 1px,transparent 1px), linear-gradient(90deg,rgba(196,135,26,.04) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 40% 50%,black 0%,transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 40% 50%,black 0%,transparent 75%)",
        }}
      />

      {/* Reticle animation (simplified) */}
      <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[680px] h-[680px] pointer-events-none hidden lg:block">
        <div className="animate-[spin_22s_linear_infinite] w-full h-full origin-center flex items-center justify-center">
          <svg viewBox="0 0 680 680" fill="none" className="w-full h-full opacity-[.22]">
            <circle cx="340" cy="340" r="315" stroke="#C4871A" strokeWidth=".8" strokeDasharray="10 6" />
            <circle cx="340" cy="340" r="292" stroke="#C4871A" strokeWidth=".5" strokeDasharray="3 9" />
            <line x1="340" y1="28" x2="340" y2="52" stroke="#C4871A" strokeWidth="2" />
            <line x1="340" y1="628" x2="340" y2="652" stroke="#C4871A" strokeWidth="2" />
            <line x1="28" y1="340" x2="52" y2="340" stroke="#C4871A" strokeWidth="2" />
            <line x1="628" y1="340" x2="652" y2="340" stroke="#C4871A" strokeWidth="2" />
            <circle cx="340" cy="340" r="10" fill="#C4871A" opacity=".9" />
            <circle cx="340" cy="340" r="4" fill="#ffffff" />
            <line x1="340" y1="0" x2="340" y2="680" stroke="#C4871A" strokeWidth=".5" />
            <line x1="0" y1="340" x2="680" y2="340" stroke="#C4871A" strokeWidth=".5" />
            <rect x="306" y="306" width="68" height="68" fill="#080808" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 md:px-8 lg:px-18 max-w-[720px]">
        <div className="flex items-center gap-3.5 mb-5 font-['Rajdhani',sans-serif] font-bold text-xs tracking-[.35em] uppercase text-[#c4871a]">
          <span className="w-9 h-[1.5px] bg-[#c4871a]" />
          Polígono de Tiro Certificado — Villavicencio, Meta
        </div>

        <h1 className="font-heading font-black text-[clamp(60px,9vw,120px)] leading-[.92] uppercase tracking-[-.01em] text-white mb-7">
          DOMINA
          <br />
          EL <span className="text-[#c4871a]">BLANCO.</span>
          <br />
          <span className="text-transparent [-webkit-text-stroke:2px_#c4871a]">CADA VEZ.</span>
        </h1>

        <p className="font-light text-base leading-relaxed text-[#c8c8c8] max-w-[460px] mb-11">
          Instalaciones de clase mundial con armería premium, instructores certificados y el
          ambiente táctico más profesional de los Llanos Orientales.
        </p>

        <div className="flex gap-4 items-center flex-wrap">
          <Link
            href="/reservas"
            className="bg-[#c4871a] text-[#080808] font-heading font-bold text-[15px] tracking-[.14em] uppercase px-9 py-4 tactical-clip-lg hover:bg-[#d4a244] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(196,135,26,.3)] transition-all duration-200 no-underline inline-block"
          >
            RESERVAR TURNO
          </Link>
          <Link
            href="/planes"
            className="bg-transparent text-[#c8c8c8] font-heading font-semibold text-[15px] tracking-[.14em] uppercase border border-[#c4871a]/40 px-9 py-[15px] tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/7 transition-all duration-200 no-underline inline-block"
          >
            VER PAQUETES
          </Link>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent_100%)] opacity-50" />
    </section>
  );
}
