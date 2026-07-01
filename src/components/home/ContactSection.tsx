import { SiteShell } from "@/components/shared/SiteShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SITE, HOURS } from "@/lib/constants";

export function ContactSection() {
  return (
    <section id="contacto" className="py-16 md:py-24">
      <SiteShell>
        <SectionHeader eyebrow="Contáctanos" title={<>HABLEMOS <span className="text-[#c4871a]">DIRECTO</span></>} />
        <div className="grid md:grid-cols-3 gap-10 md:gap-16 mt-14">
          {[
            { label: "WhatsApp / Teléfono", value: SITE.phone, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.4 2 2 0 013.6 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.6a16 16 0 006 6l.97-.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg> },
            { label: "Ubicación", value: `${SITE.city}\n${SITE.country}`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg> },
            { label: "Horario", value: `${HOURS.weekday}\n${HOURS.sunday}`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-[#c4871a]/9 border border-[#c4871a]/22 flex items-center justify-center flex-shrink-0 text-[#c4871a]">{item.icon}</div>
              <div>
                <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#B2AAA7] mb-1">{item.label}</div>
                <div className="text-sm text-white leading-relaxed whitespace-pre-line">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </SiteShell>
    </section>
  );
}
