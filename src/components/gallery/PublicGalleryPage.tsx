"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-block no-underline">
            <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#c4871a]/30 bg-[#0F0D0B]">
              <Image src="/logo.jpg" alt="Power Guns" width={56} height={56} className="h-full w-full object-contain" />
            </div>
            <div className="mt-3 text-center font-heading text-sm font-extrabold uppercase tracking-widest text-white">
              POWER <span className="text-[#c4871a]">GUNS</span>
            </div>
          </Link>
        </div>

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
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,4,3,.82))] p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="mb-2 inline-flex bg-[#c4871a]/90 px-2 py-0.5 font-['Rajdhani',sans-serif] text-[10px] font-bold uppercase tracking-[.18em] text-[#080706]">
                        {item.mediaType === "image" ? "Imagen" : "Video"}
                      </span>
                      <h2 className="font-heading text-sm font-bold uppercase tracking-[.08em] text-white">{item.name}</h2>
                    </div>
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
