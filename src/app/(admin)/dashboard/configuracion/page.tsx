"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

type TabId = "horarios" | "metodos-pago" | "reservas" | "empresa" | "notificaciones" | "seguridad";
type PaymentProvider = "daviplata" | "nequi" | "bancolombia" | "davivienda" | "bbva";

interface PaymentMethod {
  id: string;
  type: "bank_transfer";
  provider: PaymentProvider;
  providerLabel: string;
  accountNumber: string;
  accountHolderName: string;
  identificationNumber: string | null;
  isActive: boolean;
}

interface PaymentFormState {
  provider: PaymentProvider;
  accountNumber: string;
  accountHolderName: string;
  identificationNumber: string;
  isActive: boolean;
}

interface SlotInput {
  openTime: string;
  closeTime: string;
}

interface DayInput {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  hasBreak: boolean;
  slots: SlotInput[];
}

const DAYS = [
  { dayOfWeek: 0, dayName: "Domingo" },
  { dayOfWeek: 1, dayName: "Lunes" },
  { dayOfWeek: 2, dayName: "Martes" },
  { dayOfWeek: 3, dayName: "Miércoles" },
  { dayOfWeek: 4, dayName: "Jueves" },
  { dayOfWeek: 5, dayName: "Viernes" },
  { dayOfWeek: 6, dayName: "Sábado" },
];

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "horarios", label: "Horarios" },
  { id: "metodos-pago", label: "Métodos de pago" },
  { id: "reservas", label: "Reservas" },
  { id: "empresa", label: "Empresa" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "seguridad", label: "Seguridad" },
];

const PAYMENT_PROVIDERS: Array<{ value: PaymentProvider; label: string }> = [
  { value: "daviplata", label: "Daviplata" },
  { value: "nequi", label: "Nequi" },
  { value: "bancolombia", label: "Bancolombia" },
  { value: "davivienda", label: "Davivienda" },
  { value: "bbva", label: "BBVA" },
];

const emptyPaymentForm: PaymentFormState = {
  provider: "daviplata",
  accountNumber: "",
  accountHolderName: "",
  identificationNumber: "",
  isActive: true,
};

