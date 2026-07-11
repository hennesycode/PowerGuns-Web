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

const INITIAL_VISIBLE = 8;
const LOAD_STEP = 6;

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
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
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [inview, items.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + LOAD_STEP, items.length));
        }
      },
      { rootMargin: "500px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(0, visibleCount);

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
          <>
            <div className="grid auto-rows-[220px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleItems.map((item, index) => {
                const featured = index % 9 === 0 || index % 9 === 5;
                return (
                  <article
                    key={item.id}
                    className={`group relative overflow-hidden border border-[#c4871a]/12 bg-[#171513] ${featured ? "sm:col-span-2 sm:row-span-2" : ""}`}
                    style={{
                      opacity: inview ? 1 : 0,
                      transform: inview ? "translateY(0)" : "translateY(22px)",
                      transition: `opacity 0.6s ease-out ${0.08 * (index % 8)}s, transform 0.6s ease-out ${0.08 * (index % 8)}s`,
                    }}
                  >
                    {item.mediaType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.fileUrl} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <video src={item.fileUrl} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" muted controls playsInline preload="metadata" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,0)_40%,rgba(5,4,3,.84)_100%)]" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="mb-2 inline-flex bg-[#c4871a]/90 px-2.5 py-0.5 font-['Rajdhani',sans-serif] text-[10px] font-bold uppercase tracking-[.2em] text-[#080706]">
                        {item.mediaType === "image" ? "Imagen" : "Video"}
                      </span>
                      <h3 className="font-heading text-sm font-bold uppercase tracking-[.08em] text-white">{item.name}</h3>
                    </div>
                  </article>
                );
              })}
            </div>
            <div ref={sentinelRef} className="h-10" />
          </>
        )}
      </SiteShell>
    </section>
  );
}
