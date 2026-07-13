"use client";

import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/shared/SiteShell";
import { SectionHeader } from "@/components/shared/SectionHeader";

type GalleryItem = {
  id: string;
  name: string;
  mediaType: "image" | "video";
  fileUrl: string;
  width: number | null;
  height: number | null;
};

const HOME_SLIDES = 12;
const SLIDE_INTERVAL = 4500;
const ITEMS_PER_SLIDE = 4;

function shuffleItems(items: GalleryItem[]) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inview, setInview] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInview(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inview || items.length > 0) return;
    fetch("/api/public/gallery")
      .then((res) => res.json())
      .then((data) => setItems(shuffleItems(data.items ?? []).slice(0, HOME_SLIDES)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [inview, items.length]);

  useEffect(() => {
    if (!inview || items.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrent((value) => (value + 1) % Math.ceil(items.length / ITEMS_PER_SLIDE));
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [inview, items.length]);

  const slideCount = Math.ceil(items.length / ITEMS_PER_SLIDE);
  const visibleItems = items.length <= ITEMS_PER_SLIDE
    ? items
    : Array.from({ length: ITEMS_PER_SLIDE }, (_, index) => items[(current * ITEMS_PER_SLIDE + index) % items.length]);

  return (
    <section ref={sectionRef} id="galeria" className="relative overflow-hidden bg-[#0F0D0B] py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />
      <SiteShell>
        <div
          style={{
            opacity: inview ? 1 : 0,
            transform: inview ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s cubic-bezier(0.22,0.61,0.36,1), transform 0.7s cubic-bezier(0.22,0.61,0.36,1)",
          }}
        >
          <SectionHeader
            eyebrow="Experiencia visual"
            title={<>GALERÍA <span className="text-[#c4871a]">EN ACCIÓN</span></>}
            description="Imágenes y videos reales del polígono, organizados desde el panel administrativo."
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="border border-[#c4871a]/12 bg-[#171513] p-12 text-center text-sm text-[#B2AAA7]">Próximamente nuevas imágenes y videos.</div>
        ) : (
          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleItems.map((item, index) => (
                <article key={`${current}-${item.id}`} className="group relative aspect-[4/5] overflow-hidden border border-[#c4871a]/12 bg-[#080706] shadow-[0_18px_60px_rgba(0,0,0,.28)]">
                  <div
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      opacity: inview ? 1 : 0,
                      transform: inview ? "translateY(0)" : "translateY(18px)",
                      transitionDelay: `${index * 90}ms`,
                    }}
                  >
                    {item.mediaType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.fileUrl} alt={item.name} loading={current === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <video src={item.fileUrl} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" muted playsInline loop autoPlay preload="metadata" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,0)_45%,rgba(5,4,3,.28)_100%)]" />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: slideCount }).map((_, index) => (
                <button key={index} type="button" onClick={() => setCurrent(index)} className={`h-1.5 transition-all ${index === current ? "w-8 bg-[#c4871a]" : "w-3 bg-white/35 hover:bg-white/70"}`} aria-label={`Ver grupo ${index + 1}`} />
              ))}
            </div>
          </div>
        )}
      </SiteShell>
    </section>
  );
}
