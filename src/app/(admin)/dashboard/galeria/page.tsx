"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

type GalleryItem = {
  id: string;
  name: string;
  mediaType: "image" | "video";
  fileUrl: string;
  fileKey: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function GaleriaDashboardPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshGallery = useCallback(async () => {
    const res = await fetch("/api/dashboard/gallery");
    if (!res.ok) throw new Error("No se pudo cargar la galería");
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/gallery")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la galería");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => toast.error("No se pudo cargar la galería"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshGallery]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    setUploading(true);
    try {
      const res = await fetch("/api/dashboard/gallery", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron subir los archivos");
      toast.success("Galería actualizada correctamente");
      await refreshGallery();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron subir los archivos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveName = async (item: GalleryItem) => {
    const name = editingName.trim();
    if (name.length < 2) {
      toast.error("Ingresa un nombre válido");
      return;
    }
    const previous = items;
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, name } : row)));
    setEditingId(null);
    try {
      const res = await fetch(`/api/dashboard/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el nombre");
      toast.success("Nombre actualizado");
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el nombre");
    }
  };

  const deleteItem = async (item: GalleryItem) => {
    if (!window.confirm(`¿Eliminar "${item.name}" de la galería?`)) return;
    const previous = items;
    setItems((current) => current.filter((row) => row.id !== item.id));
    try {
      const res = await fetch(`/api/dashboard/gallery/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar el archivo");
      toast.success("Archivo eliminado");
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el archivo");
    }
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const previous = items;
    setItems(reordered);
    try {
      const res = await fetch("/api/dashboard/gallery/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((item) => item.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el orden");
      setItems(data.items ?? reordered);
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el orden");
    }
  };

  return (
    <AdminLayout title="Galería">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-['Rajdhani',sans-serif] text-sm text-[#B2AAA7]">
              Sube imágenes y videos para la galería pública. Las imágenes se convierten a WebP y los MP4 se optimizan antes de guardar en R2.
            </p>
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,video/mp4" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files)} />
            <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center bg-[#c4871a] px-4 py-3 font-heading text-sm font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244] disabled:opacity-60">
              {uploading ? "Procesando..." : "Subir archivos"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Archivos" value={String(items.length)} />
          <MetricCard label="Imágenes" value={String(items.filter((item) => item.mediaType === "image").length)} />
          <MetricCard label="Videos" value={String(items.filter((item) => item.mediaType === "video").length)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="border border-[#c4871a]/12 bg-[#171513] p-12 text-center text-sm text-[#B2AAA7]">Aún no hay archivos en la galería.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <article key={item.id} className="overflow-hidden border border-[#c4871a]/12 bg-[#0F0D0B]">
                <div className="relative aspect-[4/3] bg-[#080706]">
                  {item.mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.fileUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <video src={item.fileUrl} className="h-full w-full object-cover" muted controls preload="metadata" />
                  )}
                  <span className="absolute left-3 top-3 bg-[#080706]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#c4871a]">{item.mediaType === "image" ? "Imagen" : "Video"}</span>
                  <span className="absolute right-3 top-3 bg-[#080706]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#B2AAA7]">#{index + 1}</span>
                </div>
                <div className="space-y-4 p-4">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="min-w-0 flex-1 border border-[#3C3A37] bg-[#080706] px-3 py-2 text-sm text-white outline-none focus:border-[#c4871a]/60" />
                      <button type="button" onClick={() => saveName(item)} className="bg-[#c4871a] px-3 py-2 text-xs font-bold uppercase text-[#080706]">Guardar</button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-heading text-base font-bold uppercase text-white">{item.name}</h3>
                      <p className="mt-1 text-xs text-[#5B5A59]">{formatSize(item.size)} · {item.mimeType}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={index === 0} onClick={() => moveItem(index, -1)} className="border border-[#3C3A37] px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white disabled:opacity-40">Subir</button>
                    <button type="button" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} className="border border-[#3C3A37] px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white disabled:opacity-40">Bajar</button>
                    <button type="button" onClick={() => { setEditingId(item.id); setEditingName(item.name); }} className="border border-[#c4871a]/35 px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10">Editar</button>
                    <button type="button" onClick={() => deleteItem(item)} className="border border-[#B63A2B]/35 px-3 py-1.5 text-[10px] uppercase tracking-[.08em] text-[#B63A2B] hover:bg-[#B63A2B]/10">Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#c4871a]/12 bg-[#171513] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#5B5A59]">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold uppercase text-white">{value}</p>
    </div>
  );
}
