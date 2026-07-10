"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { AdminIdentificationType, AdminUserItem } from "@/lib/types/user";

const identificationTypes: { value: AdminIdentificationType; label: string }[] = [
  { value: "cedula", label: "Cédula" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "cedula_extranjeria", label: "Cédula extranjería" },
];

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  finanzas: "Finanzas",
  editor: "Editor",
  cliente: "Cliente",
  instructor: "Instructor",
};

function formatDate(value: string | null) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [identificationType, setIdentificationType] = useState<AdminIdentificationType>("cedula");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/profile");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al cargar perfil");
        }
        const data: AdminUserItem = await res.json();
        if (cancelled) return;
        setUser(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setIdentificationType(data.identificationType);
        setIdentificationNumber(data.identificationNumber);
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "No se pudo cargar el perfil");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !identificationNumber.trim()) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          identificationType,
          identificationNumber: identificationNumber.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar perfil");
      }
      const updated: AdminUserItem = await res.json();
      setUser(updated);
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setEmail(updated.email);
      setIdentificationType(updated.identificationType);
      setIdentificationNumber(updated.identificationNumber);
      window.dispatchEvent(new CustomEvent("admin:user-updated", { detail: updated }));
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Completa todos los campos de contraseña");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar contraseña");
      }
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      router.replace("/login");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
      setSavingPassword(false);
    }
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "PG" : "PG";

  return (
    <AdminLayout title="Mi perfil">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c4871a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !user ? (
        <div className="bg-[#171513] border border-[#c4871a]/12 p-12 text-center">
          <p className="text-[#B2AAA7] font-['Rajdhani',sans-serif] text-sm">No se pudo cargar la información del usuario.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#171513] border border-[#c4871a]/12 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-16 h-16 bg-[#c4871a]/15 border border-[#c4871a]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={fullName} width={64} height={64} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="font-heading font-bold text-xl text-[#c4871a]">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-xl text-white uppercase tracking-[.04em]">{fullName}</h2>
              <p className="font-['Rajdhani',sans-serif] text-sm text-[#B2AAA7] mt-1">@{user.username} · {ROLE_LABELS[user.role]}</p>
              <p className="text-[#5B5A59] text-xs mt-1">Último acceso: {formatDate(user.lastLoginAt)}</p>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.4fr_.9fr] gap-6">
            <form onSubmit={handleProfileSubmit} className="bg-[#171513] border border-[#c4871a]/12">
              <div className="px-5 md:px-6 py-4 border-b border-[#c4871a]/10">
                <h3 className="font-heading font-bold text-lg text-white uppercase tracking-[.04em]">Datos de usuario</h3>
                <p className="text-[#5B5A59] text-xs mt-1">Puedes actualizar tus datos. El usuario y el rol permanecen protegidos.</p>
              </div>
              <div className="p-5 md:p-6 grid md:grid-cols-2 gap-4">
                <ReadOnlyField label="Nombre de usuario" value={`@${user.username}`} />
                <ReadOnlyField label="Rol" value={ROLE_LABELS[user.role]} />
                <Field label="Nombres *" value={firstName} onChange={setFirstName} />
                <Field label="Apellidos *" value={lastName} onChange={setLastName} />
                <Field label="Correo electrónico *" type="email" value={email} onChange={setEmail} />
                <SelectField label="Tipo de identificación *" value={identificationType} onChange={(value) => setIdentificationType(value as AdminIdentificationType)} options={identificationTypes} />
                <Field label="Número de identificación *" value={identificationNumber} onChange={setIdentificationNumber} />
                <ReadOnlyField label="Estado" value={user.isActive ? "Activo" : "Inactivo"} />
              </div>
              <div className="px-5 md:px-6 py-4 border-t border-[#c4871a]/10 flex justify-end">
                <button type="submit" disabled={savingProfile} className="px-6 py-2.5 bg-[#c4871a] text-[#080706] hover:bg-[#d6a244] transition-colors font-heading font-bold text-sm uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center gap-2">
                  {savingProfile ? <><span className="w-4 h-4 border-2 border-[#080706] border-t-transparent rounded-full animate-spin" /> Guardando...</> : "Actualizar perfil"}
                </button>
              </div>
            </form>

            <form onSubmit={handlePasswordSubmit} className="bg-[#171513] border border-[#c4871a]/12 h-fit">
              <div className="px-5 md:px-6 py-4 border-b border-[#c4871a]/10">
                <h3 className="font-heading font-bold text-lg text-white uppercase tracking-[.04em]">Actualizar contraseña</h3>
                <p className="text-[#5B5A59] text-xs mt-1">Al guardar, la sesión se cerrará y volverás al login.</p>
              </div>
              <div className="p-5 md:p-6 space-y-4">
                <Field label="Contraseña actual *" type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
                <Field label="Nueva contraseña *" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                <Field label="Confirmar nueva contraseña *" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
                <div className="bg-[#080706] border border-[#c4871a]/12 p-3 text-xs text-[#5B5A59] leading-relaxed">
                  Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
                </div>
              </div>
              <div className="px-5 md:px-6 py-4 border-t border-[#c4871a]/10 flex justify-end">
                <button type="submit" disabled={savingPassword} className="px-6 py-2.5 bg-[#c4871a] text-[#080706] hover:bg-[#d6a244] transition-colors font-heading font-bold text-sm uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center gap-2">
                  {savingPassword ? <><span className="w-4 h-4 border-2 border-[#080706] border-t-transparent rounded-full animate-spin" /> Actualizando...</> : "Cambiar contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return (
    <div>
      <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]" />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">{label}</label>
      <div className="w-full px-3 py-2 bg-[#080706]/65 border border-[#3C3A37] text-[#B2AAA7] text-sm min-h-[38px] flex items-center">{value}</div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
