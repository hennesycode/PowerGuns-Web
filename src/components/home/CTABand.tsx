import Link from "next/link";

export function CTABand() {
  return (
    <div className="bg-[#c4871a] py-14 md:py-16 px-4 md:px-8 lg:px-18 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.06)_0%,transparent_55%)]" />
      <h3 className="font-heading font-black text-[clamp(28px,4vw,52px)] uppercase text-[#080808] leading-none relative z-10">
        ¿LISTO PARA<br />ENTRAR AL RANGO?
      </h3>
      <Link
        href="/reservas"
        className="bg-[#080808] text-[#c4871a] font-heading font-bold text-[15px] tracking-[.15em] uppercase px-10 py-4 tactical-clip-lg hover:bg-[#191919] hover:shadow-[0_8px_32px_rgba(0,0,0,.4)] transition-all no-underline inline-block whitespace-nowrap relative z-10 flex-shrink-0"
      >
        RESERVAR AHORA
      </Link>
    </div>
  );
}
