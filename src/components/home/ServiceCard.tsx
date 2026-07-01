"use client";

import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";

interface ServiceCardProps {
  id: number;
  name: string;
  title: string;
  slug: string;
  mainImageUrl: string;
  price: number;
  discountType: string;
  discountValue: number | null;
  finalPrice: number;
  durationMinutes: number;
  isFeatured: boolean;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function ServiceCard({
  id,
  name,
  title,
  slug,
  mainImageUrl,
  price,
  discountType,
  discountValue,
  finalPrice,
  durationMinutes,
  isFeatured,
}: ServiceCardProps) {
  const { addItem } = useCartContext();
  const router = useRouter();
  const hasDiscount = discountType !== "none" && discountValue && discountValue > 0;
  const cartItem = { id, name, title, slug, mainImageUrl, price, finalPrice, durationMinutes };

  const startReservation = () => {
    addItem(cartItem, { silent: true });
    router.push("/reservas");
  };
  const discountLabel =
    discountType === "percentage" ? `${discountValue}% OFF` : `-${formatCOP(discountValue!)}`;

  const handleAddToCart = () => {
    addItem(cartItem);
  };

  return (
    <article className="group relative flex flex-col h-full min-h-[480px] sm:min-h-[520px] bg-[#171513] border border-[#c4871a]/12 overflow-hidden transition-all duration-300 hover:border-[#c4871a]/30 hover:-translate-y-1">
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10 bg-[#c4871a] text-[#080706] font-heading font-bold text-[9px] uppercase tracking-[.1em] px-2 py-0.5 tactical-clip">
          Destacado
        </div>
      )}

      {/* Image 1:1 — same size for all */}
      <div className="relative aspect-square w-full shrink-0 bg-[#080706] overflow-hidden">
        <img
          src={mainImageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#c4871a]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content — fills remaining space, pushes buttons to bottom */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title — consistent 2-line minimum */}
        <h3 className="font-heading font-bold text-sm md:text-base uppercase tracking-[.03em] text-white line-clamp-2 min-h-[40px] md:min-h-[48px] leading-snug">
          {name}
        </h3>

        {/* Subtitle — consistent 1-line minimum */}
        <p className="text-xs text-[#5B5A59] line-clamp-1 min-h-[16px] mt-1 mb-3">
          {title || <>&nbsp;</>}
        </p>

        {/* Price block — same height with or without discount */}
        <div className="min-h-[54px]">
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-xs text-[#5B5A59] line-through">
                {formatCOP(price)}
              </span>
            )}
            <span className="font-['Rajdhani',sans-serif] font-bold text-lg text-[#c4871a]">
              {formatCOP(finalPrice)}
            </span>
          </div>
          {hasDiscount && (
            <span className="inline-block mt-1 text-[10px] font-heading font-bold uppercase text-[#B63A2B] bg-[#B63A2B]/10 px-1.5 py-0.5">
              {discountLabel}
            </span>
          )}
          {!hasDiscount && <span className="block mt-1 invisible text-[10px]">&nbsp;</span>}
        </div>

        {/* Duration — same height with or without */}
        <div className="min-h-[22px] mb-3">
          {durationMinutes > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#B2AAA7]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {durationMinutes} min
            </div>
          )}
        </div>

        {/* Spacer pushes buttons to bottom consistently */}
        <div className="flex-1" />

        {/* Actions — always at the bottom, same position */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={startReservation}
            className="text-center font-heading font-bold text-[11px] uppercase tracking-[.08em] bg-[#c4871a] text-[#080706] px-3 py-2.5 hover:bg-[#d4a244] transition-colors no-underline leading-none"
          >
            Agendar
          </button>
          <button
            onClick={handleAddToCart}
            className="font-heading font-bold text-[11px] uppercase tracking-[.08em] border border-[#c4871a]/40 text-[#c4871a] px-3 py-2.5 hover:bg-[#c4871a]/10 hover:border-[#c4871a] transition-colors leading-none"
          >
            + Carrito
          </button>
        </div>
      </div>
    </article>
  );
}
