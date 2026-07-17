"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { colombiaDepartments, getCities } from "@/data/colombia-locations";
import { BASE_RESERVATION_SLOTS } from "@/lib/timezone";

type ReservationStatus = "pending" | "in_review" | "confirmed" | "completed" | "canceled";

type Reservation = {
  id: string;
  reservationCode: string;
  userId: number | null;
  firstName: string;
  lastName: string;
  identificationType: "cedula" | "pasaporte" | "cedula_extranjeria";
  identificationNumber: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  department: string;
  city: string;
  reservationDate: string;
  reservationTime: string;
  reservationTimeLabel: string;
  durationHours: number;
  notes: string;
  status: ReservationStatus;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethodLabel: string | null;
  createdAt: string;
  services: Array<{
    id: string;
    serviceId: number;
    serviceTitle: string;
    serviceSlug: string | null;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    hours: number;
    total: number;
  }>;
};

type ServiceOption = {
  id: number;
  name: string;
  title: string;
  finalPrice: number;
  mainImageUrl: string;
};

type UserOption = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  identificationType: "cedula" | "pasaporte" | "cedula_extranjeria";
  identificationNumber: string;
};

type AvailabilitySlot = {
  time: string;
  label: string;
  available: boolean;
  reason: "past" | "reserved" | "closed" | null;
};

type ReservationViewMode = "calendar" | "table";

type CalendarDay = {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
};

type FormState = {
  userId: number | null;
  firstName: string;
  lastName: string;
  identificationType: "cedula" | "pasaporte" | "cedula_extranjeria";
  identificationNumber: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  city: string;
  reservationDate: string;
  reservationTime: string;
  scheduleNotes: string;
  couponCode: string;
  status: ReservationStatus;
  items: Array<{ serviceId: number; quantity: number; hours: number }>;
};

const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  in_review: "En revisión",
  confirmed: "Confirmada",
  completed: "Completada",
  canceled: "Cancelada",
};

const statusClasses: Record<ReservationStatus, string> = {
  pending: "border-[#c4871a]/35 bg-[#c4871a]/10 text-[#d6a244]",
  in_review: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  confirmed: "border-green-500/30 bg-green-500/10 text-green-400",
  completed: "border-[#5B5A59]/40 bg-[#5B5A59]/10 text-[#B2AAA7]",
  canceled: "border-[#B63A2B]/35 bg-[#B63A2B]/10 text-[#ff8174]",
};

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });

const emptyForm: FormState = {
  userId: null,
  firstName: "",
  lastName: "",
  identificationType: "cedula",
  identificationNumber: "",
  email: "",
  phone: "",
  address: "",
  department: "",
  city: "",
  reservationDate: "",
  reservationTime: "",
  scheduleNotes: "",
  couponCode: "",
  status: "pending",
  items: [],
};

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);
}

function dateToKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKeyToLocalDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildCalendarDays(monthDate: Date): CalendarDay[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstOfMonth);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  start.setDate(firstOfMonth.getDate() - mondayOffset);
  const todayKey = dateToKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateToKey(date);

    return {
      date,
      key,
      inMonth: date.getMonth() === monthDate.getMonth(),
      isToday: key === todayKey,
    };
  });
}

