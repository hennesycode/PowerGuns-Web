"use client";

import { SiteShell } from "@/components/shared/SiteShell";
import Link from "next/link";
import { useCartContext } from "@/context/CartContext";

export function CTABand() {
  const { items } = useCartContext();
  const href = items.length > 0 ? "/reservas" : "/#servicios";

  return (
    <div className="bg-[#c4871a] py-14 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.06)_0%,transparent_55%)]" />
      <SiteShell className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
        <h3 className="font-heading font-black text-[clamp(28px,4vw,52px)] uppercase text-[#080706] leading-none">¿LISTO PARA<br />ENTRAR AL RANGO?</h3>
        <Link href={href} className="bg-[#080706] text-[#c4871a] font-heading font-bold text-[15px] tracking-[.15em] uppercase px-10 py-4 tactical-clip-lg hover:bg-[#171513] hover:shadow-[0_8px_32px_rgba(0,0,0,.4)] transition-all no-underline inline-block whitespace-nowrap flex-shrink-0">RESERVAR AHORA</Link>
      </SiteShell>
    </div>
  );
}
