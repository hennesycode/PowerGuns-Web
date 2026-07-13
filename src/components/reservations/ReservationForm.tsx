"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useCartContext } from "@/context/CartContext";
import { colombiaDepartments, getCities } from "@/data/colombia-locations";
import { POLYGON_ADDRESS } from "@/lib/constants";
import type { BusinessHourData } from "@/lib/timezone";
import {
  reservationCustomerSchema,
  reservationScheduleSchema,
  reservationSchema,
} from "@/lib/validations/reservation";
import type { ReservationFormData } from "@/lib/validations/reservation";

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => void;
  loading?: boolean;
}

type Step = 1 | 2 | 3;
type FormField = keyof ReservationFormData;
type AvailabilitySlot = {
  time: string;
  label: string;
  available: boolean;
  reason: "past" | "reserved" | "closed" | null;
};
type PaymentMethodOption = {
  id: string;
  type: string;
  provider: string;
  providerLabel: string;
};

const DRAFT_KEY = "powerguns_reservation_draft";
const steps: Array<{ id: Step; short: string; label: string }> = [
  { id: 1, short: "Datos", label: "Datos de reserva" },
  { id: 2, short: "Fecha", label: "Fecha y hora" },
  { id: 3, short: "Pago", label: "Confirmación y pago" },
];

function ColombiaFlagIcon() {
  return (
    <svg viewBox="0 0 24 18" aria-hidden="true" className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]">
      <rect width="24" height="9" fill="#FCD116" />
      <rect y="9" width="24" height="4.5" fill="#003893" />
      <rect y="13.5" width="24" height="4.5" fill="#CE1126" />
    </svg>
  );
}

const emptyForm: ReservationFormData = {
  firstName: "",
  lastName: "",
  identificationType: "cedula",
  identificationNumber: "",
  email: "",
  phone: "",
  address: "",
  country: "Colombia",
  department: "",
  city: "",
  reservationDate: "",
  reservationTime: "",
  scheduleNotes: "",
  paymentMethodId: null,
};

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function getTodayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function isDateAvailable(date: Date, businessHours: BusinessHourData[]) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const dayHours = businessHours.find((day) => day.dayOfWeek === normalized.getDay());
  return normalized >= getTodayStart() && !!dayHours?.isOpen && dayHours.slots.length > 0;
}

function getTimeLabel(value: string, slots: AvailabilitySlot[]) {
  return slots.find((slot) => slot.time === value)?.label ?? value;
}

function buildFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  });
  return fieldErrors;
}