function phoneToNational(phone: string) {
  return phone.replace(/\D/g, "").replace(/^57/, "").slice(0, 10);
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const normalized = minutes % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getEndTimeLabel(time: string, durationHours: number) {
  if (!time) return "Selecciona una hora";
  return getSlotLabel(minutesToTime(timeToMinutes(time) + durationHours * 60));
}

function getSlotLabel(time: string) {
  const hour = Number(time.split(":")[0]);
  const minute = time.split(":")[1];
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute} ${period}`;
}

function reservationToForm(reservation: Reservation): FormState {
  return {
    userId: reservation.userId,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    identificationType: reservation.identificationType,
    identificationNumber: reservation.identificationNumber,
    email: reservation.email,
    phone: phoneToNational(reservation.phone),
    address: reservation.address,
    department: reservation.department,
    city: reservation.city,
    reservationDate: reservation.reservationDate,
    reservationTime: reservation.reservationTime,
    scheduleNotes: reservation.notes,
    couponCode: reservation.couponCode ?? "",
    status: reservation.status,
    items: reservation.services.map((item) => ({ serviceId: item.serviceId, quantity: item.quantity, hours: item.hours })),
  };
}

function getReservationDurationFromItems(items: Array<{ hours: number }>) {
  return Math.max(1, items.reduce((sum, item) => sum + item.hours, 0));
}

export default function ReservasDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "all">("all");
  const [date, setDate] = useState("");
  const [viewMode, setViewMode] = useState<ReservationViewMode>("calendar");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [viewing, setViewing] = useState<Reservation | null>(null);
  const [deleting, setDeleting] = useState<Reservation | null>(null);

  const refreshReservations = useCallback(async () => {
    const params = new URLSearchParams({ q: query, status, date });
    const res = await fetch(`/api/dashboard/reservations?${params.toString()}`);
    if (!res.ok) throw new Error("No se pudieron cargar reservas");
    const data = await res.json();
    setReservations(data.reservations ?? []);
  }, [date, query, status]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/dashboard/reservations").then((res) => res.json()),
      fetch("/api/public/services").then((res) => res.json()),
    ])
      .then(([reservationData, serviceData]) => {
        if (cancelled) return;
        setReservations(reservationData.reservations ?? []);
        setServices(serviceData.services ?? []);
      })
      .catch(() => toast.error("No se pudo cargar el módulo de reservas"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshReservations().catch(() => toast.error("No se pudieron aplicar los filtros"));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [refreshReservations]);

  const reservationsByDate = useMemo(() => {
    const grouped = new Map<string, Reservation[]>();
    reservations.forEach((reservation) => {
      const current = grouped.get(reservation.reservationDate) ?? [];
      current.push(reservation);
      grouped.set(reservation.reservationDate, current);
    });
    grouped.forEach((items) => items.sort((a, b) => a.reservationTime.localeCompare(b.reservationTime)));
    return grouped;
  }, [reservations]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/dashboard/reservations/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo eliminar la reserva");
      }
      toast.success("Reserva eliminada correctamente");
      setDeleting(null);
      await refreshReservations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la reserva");
    }
  };

  return (
    <AdminLayout title="Reservas">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-['Rajdhani',sans-serif] text-sm text-[#B2AAA7]">
              Gestiona reservas públicas y manuales con control de disponibilidad.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="inline-flex items-center justify-center bg-[#c4871a] px-4 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244]"
          >
            Crear reserva
          </button>
        </div>

        <div className="grid gap-3 rounded-none border border-[#c4871a]/12 bg-[#0F0D0B] p-4 md:grid-cols-[1fr_180px_180px]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#5B5A59] focus:border-[#c4871a]/60"
            placeholder="Buscar por cliente, correo, identificación o código"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as ReservationStatus | "all")} className="border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4871a]/60">
            <option value="all">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => { const value = e.target.value; setDate(value); if (value) setCalendarMonth(dateKeyToLocalDate(value)); }} className="border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4871a]/60" />
        </div>

        <div className="flex flex-col gap-3 border border-[#c4871a]/12 bg-[#0F0D0B] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#5B5A59]">Vista de reservas</p>
            <p className="mt-1 text-sm text-[#B2AAA7]">Calendario por defecto o tabla administrativa tradicional.</p>
          </div>
          <div className="grid grid-cols-2 border border-[#3C3A37] bg-[#080706] p-1 sm:w-auto">
            <button type="button" onClick={() => setViewMode("calendar")} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[.08em] transition-colors ${viewMode === "calendar" ? "bg-[#c4871a] text-[#080706]" : "text-[#B2AAA7] hover:text-white"}`}>Calendario</button>
            <button type="button" onClick={() => setViewMode("table")} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[.08em] transition-colors ${viewMode === "table" ? "bg-[#c4871a] text-[#080706]" : "text-[#B2AAA7] hover:text-white"}`}>Tabla</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
        ) : reservations.length === 0 ? (
          <div className="border border-[#c4871a]/12 bg-[#171513] p-12 text-center text-sm text-[#B2AAA7]">No hay reservas para los filtros seleccionados.</div>
        ) : viewMode === "calendar" ? (
          <ReservationsCalendar
            month={calendarMonth}
            days={calendarDays}
            reservationsByDate={reservationsByDate}
            onMonthChange={setCalendarMonth}
            onView={setViewing}
          />
        ) : (
          <ReservationsTable reservations={reservations} onView={setViewing} onEdit={(reservation) => { setEditing(reservation); setFormOpen(true); }} onDelete={setDeleting} />
        )}
      </div>

      {formOpen && (
        <ReservationFormModal
          reservation={editing}
          services={services}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={async () => {
            setFormOpen(false);
            setEditing(null);
            await refreshReservations();
          }}
        />
      )}

      {viewing && (
        <ReservationDetailModal
          reservation={viewing}
          onClose={() => setViewing(null)}
          onDelete={(reservation) => {
            setViewing(null);
            setDeleting(reservation);
          }}
          onUpdated={async (reservation) => {
            setViewing(reservation);
            await refreshReservations();
          }}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          code={deleting.reservationCode}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  );
}

function ReservationsCalendar({ month, days, reservationsByDate, onMonthChange, onView }: {
  month: Date;
  days: CalendarDay[];
  reservationsByDate: Map<string, Reservation[]>;
  onMonthChange: (date: Date) => void;
  onView: (reservation: Reservation) => void;
}) {
  const monthTitle = monthFormatter.format(month);

  const changeMonth = (offset: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  return (
    <div className="overflow-hidden border border-[#c4871a]/12 bg-[#0F0D0B]">
      <div className="flex flex-col gap-3 border-b border-[#c4871a]/10 bg-[#171513] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#5B5A59]">Calendario mensual</p>
          <h2 className="font-heading text-xl font-bold uppercase tracking-[.04em] text-white first-letter:uppercase">{monthTitle}</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => changeMonth(-1)} className="border border-[#3C3A37] px-3 py-2 text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white">Anterior</button>
          <button type="button" onClick={() => onMonthChange(new Date())} className="border border-[#c4871a]/35 px-3 py-2 text-xs font-semibold uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10">Hoy</button>
          <button type="button" onClick={() => changeMonth(1)} className="border border-[#3C3A37] px-3 py-2 text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white">Siguiente</button>
        </div>
      </div>

      <div className="hidden grid-cols-7 border-b border-[#c4871a]/10 bg-[#080706] md:grid">
        {weekDays.map((day) => (
          <div key={day} className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[.12em] text-[#5B5A59]">{day}</div>
        ))}
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-7 md:gap-0 md:p-0">
        {days.map((day) => {
          const dayReservations = reservationsByDate.get(day.key) ?? [];

          return (
            <div key={day.key} className={`min-h-[170px] border border-[#c4871a]/10 bg-[#171513] p-3 md:border-l-0 md:border-t-0 ${day.inMonth ? "" : "opacity-45"}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <span className={`inline-flex h-7 min-w-7 items-center justify-center border px-2 text-xs font-bold ${day.isToday ? "border-[#c4871a] bg-[#c4871a] text-[#080706]" : "border-[#3C3A37] text-white"}`}>{day.date.getDate()}</span>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#5B5A59] md:hidden">{weekDays[(day.date.getDay() + 6) % 7]}</span>
                </div>
                {dayReservations.length > 0 && <span className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#c4871a]">{dayReservations.length}</span>}
              </div>

              {dayReservations.length > 0 ? (
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {dayReservations.map((reservation) => (
                    <button key={reservation.id} type="button" onClick={() => onView(reservation)} className="block w-full border border-[#c4871a]/12 bg-[#080706] p-2 text-left transition-colors hover:border-[#c4871a]/45 hover:bg-[#c4871a]/5 focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30">
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-[11px] font-semibold text-[#c4871a]">{reservation.reservationCode}</span>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${reservation.status === "confirmed" ? "bg-green-400" : reservation.status === "in_review" ? "bg-sky-300" : reservation.status === "completed" ? "bg-[#B2AAA7]" : reservation.status === "canceled" ? "bg-[#ff8174]" : "bg-[#d6a244]"}`} />
                      </div>
                      <p className="mt-1 truncate font-heading text-xs font-bold uppercase text-white">{reservation.firstName} {reservation.lastName}</p>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-[#B2AAA7]">
                        <span>{reservation.reservationTimeLabel} · {reservation.durationHours} h</span>
                        <span className="truncate text-[#5B5A59]">{reservation.services.length} serv.</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5B5A59]">Sin reservas</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReservationsTable({ reservations, onView, onEdit, onDelete }: {
  reservations: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}) {
  return (
    <div className="overflow-hidden border border-[#c4871a]/12 bg-[#0F0D0B]">
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-[#080706] text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">
            <tr>
              {['Código', 'Cliente', 'Identificación', 'Correo', 'Teléfono', 'Fecha', 'Hora', 'Duración', 'Servicios', 'Total', 'Estado', 'Creada', 'Acciones'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4871a]/8">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="text-[#B2AAA7] transition-colors hover:bg-[#c4871a]/5">
                <td className="px-4 py-4 font-semibold text-[#c4871a]">{reservation.reservationCode}</td>
                <td className="px-4 py-4 text-white">{reservation.firstName} {reservation.lastName}</td>
                <td className="px-4 py-4">{reservation.identificationNumber}</td>
                <td className="px-4 py-4">{reservation.email}</td>
                <td className="px-4 py-4">{reservation.phone}</td>
                <td className="px-4 py-4">{reservation.reservationDate}</td>
                <td className="px-4 py-4">{reservation.reservationTimeLabel}</td>
                <td className="px-4 py-4">{reservation.durationHours} h</td>
                <td className="px-4 py-4">{reservation.services.map((item) => item.serviceTitle).join(', ')}</td>
                <td className="px-4 py-4 font-semibold text-white">{formatCOP(reservation.total)}</td>
                <td className="px-4 py-4"><StatusBadge status={reservation.status} /></td>
                <td className="px-4 py-4">{new Date(reservation.createdAt).toLocaleDateString('es-CO')}</td>
                <td className="px-4 py-4"><ActionButtons reservation={reservation} onView={onView} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 xl:hidden">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="border border-[#c4871a]/10 bg-[#171513] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#c4871a]">{reservation.reservationCode}</p>
                <h3 className="font-heading text-base font-bold uppercase text-white">{reservation.firstName} {reservation.lastName}</h3>
                <p className="text-xs text-[#5B5A59]">{reservation.email}</p>
              </div>
              <StatusBadge status={reservation.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#B2AAA7]">
              <span>{reservation.reservationDate}</span><span>{reservation.reservationTimeLabel} · {reservation.durationHours} h</span>
              <span>{reservation.identificationNumber}</span><span>{formatCOP(reservation.total)}</span>
            </div>
            <div className="mt-4"><ActionButtons reservation={reservation} onView={onView} onEdit={onEdit} onDelete={onDelete} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={`inline-flex border px-2 py-1 text-[10px] font-semibold uppercase tracking-[.08em] ${statusClasses[status]}`}>{statusLabels[status]}</span>;
}

function ActionButtons({ reservation, onView, onEdit, onDelete }: {
  reservation: Reservation;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onView(reservation)} className="border border-[#3C3A37] px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white">Ver</button>
      <button type="button" onClick={() => onEdit(reservation)} className="border border-[#c4871a]/35 px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10">Editar</button>
      <button type="button" onClick={() => onDelete(reservation)} className="border border-[#B63A2B]/35 px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#B63A2B] hover:bg-[#B63A2B]/10">Eliminar</button>
    </div>
  );
}

function ReservationFormModal({ reservation, services, onClose, onSaved }: {
  reservation: Reservation | null;
  services: ServiceOption[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => reservation ? reservationToForm(reservation) : emptyForm);
  const [pickerMonth, setPickerMonth] = useState(() => reservation?.reservationDate ? dateKeyToLocalDate(reservation.reservationDate) : new Date());
  const [userMode, setUserMode] = useState<"new" | "existing">(reservation?.userId ? "existing" : "new");
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [saving, setSaving] = useState(false);
  const cities = form.department ? getCities(form.department) : [];

  useEffect(() => {
    if (userMode !== "existing") return;
    const timeout = window.setTimeout(() => {
      fetch(`/api/dashboard/reservations/users?q=${encodeURIComponent(userQuery)}`)
        .then((res) => res.json())
        .then((data) => setUsers(data.users ?? []))
        .catch(() => setUsers([]));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [userMode, userQuery]);

  useEffect(() => {
    if (!form.reservationDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailability([]);
      return;
    }
    const params = new URLSearchParams({ date: form.reservationDate, durationHours: String(getReservationDurationFromItems(form.items)) });
    if (reservation) params.set("excludeReservationId", reservation.id);
    fetch(`/api/public/availability?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.slots ?? []))
      .catch(() => setAvailability([]));
  }, [form.items, form.reservationDate, reservation]);

  const selectedServices = form.items
    .map((item) => ({ item, service: services.find((service) => service.id === item.serviceId) }))
    .filter((entry): entry is { item: { serviceId: number; quantity: number; hours: number }; service: ServiceOption } => Boolean(entry.service));
  const durationHours = getReservationDurationFromItems(form.items);
  const subtotal = selectedServices.reduce((sum, entry) => sum + entry.service.finalPrice * entry.item.quantity * entry.item.hours, 0);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }));
  const addService = (serviceId: number) => {
    if (!serviceId) return;
    setForm((prev) => {
      const existing = prev.items.find((item) => item.serviceId === serviceId);
      return {
        ...prev,
        items: existing ? prev.items : [...prev.items, { serviceId, quantity: 1, hours: 1 }],
      };
    });
  };

  const submit = async () => {
    if (form.items.length === 0) {
      toast.error("Selecciona al menos un servicio");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        country: "Colombia",
        couponCode: form.couponCode.trim() || null,
      };
      const res = await fetch(reservation ? `/api/dashboard/reservations/${reservation.id}` : "/api/dashboard/reservations", {
        method: reservation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la reserva");
      toast.success(reservation ? "Reserva actualizada correctamente" : "Reserva creada correctamente");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la reserva");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-5xl border border-[#c4871a]/15 bg-[#0F0D0B] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#c4871a]/10 p-5">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-[.04em] text-white">{reservation ? "Editar reserva" : "Crear reserva"}</h2>
            <p className="text-xs text-[#5B5A59]">Valida cliente, disponibilidad, servicios y estado.</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#5B5A59] hover:text-white" aria-label="Cerrar modal">✕</button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => { setUserMode("new"); setField("userId", null); }} className={`border px-4 py-3 text-sm font-semibold uppercase tracking-[.08em] ${userMode === "new" ? "border-[#c4871a] bg-[#c4871a]/10 text-[#c4871a]" : "border-[#3C3A37] text-[#B2AAA7]"}`}>Crear nuevo usuario</button>
              <button type="button" onClick={() => setUserMode("existing")} className={`border px-4 py-3 text-sm font-semibold uppercase tracking-[.08em] ${userMode === "existing" ? "border-[#c4871a] bg-[#c4871a]/10 text-[#c4871a]" : "border-[#3C3A37] text-[#B2AAA7]"}`}>Seleccionar usuario existente</button>
            </div>

            {userMode === "existing" && (
              <div className="border border-[#c4871a]/10 bg-[#080706] p-4">
                <label className="mb-1.5 block text-xs uppercase tracking-[.08em] text-[#B2AAA7]">Buscar usuario</label>
                <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} className="w-full border border-[#3C3A37] bg-[#0F0D0B] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4871a]/60" placeholder="Nombre, correo o identificación" />
                <div className="mt-3 max-h-44 overflow-y-auto space-y-2">
                  {users.map((user) => (
                    <button key={user.id} type="button" onClick={() => setForm((prev) => ({ ...prev, userId: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, identificationType: user.identificationType, identificationNumber: user.identificationNumber }))} className="block w-full border border-[#3C3A37] p-3 text-left text-sm text-[#B2AAA7] hover:border-[#c4871a]/40">
                      <span className="block font-semibold text-white">{user.firstName} {user.lastName}</span>
                      <span className="text-xs">{user.email} · {user.identificationNumber}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombres"><input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="input-admin" /></Field>
              <Field label="Apellidos"><input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="input-admin" /></Field>
              <Field label="Tipo ID"><select value={form.identificationType} onChange={(e) => setField("identificationType", e.target.value as FormState["identificationType"])} className="input-admin"><option value="cedula">Cédula</option><option value="pasaporte">Pasaporte</option><option value="cedula_extranjeria">Cédula extranjería</option></select></Field>
              <Field label="Número identificación"><input value={form.identificationNumber} onChange={(e) => setField("identificationNumber", e.target.value)} className="input-admin" /></Field>
              <Field label="Correo"><input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="input-admin" /></Field>
              <Field label="Teléfono"><div className="flex border border-[#3C3A37] bg-[#080706]"><span className="border-r border-[#3C3A37] px-3 py-2.5 text-sm text-[#B2AAA7]">🇨🇴 +57</span><input value={form.phone} maxLength={10} inputMode="numeric" onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none" /></div></Field>
              <Field label="Dirección"><input value={form.address} onChange={(e) => setField("address", e.target.value)} className="input-admin" /></Field>
              <Field label="País"><input value="Colombia" disabled className="input-admin opacity-60" /></Field>
              <Field label="Departamento"><SearchableSelect options={colombiaDepartments.map((d) => d.name)} value={form.department} onChange={(value) => setForm((prev) => ({ ...prev, department: value, city: "" }))} label="Departamento" /></Field>
              <Field label="Ciudad"><SearchableSelect options={cities} value={form.city} onChange={(value) => setField("city", value)} disabled={!form.department} label="Ciudad" /></Field>
              <div className="sm:col-span-2">
                <Field label="Fecha">
                  <DashboardDatePicker
                    month={pickerMonth}
                    selectedDate={form.reservationDate}
                    onMonthChange={setPickerMonth}
                    onSelect={(value) => setForm((prev) => ({ ...prev, reservationDate: value, reservationTime: "" }))}
                  />
                </Field>
              </div>
              <Field label="Hora"><select value={form.reservationTime} onChange={(e) => setField("reservationTime", e.target.value)} className="input-admin"><option value="">Seleccionar hora</option>{(availability.length ? availability : BASE_RESERVATION_SLOTS.map((slot) => ({ ...slot, available: false, reason: null }))).map((slot) => <option key={slot.time} value={slot.time} disabled={!slot.available && slot.time !== reservation?.reservationTime}>{slot.label}{!slot.available ? ` · ${slot.reason ?? 'no disponible'}` : ''}</option>)}</select></Field>
              <Field label="Estado"><select value={form.status} onChange={(e) => setField("status", e.target.value as ReservationStatus)} className="input-admin">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="Cupón"><input value={form.couponCode} onChange={(e) => setField("couponCode", e.target.value.toUpperCase())} className="input-admin" placeholder="POWER10" /></Field>
            </div>

            <Field label="Notas"><textarea value={form.scheduleNotes} onChange={(e) => setField("scheduleNotes", e.target.value)} className="input-admin min-h-24 resize-none" /></Field>

            <div className="border border-[#c4871a]/10 bg-[#080706] p-4">
              <label className="mb-2 block text-xs uppercase tracking-[.08em] text-[#B2AAA7]">Servicios</label>
              <select onChange={(e) => { addService(Number(e.target.value)); e.target.value = ""; }} className="input-admin">
                <option value="">Agregar servicio</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {formatCOP(service.finalPrice)}</option>)}
              </select>
              <div className="mt-3 space-y-2">
                {selectedServices.map(({ item, service }) => (
                  <div key={service.id} className="flex items-center justify-between gap-3 border border-[#3C3A37] p-3 text-sm">
                    <div className="min-w-0"><p className="truncate text-white">{service.name}</p><p className="text-xs text-[#5B5A59]">{formatCOP(service.finalPrice)} por persona/hora · Total {formatCOP(service.finalPrice * item.quantity * item.hours)}</p></div>
                    <div className="grid shrink-0 gap-2 sm:grid-cols-[120px_100px_auto] sm:items-end">
                      <MiniNumber label="Personas" value={item.quantity} min={1} max={20} onChange={(value) => setForm((prev) => ({ ...prev, reservationTime: "", items: prev.items.map((row) => row.serviceId === service.id ? { ...row, quantity: value } : row) }))} />
                      <MiniNumber label="Horas" value={item.hours} min={1} max={8} onChange={(value) => setForm((prev) => ({ ...prev, reservationTime: "", items: prev.items.map((row) => row.serviceId === service.id ? { ...row, hours: value } : row) }))} />
                      <button type="button" onClick={() => setForm((prev) => ({ ...prev, reservationTime: "", items: prev.items.filter((row) => row.serviceId !== service.id) }))} className="text-xs text-[#B63A2B]">Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit border border-[#c4871a]/12 bg-[#080706] p-4 lg:sticky lg:top-4">
            <h3 className="font-heading text-base font-bold uppercase text-white">Resumen</h3>
            <div className="mt-4 space-y-2 text-sm text-[#B2AAA7]">
              <div className="flex justify-between"><span>Servicios</span><span>{form.items.length}</span></div>
              <div className="flex justify-between"><span>Duración</span><span>{durationHours} {durationHours === 1 ? "hora" : "horas"}</span></div>
              <div className="flex justify-between"><span>Horario ocupado</span><span>{form.reservationTime ? `${getSlotLabel(form.reservationTime)} - ${getEndTimeLabel(form.reservationTime, durationHours)}` : "Pendiente"}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCOP(subtotal)}</span></div>
              <div className="flex justify-between border-t border-[#c4871a]/10 pt-2 font-heading text-lg font-bold uppercase text-white"><span>Total estimado</span><span className="text-[#c4871a]">{formatCOP(subtotal)}</span></div>
              <p className="pt-2 text-xs text-[#5B5A59]">El backend recalcula cupón, descuento y total antes de guardar.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#c4871a]/10 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="border border-[#3C3A37] px-5 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#B2AAA7] hover:text-white">Cancelar</button>
          <button type="button" onClick={submit} disabled={saving} className="bg-[#c4871a] px-5 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] hover:bg-[#d6a244] disabled:opacity-60">{saving ? "Guardando..." : "Guardar reserva"}</button>
        </div>

        <style jsx global>{`.input-admin{width:100%;border:1px solid #3C3A37;background:#080706;padding:.625rem .75rem;color:white;font-size:.875rem;outline:none}.input-admin:focus{border-color:rgba(196,135,26,.6)}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">{label}</span>{children}</label>;
}

function MiniNumber({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[.08em] text-[#B2AAA7]">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || min)))}
        className="w-full border border-[#3C3A37] bg-[#080706] px-2 py-1.5 text-white"
      />
    </label>
  );
}

function DashboardDatePicker({ month, selectedDate, onMonthChange, onSelect }: { month: Date; selectedDate: string; onMonthChange: (date: Date) => void; onSelect: (date: string) => void }) {
  const title = monthFormatter.format(month);
  const days = buildCalendarDays(month);
  const todayKey = dateToKey(new Date());

  return (
    <div className="border border-[#3C3A37] bg-[#080706] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="border border-[#3C3A37] px-2 py-1.5 text-xs text-[#B2AAA7] hover:text-white">Anterior</button>
        <p className="font-heading text-sm font-bold uppercase text-white first-letter:uppercase">{title}</p>
        <button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="border border-[#3C3A37] px-2 py-1.5 text-xs text-[#B2AAA7] hover:text-white">Siguiente</button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[.08em] text-[#5B5A59]">
        {weekDays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const selected = selectedDate === day.key;
          const disabled = !day.inMonth || day.key < todayKey;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelect(day.key)}
              disabled={disabled}
              className={`h-9 border text-xs font-semibold transition-colors ${selected ? "border-[#c4871a] bg-[#c4871a] text-[#080706]" : disabled ? "cursor-not-allowed border-[#171513] text-[#3C3A37]" : "border-[#26221e] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white"}`}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReservationDetailModal({ reservation, onClose, onDelete, onUpdated }: {
  reservation: Reservation;
  onClose: () => void;
  onDelete: (reservation: Reservation) => void;
  onUpdated: (reservation: Reservation) => void | Promise<void>;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(null);

  const changeStatus = async (nextStatus: ReservationStatus) => {
    if (nextStatus === reservation.status) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/dashboard/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el estado");
      toast.success(data.emailSent ? "Estado actualizado y correo enviado" : "Estado actualizado. No se pudo enviar el correo");
      await onUpdated(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el estado");
    } finally {
      setUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  const resendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/dashboard/reservations/${reservation.id}/email`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo reenviar el correo");
      toast.success("Correo de confirmación reenviado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo reenviar el correo");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-[#c4871a]/15 bg-[#0F0D0B] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs text-[#c4871a]">{reservation.reservationCode}</p><h2 className="font-heading text-xl font-bold uppercase text-white">Detalle de reserva</h2></div>
          <button type="button" onClick={onClose} className="text-[#5B5A59] hover:text-white">✕</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBox title="Cliente" lines={[`${reservation.firstName} ${reservation.lastName}`, reservation.identificationNumber, reservation.email, reservation.phone]} />
          <InfoBox title="Fecha y estado" lines={[reservation.reservationDate, `${reservation.reservationTimeLabel} - ${getEndTimeLabel(reservation.reservationTime, reservation.durationHours)}`, `${reservation.durationHours} ${reservation.durationHours === 1 ? "hora" : "horas"} ocupadas`, statusLabels[reservation.status]]} />
          <InfoBox title="Ubicación" lines={[reservation.address, `${reservation.city}, ${reservation.department}`, reservation.country]} />
          <InfoBox title="Método de pago" lines={[reservation.paymentMethodLabel || "No registrado"]} />
          <InfoBox title="Notas" lines={[reservation.notes || "Sin notas"]} />
        </div>
        <div className="mt-5 border border-[#c4871a]/10 bg-[#080706] p-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">Cambiar estado</span>
            <select
              value={reservation.status}
              onChange={(event) => setPendingStatus(event.target.value as ReservationStatus)}
              disabled={updatingStatus}
              className="w-full border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4871a]/60 disabled:opacity-60"
            >
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-5 border border-[#c4871a]/10 bg-[#080706] p-4">
          <p className="mb-3 text-xs uppercase tracking-[.12em] text-[#5B5A59]">Servicios</p>
          {reservation.services.map((item) => <div key={item.id} className="flex justify-between gap-3 border-b border-[#171513] py-2 text-sm last:border-b-0"><span className="text-white">{item.serviceTitle}<span className="block text-xs text-[#5B5A59]">{item.quantity} persona(s) · {item.hours} hora(s)</span></span><span className="shrink-0 text-[#c4871a]">{formatCOP(item.total)}</span></div>)}
          <div className="mt-3 space-y-1 border-t border-[#c4871a]/10 pt-3 text-sm"><div className="flex justify-between text-[#B2AAA7]"><span>Subtotal</span><span>{formatCOP(reservation.subtotal)}</span></div>{reservation.discount > 0 && <div className="flex justify-between text-[#c4871a]"><span>Descuento {reservation.couponCode}</span><span>-{formatCOP(reservation.discount)}</span></div>}<div className="flex justify-between font-heading text-lg font-bold uppercase text-white"><span>Total</span><span className="text-[#c4871a]">{formatCOP(reservation.total)}</span></div></div>
        </div>
        <div className="mt-5 grid gap-3 border-t border-[#c4871a]/10 pt-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={resendEmail}
            disabled={sendingEmail}
            className="border border-[#c4871a]/35 px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10 disabled:opacity-60"
          >
            {sendingEmail ? "Enviando..." : "Reenviar correo"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(reservation)}
            className="border border-[#B63A2B]/35 px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#B63A2B] hover:bg-[#B63A2B]/10"
          >
            Eliminar reserva
          </button>
        </div>
      </div>
      {pendingStatus && pendingStatus !== reservation.status && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#c4871a]/25 bg-[#0F0D0B] p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-bold uppercase text-white">¿Cambiar estado?</h3>
            <p className="mt-2 text-sm leading-6 text-[#B2AAA7]">
              La reserva {reservation.reservationCode} cambiará de {statusLabels[reservation.status]} a {statusLabels[pendingStatus]}. Se enviará un correo al cliente con el nuevo estado y todos los datos de la reserva.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPendingStatus(null)} disabled={updatingStatus} className="border border-[#3C3A37] px-4 py-2 text-sm text-[#B2AAA7] hover:text-white disabled:opacity-60">Cancelar</button>
              <button type="button" onClick={() => changeStatus(pendingStatus)} disabled={updatingStatus} className="bg-[#c4871a] px-4 py-2 text-sm font-bold uppercase text-[#080706] hover:bg-[#d6a244] disabled:opacity-60">{updatingStatus ? "Actualizando..." : "Sí, cambiar estado"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ title, lines }: { title: string; lines: string[] }) {
  return <div className="border border-[#c4871a]/10 bg-[#080706] p-4"><p className="mb-2 text-xs uppercase tracking-[.12em] text-[#5B5A59]">{title}</p>{lines.map((line) => <p key={line} className="text-sm text-[#B2AAA7]">{line}</p>)}</div>;
}

function ConfirmDeleteModal({ code, onCancel, onConfirm }: { code: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-[#B63A2B]/30 bg-[#0F0D0B] p-6 shadow-2xl">
        <h2 className="font-heading text-lg font-bold uppercase text-white">¿Seguro que deseas eliminar esta reserva?</h2>
        <p className="mt-2 text-sm text-[#B2AAA7]">Reserva {code}. Esta acción no se podrá deshacer.</p>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="border border-[#3C3A37] px-4 py-2 text-sm text-[#B2AAA7] hover:text-white">Cancelar</button><button type="button" onClick={onConfirm} className="bg-[#B63A2B] px-4 py-2 text-sm font-bold uppercase text-white hover:bg-[#c94a3a]">Eliminar</button></div>
      </div>
    </div>
  );
}
