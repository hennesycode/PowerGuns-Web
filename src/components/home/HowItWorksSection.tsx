import { SiteShell } from "@/components/shared/SiteShell";
import { SectionHeader } from "@/components/shared/SectionHeader";

const steps = [
  { num: "01", title: "Reserva tu Turno", desc: "Selecciona el servicio, paquete, fecha y horario. Recibirás confirmación en menos de 2 horas." },
  { num: "02", title: "Validación de Seguridad", desc: "Revisamos tu solicitud. Debes aceptar las normas de seguridad antes de confirmar tu reserva." },
  { num: "03", title: "Llega al Polígono", desc: "Preséntate 15 minutos antes. Recibirás inducción de seguridad y equipo de protección." },
  { num: "04", title: "Vive la Experiencia", desc: "Disfruta del tiro con instructor certificado, armas premium y el mejor ambiente táctico." },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-[#0F0D0B]">
      <SiteShell>
        <SectionHeader eyebrow="Proceso simple" title={<>CÓMO <span className="text-[#c4871a]">FUNCIONA</span></>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((step) => (
            <div key={step.num} className="bg-[#171513] border border-[#c4871a]/10 p-6 md:p-8 relative group hover:border-[#c4871a]/25 transition-all">
              <span className="font-heading font-black text-7xl text-[#c4871a]/10 absolute top-3 right-4 leading-none select-none">{step.num}</span>
              <h4 className="font-heading font-bold text-xl uppercase text-white mb-3 relative z-10">{step.title}</h4>
              <p className="text-[13px] leading-relaxed text-[#B2AAA7] relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </SiteShell>
    </section>
  );
}
