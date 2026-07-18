"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

type DiscountType = "percentage" | "fixed";
type CouponStatus = "active" | "inactive" | "scheduled" | "expired" | "exhausted";

type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  status: CouponStatus;
  startsAt: string | null;
  expiresAt: string | null;
  maxUses: number | null;
  perCustomerLimit: number | null;
  assignedUser: { id: number; firstName: string; lastName: string; email: string; identificationNumber: string } | null;
  usedCount: number;
  minimumSubtotal: number;
  createdAt: string;
  redemptions: Array<{
    id: string;
    reservationId: string | null;
    userId: number | null;
    customerName: string;
    customerEmail: string;
    subtotal: number;
    discountAmount: number;
    total: number;
    createdAt: string;
  }>;
};

type UserOption = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  identificationNumber: string;
};

type CouponForm = {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
  maxUses: string;
  perCustomerLimit: string;
  assignedUserId: number | null;
  minimumSubtotal: string;
};

type HelpTopic = {
  title: string;
  description: string;
  example: string;
};

const emptyForm: CouponForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  isActive: true,
  startsAt: "",
  expiresAt: "",
  maxUses: "",
  perCustomerLimit: "",
  assignedUserId: null,
  minimumSubtotal: "",
};

const statusLabels: Record<CouponStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  scheduled: "Programado",
  expired: "Vencido",
  exhausted: "Agotado",
};

const statusClasses: Record<CouponStatus, string> = {
  active: "border-green-500/30 bg-green-500/10 text-green-400",
  inactive: "border-[#3C3A37] bg-[#080706] text-[#5B5A59]",
  scheduled: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  expired: "border-[#B63A2B]/35 bg-[#B63A2B]/10 text-[#ff8174]",
  exhausted: "border-[#c4871a]/35 bg-[#c4871a]/10 text-[#d6a244]",
};

const helpTopics: Record<string, HelpTopic> = {
  code: { title: "Código", description: "Es el texto que el cliente escribe para aplicar el descuento. Siempre se guarda en mayúsculas.", example: "Ejemplo: POWER10 o CLIENTEVIP." },
  discountType: { title: "Tipo", description: "Define si el descuento será un porcentaje del total o un valor fijo en pesos.", example: "Porcentaje: 10%. Valor monetario: 50.000 COP." },
  discountValue: { title: "Descuento", description: "Valor exacto que se descuenta según el tipo seleccionado.", example: "Si eliges porcentaje y escribes 15, descuenta 15%. Si eliges COP y escribes 20.000, descuenta $20.000." },
  minimumSubtotal: { title: "Compra mínima", description: "Subtotal mínimo que debe tener la reserva para poder usar el cupón.", example: "Si pones 200.000, una reserva de $150.000 no podrá usarlo." },
  startsAt: { title: "Fecha inicio", description: "Fecha desde la cual el cupón empieza a estar disponible.", example: "Úsalo para campañas que empiezan el lunes o en una fecha especial." },
  expiresAt: { title: "Fecha límite", description: "Fecha hasta la cual el cupón será válido. Si queda vacío, no vence por fecha.", example: "Promoción válida hasta el 31 de diciembre." },
  maxUses: { title: "Usos totales", description: "Cantidad máxima de veces que el cupón puede usarse entre todos los clientes.", example: "Si pones 1, solo se podrá usar una vez en total." },
  perCustomerLimit: { title: "Usos por cliente", description: "Cantidad máxima de veces que un mismo cliente puede usar este cupón.", example: "Si pones 1, cada cliente solo lo podrá usar una vez." },
  isActive: { title: "Activo", description: "Controla si el cupón puede aplicarse. Si está inactivo, nadie lo puede usar aunque cumpla las demás reglas.", example: "Desactívalo para pausar una campaña sin borrar el cupón." },
  assignedUser: { title: "Cliente único", description: "Restringe el cupón para que solo un cliente específico pueda usarlo.", example: "Cupón especial asignado únicamente a Juan Pérez." },
};

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);
}

