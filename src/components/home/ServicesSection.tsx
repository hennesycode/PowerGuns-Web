import { SectionHeader } from "@/components/shared/SectionHeader";
import { TacticalCard } from "@/components/shared/TacticalCard";

const FALLBACK_SERVICES = [
  { id: 1, name: "Tiro con Pistola", description: "Glock, Beretta, Sig Sauer, CZ y más. Modalidades de tiro de precisión y velocidad. Munición incluida.", icon: "target", orderNum: 1 },
  { id: 2, name: "Tiro con Rifle", description: "Plataformas AR, bolt-action y rifles de asalto. Distancias de 15 a 25 m. Cabinas acústicas con ventilación industrial.", icon: "crosshair", orderNum: 2 },
  { id: 3, name: "Defensa Personal", description: "Cursos prácticos para portadores de licencia. Técnicas de manejo seguro, tiro de estrés y situaciones reales.", icon: "shield", orderNum: 3 },
  { id: 4, name: "Eventos Corporativos", description: "Team building con experiencia de tiro real. Grupos empresariales, despedidas y celebraciones especiales.", icon: "users", orderNum: 4 },
];

const icons: Record<string, React.ReactNode> = {
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  crosshair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M3 12h18M17 8l4 4-4 4" /><rect x="3" y="10" width="5" height="4" rx="1" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
};

export async function ServicesSection() {
  let services = FALLBACK_SERVICES;
  try {
    const { servicesService } = await import("@/server/services/service.service");
    services = await servicesService.getServices();
  } catch { /* DB not available, use fallback */ }

  return (
    <section id="servicios" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Lo que ofrecemos"
          title={<>NUESTROS <span className="text-[#c4871a]">SERVICIOS</span></>}
        />
        <div className="grid sm:grid-cols-2 gap-0.5">
          {services.map((svc, i) => (
            <TacticalCard key={svc.id}>
              <span className="font-heading font-black text-[80px] text-[#c4871a]/8 absolute top-3 right-6 leading-none pointer-events-none transition-colors duration-300 group-hover:text-[#c4871a]/14">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-12 h-12 bg-[#c4871a]/10 border border-[#c4871a]/25 flex items-center justify-center mb-5 tactical-clip">
                <span className="text-[#c4871a]">{icons[svc.icon] || icons.target}</span>
              </div>
              <h3 className="font-heading font-bold text-2xl uppercase tracking-[.04em] text-white mb-3">{svc.name}</h3>
              <p className="text-sm leading-relaxed text-[#8a8a8a] max-w-[340px]">{svc.description}</p>
              <div className="mt-5 font-['Rajdhani',sans-serif] font-semibold text-[11px] tracking-[.22em] uppercase text-[#c4871a] flex items-center gap-2 group-hover:gap-3.5 transition-all cursor-pointer">
                RESERVAR SESIÓN →{" "}
              </div>
            </TacticalCard>
          ))}
        </div>
      </div>
    </section>
  );
}
