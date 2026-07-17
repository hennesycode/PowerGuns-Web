"use client";

import { useCartContext } from "@/context/CartContext";

export function CartButton() {
  const { items, hydrated, openCart } = useCartContext();
  const count = items.length;

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-9 h-9 md:w-[38px] md:h-[38px] rounded-full border border-[#c4871a]/20 bg-[#0F0D0B] hover:border-[#c4871a]/50 hover:shadow-[0_0_8px_rgba(196,135,26,0.25)] transition-all duration-200 group"
      aria-label={`Abrir carrito${count > 0 ? `, ${count} servicio${count > 1 ? "s" : ""}` : ""}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#B2AAA7] group-hover:text-[#c4871a] transition-colors">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
      {hydrated && count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#c4871a] text-[#080706] font-heading font-bold text-[10px] flex items-center justify-center rounded-full leading-none animate-[fade-in-up_0.2s_ease-out]">
          {count}
        </span>
      )}
    </button>
  );
}
