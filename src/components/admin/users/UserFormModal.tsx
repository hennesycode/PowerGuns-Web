"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AdminIdentificationType, AdminUserItem, AdminUserRole } from "@/lib/types/user";

interface UserFormModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const roles: { value: AdminUserRole; label: string }[] = [
  { value: "administrador", label: "Administrador" },
  { value: "finanzas", label: "Finanzas" },
  { value: "editor", label: "Editor" },
  { value: "instructor", label: "Instructor" },
  { value: "cliente", label: "Cliente" },
];

const identificationTypes: { value: AdminIdentificationType; label: string }[] = [
  { value: "cedula", label: "Cédula" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "cedula_extranjeria", label: "Cédula extranjería" },
];

export function UserFormModal({ user, onClose, onSuccess }: UserFormModalProps) {
  const isEditing = !!user;
  const [username, setUsername] = useState(user?.username || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [identificationType, setIdentificationType] = useState<AdminIdentificationType>(user?.identificationType || "cedula");
  const [identificationNumber, setIdentificationNumber] = useState(user?.identificationNumber || "");
  const [role, setRole] = useState<AdminUserRole>(user?.role || "cliente");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !identificationNumber.trim()) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    if (!isEditing && (!password || !confirmPassword)) {
      toast.error("La contraseña es obligatoria para crear usuarios");
      return;
    }
    if ((password || confirmPassword) && password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        identificationType,
        identificationNumber: identificationNumber.trim(),
        role,
        isActive,
        password: password || undefined,
        confirmPassword: confirmPassword || undefined,
      };
      const res = await fetch(isEditing ? `/api/dashboard/users/${user.id}` : "/api/dashboard/users", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar usuario");
      }
      toast.success(isEditing ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
      <div className="relative w-full max-w-2xl bg-[#171513] border border-[#c4871a]/20 shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4871a]/10">
          <h2 className="font-heading font-bold text-lg text-white uppercase tracking-[.04em]">{isEditing ? "Editar usuario" : "Crear usuario"}</h2>
          <button onClick={onClose} disabled={saving} className="text-[#5B5A59] hover:text-white transition-colors disabled:opacity-50" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nombres *" value={firstName} onChange={setFirstName} />
              <Field label="Apellidos *" value={lastName} onChange={setLastName} />
              <Field label="Usuario *" value={username} onChange={setUsername} />
              <Field label="Correo electrónico *" type="email" value={email} onChange={setEmail} />
              <SelectField label="Tipo de identificación *" value={identificationType} onChange={(value) => setIdentificationType(value as AdminIdentificationType)} options={identificationTypes} />
              <Field label="Número de identificación *" value={identificationNumber} onChange={setIdentificationNumber} />
              <SelectField label="Rol *" value={role} onChange={(value) => setRole(value as AdminUserRole)} options={roles} />
              <SelectField label="Estado *" value={isActive ? "active" : "inactive"} onChange={(value) => setIsActive(value === "active")} options={[{ value: "active", label: "Activo" }, { value: "inactive", label: "Inactivo" }]} />
            </div>

            <div className="bg-[#080706] border border-[#c4871a]/12 p-4 space-y-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-[.04em]">{isEditing ? "Actualizar contraseña" : "Contraseña de acceso"}</h3>
                <p className="text-[#5B5A59] text-xs mt-1">{isEditing ? "Déjala vacía si no deseas cambiarla." : "Debe cumplir las reglas de seguridad del sistema."}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label={isEditing ? "Nueva contraseña" : "Contraseña *"} type="password" value={password} onChange={setPassword} autoComplete="new-password" />
                <Field label={isEditing ? "Confirmar nueva contraseña" : "Confirmar contraseña *"} type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#c4871a]/10 flex items-center justify-between">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2.5 border border-[#3C3A37] text-[#B2AAA7] hover:text-white hover:border-[#5B5A59] transition-colors font-['Rajdhani',sans-serif] font-semibold text-sm uppercase tracking-[.06em] disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#c4871a] text-[#080706] hover:bg-[#d6a244] transition-colors font-heading font-bold text-sm uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-[#080706] border-t-transparent rounded-full animate-spin" /> Guardando...</> : isEditing ? "Actualizar usuario" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
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
