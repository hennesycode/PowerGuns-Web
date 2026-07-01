import { SiteShell } from "@/components/shared/SiteShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import Link from "next/link";

export function GallerySection() {
  return (
    <section id="galeria" className="py-16 md:py-24 bg-[#0F0D0B]">
      <SiteShell>
        <SectionHeader eyebrow="Experiencia visual" title={<>GALERÍA <span className="text-[#c4871a]">EN ACCIÓN</span></>} />
        <div className="grid grid-cols-4 grid-rows-[150px_150px] md:grid-rows-[200px_200px] gap-1 mt-12">
          {[{ label: "RANGO PRINCIPAL", span: "col-span-2 row-span-2", bg: "" }, { label: "", span: "", bg: "bg-[#26231F]" }, { label: "", span: "", bg: "" }, { label: "", span: "", bg: "bg-[#26231F]" }, { label: "", span: "", bg: "" }].map((item, i) => (
            <div key={i} className={`${item.span} ${item.bg || "bg-[#171513]"} relative overflow-hidden cursor-pointer group`}>
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(196,135,26,.12)" className="w-9 h-9"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </div>
              <div className="absolute inset-0 bg-[#c4871a]/18 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-7 h-7"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              {item.label && <span className="absolute bottom-3 left-3 bg-[#c4871a]/88 font-['Rajdhani',sans-serif] font-bold text-[10px] tracking-[.2em] uppercase text-[#080706] px-2.5 py-0.5">{item.label}</span>}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="#" className="bg-transparent text-[#CFD1D4] font-heading font-semibold text-sm tracking-[.14em] uppercase border border-[#c4871a]/40 px-8 py-3.5 tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/7 transition-all no-underline inline-block">VER GALERÍA COMPLETA</Link>
        </div>
      </SiteShell>
    </section>
  );
}
