"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AdminUserItem } from "@/lib/types/user";

interface UsersTableProps {
  users: AdminUserItem[];
  onEdit: (user: AdminUserItem) => void;
  onDelete: (user: AdminUserItem) => void;
}

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  finanzas: "Finanzas",
  editor: "Editor",
  cliente: "Cliente",
  instructor: "Instructor",
};

const ID_LABELS: Record<string, string> = {
  cedula: "Cédula",
  pasaporte: "Pasaporte",
  cedula_extranjeria: "Cédula extranjería",
};

function formatDate(value: string | null) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function UserAvatar({ user }: { user: AdminUserItem }) {
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "PG";
  return (
    <div className="relative w-9 h-9 bg-[#080706] border border-[#c4871a]/15 flex items-center justify-center overflow-hidden flex-shrink-0">
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} fill sizes="36px" className="w-full h-full object-cover" unoptimized />
      ) : (
        <span className="font-heading font-bold text-xs text-[#c4871a]">{initials}</span>
      )}
    </div>
  );
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="bg-[#171513] border border-[#c4871a]/12 overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#c4871a]/10">
              {["Usuario", "Contacto", "Identificación", "Rol", "Estado", "Último acceso", "Acciones"].map((head) => (
                <th key={head} className={cn(
                  "py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7]",
                  head === "Acciones" && "text-right",
                )}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4871a]/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#c4871a]/3 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3 min-w-[190px]">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[#5B5A59] truncate">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-[#B2AAA7]">{user.email}</td>
                <td className="py-3 px-4 text-sm text-[#B2AAA7]">
                  <div>{ID_LABELS[user.identificationType]}</div>
                  <div className="text-xs text-[#5B5A59]">{user.identificationNumber}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[11px] font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em] text-[#c4871a] bg-[#c4871a]/10 px-2 py-1">
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    "text-[11px] font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em] px-2 py-1",
                    user.isActive ? "text-green-500 bg-green-500/10" : "text-[#B63A2B] bg-[#B63A2B]/10",
                  )}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-[#B2AAA7] whitespace-nowrap">{formatDate(user.lastLoginAt)}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(user)} className="p-1.5 text-[#B2AAA7] hover:text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors" title="Editar usuario">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => onDelete(user)} className="p-1.5 text-[#B2AAA7] hover:text-[#B63A2B] hover:bg-[#B63A2B]/10 transition-colors" title="Eliminar usuario">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-[#c4871a]/5">
        {users.map((user) => (
          <div key={user.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar user={user} />
                <div className="min-w-0">
                  <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white truncate">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-[#5B5A59] truncate">@{user.username} · {user.email}</div>
                </div>
              </div>
              <span className={cn("text-[10px] font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em] px-2 py-1 flex-shrink-0", user.isActive ? "text-green-500 bg-green-500/10" : "text-[#B63A2B] bg-[#B63A2B]/10")}>{user.isActive ? "Activo" : "Inactivo"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#5B5A59] text-xs">Rol</span><div className="text-[#c4871a] font-['Rajdhani',sans-serif] font-semibold">{ROLE_LABELS[user.role]}</div></div>
              <div><span className="text-[#5B5A59] text-xs">Identificación</span><div className="text-[#B2AAA7]">{user.identificationNumber}</div></div>
              <div className="col-span-2"><span className="text-[#5B5A59] text-xs">Último acceso</span><div className="text-[#B2AAA7]">{formatDate(user.lastLoginAt)}</div></div>
            </div>
            <div className="flex items-center justify-end gap-1 pt-1 border-t border-[#c4871a]/5">
              <button onClick={() => onEdit(user)} className="px-3 py-1.5 text-xs text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]">Editar</button>
              <button onClick={() => onDelete(user)} className="px-3 py-1.5 text-xs text-[#B63A2B] hover:bg-[#B63A2B]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
