"use client";

import { useState } from "react";
import Link from "next/link";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationSummary } from "@/components/reservations/ReservationSummary";
import { useCartContext } from "@/context/CartContext";
import { toast } from "sonner";
import type { ReservationFormData } from "@/lib/validations/reservation";

export function ReservaContent() {
  const { items, couponCode, clearCart } = useCartContext();
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    reservationCode: string;
    status: string;
  } | null>(null);

  const handleSubmit = async (data: ReservationFormData) => {
    if (items.length === 0) {
      toast.error("Debes seleccionar al menos un servicio");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({ serviceId: item.id, quantity: item.quantity })),
          couponCode: couponCode.trim() || null,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "No se pudo crear la reserva. Intenta nuevamente.");
      }

      clearCart();
      localStorage.removeItem("powerguns_reservation_draft");
      setConfirmation({
        reservationCode: result.reservation.reservationCode,
        status: result.reservation.status,
      });
      toast.success("Reserva creada correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050403]">
      <div className="mx-auto flex max-w-[1120px] px-6 pt-6 md:px-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#5B5A59] no-underline transition-colors hover:text-[#c4871a] focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al inicio
        </Link>
      </div>

      {/* Logo */}
      <div className="pb-5 pt-4 text-center">
        <Link href="/" className="inline-block no-underline">
          <div className="w-14 h-14 rounded-full border border-[#c4871a]/30 bg-[#0F0D0B] flex items-center justify-center overflow-hidden mx-auto">
            <img src="/logo.jpg" alt="Power Guns" className="w-full h-full object-contain" />
          </div>
          <div className="mt-3 font-heading font-extrabold text-sm uppercase tracking-widest text-white">
            POWER <span className="text-[#c4871a]">GUNS</span>
          </div>
          <p className="text-[10px] text-[#5B5A59] font-['Rajdhani',sans-serif] uppercase tracking-[.15em] mt-0.5">
            Reserva de servicios
          </p>
        </Link>
      </div>

      {/* Main layout */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* Left: Form */}
          <div
            className="bg-[#0F0D0B] border border-[#c4871a]/10 p-5 shadow-[0_22px_80px_rgba(0,0,0,.28)] sm:p-6 md:p-8"
            style={{
              animation: "fade-in-up 0.5s ease-out",
            }}
          >
            {confirmation ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#c4871a]/40 bg-[#c4871a]/10 text-[#c4871a]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#c4871a]">
                  Reserva recibida correctamente
                </p>
                <h1 className="mt-2 font-heading text-2xl font-bold uppercase tracking-[.04em] text-white">
                  Código: {confirmation.reservationCode}
                </h1>
                <p className="mt-3 text-sm text-[#B2AAA7]">
                  Estado inicial: <span className="text-[#c4871a]">Pendiente</span>. Nos comunicaremos contigo para confirmar disponibilidad.
                </p>
                <Link href="/" className="mt-8 inline-flex bg-[#c4871a] px-5 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] no-underline transition-colors hover:bg-[#d6a244]">
                  Volver al inicio
                </Link>
              </div>
            ) : (
              <ReservationForm onSubmit={handleSubmit} loading={submitting} />
            )}
          </div>

          {/* Right: Summary */}
          <div
            style={{
              animation: "fade-in-up 0.5s ease-out 0.15s",
              animationFillMode: "both",
            }}
          >
            <ReservationSummary />
          </div>
        </div>
      </div>

      {/* Inject keyframe for animation since Tailwind v4 might not have fade-in-up */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
