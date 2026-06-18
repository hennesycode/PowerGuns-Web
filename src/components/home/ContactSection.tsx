import { SectionHeader } from "@/components/shared/SectionHeader";
import { SITE, HOURS } from "@/lib/constants";

export function ContactSection() {
  return (
    <section id="contacto" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Contáctanos"
          title={<>HABLEMOS <span className="text-[#c4871a]">DIRECTO</span></>}
        />
        <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr] gap-10 md:gap-16 mt-14">
          {/* Phone */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#c4871a]/9 border border-[#c4871a]/22 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#c4871a]">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.4 2 2 0 013.6 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.6a16 16 0 006 6l.97-.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#8a8a8a] mb-1">
                WhatsApp / Teléfono
              </div>
              <div className="text-sm text-white leading-relaxed">{SITE.phone}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#c4871a]/9 border border-[#c4871a]/22 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#c4871a]">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#8a8a8a] mb-1">
                Ubicación
              </div>
              <div className="text-sm text-white leading-relaxed">{SITE.city}<br />{SITE.country}</div>
            </div>
          </div>

          {/* Hours */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#c4871a]/9 border border-[#c4871a]/22 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#c4871a]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.22em] uppercase text-[#8a8a8a] mb-1">
                Horario de Atención
              </div>
              <div className="text-sm text-white leading-relaxed">{HOURS.weekday}<br />{HOURS.sunday}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
