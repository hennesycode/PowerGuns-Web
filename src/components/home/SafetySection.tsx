import { SiteShell } from "@/components/shared/SiteShell";
import { SectionHeader } from "@/components/shared/SectionHeader";

const whyItems = [
  { title: "Instructores Certificados", desc: "Personal certificado por INDUMIL con experiencia en fuerzas de seguridad del Estado. Cada sesión cuenta con supervisión experta permanente." },
  { title: "Armería Premium", desc: "Más de 25 armas disponibles entre pistolas, revólveres, subametralladoras y rifles de diferentes calibres y fabricantes internacionales." },
  { title: "Seguridad Total", desc: "Cabinas acústicas, cristales antibalas, ventilación industrial y protocolo clase A. Tu seguridad es nuestra máxima prioridad." },
  { title: "100% Legal y Certificado", desc: "Permisos vigentes ante el Ejército Nacional, Policía Nacional y Superseguridad. Opera con total transparencia." },
];

export function SafetySection() {
  return (
    <section id="nosotros" className="py-16 md:py-24">
      <SiteShell>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="relative">
            <div className="w-full aspect-[4/5] bg-[#171513] border border-[#c4871a]/18 relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-3.5 left-3.5 w-5 h-5 border-t-2 border-l-2 border-[#c4871a]" /><div className="absolute top-3.5 right-3.5 w-5 h-5 border-t-2 border-r-2 border-[#c4871a]" />
              <div className="absolute bottom-3.5 left-3.5 w-5 h-5 border-b-2 border-l-2 border-[#c4871a]" /><div className="absolute bottom-3.5 right-3.5 w-5 h-5 border-b-2 border-r-2 border-[#c4871a]" />
              <div className="text-[#c4871a]/15 text-8xl font-heading font-black select-none">⊕</div>
              <div className="absolute top-4 left-4 bg-[#080706]/75 border border-[#c4871a]/30 px-2.5 py-1.5"><span className="font-['Rajdhani',sans-serif] text-[9px] tracking-[.22em] text-[#c4871a] uppercase">ZONA DE TIRO ACTIVA</span></div>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-[#c4871a] px-6 py-5"><div className="font-heading font-black text-4xl text-[#080706] leading-none">10+</div><div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.2em] uppercase text-[#080706]">AÑOS DE<br />EXPERIENCIA</div></div>
          </div>
          <div>
            <SectionHeader eyebrow="¿Por qué elegirnos?" title={<>EL MEJOR<br /><span className="text-[#c4871a]">POLÍGONO</span><br />DEL LLANO</>} />
            <ul className="space-y-0 mt-9">
              {whyItems.map((item, i) => (
                <li key={item.title} className={`flex gap-4 items-start py-4 ${i < whyItems.length - 1 ? "border-b border-[#c4871a]/10" : ""}`}>
                  <span className="font-heading font-black text-xl text-[#c4871a]/35 flex-shrink-0 w-5 pt-0.5">—</span>
                  <div><h4 className="font-heading font-bold text-lg uppercase text-white mb-1">{item.title}</h4><p className="text-[13px] leading-relaxed text-[#B2AAA7]">{item.desc}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SiteShell>
    </section>
  );
}
