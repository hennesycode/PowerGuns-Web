"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Slot = { openTime: string; closeTime: string };
type Weekday = { dayOfWeek: number; slots: Slot[] };
type HistoryEntry = {
  id: string;
  action: string;
  reason: string;
  isOpen: boolean;
  slotsJson: string;
  changedBy: string;
  createdAt: string;
};
type Exception = {
  id: string;
  dateKey: string;
  isOpen: boolean;
  isActive: boolean;
  reason: string;
  createdBy: string;
  updatedAt: string;
  slots: Slot[];
  history: HistoryEntry[];
};

const inputClass = "border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#c4871a]/60";
const actionLabels: Record<string, string> = {
  created: "Creada",
  updated: "Actualizada",
  reactivated: "Reactivada",
  cancelled: "Cancelada",
};

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatExceptionDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BusinessHourExceptions({ weekdays }: { weekdays: Weekday[] }) {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateKey, setDateKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadExceptions = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/dashboard/settings/business-hours/exceptions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar las excepciones");
      setExceptions(data.exceptions ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las excepciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The callback fetches from the API and updates state after its async response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExceptions(false);
  }, [loadExceptions]);

  const setDate = (value: string) => {
    setDateKey(value);
    setEditingId(null);
    const dayOfWeek = value ? new Date(`${value}T12:00:00`).getDay() : -1;
    const weeklySlots = weekdays.find((day) => day.dayOfWeek === dayOfWeek)?.slots ?? [];
    setSlots(weeklySlots.length ? weeklySlots.map(({ openTime, closeTime }) => ({ openTime, closeTime })) : [{ openTime: "08:00", closeTime: "18:00" }]);
  };

  const reset = () => {
    setDateKey("");
    setIsOpen(false);
    setReason("");
    setSlots([]);
    setEditingId(null);
  };

  const editException = (exception: Exception) => {
    setDateKey(exception.dateKey);
    setIsOpen(exception.isOpen);
    setReason(exception.reason);
    setSlots(exception.slots.map(({ openTime, closeTime }) => ({ openTime, closeTime })));
    setEditingId(exception.id);
    document.getElementById("business-hour-exception-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = async () => {
    if (!dateKey) { toast.error("Selecciona una fecha"); return; }
    if (!reason.trim()) { toast.error("Indica el motivo de la excepción"); return; }
    if (isOpen && slots.length === 0) { toast.error("Agrega al menos un bloque de atención"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings/business-hours/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey, isOpen, reason, slots: isOpen ? slots : [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la excepción");
      toast.success("Excepción de horario guardada");
      reset();
      await loadExceptions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la excepción");
    } finally {
      setSaving(false);
    }
  };

  const cancelException = async (exception: Exception) => {
    if (!window.confirm(`¿Cancelar la excepción del ${formatExceptionDate(exception.dateKey)}? Se restaurará el horario semanal.`)) return;
    try {
      const res = await fetch(`/api/dashboard/settings/business-hours/exceptions/${exception.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cancelar la excepción");
      toast.success("Excepción cancelada; se restauró el horario semanal");
      await loadExceptions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la excepción");
    }
  };

  const updateSlot = (index: number, field: keyof Slot, value: string) => {
    setSlots((current) => current.map((slot, slotIndex) => slotIndex === index ? { ...slot, [field]: value } : slot));
  };

  return (
    <section className="space-y-5 border-t border-[#c4871a]/15 pt-6" aria-labelledby="exceptions-heading">
      <div>
        <h2 id="exceptions-heading" className="font-heading text-lg font-bold uppercase tracking-[.06em] text-white">Excepciones por fecha</h2>
        <p className="mt-1 max-w-3xl text-sm text-[#B2AAA7]">Bloquea un festivo o define un horario distinto para una fecha puntual. El horario semanal permanece intacto y se reactiva automáticamente en las siguientes semanas.</p>
      </div>

      <div id="business-hour-exception-form" className="border border-[#c4871a]/15 bg-[#0F0D0B] p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#B2AAA7]">
            Fecha específica
            <input type="date" min={todayKey()} value={dateKey} onChange={(event) => setDate(event.target.value)} className={`${inputClass} mt-1.5 w-full`} />
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#B2AAA7]">
            Motivo
            <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} className={`${inputClass} mt-1.5 w-full`} placeholder="Ej. Festivo, mantenimiento, evento privado" />
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className="mb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#B2AAA7]">Disponibilidad para esa fecha</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setIsOpen(false)} aria-pressed={!isOpen} className={`border px-4 py-2.5 text-xs font-bold uppercase tracking-[.08em] transition-colors ${!isOpen ? "border-[#B63A2B]/60 bg-[#B63A2B]/10 text-[#ff6b5f]" : "border-[#3C3A37] text-[#B2AAA7] hover:text-white"}`}>Cerrar todo el día</button>
            <button type="button" onClick={() => { setIsOpen(true); if (slots.length === 0) setSlots([{ openTime: "08:00", closeTime: "18:00" }]); }} aria-pressed={isOpen} className={`border px-4 py-2.5 text-xs font-bold uppercase tracking-[.08em] transition-colors ${isOpen ? "border-[#c4871a]/60 bg-[#c4871a]/10 text-[#c4871a]" : "border-[#3C3A37] text-[#B2AAA7] hover:text-white"}`}>Horario especial</button>
          </div>
        </fieldset>

        {isOpen && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[#5B5A59]">Define solo los bloques que estarán disponibles. Por ejemplo, un único bloque de mañana cierra la tarde. Los horarios deben estar en orden y no cruzarse.</p>
            {slots.map((slot, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <span className="w-20 text-[10px] uppercase tracking-[.08em] text-[#5B5A59]">Bloque {index + 1}</span>
                <input type="time" value={slot.openTime} onChange={(event) => updateSlot(index, "openTime", event.target.value)} className={inputClass} aria-label={`Bloque ${index + 1}, apertura`} />
                <span className="text-[#5B5A59]">a</span>
                <input type="time" value={slot.closeTime} onChange={(event) => updateSlot(index, "closeTime", event.target.value)} className={inputClass} aria-label={`Bloque ${index + 1}, cierre`} />
                <button type="button" onClick={() => setSlots((current) => current.filter((_, slotIndex) => slotIndex !== index))} className="px-2 py-2 text-xs text-[#B63A2B] hover:text-[#ff6b5f]" aria-label={`Quitar bloque ${index + 1}`}>Quitar</button>
              </div>
            ))}
            {slots.length < 4 && <button type="button" onClick={() => setSlots((current) => [...current, { openTime: "14:00", closeTime: "18:00" }])} className="border border-[#3C3A37] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/40 hover:text-[#c4871a]">+ Agregar bloque</button>}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {editingId && <button type="button" onClick={reset} className="border border-[#3C3A37] px-4 py-2.5 text-xs font-bold uppercase tracking-[.08em] text-[#B2AAA7] hover:text-white">Salir de edición</button>}
          <button type="button" onClick={save} disabled={saving} className="bg-[#c4871a] px-5 py-2.5 text-xs font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244] disabled:opacity-60">{saving ? "Guardando..." : editingId ? "Actualizar excepción" : "Guardar excepción"}</button>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-sm font-bold uppercase tracking-[.08em] text-white">Excepciones e historial</h3>
          <span className="text-[10px] text-[#5B5A59]">Se conservan las últimas 100 fechas registradas</span>
        </div>
        {loading ? <div className="flex justify-center py-8"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div> : exceptions.length === 0 ? (
          <p className="border border-dashed border-[#3C3A37] px-4 py-8 text-center text-sm text-[#5B5A59]">Todavía no hay excepciones registradas.</p>
        ) : (
          <div className="space-y-3">
            {exceptions.map((exception) => (
              <article key={exception.id} className="border border-[#3C3A37] bg-[#0F0D0B] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold capitalize text-white">{formatExceptionDate(exception.dateKey)}</h4>
                      <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.08em] ${exception.isActive ? "border-[#c4871a]/30 bg-[#c4871a]/10 text-[#c4871a]" : "border-[#3C3A37] text-[#5B5A59]"}`}>{exception.isActive ? "Activa" : "Cancelada"}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#B2AAA7]">{exception.isOpen ? exception.slots.map((slot) => `${slot.openTime}–${slot.closeTime}`).join(" · ") : "Cerrado todo el día"} <span className="text-[#5B5A59]">— {exception.reason}</span></p>
                    <p className="mt-1 text-[10px] text-[#5B5A59]">Registró {exception.createdBy} · Actualizado {new Date(exception.updatedAt).toLocaleString("es-CO")}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editException(exception)} className="border border-[#3C3A37] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.06em] text-[#B2AAA7] hover:border-[#c4871a]/40 hover:text-[#c4871a]">Editar</button>
                    {exception.isActive && <button type="button" onClick={() => cancelException(exception)} className="border border-[#B63A2B]/35 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.06em] text-[#ff6b5f] hover:bg-[#B63A2B]/10">Cancelar</button>}
                  </div>
                </div>
                <details className="mt-3 border-t border-[#3C3A37]/70 pt-3">
                  <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[.08em] text-[#5B5A59] hover:text-[#B2AAA7]">Ver historial ({exception.history.length})</summary>
                  <ol className="mt-3 space-y-2">
                    {exception.history.map((entry) => {
                      let entrySlots: Slot[] = [];
                      try { entrySlots = JSON.parse(entry.slotsJson) as Slot[]; } catch { /* Preserve history rendering if a legacy record is malformed. */ }
                      return <li key={entry.id} className="border-l border-[#c4871a]/25 pl-3 text-xs text-[#B2AAA7]">
                        <span className="font-semibold text-white">{actionLabels[entry.action] ?? entry.action}</span>
                        <span className="text-[#5B5A59]"> · {new Date(entry.createdAt).toLocaleString("es-CO")} · {entry.changedBy}</span>
                        <p className="mt-0.5">{entry.isOpen ? entrySlots.map((slot) => `${slot.openTime}–${slot.closeTime}`).join(" · ") : "Cerrado todo el día"} — {entry.reason}</p>
                      </li>;
                    })}
                  </ol>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
