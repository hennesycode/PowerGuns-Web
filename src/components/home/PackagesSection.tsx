import { SectionHeader } from "@/components/shared/SectionHeader";
import Link from "next/link";

const FALLBACK_PACKAGES = [
  { id: 1, name: "INICIACIÓN", tier: "NIVEL 01", tierLevel: 1, price: 85000, unit: "COP por persona", features: ["50 disparos calibre 9mm","1 pistola a elección","Instrucción de seguridad básica","Equipo de protección completo","Duración: ~45 minutos"], isPopular: false, orderNum: 1 },
  { id: 2, name: "TÁCTICO", tier: "NIVEL 02", tierLevel: 2, price: 165000, unit: "COP por persona", features: ["100 disparos — pistola + rifle","2 armas a elección","Instrucción técnica personalizada","Video de tu sesión de tiro","Targets impresos de recuerdo","Duración: ~90 minutos"], isPopular: true, orderNum: 2 },
  { id: 3, name: "ELITE", tier: "NIVEL 03", tierLevel: 3, price: 280000, unit: "COP por persona", features: ["200 disparos — sin restricción de calibre","Acceso completo a la armería","Instructor dedicado exclusivo","Sesión de fotos profesional","Cronometraje y análisis de tiro","Rango privado disponible","Duración: ~3 horas"], isPopular: false, orderNum: 3 },
];

export async function PackagesSection() {
  let packages = FALLBACK_PACKAGES;
  try {
    const { packagesService } = await import("@/server/services/package.service");
    const dbPkgs = await packagesService.getPackages();
    packages = dbPkgs.map((p: Record<string, unknown>) => ({
      id: p.id as number,
      name: p.name as string,
      tier: p.tier as string,
      tierLevel: p.tierLevel as number,
      price: Number(p.price),
      unit: (p.unit as string) || "COP por persona",
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
      isPopular: Boolean(p.isPopular),
      orderNum: (p.orderNum as number) || 0,
    }));
  } catch { /* DB not available */ }

  return (
    <section id="paquetes" className="section-padding section-alt">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Elige tu nivel"
          title={<>PAQUETES <span className="text-[#c4871a]">&amp; PLANES</span></>}
          description="Todos los paquetes incluyen equipo de protección, instrucción de seguridad y supervisión profesional."
        />
        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-[#191919] border ${pkg.isPopular ? "border-[#c4871a]/40 bg-[#222222]" : "border-[#c4871a]/12"} p-8 md:p-10 overflow-hidden transition-all duration-300 hover:border-[#c4871a]/35 hover:-translate-y-1 group`}
            >
              {pkg.isPopular && (
                <span className="absolute top-4 right-4 bg-[#c4871a] text-[#080808] font-['Rajdhani',sans-serif] font-bold text-[9px] tracking-[.22em] uppercase px-2.5 py-0.5 tactical-clip">
                  MÁS POPULAR
                </span>
              )}
              <div className="font-['Rajdhani',sans-serif] font-bold text-[10px] tracking-[.35em] uppercase text-[#c4871a] mb-1.5">{pkg.tier}</div>
              <h3 className="font-heading font-black text-4xl uppercase text-white mb-5 leading-none">{pkg.name}</h3>
              <div className="text-[11px] text-[#8a8a8a] mb-0.5">Desde</div>
              <div className={`font-heading font-black text-[46px] ${pkg.isPopular ? "text-[50px]" : ""} text-[#c4871a] leading-none mb-0.5`}>${pkg.price.toLocaleString("es-CO")}</div>
              <div className="text-[11px] text-[#8a8a8a] mb-7">{pkg.unit}</div>
              <div className="h-px bg-[#c4871a]/18 mb-6" />
              <ul className="space-y-2.5 mb-8">
                {pkg.features.map((feat: string) => (
                  <li key={feat} className="flex items-start gap-2.5 text-[13px] text-[#c8c8c8] leading-relaxed">
                    <span className="text-[#c4871a] text-[7px] mt-[5px] flex-shrink-0">◆</span>{feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/reservas"
                className={`w-full block text-center py-4 font-heading font-bold text-sm tracking-[.15em] uppercase no-underline transition-all ${pkg.isPopular ? "bg-[#c4871a] text-[#080808] hover:bg-[#d4a244]" : "bg-transparent text-[#c8c8c8] border border-[#c4871a]/35 hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/7"}`}
              >
                RESERVAR
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-8 p-5 bg-[#c4871a]/6 border border-[#c4871a]/18 flex items-center gap-3.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#c4871a] flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] text-[#8a8a8a]">¿Grupo de más de 5 personas o evento especial? <Link href="#contacto" className="text-[#c4871a] no-underline">Solicita una cotización personalizada →</Link></p>
        </div>
      </div>
    </section>
  );
}
