"use client";

import { useEffect } from "react";
import { useCartContext } from "@/context/CartContext";
import { toast } from "sonner";

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function CartDrawer() {
  const {
    items,
    isOpen,
    coupon,
    couponCode,
    couponLoading,
    couponError,
    subtotal,
    discount,
    total,
    removeItem,
    updateQuantity,
    closeCart,
    setCouponCode,
    applyCoupon,
    clearCoupon,
  } = useCartContext();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon();
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
    toast.success("Servicio eliminado del carrito");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-[#0F0D0B] border-l border-[#c4871a]/15 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c4871a]/10 shrink-0">
          <div>
            <h2 className="font-heading font-bold text-lg text-white uppercase tracking-[.04em]">
              Tu carrito
            </h2>
            <p className="text-xs text-[#5B5A59] mt-0.5">
              {items.length > 0
                ? `${items.reduce((s, i) => s + i.quantity, 0)} servicio${items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""} agregado${items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""}`
                : "Servicios agregados"}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-[#5B5A59] hover:text-white transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-14 h-14 text-[#3C3A37] mb-4">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <p className="text-[#5B5A59] font-['Rajdhani',sans-serif] text-sm">Tu carrito está vacío</p>
              <p className="text-[#3C3A37] text-xs mt-1">Agrega servicios desde nuestra sección</p>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-[#171513] border border-[#c4871a]/8"
                >
                  {/* Image */}
                  <div className="w-16 h-16 shrink-0 bg-[#080706] border border-[#c4871a]/10 overflow-hidden">
                    <img
                      src={item.mainImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-xs uppercase tracking-[.03em] text-white leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-[#5B5A59] line-clamp-1 mt-0.5">
                      {item.title}
                    </p>

                    {/* Price */}
                    <p className="font-['Rajdhani',sans-serif] font-semibold text-sm text-[#c4871a] mt-1">
                      {formatCOP(item.finalPrice)} c/u
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-0 border border-[#3C3A37]">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              handleRemoveItem(item.id);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-[#B2AAA7] hover:text-white hover:bg-[#3C3A37] transition-colors text-sm leading-none"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-white text-xs font-['Rajdhani',sans-serif] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#B2AAA7] hover:text-white hover:bg-[#3C3A37] transition-colors text-sm leading-none"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[10px] text-[#5B5A59] hover:text-[#B63A2B] transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]"
                        aria-label="Eliminar servicio del carrito"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0">
                    <span className="font-['Rajdhani',sans-serif] font-bold text-sm text-white">
                      {formatCOP(item.finalPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#c4871a]/10 px-5 py-4 space-y-4">
            {/* Coupon */}
            <form onSubmit={handleSubmitCoupon} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    if (coupon) clearCoupon();
                  }}
                  className="flex-1 px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-xs focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59] font-['Rajdhani',sans-serif] uppercase tracking-[.06em]"
                  placeholder="Código de cupón"
                  disabled={!!coupon}
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={clearCoupon}
                    className="px-3 py-2 text-xs text-[#B63A2B] border border-[#B63A2B]/30 hover:bg-[#B63A2B]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 text-xs bg-[#c4871a] text-[#080706] hover:bg-[#d4a244] transition-colors font-heading font-bold uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {couponLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-[#080706] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Aplicar"
                    )}
                  </button>
                )}
              </div>

              {couponError && (
                <p className="text-[10px] text-[#B63A2B] font-['Rajdhani',sans-serif] uppercase tracking-[.06em]">
                  {couponError}
                </p>
              )}
              {coupon && (
                <p className="text-[10px] text-green-500 font-['Rajdhani',sans-serif] uppercase tracking-[.06em]">
                  {coupon.message}
                </p>
              )}
            </form>

            {/* Summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#B2AAA7]">Subtotal</span>
                <span className="font-['Rajdhani',sans-serif] font-semibold text-white">
                  {formatCOP(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#c4871a]">
                    Descuento {coupon?.code && `(${coupon.code})`}
                  </span>
                  <span className="font-['Rajdhani',sans-serif] font-semibold text-[#c4871a]">
                    -{formatCOP(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#c4871a]/10 pt-2 mt-2">
                <span className="font-heading font-bold text-white uppercase tracking-[.04em] text-base">
                  Total
                </span>
                <span className="font-heading font-bold text-xl text-[#c4871a]">
                  {formatCOP(total)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/reservas"
              className="block w-full text-center font-heading font-bold text-sm uppercase tracking-[.08em] bg-[#c4871a] text-[#080706] py-3.5 hover:bg-[#d4a244] transition-colors no-underline"
            >
              Continuar reserva
            </a>
          </div>
        )}
      </div>
    </>
  );
}
