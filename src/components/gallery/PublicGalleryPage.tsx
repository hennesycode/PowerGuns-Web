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
  size: number;
};

const INITIAL_VISIBLE = 18;
const LOAD_STEP = 12;

export function PublicGalleryPage() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + LOAD_STEP, items.length));
        }
      },
      { rootMargin: "700px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#050403] text-white">
      <div className="mx-auto flex max-w-[1280px] px-6 pt-6 md:px-10 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#5B5A59] no-underline transition-colors hover:text-[#c4871a] focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al inicio
        </Link>
      </div>

      <SiteShell className="py-12 md:py-16">
        <SectionHeader
          eyebrow="Galería completa"
          title={<>EXPERIENCIA <span className="text-[#c4871a]">POWER GUNS</span></>}
          description="Todas las imágenes y videos del polígono, respetando formatos verticales, cuadrados y horizontales con carga progresiva."
        />

        {loading ? (
          <div className="flex justify-center py-24"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="border border-[#c4871a]/12 bg-[#171513] p-12 text-center text-sm text-[#B2AAA7]">Próximamente nuevas imágenes y videos.</div>
        ) : (
          <>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4">
              {visibleItems.map((item, index) => (
                <article key={item.id} className="group mb-4 break-inside-avoid overflow-hidden border border-[#c4871a]/12 bg-[#0F0D0B]">
                  <div className="relative bg-[#080706]">
                    {item.mediaType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.fileUrl} alt={item.name} loading={index < 6 ? "eager" : "lazy"} decoding="async" className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.015]" />
                    ) : (
                      <video src={item.fileUrl} className="h-auto w-full" controls playsInline preload="metadata" />
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div ref={sentinelRef} className="h-16" />
          </>
        )}
      </SiteShell>
    </main>
  );
}
