"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartContext } from "@/context/CartContext";
import { toast } from "sonner";

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function ReservationSummary() {
  const {
    items,
    coupon,
    couponCode,
    couponLoading,
    couponError,
    subtotal,
    discount,
    total,
    updateQuantity,
    removeItem,
    setCouponCode,
    applyCoupon,
    clearCoupon,
  } = useCartContext();

  const handleRemove = (id: number) => {
    removeItem(id);
    toast.success("Servicio eliminado de la reserva");
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon();
  };

  return (
    <aside className="bg-[#0F0D0B] border border-[#c4871a]/12 p-5 shadow-[0_22px_80px_rgba(0,0,0,.22)] sm:p-6 lg:sticky lg:top-8" aria-label="Resumen de reserva">
      <h2 className="font-heading font-bold text-lg text-white uppercase tracking-[.04em] mb-1">
        Tu reserva
      </h2>
      <p className="text-xs text-[#5B5A59] mb-5">
        Servicios seleccionados
      </p>

      {items.length === 0 ? (
        <div className="text-center py-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-[#3C3A37] mx-auto mb-3">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          <p className="text-[#5B5A59] text-sm mb-3">No tienes servicios seleccionados</p>
          <Link href="/#servicios"
            className="inline-block font-heading font-bold text-[11px] uppercase tracking-[.08em] border border-[#c4871a]/40 text-[#c4871a] px-4 py-2 hover:bg-[#c4871a]/10 transition-colors no-underline">
            Ver servicios
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-[#171513] border border-[#c4871a]/8 transition-colors hover:border-[#c4871a]/20">
                <div className="relative w-14 h-14 shrink-0 bg-[#080706] border border-[#c4871a]/10 overflow-hidden">
                  <Image src={item.mainImageUrl} alt={item.name} fill sizes="56px" className="w-full h-full object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-[11px] uppercase tracking-[.03em] text-white line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] text-[#5B5A59]">{formatCOP(item.finalPrice)} c/u</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex items-center border border-[#3C3A37]">
                      <button onClick={() => {
                        if (item.quantity <= 1) handleRemove(item.id);
                        else updateQuantity(item.id, item.quantity - 1);
                      }} className="w-6 h-6 flex items-center justify-center text-[#B2AAA7] hover:text-white hover:bg-[#3C3A37] transition-colors text-xs focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30" aria-label={`Disminuir cantidad de ${item.name}`}>-</button>
                      <span className="w-6 h-6 flex items-center justify-center text-white text-[10px] font-['Rajdhani',sans-serif] font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-[#B2AAA7] hover:text-white hover:bg-[#3C3A37] transition-colors text-xs focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30" aria-label={`Aumentar cantidad de ${item.name}`}>+</button>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="text-[10px] text-[#5B5A59] hover:text-[#B63A2B] transition-colors font-['Rajdhani',sans-serif] uppercase tracking-[.04em] focus:outline-none focus:ring-2 focus:ring-[#B63A2B]/30" aria-label={`Eliminar ${item.name}`}>Eliminar</button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-['Rajdhani',sans-serif] font-bold text-xs text-white">{formatCOP(item.finalPrice * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <form onSubmit={handleCouponSubmit} className="mb-5 space-y-2">
            <div className="flex gap-2">
              <label htmlFor="reservationCoupon" className="sr-only">Cupón de descuento</label>
              <input id="reservationCoupon" name="reservationCoupon" type="text" value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); if (coupon) clearCoupon(); }}
                className="flex-1 px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-xs focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59] font-['Rajdhani',sans-serif] uppercase tracking-[.06em]"
                placeholder="Cupón de descuento" disabled={!!coupon} />
              {coupon ? (
                <button type="button" onClick={clearCoupon}
                  className="px-3 py-2 text-xs text-[#B63A2B] border border-[#B63A2B]/30 hover:bg-[#B63A2B]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]">Quitar</button>
              ) : (
                <button type="submit" disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 text-xs bg-[#c4871a] text-[#080706] hover:bg-[#d4a244] transition-colors font-heading font-bold uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center gap-2">
                  {couponLoading ? <span className="w-3.5 h-3.5 border-2 border-[#080706] border-t-transparent rounded-full animate-spin" /> : "Aplicar"}
                </button>
              )}
            </div>
            {couponError && <p className="text-[10px] text-[#B63A2B] font-['Rajdhani',sans-serif] uppercase tracking-[.04em]">{couponError}</p>}
            {coupon && <p className="text-[10px] text-green-500 font-['Rajdhani',sans-serif] uppercase tracking-[.04em]">{coupon.message}</p>}
          </form>

          {/* Totals */}
          <div className="border-t border-[#c4871a]/10 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[#B2AAA7]">Subtotal</span>
              <span className="font-['Rajdhani',sans-serif] font-semibold text-white">{formatCOP(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#c4871a]">Descuento{coupon && ` (${coupon.code})`}</span>
                <span className="font-['Rajdhani',sans-serif] font-semibold text-[#c4871a]">-{formatCOP(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#c4871a]/10 pt-2 mt-2">
              <span className="font-heading font-bold text-white uppercase tracking-[.04em]">Total</span>
              <span className="font-heading font-bold text-xl text-[#c4871a]">{formatCOP(total)}</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
