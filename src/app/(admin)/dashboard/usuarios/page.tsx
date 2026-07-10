"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DeleteUserModal } from "@/components/admin/users/DeleteUserModal";
import { UserFormModal } from "@/components/admin/users/UserFormModal";
import { UsersTable } from "@/components/admin/users/UsersTable";
import type { AdminUserItem } from "@/lib/types/user";

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);

  async function refreshUsers() {
    const res = await fetch("/api/dashboard/users");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Error al cargar usuarios");
    }
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/users");
        if (cancelled) return;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al cargar usuarios");
        }
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingUser(null);
    refreshUsers().catch((err) => toast.error(err instanceof Error ? err.message : "No se pudo actualizar la lista"));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/dashboard/users/${deletingUser.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar usuario");
      }
      toast.success("Usuario eliminado correctamente");
      setDeletingUser(null);
      await refreshUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el usuario");
    }
  };

  return (
    <AdminLayout title="Usuarios">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-['Rajdhani',sans-serif] text-[#B2AAA7] text-sm">
              Administra usuarios, roles, estado de acceso y credenciales del dashboard.
            </p>
            <p className="text-[#5B5A59] text-xs mt-1">
              Solo el rol administrador puede crear, editar o eliminar usuarios.
            </p>
          </div>
          <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c4871a] text-[#080706] font-heading font-bold text-sm uppercase tracking-[.06em] hover:bg-[#d6a244] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Crear usuario
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#c4871a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#171513] border border-[#c4871a]/12 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-[#5B5A59] mx-auto mb-4"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <p className="text-[#B2AAA7] font-['Rajdhani',sans-serif] text-sm">No hay usuarios registrados</p>
            <p className="text-[#5B5A59] text-xs mt-1">Crea tu primer usuario con el botón superior</p>
          </div>
        ) : (
          <UsersTable users={users} onEdit={handleEdit} onDelete={setDeletingUser} />
        )}
      </div>

      {formOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setFormOpen(false);
            setEditingUser(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingUser && (
        <DeleteUserModal user={deletingUser} onCancel={() => setDeletingUser(null)} onConfirm={handleDeleteConfirm} />
      )}
    </AdminLayout>
  );
}
