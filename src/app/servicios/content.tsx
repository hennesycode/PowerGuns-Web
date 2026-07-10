"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartContext } from "@/context/CartContext";
import { SiteShell } from "@/components/shared/SiteShell";
import { toast } from "sonner";

type Service = {
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
};

type SortValue =
  | "date-desc"
  | "featured"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "duration-desc";

type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "date-desc", label: "Más recientes" },
  { value: "featured", label: "Destacados primero" },
  { value: "price-asc", label: "Precio: bajo a alto" },
  { value: "price-desc", label: "Precio: alto a bajo" },
  { value: "duration-asc", label: "Duración: menor a mayor" },
  { value: "duration-desc", label: "Duración: mayor a menor" },
];

const VIEW_STORAGE_KEY = "powerguns_services_view";

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function getStoredView(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = localStorage.getItem(VIEW_STORAGE_KEY);
  return stored === "list" ? "list" : "grid";
}

export function ServiciosPageContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("date-desc");
  const [view, setView] = useState<ViewMode>("grid");
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore view preference on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(getStoredView());
    setHydrated(true);
  }, []);

  // Fetch services
  const fetchServices = useCallback(async (q: string, s: SortValue) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: s });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/public/services?${params.toString()}`);
      const data = await res.json();
      setServices(data.services ?? []);
    } catch {
      toast.error("No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices(query, sort);
  }, [fetchServices, query, sort]);

  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchServices(value, sort);
    }, 400);
  }, [fetchServices, sort]);

  // Sort change — immediate fetch
  const handleSortChange = useCallback((value: SortValue) => {
    setSort(value);
    fetchServices(query, value);
  }, [fetchServices, query]);

  // View toggle
  const toggleView = useCallback((mode: ViewMode) => {
    setView(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    fetchServices("", sort);
  }, [fetchServices, sort]);

  return (
    <div className="min-h-screen bg-[#050403]">
      {/* Hero */}
      <div className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c4871a]/[0.015] rounded-full blur-[100px] pointer-events-none" />

        <SiteShell>
          <div className="max-w-[720px] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="inline-block font-['Rajdhani',sans-serif] text-[10px] font-semibold uppercase tracking-[.22em] text-[#c4871a] border border-[#c4871a]/30 px-3 py-1 mb-4">
              Servicios
            </span>
            <h1 className="font-heading font-black text-[clamp(32px,4.5vw,48px)] uppercase leading-[1.05] text-white mb-3">
              Nuestros<span className="text-[#c4871a]"> Servicios</span>
            </h1>
            <p className="text-bas md:text-lg text-[#B2AAA7] leading-relaxed">
              Explora entrenamientos, certificaciones y experiencias diseñadas
              para tu práctica.
            </p>
          </div>
        </SiteShell>
      </div>

      {/* Toolbar */}
      <SiteShell className="pb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-[420px]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B5A59]"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Buscar servicios, entrenamientos o certificaciones..."
              className="w-full border border-[#3C3A37] bg-[#0F0D0B] pl-10 pr-4 py-3 text-sm text-white placeholder-[#5B5A59] focus:border-[#c4871a]/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Sort + View */}
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortValue)}
              className="h-[46px] border border-[#3C3A37] bg-[#0F0D0B] px-3 text-sm text-white focus:border-[#c4871a]/60 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* View toggles */}
            {hydrated && (
              <div className="flex border border-[#3C3A37]">
                <button
                  type="button"
                  onClick={() => toggleView("grid")}
                  className={`h-[46px] w-11 flex items-center justify-center transition-colors ${
                    view === "grid"
                      ? "bg-[#c4871a] text-[#080706]"
                      : "text-[#5B5A59] hover:text-white bg-[#0F0D0B]"
                  }`}
                  aria-label="Vista cuadrícula"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => toggleView("list")}
                  className={`h-[46px] w-11 flex items-center justify-center transition-colors ${
                    view === "list"
                      ? "bg-[#c4871a] text-[#080706]"
                      : "text-[#5B5A59] hover:text-white bg-[#0F0D0B]"
                  }`}
                  aria-label="Vista lista"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <line x1="3" y1="14" x2="21" y2="14" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </SiteShell>

      {/* Content */}
      <SiteShell className="pb-20 md:pb-28">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" />
          </div>
        )}

        {/* No results */}
        {!loading && services.length === 0 && query && (
          <div className="border border-[#c4871a]/12 bg-[#0F0D0B] p-10 md:p-14 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-14 h-14 text-[#3C3A37] mx-auto mb-4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-[#B2AAA7] text-sm mb-3">
              No encontramos servicios con esa búsqueda.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="border border-[#c4871a]/40 px-5 py-2 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* No active services */}
        {!loading && services.length === 0 && !query && (
          <div className="border border-[#c4871a]/12 bg-[#0F0D0B] p-10 md:p-14 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-14 h-14 text-[#3C3A37] mx-auto mb-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <p className="text-[#B2AAA7] text-sm">
              Próximamente nuevos servicios disponibles.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && services.length > 0 && (
          view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <div
                  key={service.id}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-400"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ServiceCardGrid service={service} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, i) => (
                <div
                  key={service.id}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-300"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <ServiceRow service={service} />
                </div>
              ))}
            </div>
          )
        )}
      </SiteShell>
    </div>
  );
}

function ServiceCardGrid({ service }: { service: Service }) {
  const { addItem } = useCartContext();
  const router = useRouter();
  const hasDiscount =
    service.discountType !== "none" && service.discountValue && service.discountValue > 0;
  const cartItem = {
    id: service.id,
    name: service.name,
    title: service.title,
    slug: service.slug,
    mainImageUrl: service.mainImageUrl,
    price: service.price,
    finalPrice: service.finalPrice,
    durationMinutes: service.durationMinutes,
  };

  const handleAgendar = () => {
    addItem(cartItem, { silent: true });
    router.push("/reservas");
  };

  const handleAddToCart = () => {
    addItem(cartItem);
    toast.success("Servicio agregado al carrito");
  };

  const discountLabel =
    service.discountType === "percentage"
      ? `${service.discountValue}% OFF`
      : `-${formatCOP(service.discountValue!)}`;

  return (
    <article className="group relative flex flex-col h-full min-h-[480px] sm:min-h-[520px] bg-[#171513] border border-[#c4871a]/12 overflow-hidden transition-all duration-300 hover:border-[#c4871a]/30 hover:-translate-y-1">
      {service.isFeatured && (
        <div className="absolute top-3 left-3 z-10 bg-[#c4871a] text-[#080706] font-heading font-bold text-[9px] uppercase tracking-[.1em] px-2 py-0.5 tactical-clip">
          Destacado
        </div>
      )}

      <div className="relative aspect-square w-full shrink-0 bg-[#080706] overflow-hidden">
        <Image
          src={service.mainImageUrl}
          alt={service.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#c4871a]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading font-bold text-sm md:text-base uppercase tracking-[.03em] text-white line-clamp-2 min-h-[40px] md:min-h-[48px] leading-snug">
          {service.name}
        </h3>
        <p className="text-xs text-[#5B5A59] line-clamp-2 min-h-[16px] mt-1 mb-3">
          {service.shortDescription || service.title || <>&nbsp;</>}
        </p>

        <div className="min-h-[54px]">
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-xs text-[#5B5A59] line-through">
                {formatCOP(service.price)}
              </span>
            )}
            <span className="font-['Rajdhani',sans-serif] font-bold text-lg text-[#c4871a]">
              {formatCOP(service.finalPrice)}
            </span>
          </div>
          {hasDiscount && (
            <span className="inline-block mt-1 text-[10px] font-heading font-bold uppercase text-[#B63A2B] bg-[#B63A2B]/10 px-1.5 py-0.5">
              {discountLabel}
            </span>
          )}
          {!hasDiscount && (
            <span className="block mt-1 invisible text-[10px]">&nbsp;</span>
          )}
        </div>

        {service.durationMinutes > 0 && (
          <div className="min-h-[22px] mb-3">
            <div className="flex items-center gap-1.5 text-xs text-[#B2AAA7]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3.5 h-3.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {service.durationMinutes} min
            </div>
          </div>
        )}

        <div className="flex-1" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleAgendar}
            className="text-center font-heading font-bold text-[11px] uppercase tracking-[.08em] bg-[#c4871a] text-[#080706] px-3 py-2.5 hover:bg-[#d4a244] transition-colors"
          >
            Agendar
          </button>
          <button
            onClick={handleAddToCart}
            className="font-heading font-bold text-[11px] uppercase tracking-[.08em] border border-[#c4871a]/40 text-[#c4871a] px-3 py-2.5 hover:bg-[#c4871a]/10 hover:border-[#c4871a] transition-colors"
          >
            + Carrito
          </button>
        </div>
      </div>
    </article>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const { addItem } = useCartContext();
  const router = useRouter();
  const hasDiscount =
    service.discountType !== "none" && service.discountValue && service.discountValue > 0;
  const cartItem = {
    id: service.id,
    name: service.name,
    title: service.title,
    slug: service.slug,
    mainImageUrl: service.mainImageUrl,
    price: service.price,
    finalPrice: service.finalPrice,
    durationMinutes: service.durationMinutes,
  };

  const handleAgendar = () => {
    addItem(cartItem, { silent: true });
    router.push("/reservas");
  };

  const handleAddToCart = () => {
    addItem(cartItem);
    toast.success("Servicio agregado al carrito");
  };

  const discountLabel =
    service.discountType === "percentage"
      ? `${service.discountValue}% OFF`
      : `-${formatCOP(service.discountValue!)}`;

  return (
    <div className="group flex flex-col sm:flex-row gap-4 p-4 md:p-5 bg-[#171513] border border-[#c4871a]/12 transition-all duration-300 hover:border-[#c4871a]/25">
      {/* Image */}
      <div className="relative w-full sm:w-[160px] md:w-[200px] shrink-0 aspect-square sm:aspect-auto">
        {service.isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-[#c4871a] text-[#080706] font-heading font-bold text-[8px] uppercase tracking-[.1em] px-2 py-0.5">
            Destacado
          </div>
        )}
        <Image
          src={service.mainImageUrl}
          alt={service.title}
          fill
          sizes="(min-width: 768px) 200px, 100vw"
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-heading font-bold text-bas md:text-lg uppercase tracking-[.03em] text-white line-clamp-1">
          {service.name}
        </h3>
        <p className="text-xs text-[#5B5A59] line-clamp-2 mt-1 mb-2">
          {service.shortDescription || service.title}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {hasDiscount && (
            <span className="text-xs text-[#5B5A59] line-through">
              {formatCOP(service.price)}
            </span>
          )}
          <span className="font-['Rajdhani',sans-serif] font-bold text-lg text-[#c4871a]">
            {formatCOP(service.finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] font-heading font-bold uppercase text-[#B63A2B] bg-[#B63A2B]/10 px-1.5 py-0.5">
              {discountLabel}
            </span>
          )}
          {service.durationMinutes > 0 && (
            <span className="text-xs text-[#B2AAA7] flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3 h-3 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {service.durationMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2 shrink-0 sm:justify-center sm:min-w-[130px]">
        <button
          onClick={handleAgendar}
          className="flex-1 sm:flex-none font-heading font-bold text-[11px] uppercase tracking-[.08em] bg-[#c4871a] text-[#080706] px-4 py-2.5 hover:bg-[#d4a244] transition-colors"
        >
          Agendar
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 sm:flex-none font-heading font-bold text-[11px] uppercase tracking-[.08em] border border-[#c4871a]/40 text-[#c4871a] px-4 py-2.5 hover:bg-[#c4871a]/10 hover:border-[#c4871a] transition-colors"
        >
          + Carrito
        </button>
      </div>
    </div>
  );
}
