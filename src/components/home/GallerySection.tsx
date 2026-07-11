"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
      setCurrent((value) => (value + 1) % items.length);
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [inview, items.length]);

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
          <div className="space-y-7">
            <div className="relative overflow-hidden border border-[#c4871a]/12 bg-[#080706] shadow-[0_24px_90px_rgba(0,0,0,.35)]">
              <div className="aspect-[16/10] md:aspect-[21/9]">
                {items.map((item, index) => (
                  <div key={item.id} className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== current}>
                    {item.mediaType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.fileUrl} alt={item.name} loading={index === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <video src={item.fileUrl} className="h-full w-full object-cover" muted playsInline loop autoPlay={index === current} preload="metadata" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,4,3,.82),rgba(5,4,3,.22)_48%,rgba(5,4,3,.72))]" />
                    <div className="absolute bottom-0 left-0 max-w-xl p-5 md:p-8">
                      <span className="mb-3 inline-flex bg-[#c4871a]/90 px-2.5 py-0.5 font-['Rajdhani',sans-serif] text-[10px] font-bold uppercase tracking-[.2em] text-[#080706]">
                        {item.mediaType === "image" ? "Imagen" : "Video"}
                      </span>
                      <h3 className="font-heading text-2xl font-black uppercase tracking-[.04em] text-white md:text-4xl">{item.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                {items.map((item, index) => (
                  <button key={item.id} type="button" onClick={() => setCurrent(index)} className={`h-1.5 transition-all ${index === current ? "w-8 bg-[#c4871a]" : "w-3 bg-white/35 hover:bg-white/70"}`} aria-label={`Ver elemento ${index + 1}`} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#B2AAA7]">Vista previa optimizada. Abre la galería completa para ver todos los formatos y proporciones.</p>
              <Link href="/galeria" className="inline-flex justify-center border border-[#c4871a]/40 px-6 py-3 font-heading text-sm font-bold uppercase tracking-[.12em] text-[#c4871a] no-underline transition-colors hover:bg-[#c4871a]/10">
                Ver galería completa
              </Link>
            </div>
          </div>
        )}
      </SiteShell>
    </section>
  );
}