export function ReservationForm({ onSubmit, loading }: ReservationFormProps) {
  const { items, subtotal, discount, total, coupon } = useCartContext();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ReservationFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftReady, setDraftReady] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHourData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const cities = form.department ? getCities(form.department) : [];
  const progress = ((step - 1) / (steps.length - 1)) * 100;
  const selectedDate = form.reservationDate ? parseDateKey(form.reservationDate) : null;
  const cashPaymentMethods = paymentMethods.filter((method) => method.type === "cash");
  const transferPaymentMethods = paymentMethods.filter((method) => method.type === "bank_transfer");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReservationFormData> & { currentStep?: number };
        const restored = { ...emptyForm };
        (Object.keys(emptyForm) as FormField[]).forEach((key) => {
          if (typeof parsed[key] === "string") restored[key] = parsed[key] as never;
        });
        // Draft hydration must read localStorage after mount to avoid SSR access.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(restored);
        if (parsed.currentStep === 1 || parsed.currentStep === 2 || parsed.currentStep === 3) {
          setStep(parsed.currentStep);
        }
        const restoredDate = restored.reservationDate ? parseDateKey(restored.reservationDate) : null;
        if (restoredDate) {
          setCurrentMonth(new Date(restoredDate.getFullYear(), restoredDate.getMonth(), 1));
        }
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, currentStep: step }));
  }, [draftReady, form, step]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/business-hours")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al consultar horarios");
        return data.hours as BusinessHourData[];
      })
      .then((hours) => {
        if (!cancelled) setBusinessHours(hours);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar los horarios de atención");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/payment-methods")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al consultar métodos de pago");
        return data.methods as PaymentMethodOption[];
      })
      .then((methods) => {
        if (!cancelled) setPaymentMethods(methods);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar los métodos de pago");
      })
      .finally(() => {
        if (!cancelled) setPaymentMethodsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.reservationDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailabilitySlots([]);
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);
    fetch(`/api/public/availability?date=${form.reservationDate}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al consultar disponibilidad");
        return data.slots as AvailabilitySlot[];
      })
      .then((slots) => {
        if (cancelled) return;
        setAvailabilitySlots(slots);
        const selectedSlot = slots.find((slot) => slot.time === form.reservationTime);
        if (selectedSlot && !selectedSlot.available) {
          setForm((prev) => ({ ...prev, reservationTime: "" }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailabilitySlots([]);
          toast.error("No se pudo consultar disponibilidad");
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.reservationDate, form.reservationTime]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setField = <K extends FormField>(field: K, value: ReservationFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handlePhoneChange = (value: string) => {
    setField("phone", value.replace(/\D/g, "").slice(0, 10));
  };

  const handleIdentificationNumberChange = (value: string) => {
    setField("identificationNumber", value.replace(/\D/g, "").slice(0, 11));
  };

  const validateCustomer = () => {
    const result = reservationCustomerSchema.safeParse(form);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      toast.error("Revisa los datos personales antes de continuar");
      return false;
    }
    setErrors({});
    return true;
  };

  const validateSchedule = () => {
    const result = reservationScheduleSchema.safeParse({
      reservationDate: form.reservationDate,
      reservationTime: form.reservationTime,
      scheduleNotes: form.scheduleNotes,
    });

    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      toast.error("Selecciona una fecha y hora disponible");
      return false;
    }

    const date = parseDateKey(form.reservationDate);
    if (!date || !isDateAvailable(date, businessHours)) {
      setErrors({ reservationDate: "Selecciona una fecha disponible" });
      toast.error("La fecha seleccionada no está disponible");
      return false;
    }

    const selectedSlot = availabilitySlots.find((slot) => slot.time === form.reservationTime);
    if (!selectedSlot || !selectedSlot.available) {
      setErrors({ reservationTime: "Selecciona una hora disponible" });
      toast.error("Selecciona una hora disponible");
      return false;
    }

    setErrors({});
    return true;
  };

  const goNext = () => {
    if (step === 1 && validateCustomer()) setStep(2);
    if (step === 2 && validateSchedule()) setStep(3);
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => (current === 3 ? 2 : 1));
  };

  const confirmReservation = () => {
    if (!validateCustomer()) {
      setStep(1);
      return;
    }
    if (!validateSchedule()) {
      setStep(2);
      return;
    }
    if (items.length === 0) {
      toast.error("Debes seleccionar al menos un servicio");
      return;
    }
    if (paymentMethods.length > 0 && !form.paymentMethodId) {
      setErrors({ paymentMethodId: "Selecciona un método de pago" });
      toast.error("Selecciona un método de pago");
      return;
    }

    const result = reservationSchema.safeParse(form);
    if (!result.success) {
      setErrors(buildFieldErrors(result.error.issues));
      toast.error("Revisa los datos de la reserva");
      return;
    }

    onSubmit(result.data);
  };

  const clearDraft = () => {
    setForm(emptyForm);
    setStep(1);
    setErrors({});
    localStorage.removeItem(DRAFT_KEY);
    toast.success("Formulario limpiado");
  };

  const selectDate = (date: Date) => {
    if (!isDateAvailable(date, businessHours)) return;
    setForm((prev) => ({
      ...prev,
      reservationDate: getDateKey(date),
      reservationTime: "",
    }));
    clearError("reservationDate");
    clearError("reservationTime");
  };

  const changeMonth = (direction: -1 | 1) => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1));
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.04em] text-[#B63A2B]">
        {errors[key]}
      </p>
    ) : null;

  const inputClass = (key: string) =>
    `w-full border bg-[#080706] px-3 py-3 text-sm text-white transition-colors placeholder:text-[#5B5A59] focus:outline-none focus:ring-2 focus:ring-[#c4871a]/20 ${
      errors[key] ? "border-[#B63A2B]/60" : "border-[#3C3A37] focus:border-[#c4871a]/60"
    }`;

  const monthYear = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);
  const today = getTodayStart();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevMonthDisabled = currentMonth <= currentMonthStart;
  const firstWeekday = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1),
    ),
  ];

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#c4871a]">
              Paso {step} de 3
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold uppercase tracking-[.04em] text-white md:text-2xl">
              {steps[step - 1].label}
            </h2>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="shrink-0 text-[10px] font-semibold uppercase tracking-[.08em] text-[#5B5A59] transition-colors hover:text-[#c4871a] focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30"
          >
            Limpiar formulario
          </button>
        </div>

        <div aria-label="Progreso de la reserva" className="space-y-3">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-[#171513]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8d5f12] via-[#c4871a] to-[#d6a244] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {steps.map((item) => {
              const active = item.id === step;
              const complete = item.id < step;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => {
                    if (item.id < step) setStep(item.id);
                  }}
                  className={`flex items-center gap-2 rounded-none border px-2 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 ${
                    active
                      ? "border-[#c4871a]/60 bg-[#c4871a]/10 text-white"
                      : complete
                        ? "border-[#c4871a]/25 text-[#c4871a]"
                        : "border-[#3C3A37] text-[#5B5A59]"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active || complete ? "bg-[#c4871a] text-[#080706]" : "bg-[#171513] text-[#5B5A59]"}`}>
                    {item.id}
                  </span>
                  <span className="min-w-0 text-[10px] font-semibold uppercase tracking-[.06em] sm:text-xs">
                    {item.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-[520px] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Nombres *
                </label>
                <input id="firstName" name="firstName" autoComplete="given-name" type="text" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className={inputClass("firstName")} placeholder="Ej: Carlos Andrés" />
                {fieldError("firstName")}
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Apellidos *
                </label>
                <input id="lastName" name="lastName" autoComplete="family-name" type="text" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className={inputClass("lastName")} placeholder="Ej: Méndez Rojas" />
                {fieldError("lastName")}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
              <div>
                <label htmlFor="identificationType" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Tipo ID *
                </label>
                <select id="identificationType" name="identificationType" value={form.identificationType} onChange={(e) => setField("identificationType", e.target.value as ReservationFormData["identificationType"])} className={inputClass("identificationType")}>
                  <option value="cedula">Cédula</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="cedula_extranjeria">Cédula extranjería</option>
                </select>
              </div>
              <div>
                <label htmlFor="identificationNumber" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Número de identificación *
                </label>
                <input id="identificationNumber" name="identificationNumber" type="text" inputMode="numeric" maxLength={11} value={form.identificationNumber} onChange={(e) => handleIdentificationNumberChange(e.target.value)} className={inputClass("identificationNumber")} placeholder="Ej: 1000000001" />
                {fieldError("identificationNumber")}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Correo electrónico *
                </label>
                <input id="email" name="email" autoComplete="email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass("email")} placeholder="correo@ejemplo.com" />
                {fieldError("email")}
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Número de teléfono *
                </label>
                <div className={`flex min-w-0 items-center border bg-[#080706] transition-colors focus-within:border-[#c4871a]/60 focus-within:ring-2 focus-within:ring-[#c4871a]/20 ${errors.phone ? "border-[#B63A2B]/60" : "border-[#3C3A37]"}`}>
                  <span className="flex shrink-0 items-center gap-2 border-r border-[#3C3A37] px-3 py-3 text-sm text-[#B2AAA7]">
                    <ColombiaFlagIcon />
                    <span className="font-semibold">+57</span>
                  </span>
                  <input id="phone" name="phone" autoComplete="tel-national" type="text" inputMode="numeric" pattern="3[0-9]{9}" maxLength={10} value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-[#5B5A59] focus:outline-none" placeholder="3057138140" />
                </div>
                {fieldError("phone")}
                <p className="mt-1 text-[10px] text-[#5B5A59]">Debe iniciar en 3 y tener exactamente 10 dígitos.</p>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                Dirección completa <span className="text-[10px] text-[#5B5A59]">(opcional)</span>
              </label>
              <input id="address" name="address" autoComplete="street-address" type="text" value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputClass("address")} placeholder="Calle, carrera, número, barrio, referencia" />
              {fieldError("address")}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="country" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  País <span className="text-[10px] text-[#5B5A59]">(opcional)</span>
                </label>
                <input id="country" name="country" type="text" value="Colombia" disabled className="w-full cursor-not-allowed border border-[#3C3A37] bg-[#080706] px-3 py-3 text-sm text-[#5B5A59] opacity-70" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Departamento <span className="text-[10px] text-[#5B5A59]">(opcional)</span>
                </label>
                <SearchableSelect options={colombiaDepartments.map((d) => d.name)} value={form.department} onChange={(value) => { setForm((prev) => ({ ...prev, department: value, city: "" })); clearError("department"); }} placeholder="Seleccionar..." label="Departamento" />
                {fieldError("department")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                  Ciudad <span className="text-[10px] text-[#5B5A59]">(opcional)</span>
                </label>
                <SearchableSelect options={cities} value={form.city} onChange={(value) => setField("city", value)} placeholder={form.department ? "Seleccionar..." : "Primero departamento"} disabled={!form.department} label="Ciudad" />
                {fieldError("city")}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-none border border-[#c4871a]/12 bg-[#080706] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <button type="button" onClick={() => changeMonth(-1)} disabled={prevMonthDisabled} className="flex h-10 w-10 items-center justify-center border border-[#3C3A37] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/40 hover:text-[#c4871a] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Mes anterior">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h3 className="font-heading text-base font-bold uppercase tracking-[.08em] text-white first-letter:uppercase">
                  {monthYear}
                </h3>
                <button type="button" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center border border-[#3C3A37] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/40 hover:text-[#c4871a]" aria-label="Mes siguiente">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[.08em] text-[#5B5A59]">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => <div key={day} className="py-2">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendario de disponibilidad">
                {calendarCells.map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                  const key = getDateKey(date);
                  const available = isDateAvailable(date, businessHours);
                  const selected = form.reservationDate === key;
                  const isToday = key === getDateKey(today);
                  return (
                    <button
                      key={key}
                      type="button"
                      role="gridcell"
                      onClick={() => selectDate(date)}
                      disabled={!available}
                      aria-selected={selected}
                      aria-current={isToday ? "date" : undefined}
                      className={`aspect-square min-h-10 border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 ${
                        selected
                          ? "border-[#c4871a] bg-[#c4871a] text-[#080706] shadow-[0_0_22px_rgba(196,135,26,.25)]"
                          : available
                            ? "border-[#27231f] bg-[#11100e] text-[#B2AAA7] hover:border-[#c4871a]/60 hover:bg-[#c4871a]/10 hover:text-white"
                            : "cursor-not-allowed border-[#171513] bg-[#0b0a09] text-[#3C3A37] opacity-60"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              {fieldError("reservationDate")}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                Horarios disponibles *
              </label>
              {form.reservationDate ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="listbox" aria-label="Horarios disponibles">
                  {availabilitySlots.map((slot) => {
                    const selected = form.reservationTime === slot.time;
                    const disabled = !slot.available || availabilityLoading;
                    const reasonLabel = slot.reason === "past"
                      ? "Horario pasado"
                      : slot.reason === "reserved"
                        ? "Reservado"
                        : slot.reason === "closed"
                          ? "No disponible"
                          : null;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={disabled}
                        onClick={() => setField("reservationTime", slot.time)}
                        className={`border px-3 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 ${
                          selected
                            ? "border-[#c4871a] bg-[#c4871a] text-[#080706]"
                            : disabled
                              ? "cursor-not-allowed border-[#24211f] bg-[#0b0a09] text-[#4b4743]"
                              : "border-[#3C3A37] bg-[#080706] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white"
                        }`}
                      >
                        <span className="block">{slot.label}</span>
                        {reasonLabel && <span className="mt-0.5 block text-[9px] font-normal uppercase tracking-[.06em]">{reasonLabel}</span>}
                      </button>
                    );
                  })}
                  {!availabilityLoading && availabilitySlots.length === 0 && (
                    <div className="col-span-full border border-dashed border-[#3C3A37] bg-[#080706] px-4 py-5 text-center text-sm text-[#5B5A59]">
                      No hay horarios configurados para este día.
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-[#3C3A37] bg-[#080706] px-4 py-5 text-center text-sm text-[#5B5A59]">
                  Selecciona una fecha para ver horarios.
                </div>
              )}
              {fieldError("reservationTime")}
            </div>

            <div>
              <label htmlFor="scheduleNotes" className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                Notas adicionales
              </label>
              <textarea id="scheduleNotes" name="scheduleNotes" rows={4} value={form.scheduleNotes ?? ""} onChange={(e) => setField("scheduleNotes", e.target.value)} className={`${inputClass("scheduleNotes")} resize-none`} placeholder="Ej: prefiero horario en la mañana, voy con acompañante, observaciones especiales..." />
              {fieldError("scheduleNotes")}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Cliente</p>
                <p className="mt-1 font-heading text-sm font-bold uppercase tracking-[.04em] text-white">{form.firstName} {form.lastName}</p>
                <p className="mt-1 text-xs text-[#B2AAA7]">{form.email}</p>
                <p className="flex items-center gap-1.5 text-xs text-[#B2AAA7]"><ColombiaFlagIcon /> +57 {form.phone}</p>
              </div>
              <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Fecha y hora</p>
                <p className="mt-1 font-heading text-sm font-bold uppercase tracking-[.04em] text-white">
                  {selectedDate ? new Intl.DateTimeFormat("es-CO", { dateStyle: "full" }).format(selectedDate) : "Fecha pendiente"}
                </p>
                <p className="mt-1 text-xs text-[#B2AAA7]">{form.reservationTime ? getTimeLabel(form.reservationTime, availabilitySlots) : "Hora pendiente"}</p>
              </div>
            </div>

            <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Ubicación</p>
              <p className="mt-1 text-sm text-white">Dirección: {POLYGON_ADDRESS}</p>
            </div>

            {form.scheduleNotes && (
              <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Notas adicionales</p>
                <p className="mt-1 text-sm text-[#B2AAA7]">{form.scheduleNotes}</p>
              </div>
            )}

            <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Servicios seleccionados</p>
                <span className="text-[10px] text-[#c4871a]">{items.length} item{items.length === 1 ? "" : "s"}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-[#B63A2B]">Debes seleccionar al menos un servicio.</p>
                ) : items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#171513] py-2 last:border-b-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-[#5B5A59]">{item.quantity} x {formatCOP(item.finalPrice)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#c4871a]">{formatCOP(item.finalPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-[#c4871a]/10 pt-3 text-sm">
                <div className="flex justify-between text-[#B2AAA7]"><span>Subtotal</span><span>{formatCOP(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-[#c4871a]"><span>Descuento{coupon ? ` (${coupon.code})` : ""}</span><span>-{formatCOP(discount)}</span></div>}
                <div className="flex justify-between pt-2 font-heading text-lg font-bold uppercase tracking-[.04em] text-white"><span>Total</span><span className="text-[#c4871a]">{formatCOP(total)}</span></div>
              </div>
            </div>

            <div className="border border-[#c4871a]/12 bg-[#080706] p-4">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Método de pago</p>
                  <p className="mt-1 text-sm text-[#B2AAA7]">Selecciona cómo vas a pagar la reserva.</p>
                </div>
                {paymentMethods.length > 0 && <span className="w-fit text-[10px] font-semibold uppercase tracking-[.1em] text-[#c4871a]">Requerido</span>}
              </div>

              {paymentMethodsLoading ? (
                <div className="flex justify-center py-7"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
              ) : paymentMethods.length === 0 ? (
                <div className="border border-dashed border-[#3C3A37] px-4 py-5 text-center text-sm text-[#5B5A59]">
                  Métodos de pago no disponibles.
                </div>
              ) : (
                <div className="space-y-4">
                  {cashPaymentMethods.length > 0 && (
                    <div className="space-y-2">
                      {cashPaymentMethods.map((method) => {
                        const selected = form.paymentMethodId === method.id;
                        return (
                          <button key={method.id} type="button" onClick={() => setField("paymentMethodId", method.id)} className={`w-full border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 ${selected ? "border-[#c4871a] bg-[#c4871a]/10" : "border-[#3C3A37] hover:border-[#c4871a]/40"}`}>
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-heading text-sm font-bold uppercase tracking-[.06em] text-white">{method.providerLabel}</span>
                              <span className={`h-3 w-3 rounded-full border ${selected ? "border-[#c4871a] bg-[#c4871a]" : "border-[#5B5A59]"}`} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {transferPaymentMethods.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">Transferencia bancaria</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {transferPaymentMethods.map((method) => {
                          const selected = form.paymentMethodId === method.id;
                          return (
                            <button key={method.id} type="button" onClick={() => setField("paymentMethodId", method.id)} className={`border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 ${selected ? "border-[#c4871a] bg-[#c4871a]/10" : "border-[#3C3A37] hover:border-[#c4871a]/40"}`}>
                              <span className="flex items-center justify-between gap-3">
                                <span className="font-heading text-sm font-bold uppercase tracking-[.06em] text-white">{method.providerLabel}</span>
                                <span className={`h-3 w-3 rounded-full border ${selected ? "border-[#c4871a] bg-[#c4871a]" : "border-[#5B5A59]"}`} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {fieldError("paymentMethodId")}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#c4871a]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        {step > 1 ? (
          <button type="button" onClick={goBack} className="w-full border border-[#3C3A37] px-5 py-3.5 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 sm:w-auto">
            Atrás
          </button>
        ) : <span />}
        {step < 3 ? (
          <button type="button" onClick={goNext} className="w-full bg-[#c4871a] px-5 py-3.5 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d4a244] focus:outline-none focus:ring-2 focus:ring-[#d6a244]/40 sm:w-auto">
            Siguiente
          </button>
        ) : (
          <button type="button" onClick={confirmReservation} disabled={loading} className="inline-flex w-full items-center justify-center gap-2 bg-[#c4871a] px-5 py-3.5 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d4a244] focus:outline-none focus:ring-2 focus:ring-[#d6a244]/40 disabled:opacity-50 sm:w-auto">
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-[#080706] border-t-transparent animate-spin" /> : null}
            {loading ? "Procesando..." : "Confirmar reserva"}
          </button>
        )}
      </div>
    </div>
  );
}
