"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ServicesTable } from "@/components/admin/services/ServicesTable";
import { ServiceFormModal } from "@/components/admin/services/ServiceFormModal";
import { DeleteServiceModal } from "@/components/admin/services/DeleteServiceModal";
import { toast } from "sonner";
import type { ServiceItem } from "@/lib/types/service";

export default function ServiciosPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [featuredTogglingIds, setFeaturedTogglingIds] = useState<Set<number>>(new Set());

  async function refreshServices() {
    const res = await fetch("/api/dashboard/services");
    if (!res.ok) return;
    const data = await res.json();
    setServices(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/services");
        if (cancelled) return;
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setServices(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleStatus = useCallback(async (service: ServiceItem) => {
    const newActive = !service.isActive;
    setTogglingIds((prev) => new Set(prev).add(service.id));
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isActive: newActive } : s)),
    );
    try {
      const res = await fetch(
        `/api/dashboard/services/${service.id}/status`,
        { method: "PATCH" },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar estado");
      }
      toast.success(
        newActive
          ? "Servicio activado correctamente"
          : "Servicio desactivado correctamente",
      );
    } catch (err) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, isActive: service.isActive } : s,
        ),
      );
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del servicio. Intenta nuevamente.",
      );
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
    }
  }, []);

  const handleToggleFeatured = useCallback(async (service: ServiceItem) => {
    const newFeatured = !service.isFeatured;
    setFeaturedTogglingIds((prev) => new Set(prev).add(service.id));
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, isFeatured: newFeatured } : s,
      ),
    );
    try {
      const res = await fetch(
        `/api/dashboard/services/${service.id}/featured`,
        { method: "PATCH" },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar destacado");
      }
      toast.success(
        newFeatured
          ? "Servicio marcado como destacado"
          : "Servicio quitado de destacados",
      );
    } catch (err) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id
            ? { ...s, isFeatured: service.isFeatured }
            : s,
        ),
      );
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el destacado del servicio. Intenta nuevamente.",
      );
    } finally {
      setFeaturedTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
    }
  }, []);

  const handleCreate = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleDelete = (service: ServiceItem) => {
    setDeletingService(service);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingService(null);
    refreshServices();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    try {
      const res = await fetch(`/api/dashboard/services/${deletingService.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      toast.success("Servicio eliminado correctamente");
      setDeletingService(null);
      refreshServices();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el servicio",
      );
    }
  };

  return (
    <AdminLayout title="Servicios">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-['Rajdhani',sans-serif] text-[#B2AAA7] text-sm">
            Gestiona los servicios de entrenamiento del polígono
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c4871a] text-[#080706] font-heading font-bold text-sm uppercase tracking-[.06em] hover:bg-[#d6a244] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear servicio
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#c4871a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-[#171513] border border-[#c4871a]/12 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-[#5B5A59] mx-auto mb-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <p className="text-[#B2AAA7] font-['Rajdhani',sans-serif] text-sm">No hay servicios disponibles</p>
            <p className="text-[#5B5A59] text-xs mt-1">Crea tu primer servicio con el botón superior</p>
          </div>
        ) : (
          <ServicesTable
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            togglingIds={togglingIds}
            onToggleFeatured={handleToggleFeatured}
            featuredTogglingIds={featuredTogglingIds}
          />
        )}
      </div>

      {formOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={() => {
            setFormOpen(false);
            setEditingService(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingService && (
        <DeleteServiceModal
          serviceName={deletingService.name}
          onCancel={() => setDeletingService(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </AdminLayout>
  );
}
