"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationSummary } from "@/components/reservations/ReservationSummary";
import { useCartContext } from "@/context/CartContext";
import { toast } from "sonner";
import type { ReservationFormData } from "@/lib/validations/reservation";

type ConfirmationState = {
  reservationCode: string;
  firstName: string;
  lastName: string;
  reservationDate: string;
  reservationTimeLabel: string;
  durationMinutes: number;
  status: string;
  paymentMethodLabel: string | null;
  paymentMethod: {
    type: string;
    providerLabel: string;
    accountNumber: string;
    accountHolderName: string;
    identificationNumber: string | null;
  } | null;
};

function formatReservationDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "full" }).format(new Date(year, month - 1, day));
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} ${hours === 1 ? "hora" : "horas"} y ${mins} minutos`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  return `${mins} minutos`;
}

export function ReservaContent() {
  const { items, couponCode, clearCart } = useCartContext();
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

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
          items: items.map((item) => ({ serviceId: item.id, quantity: item.quantity, hours: item.hours })),
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
        firstName: result.reservation.firstName,
        lastName: result.reservation.lastName,
        reservationDate: result.reservation.reservationDate,
        reservationTimeLabel: result.reservation.reservationTimeLabel,
        durationMinutes: result.reservation.durationMinutes,
        status: result.reservation.status,
        paymentMethodLabel: result.reservation.paymentMethodLabel,
        paymentMethod: result.reservation.paymentMethod,
      });
      toast.success("Reserva creada correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPaymentData = async () => {
    if (!confirmation?.paymentMethod) return;
    const method = confirmation.paymentMethod;
    const text = [
      `Método: ${method.providerLabel}`,
      `Número: ${method.accountNumber}`,
      `Titular: ${method.accountHolderName}`,
      method.identificationNumber ? `Identificación: ${method.identificationNumber}` : null,
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Datos de pago copiados");
    } catch {
      toast.error("No se pudieron copiar los datos");
    }
  };

  const confirmPayment = () => {
    if (!confirmation) return;
    const fullName = `${confirmation.firstName} ${confirmation.lastName}`.trim();
    const message = `Hola, acabo de reservar por la página a nombre de: ${fullName}. Te envío el comprobante de pago.`;
    window.open(`https://wa.me/573057138140?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setPaymentConfirmed(true);
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
            <Image src="/logo.jpg" alt="Power Guns" width={56} height={56} className="w-full h-full object-contain" />
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
        <div className={confirmation ? "mx-auto max-w-3xl" : "grid lg:grid-cols-[1fr_420px] gap-8 items-start"}>
          {/* Left: Form */}
          <div
            className="bg-[#0F0D0B] border border-[#c4871a]/10 p-5 shadow-[0_22px_80px_rgba(0,0,0,.28)] sm:p-6 md:p-8"
            style={{
              animation: "fade-in-up 0.5s ease-out",
            }}
          >
            {confirmation ? (
              <div className="py-4 text-center sm:py-6">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#c4871a]/40 bg-[#c4871a]/10 text-[#c4871a] shadow-[0_0_30px_rgba(196,135,26,.18)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#c4871a]">
                  Gracias por tu reserva
                </p>
                <h1 className="mt-2 font-heading text-2xl font-bold uppercase tracking-[.04em] text-white">
                  Código: {confirmation.reservationCode}
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#B2AAA7]">
                  Tu reserva quedó registrada para <span className="font-semibold text-white">{formatReservationDate(confirmation.reservationDate)}</span> a las <span className="font-semibold text-white">{confirmation.reservationTimeLabel}</span> por <span className="font-semibold text-white">{formatDuration(confirmation.durationMinutes)}</span>.
                </p>

                <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                  <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Estado</p>
                    <p className="mt-1 font-heading text-sm font-bold uppercase tracking-[.06em] text-[#c4871a]">Pendiente</p>
                  </div>
                  <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Método seleccionado</p>
                    <p className="mt-1 font-heading text-sm font-bold uppercase tracking-[.06em] text-white">{confirmation.paymentMethodLabel || "No registrado"}</p>
                  </div>
                </div>

                {confirmation.paymentMethod?.type === "cash" && (
                  <div className="mt-5 border border-[#c4871a]/20 bg-[#c4871a]/5 p-5 text-left">
                    <p className="font-heading text-sm font-bold uppercase tracking-[.08em] text-[#c4871a]">Pago en efectivo</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#B2AAA7]">
                      Recuerda: seleccionaste <span className="font-semibold text-white">pago en efectivo</span>. Nuestro equipo validará tu reserva y podrás realizar el pago directamente en el polígono.
                    </p>
                  </div>
                )}

                {confirmation.paymentMethod?.type === "bank_transfer" && (
                  <div className="mt-5 border border-[#c4871a]/20 bg-[#080706] p-5 text-left">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-heading text-sm font-bold uppercase tracking-[.08em] text-[#c4871a]">Datos para transferencia</p>
                        <p className="mt-1 text-xs text-[#B2AAA7]">No cierres esta página hasta guardar o enviar el comprobante.</p>
                      </div>
                      <button type="button" onClick={copyPaymentData} className="w-full border border-[#3C3A37] px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/50 hover:text-white sm:w-auto">
                        Copiar datos
                      </button>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="border border-[#171513] p-3"><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Método</dt><dd className="mt-1 font-semibold text-white">{confirmation.paymentMethod.providerLabel}</dd></div>
                      <div className="border border-[#171513] p-3"><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Número</dt><dd className="mt-1 font-semibold text-white">{confirmation.paymentMethod.accountNumber}</dd></div>
                      <div className="border border-[#171513] p-3"><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Titular</dt><dd className="mt-1 font-semibold text-white">{confirmation.paymentMethod.accountHolderName}</dd></div>
                      <div className="border border-[#171513] p-3"><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Identificación</dt><dd className="mt-1 font-semibold text-white">{confirmation.paymentMethod.identificationNumber || "No registrada"}</dd></div>
                    </dl>
                    <p className="mt-4 border border-dashed border-[#c4871a]/25 bg-[#c4871a]/5 p-3 text-xs leading-relaxed text-[#B2AAA7]">
                      Recuerda tomar captura del comprobante de pago. Al confirmar te enviaremos a WhatsApp para que adjuntes la foto del comprobante.
                    </p>
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                  <Link href="/" className="inline-flex justify-center border border-[#3C3A37] px-5 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#B2AAA7] no-underline transition-colors hover:border-[#c4871a]/50 hover:text-white">
                    Continuar
                  </Link>
                  {confirmation.paymentMethod?.type === "bank_transfer" && !paymentConfirmed && (
                    <button type="button" onClick={confirmPayment} className="inline-flex justify-center bg-[#c4871a] px-5 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244]">
                      Confirmar pago
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <ReservationForm onSubmit={handleSubmit} loading={submitting} />
            )}
          </div>

          {/* Right: Summary */}
          {!confirmation && (
            <div
              style={{
                animation: "fade-in-up 0.5s ease-out 0.15s",
                animationFillMode: "both",
              }}
            >
              <ReservationSummary />
            </div>
          )}
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