function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? new Intl.NumberFormat("es-CO").format(Number(digits)) : "";
}

function parseMoney(value: string) {
  return Number(value.replace(/\D/g, "") || 0);
}

function formatDate(value: string | null) {
  if (!value) return "Sin límite";
  return new Date(value).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [viewing, setViewing] = useState<Coupon | null>(null);

  const loadCoupons = async () => {
    const res = await fetch("/api/dashboard/coupons");
    if (!res.ok) throw new Error("No se pudieron cargar los cupones");
    const data = await res.json();
    setCoupons(data.coupons ?? []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCoupons().catch(() => toast.error("No se pudieron cargar los cupones")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!modalOpen || !userQuery.trim()) return;
    const timeout = window.setTimeout(() => {
      fetch(`/api/dashboard/reservations/users?q=${encodeURIComponent(userQuery)}`)
        .then((res) => res.json())
        .then((data) => setUsers(data.users ?? []))
        .catch(() => setUsers([]));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [modalOpen, userQuery]);

  const saveCoupon = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: form.discountType === "fixed" ? parseMoney(form.discountValue) : Number(form.discountValue),
        minimumSubtotal: parseMoney(form.minimumSubtotal),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      };
      const res = await fetch("/api/dashboard/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear el cupón");
      toast.success("Cupón creado exitosamente");
      setModalOpen(false);
      setForm(emptyForm);
      setUserQuery("");
      await loadCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el cupón");
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/dashboard/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el cupón");
      toast.success(data.isActive ? "Cupón activado" : "Cupón inactivado");
      await loadCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el cupón");
    }
  };

  return (
    <AdminLayout title="Cupones">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-['Rajdhani',sans-serif] text-sm text-[#B2AAA7]">Crea descuentos por porcentaje o valor fijo con límites, vigencia y cliente asignado.</p>
          </div>
          <button type="button" onClick={() => setModalOpen(true)} className="bg-[#c4871a] px-4 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] hover:bg-[#d6a244]">Crear cupón</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
        ) : coupons.length === 0 ? (
          <div className="border border-[#c4871a]/12 bg-[#171513] p-12 text-center text-sm text-[#B2AAA7]">No hay cupones registrados.</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {coupons.map((coupon) => (
              <article key={coupon.id} className="border border-[#c4871a]/12 bg-[#0F0D0B] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl font-bold uppercase tracking-[.08em] text-white">{coupon.code}</h2>
                      <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${statusClasses[coupon.status]}`}>{statusLabels[coupon.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#B2AAA7]">{coupon.discountType === "percentage" ? `${coupon.discountValue}% de descuento` : `${formatCOP(coupon.discountValue)} de descuento`}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewing(coupon)} className="border border-[#3C3A37] px-3 py-2 text-xs uppercase tracking-[.08em] text-[#B2AAA7] hover:text-white">Ver usos</button>
                    <button type="button" onClick={() => toggleCoupon(coupon)} className="border border-[#c4871a]/35 px-3 py-2 text-xs uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10">{coupon.isActive ? "Inactivar" : "Activar"}</button>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Info label="Usos" value={`${coupon.usedCount}${coupon.maxUses ? ` / ${coupon.maxUses}` : ""}`} />
                  <Info label="Límite cliente" value={coupon.perCustomerLimit ? `${coupon.perCustomerLimit} uso(s)` : "Sin límite"} />
                  <Info label="Vigencia" value={coupon.expiresAt ? formatDate(coupon.expiresAt) : "Sin límite"} />
                  <Info label="Cliente" value={coupon.assignedUser ? `${coupon.assignedUser.firstName} ${coupon.assignedUser.lastName}` : "Todos"} />
                  <Info label="Compra mínima" value={coupon.minimumSubtotal > 0 ? formatCOP(coupon.minimumSubtotal) : "Sin mínimo"} />
                  <Info label="Creado" value={formatDate(coupon.createdAt)} />
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <CouponModal form={form} setForm={setForm} saving={saving} onClose={() => setModalOpen(false)} onSave={saveCoupon} userQuery={userQuery} setUserQuery={setUserQuery} users={users} />
      )}

      {viewing && <CouponUsageModal coupon={viewing} onClose={() => setViewing(null)} />}
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="border border-[#c4871a]/10 bg-[#080706] p-3"><dt className="text-[10px] uppercase tracking-[.12em] text-[#5B5A59]">{label}</dt><dd className="mt-1 font-semibold text-[#B2AAA7]">{value}</dd></div>;
}

function CouponModal({ form, setForm, saving, onClose, onSave, userQuery, setUserQuery, users }: { form: CouponForm; setForm: (form: CouponForm) => void; saving: boolean; onClose: () => void; onSave: () => void; userQuery: string; setUserQuery: (value: string) => void; users: UserOption[] }) {
  const inputClass = "w-full border border-[#3C3A37] bg-[#080706] px-3 py-3 text-sm text-white outline-none focus:border-[#c4871a]/60";
  const [help, setHelp] = useState<HelpTopic | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl border border-[#c4871a]/15 bg-[#0F0D0B] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#c4871a]/10 p-5">
          <div><h2 className="font-heading text-xl font-bold uppercase tracking-[.04em] text-white">Crear cupón</h2><p className="text-xs text-[#5B5A59]">Configura descuentos combinando límites, fechas y cliente único.</p></div>
          <button type="button" onClick={onClose} className="text-[#5B5A59] hover:text-white">✕</button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Código" help={() => setHelp(helpTopics.code)}><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} className={inputClass} placeholder="POWER10" /></Field>
          <Field label="Tipo" help={() => setHelp(helpTopics.discountType)}><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType, discountValue: "" })} className={inputClass}><option value="percentage">Porcentaje</option><option value="fixed">Valor monetario</option></select></Field>
          <Field label="Descuento" help={() => setHelp(helpTopics.discountValue)}><div className="flex border border-[#3C3A37] bg-[#080706]"><input value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: form.discountType === "fixed" ? formatMoneyInput(e.target.value) : e.target.value.replace(/\D/g, "").slice(0, 3) })} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none" placeholder={form.discountType === "fixed" ? "50.000" : "10"} /><span className="border-l border-[#3C3A37] px-3 py-3 text-sm text-[#B2AAA7]">{form.discountType === "fixed" ? "COP" : "%"}</span></div></Field>
          <Field label="Compra mínima" help={() => setHelp(helpTopics.minimumSubtotal)}><input value={form.minimumSubtotal} onChange={(e) => setForm({ ...form, minimumSubtotal: formatMoneyInput(e.target.value) })} className={inputClass} placeholder="0" /></Field>
          <Field label="Fecha inicio" help={() => setHelp(helpTopics.startsAt)}><input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputClass} /></Field>
          <Field label="Fecha límite" help={() => setHelp(helpTopics.expiresAt)}><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputClass} /></Field>
          <Field label="Usos totales" help={() => setHelp(helpTopics.maxUses)}><input type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={inputClass} placeholder="Sin límite" /></Field>
          <Field label="Usos por cliente" help={() => setHelp(helpTopics.perCustomerLimit)}><input type="number" min={1} value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} className={inputClass} placeholder="Sin límite" /></Field>
          <label className="flex items-center justify-between border border-[#3C3A37] bg-[#080706] px-3 py-3 sm:col-span-2"><span><span className="flex items-center gap-2 text-xs uppercase tracking-[.1em] text-[#B2AAA7]">Activo <InfoButton onClick={() => setHelp(helpTopics.isActive)} /></span><span className="text-xs text-[#5B5A59]">Disponible para aplicar si cumple reglas.</span></span><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-[#c4871a]" /></label>
          <div className="sm:col-span-2">
            <Field label="Cliente único" help={() => setHelp(helpTopics.assignedUser)}><input value={userQuery} onChange={(e) => { setUserQuery(e.target.value); setForm({ ...form, assignedUserId: null }); }} className={inputClass} placeholder="Buscar por nombre, correo o identificación" /></Field>
            {form.assignedUserId && <p className="mt-2 text-xs text-[#c4871a]">Cliente asignado seleccionado.</p>}
            {users.length > 0 && <div className="mt-2 max-h-44 overflow-y-auto border border-[#3C3A37] bg-[#080706]">{users.map((user) => <button key={user.id} type="button" onClick={() => { setForm({ ...form, assignedUserId: user.id }); setUserQuery(`${user.firstName} ${user.lastName} · ${user.email}`); }} className="block w-full border-b border-[#171513] p-3 text-left text-sm text-[#B2AAA7] hover:bg-[#c4871a]/5"><span className="font-semibold text-white">{user.firstName} {user.lastName}</span><span className="block text-xs">{user.email} · {user.identificationNumber}</span></button>)}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#c4871a]/10 p-5"><button type="button" onClick={onClose} className="border border-[#3C3A37] px-5 py-3 text-sm text-[#B2AAA7] hover:text-white">Cancelar</button><button type="button" onClick={onSave} disabled={saving} className="bg-[#c4871a] px-5 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] hover:bg-[#d6a244] disabled:opacity-60">{saving ? "Guardando..." : "Crear cupón"}</button></div>
      </div>
      {help && <HelpModal topic={help} onClose={() => setHelp(null)} />}
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: () => void; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">{label}{help && <InfoButton onClick={help} />}</span>{children}</label>;
}

function InfoButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={(event) => { event.preventDefault(); onClick(); }} className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#c4871a]/35 text-[11px] font-bold text-[#c4871a] transition-colors hover:bg-[#c4871a]/10" aria-label="Ver información">i</button>;
}

function HelpModal({ topic, onClose }: { topic: HelpTopic; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-[#c4871a]/25 bg-[#0F0D0B] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#c4871a]">Información</p><h3 className="mt-1 font-heading text-lg font-bold uppercase text-white">{topic.title}</h3></div>
          <button type="button" onClick={onClose} className="text-[#5B5A59] hover:text-white">✕</button>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#B2AAA7]">{topic.description}</p>
        <div className="mt-4 border border-[#c4871a]/12 bg-[#080706] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#5B5A59]">Ejemplo</p>
          <p className="mt-1 text-sm text-white">{topic.example}</p>
        </div>
        <div className="mt-5 flex justify-end"><button type="button" onClick={onClose} className="bg-[#c4871a] px-4 py-2 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#080706] hover:bg-[#d6a244]">Entendido</button></div>
      </div>
    </div>
  );
}

function CouponUsageModal({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-[#c4871a]/15 bg-[#0F0D0B] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-[#c4871a]">{coupon.code}</p><h2 className="font-heading text-xl font-bold uppercase text-white">Usos del cupón</h2></div><button type="button" onClick={onClose} className="text-[#5B5A59] hover:text-white">✕</button></div>
        <div className="mt-5 max-h-[60vh] overflow-y-auto">
          {coupon.redemptions.length === 0 ? <p className="border border-dashed border-[#3C3A37] p-8 text-center text-sm text-[#5B5A59]">Este cupón todavía no ha sido usado.</p> : <div className="space-y-3">{coupon.redemptions.map((use) => <div key={use.id} className="border border-[#3C3A37] bg-[#080706] p-4 text-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-white">{use.customerName}</p><p className="text-xs text-[#5B5A59]">{use.customerEmail}</p><p className="mt-1 text-xs text-[#B2AAA7]">{new Date(use.createdAt).toLocaleString("es-CO")}</p></div><div className="text-left sm:text-right"><p className="text-[#B2AAA7]">Subtotal {formatCOP(use.subtotal)}</p><p className="text-[#c4871a]">Descuento -{formatCOP(use.discountAmount)}</p><p className="font-bold text-white">Total {formatCOP(use.total)}</p></div></div></div>)}</div>}
        </div>
      </div>
    </div>
  );
}