function defaultDays(): DayInput[] {
  return DAYS.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    dayName: day.dayName,
    isOpen: day.dayOfWeek !== 0,
    hasBreak: false,
    slots: day.dayOfWeek !== 0
      ? [{ openTime: "08:00", closeTime: "18:00" }]
      : [],
  }));
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabId>("horarios");
  const [days, setDays] = useState<DayInput[]>(defaultDays);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(emptyPaymentForm);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const loadPaymentMethods = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/dashboard/settings/payment-methods");
      if (!res.ok) throw new Error("No se pudieron cargar los métodos de pago");
      const data = await res.json();
      setPaymentMethods(data.methods ?? []);
    } catch { toast.error("No se pudieron cargar los métodos de pago"); }
    finally { setPaymentsLoading(false); }
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/settings/business-hours")
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            toast.error("No autorizado");
            return;
          }
          throw new Error("No se pudieron cargar los horarios");
        }
        const data = await res.json();
        if (data.hours && data.hours.length > 0) {
          const restored: DayInput[] = DAYS.map((day) => {
            const existing = data.hours.find(
              (h: { dayOfWeek: number }) => h.dayOfWeek === day.dayOfWeek,
            );
            if (!existing) {
              return {
                dayOfWeek: day.dayOfWeek,
                dayName: day.dayName,
                isOpen: false,
                hasBreak: false,
                slots: [],
              };
            }
            return {
              dayOfWeek: existing.dayOfWeek,
              dayName: existing.dayName,
              isOpen: existing.isOpen,
              hasBreak: existing.slots.length > 1,
              slots: existing.slots.map((s: { openTime: string; closeTime: string }) => ({
                openTime: s.openTime,
                closeTime: s.closeTime,
              })),
            };
          });
          setDays(restored);
        }
      })
      .catch(() => toast.error("No se pudieron cargar los horarios"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard/settings/payment-methods")
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los métodos de pago");
        const data = await res.json();
        if (active) setPaymentMethods(data.methods ?? []);
      })
      .catch(() => toast.error("No se pudieron cargar los métodos de pago"))
      .finally(() => { if (active) setPaymentsLoading(false); });
    return () => { active = false; };
  }, []);

  const updateDay = (dayOfWeek: number, updates: Partial<DayInput>) => {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day,
      ),
    );
  };

  const toggleOpen = (dayOfWeek: number, open: boolean) => {
    const day = days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDay(dayOfWeek, {
      isOpen: open,
      slots: open
        ? [{ openTime: "08:00", closeTime: "18:00" }]
        : [],
      hasBreak: false,
    });
  };

  const toggleBreak = (dayOfWeek: number, hasBreak: boolean) => {
    const day = days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    if (hasBreak) {
      const firstEnd = day.slots[0]?.closeTime ?? "12:00";
      updateDay(dayOfWeek, {
        hasBreak: true,
        slots: [
          { openTime: day.slots[0]?.openTime ?? "08:00", closeTime: firstEnd },
          { openTime: firstEnd, closeTime: day.slots[1]?.closeTime ?? "18:00" },
        ],
      });
    } else {
      const firstOpen = day.slots[0]?.openTime ?? "08:00";
      const lastClose = day.slots[day.slots.length - 1]?.closeTime ?? "18:00";
      updateDay(dayOfWeek, {
        hasBreak: false,
        slots: [{ openTime: firstOpen, closeTime: lastClose }],
      });
    }
  };

  const updateSlot = (
    dayOfWeek: number,
    slotIndex: number,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot,
              ),
            }
          : day,
      ),
    );
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = { days };
      const res = await fetch("/api/dashboard/settings/business-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudieron guardar los horarios");
      }
      toast.success("Horarios guardados correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron guardar los horarios");
    } finally {
      setSaving(false);
    }
  }, [days]);

  const resetPaymentForm = () => {
    setPaymentForm(emptyPaymentForm);
    setEditingPaymentId(null);
  };

  const editPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentId(method.id);
    setPaymentForm({
      provider: method.provider,
      accountNumber: method.accountNumber,
      accountHolderName: method.accountHolderName,
      identificationNumber: method.identificationNumber ?? "",
      isActive: method.isActive,
    });
  };

  const savePaymentMethod = async () => {
    if (!paymentForm.accountNumber.trim()) { toast.error("Ingresa el número de cuenta"); return; }
    if (!paymentForm.accountHolderName.trim()) { toast.error("Ingresa el nombre completo"); return; }
    setPaymentSaving(true);
    try {
      const res = await fetch(editingPaymentId ? `/api/dashboard/settings/payment-methods/${editingPaymentId}` : "/api/dashboard/settings/payment-methods", {
        method: editingPaymentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "bank_transfer", ...paymentForm, identificationNumber: paymentForm.identificationNumber || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el método de pago");
      toast.success(editingPaymentId ? "Método de pago actualizado" : "Método de pago agregado");
      resetPaymentForm();
      loadPaymentMethods();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el método de pago"); }
    finally { setPaymentSaving(false); }
  };

  const deletePaymentMethod = async (method: PaymentMethod) => {
    if (!confirm(`¿Eliminar el método de pago ${method.providerLabel}?`)) return;
    try {
      const res = await fetch(`/api/dashboard/settings/payment-methods/${method.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar el método de pago");
      toast.success("Método de pago eliminado");
      if (editingPaymentId === method.id) resetPaymentForm();
      loadPaymentMethods();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo eliminar el método de pago"); }
  };

  return (
    <AdminLayout title="Configuración">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-[#B2AAA7]">
            Administra los parámetros operativos del polígono.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#c4871a]/10 pb-px" role="tablist">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-5 py-3 text-xs font-semibold uppercase tracking-[.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#c4871a]/30 ${
                  active
                    ? "border-b-2 border-[#c4871a] text-[#c4871a]"
                    : "text-[#5B5A59] hover:text-[#B2AAA7]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "horarios" && (
          <div className="space-y-5">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {days.map((day) => (
                    <DayCard
                      key={day.dayOfWeek}
                      day={day}
                      onToggleOpen={(open) => toggleOpen(day.dayOfWeek, open)}
                      onToggleBreak={(hasBreak) => toggleBreak(day.dayOfWeek, hasBreak)}
                      onUpdateSlot={(slotIndex, field, value) =>
                        updateSlot(day.dayOfWeek, slotIndex, field, value)
                      }
                    />
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#c4871a]/10 pt-5">
                  <button
                    type="button"
                    onClick={() => setDays(defaultDays())}
                    className="border border-[#3C3A37] px-5 py-3 text-xs font-bold uppercase tracking-[.08em] text-[#B2AAA7] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30"
                  >
                    Restaurar valores por defecto
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#c4871a] px-6 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244] focus:outline-none focus:ring-2 focus:ring-[#d6a244]/40 disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "metodos-pago" && (
          <PaymentMethodsSection
            methods={paymentMethods}
            loading={paymentsLoading}
            saving={paymentSaving}
            form={paymentForm}
            editingId={editingPaymentId}
            onFormChange={setPaymentForm}
            onSave={savePaymentMethod}
            onCancelEdit={resetPaymentForm}
            onEdit={editPaymentMethod}
            onDelete={deletePaymentMethod}
          />
        )}

        {activeTab !== "horarios" && activeTab !== "metodos-pago" && (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#c4871a]/20 bg-[#0F0D0B] py-20 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 h-12 w-12 text-[#3C3A37]">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <p className="font-heading text-sm font-bold uppercase tracking-[.08em] text-[#5B5A59]">
              Próximamente disponible
            </p>
            <p className="mt-1 text-xs text-[#3C3A37]">
              Esta sección estará habilitada en una próxima actualización.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function PaymentMethodsSection({
  methods,
  loading,
  saving,
  form,
  editingId,
  onFormChange,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
}: {
  methods: PaymentMethod[];
  loading: boolean;
  saving: boolean;
  form: PaymentFormState;
  editingId: string | null;
  onFormChange: (form: PaymentFormState) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
}) {
  const inputClass = "w-full border border-[#3C3A37] bg-[#080706] px-3 py-3 text-sm text-white placeholder-[#5B5A59] outline-none transition-colors focus:border-[#c4871a]/60";

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="border border-[#c4871a]/10 bg-[#0F0D0B] p-5">
        <div className="mb-5">
          <p className="font-heading text-sm font-bold uppercase tracking-[.12em] text-white">
            {editingId ? "Editar método" : "Agregar método"}
          </p>
          <p className="mt-1 text-xs text-[#5B5A59]">
            Por ahora solo se permite transferencia bancaria.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#B2AAA7]">Tipo</span>
            <select value="bank_transfer" disabled className={`${inputClass} cursor-not-allowed opacity-70`}>
              <option value="bank_transfer">Transferencia bancaria</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#B2AAA7]">Entidad *</span>
            <select value={form.provider} onChange={(event) => onFormChange({ ...form, provider: event.target.value as PaymentProvider })} className={inputClass}>
              {PAYMENT_PROVIDERS.map((provider) => <option key={provider.value} value={provider.value}>{provider.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#B2AAA7]">Número de cuenta *</span>
            <input value={form.accountNumber} onChange={(event) => onFormChange({ ...form, accountNumber: event.target.value })} className={inputClass} placeholder="Número de cuenta o celular" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#B2AAA7]">Nombre completo *</span>
            <input value={form.accountHolderName} onChange={(event) => onFormChange({ ...form, accountHolderName: event.target.value })} className={inputClass} placeholder="Titular de la cuenta" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#B2AAA7]">Número de identificación</span>
            <input value={form.identificationNumber} onChange={(event) => onFormChange({ ...form, identificationNumber: event.target.value })} className={inputClass} placeholder="Opcional" />
          </label>

          <label className="flex items-center justify-between border border-[#3C3A37]/70 bg-[#080706] px-3 py-3">
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[.1em] text-[#B2AAA7]">Estado</span>
              <span className="text-xs text-[#5B5A59]">Visible para uso operativo</span>
            </span>
            <input type="checkbox" checked={form.isActive} onChange={(event) => onFormChange({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-[#c4871a]" />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {editingId && <button type="button" onClick={onCancelEdit} className="border border-[#3C3A37] px-5 py-3 text-xs font-bold uppercase tracking-[.08em] text-[#B2AAA7] transition-colors hover:text-white">Cancelar edición</button>}
          <button type="button" onClick={onSave} disabled={saving} className="bg-[#c4871a] px-6 py-3 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244] disabled:opacity-60">
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "+ Agregar método"}
          </button>
        </div>
      </section>

      <section className="border border-[#c4871a]/10 bg-[#0F0D0B] p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-sm font-bold uppercase tracking-[.12em] text-white">Métodos configurados</p>
            <p className="mt-1 text-xs text-[#5B5A59]">Administra Daviplata, Nequi, Bancolombia, Davivienda y BBVA.</p>
          </div>
          <span className="w-fit border border-[#c4871a]/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#c4871a]">{methods.length} registrados</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
        ) : methods.length === 0 ? (
          <div className="border border-dashed border-[#c4871a]/20 bg-[#080706] py-14 text-center">
            <p className="font-heading text-sm font-bold uppercase tracking-[.08em] text-[#5B5A59]">Sin métodos de pago</p>
            <p className="mt-1 text-xs text-[#3C3A37]">Agrega el primer método desde el formulario.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <article key={method.id} className="border border-[#3C3A37]/60 bg-[#080706] p-4 transition-colors hover:border-[#c4871a]/30">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-base font-bold uppercase tracking-[.04em] text-white">{method.providerLabel}</h3>
                      <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] ${method.isActive ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-[#3C3A37] bg-[#0F0D0B] text-[#5B5A59]"}`}>{method.isActive ? "Activo" : "Inactivo"}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#5B5A59]">Transferencia bancaria</p>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Cuenta</dt><dd className="font-semibold text-[#B2AAA7]">{method.accountNumber}</dd></div>
                      <div><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Titular</dt><dd className="font-semibold text-[#B2AAA7]">{method.accountHolderName}</dd></div>
                      <div><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">Identificación</dt><dd className="font-semibold text-[#B2AAA7]">{method.identificationNumber || "No registrada"}</dd></div>
                    </dl>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => onEdit(method)} className="border border-[#3C3A37] px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/50 hover:text-white">Editar</button>
                    <button type="button" onClick={() => onDelete(method)} className="border border-[#B63A2B]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#ff6b5f] transition-colors hover:bg-[#B63A2B]/10">Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DayCard({
  day,
  onToggleOpen,
  onToggleBreak,
  onUpdateSlot,
}: {
  day: DayInput;
  onToggleOpen: (open: boolean) => void;
  onToggleBreak: (hasBreak: boolean) => void;
  onUpdateSlot: (slotIndex: number, field: "openTime" | "closeTime", value: string) => void;
}) {
  return (
    <div className={`border bg-[#171513] transition-colors ${
      day.isOpen ? "border-[#c4871a]/20" : "border-[#3C3A37]/40"
    }`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h3 className="min-w-[100px] font-heading text-lg font-bold uppercase tracking-[.04em] text-white sm:text-base">
            {day.dayName}
          </h3>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={day.isOpen}
              onChange={(e) => onToggleOpen(e.target.checked)}
              className="peer sr-only"
              aria-label={`${day.dayName} ${day.isOpen ? "cerrado" : "abierto"}`}
            />
            <span className="h-6 w-11 rounded-full bg-[#3C3A37] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-[#5B5A59] after:transition-all peer-checked:bg-[#c4871a] peer-checked:after:translate-x-full peer-checked:after:bg-[#080706] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#c4871a]/30" />
          </label>
          <span className={`text-[10px] font-semibold uppercase tracking-[.12em] ${
            day.isOpen ? "text-green-500" : "text-[#B63A2B]"
          }`}>
            {day.isOpen ? "Abierto" : "Cerrado"}
          </span>
        </div>
      </div>

      {day.isOpen && (
        <div className="border-t border-[#c4871a]/10 px-5 pb-5 pt-4">
          <div className="space-y-3">
            {day.slots.map((slot, index) => (
              <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {index === 1 && (
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[.08em] text-[#c4871a] sm:mx-2 sm:block sm:w-auto">
                    <span className="hidden sm:inline">Descanso</span>
                    <span className="sm:hidden">Descanso</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="hidden text-xs uppercase tracking-[.08em] text-[#5B5A59] sm:inline">
                      {day.hasBreak ? "Primer bloque" : "Horario"}
                    </span>
                  )}
                  {index === 1 && (
                    <span className="hidden text-xs uppercase tracking-[.08em] text-[#5B5A59] sm:inline">
                      Segundo bloque
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="time"
                    value={slot.openTime}
                    onChange={(e) => onUpdateSlot(index, "openTime", e.target.value)}
                    className="w-32 border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4871a]/60"
                    aria-label={`${day.dayName} bloque ${index + 1} apertura`}
                  />
                  <span className="text-[#5B5A59]">—</span>
                  <input
                    type="time"
                    value={slot.closeTime}
                    onChange={(e) => onUpdateSlot(index, "closeTime", e.target.value)}
                    className="w-32 border border-[#3C3A37] bg-[#080706] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c4871a]/60"
                    aria-label={`${day.dayName} bloque ${index + 1} cierre`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="relative inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={day.hasBreak}
                onChange={(e) => onToggleBreak(e.target.checked)}
                className="peer sr-only"
                aria-label={`${day.dayName} tiene descanso`}
              />
              <span className="h-6 w-11 rounded-full bg-[#3C3A37] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-[#5B5A59] after:transition-all peer-checked:bg-[#c4871a]/60 peer-checked:after:translate-x-full peer-checked:after:bg-[#c4871a] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#c4871a]/30" />
              <span className="text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                Tiene descanso / horario partido
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
