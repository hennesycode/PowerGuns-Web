"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SiteShell } from "@/components/shared/SiteShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ServiceCard } from "./ServiceCard";

interface PublicService {
  id: number;
  name: string;
  title: string;
  slug: string;
  mainImageUrl: string;
  shortDescription: string;
  price: number;
  discountType: string;
  discountValue: number | null;
  finalPrice: number;
  durationMinutes: number;
  isFeatured: boolean;
}

const AUTOPLAY_INTERVAL = 5000;

export function ServicesProfessionalSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cardsPerView, setCardsPerView] = useState(4);

  // IntersectionObserver (project pattern)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInview(true); observer.unobserve(el); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Responsive cards per view
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCardsPerView(1);
      else if (w < 1024) setCardsPerView(2);
      else setCardsPerView(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fetch services
  useEffect(() => {
    fetch("/api/public/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxSlide = Math.max(0, services.length - cardsPerView);

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(index, maxSlide)));
  }, [maxSlide]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxSlide ? 0 : prev + 1));
  }, [maxSlide]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? maxSlide : prev - 1));
  }, [maxSlide]);

  // Autoplay
  useEffect(() => {
    if (paused || services.length <= cardsPerView) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next, services.length, cardsPerView]);

  const translatePct = cardsPerView > 0 ? (current * 100) / cardsPerView : 0;

  return (
    <section
      id="servicios"
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-[#050403] overflow-hidden"
    >
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />

      <SiteShell>
        {/* Header */}
        <div
          style={{
            opacity: inview ? 1 : 0,
            transform: inview ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s cubic-bezier(0.22,0.61,0.36,1), transform 0.7s cubic-bezier(0.22,0.61,0.36,1)",
          }}
        >
          <SectionHeader
            eyebrow="Servicios"
            title={<>NUESTROS <span className="text-[#c4871a]">SERVICIOS</span> PROFESIONALES</>}
            description="Entrenamientos, certificaciones y experiencias diseñadas para llevar tu práctica al siguiente nivel."
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c4871a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-[#171513] border border-[#c4871a]/12 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-[#5B5A59] mx-auto mb-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <p className="text-[#B2AAA7] font-['Rajdhani',sans-serif] text-sm">
              Próximamente nuevos servicios disponibles
            </p>
          </div>
        ) : (
          <div>
            {/* Carousel */}
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              style={{
                opacity: inview ? 1 : 0,
                transform: inview ? "translateY(0)" : "translateY(28px)",
                transition: "opacity 0.7s cubic-bezier(0.22,0.61,0.36,1) 0.15s, transform 0.7s cubic-bezier(0.22,0.61,0.36,1) 0.15s",
              }}
            >
              {/* Cards track */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${translatePct}%)` }}
                >
                  {services.map((service, i) => (
                    <div
                      key={service.id}
                      className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-2 h-full"
                      style={{
                        opacity: inview ? 1 : 0,
                        transform: inview ? "translateY(0)" : "translateY(20px)",
                        transition: `opacity 0.6s ease-out ${0.24 + i * 0.08}s, transform 0.6s ease-out ${0.24 + i * 0.08}s`,
                      }}
                    >
                      <ServiceCard
                        id={service.id}
                        name={service.name}
                        title={service.title}
                        slug={service.slug}
                        mainImageUrl={service.mainImageUrl}
                        price={service.price}
                        discountType={service.discountType}
                        discountValue={service.discountValue}
                        finalPrice={service.finalPrice}
                        durationMinutes={service.durationMinutes}
                        isFeatured={service.isFeatured}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows */}
              {services.length > cardsPerView && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 md:-translate-x-4 w-10 h-10 bg-[#171513]/90 border border-[#c4871a]/20 text-white hover:bg-[#c4871a]/15 hover:border-[#c4871a]/50 transition-all flex items-center justify-center z-10"
                    aria-label="Servicio anterior"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 md:translate-x-4 w-10 h-10 bg-[#171513]/90 border border-[#c4871a]/20 text-white hover:bg-[#c4871a]/15 hover:border-[#c4871a]/50 transition-all flex items-center justify-center z-10"
                    aria-label="Servicio siguiente"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {services.length > cardsPerView && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === current ? "bg-[#c4871a] w-4" : "bg-[#3C3A37] hover:bg-[#5B5A59]"
                    }`}
                    aria-label={`Ir al slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </SiteShell>
    </section>
  );
}
