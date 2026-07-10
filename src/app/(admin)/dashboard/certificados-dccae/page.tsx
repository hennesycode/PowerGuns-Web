"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

type CertificateItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  fileUrl: string | null;
  mimeType: string | null;
  size: number | null;
  extension: string | null;
  createdAt: string;
  updatedAt: string;
};

type Breadcrumb = { id: string; name: string };
type ContextMenuState = { item: CertificateItem; x: number; y: number } | null;

const allowedAccept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp";

function formatSize(size: number | null) {
  if (!size) return "--";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function fileTone(item: CertificateItem) {
  const ext = item.extension?.toLowerCase();
  if (ext === "pdf") return "text-red-300 bg-red-500/10 border-red-500/20";
  if (["doc", "docx"].includes(ext || "")) return "text-blue-300 bg-blue-500/10 border-blue-500/20";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
  if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return "text-violet-300 bg-violet-500/10 border-violet-500/20";
  return "text-[#c4871a] bg-[#c4871a]/10 border-[#c4871a]/20";
}

export default function CertificadosDccaePage() {
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<CertificateItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CertificateItem | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async (folderId = currentFolderId) => {
    setLoading(true);
    try {
      const params = folderId ? `?parentId=${encodeURIComponent(folderId)}` : "";
      const res = await fetch(`/api/dashboard/certificados-dccae${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar el gestor");
      setItems(data.items ?? []);
      setBreadcrumbs(data.breadcrumbs ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el gestor");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => { fetchItems(); }, [fetchItems]); // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  const openFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    fetchItems(folderId);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (selected.length === 0) return;
    setUploading(true);
    try {
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) formData.append("parentId", currentFolderId);
        const res = await fetch("/api/dashboard/certificados-dccae", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `No se pudo subir ${file.name}`);
      }
      toast.success(selected.length === 1 ? "Archivo cargado correctamente" : "Archivos cargados correctamente");
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir el archivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const moveItem = async (itemId: string, parentId: string | null) => {
    try {
      const res = await fetch(`/api/dashboard/certificados-dccae/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo mover el elemento");
      toast.success("Elemento movido correctamente");
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo mover el elemento");
    }
  };

  const deleteItem = async () => {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/dashboard/certificados-dccae/${deletingItem.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar");
      toast.success(deletingItem.type === "folder" ? "Carpeta eliminada" : "Archivo eliminado");
      setDeletingItem(null);
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar");
    }
  };

  return (
    <AdminLayout title="Certificados DCCAE">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="max-w-2xl text-sm text-[#B2AAA7]">Gestor documental para carpetas, certificados, soportes e imágenes. Puedes abrir carpetas, crear subcarpetas, cargar archivos y mover elementos arrastrándolos.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setFolderModalOpen(true)} className="border border-[#c4871a]/40 px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#c4871a] transition-colors hover:bg-[#c4871a]/10">+ Crear carpeta</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-[#c4871a] px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#080706] transition-colors hover:bg-[#d6a244] disabled:opacity-60">{uploading ? "Cargando..." : "+ Agregar archivos"}</button>
            <input ref={fileInputRef} type="file" multiple accept={allowedAccept} className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
          </div>
        </div>

        <div className="border border-[#c4871a]/10 bg-[#0F0D0B]">
          <div className="flex flex-col gap-3 border-b border-[#c4871a]/10 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button type="button" onClick={() => openFolder(null)} className="font-heading text-xs font-bold uppercase tracking-[.1em] text-[#c4871a] hover:text-[#d6a244]">Inicio</button>
              {breadcrumbs.map((crumb) => (
                <span key={crumb.id} className="flex items-center gap-2">
                  <span className="text-[#5B5A59]">/</span>
                  <button type="button" onClick={() => openFolder(crumb.id)} className="text-[#B2AAA7] hover:text-white">{crumb.name}</button>
                </span>
              ))}
            </div>
            <div className="text-xs uppercase tracking-[.12em] text-[#5B5A59]">{items.length} elemento{items.length === 1 ? "" : "s"}</div>
          </div>

          <div
            className="min-h-[420px] p-4"
            onDragOver={(e) => { e.preventDefault(); setDragOverFolderId("root"); }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverFolderId(null);
              const draggedId = e.dataTransfer.getData("application/powerguns-item");
              if (draggedId) moveItem(draggedId, currentFolderId);
              else if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
            }}
          >
            {loading ? (
              <div className="flex justify-center py-24"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
            ) : items.length === 0 ? (
              <div className={`flex min-h-[320px] flex-col items-center justify-center border border-dashed p-8 text-center transition-colors ${dragOverFolderId === "root" ? "border-[#c4871a] bg-[#c4871a]/10" : "border-[#c4871a]/15 bg-[#050403]"}`}>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#c4871a]/20 bg-[#c4871a]/10 text-[#c4871a]"><FolderIcon /></div>
                <p className="font-heading text-sm font-bold uppercase tracking-[.12em] text-white">Carpeta vacía</p>
                <p className="mt-2 max-w-md text-sm text-[#B2AAA7]">Crea una carpeta, agrega archivos o arrastra documentos aquí para cargarlos en esta ubicación.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {items.map((item) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    dragOver={dragOverFolderId === item.id}
                    onOpen={() => {
                      if (item.type === "folder") openFolder(item.id);
                      else if (item.fileUrl) window.open(item.fileUrl, "_blank", "noopener,noreferrer");
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setContextMenu({ item, x: event.clientX, y: event.clientY });
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("application/powerguns-item", item.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => {
                      if (item.type !== "folder") return;
                      event.preventDefault();
                      setDragOverFolderId(item.id);
                    }}
                    onDragLeave={() => setDragOverFolderId(null)}
                    onDrop={(event) => {
                      if (item.type !== "folder") return;
                      event.preventDefault();
                      setDragOverFolderId(null);
                      const draggedId = event.dataTransfer.getData("application/powerguns-item");
                      if (draggedId && draggedId !== item.id) moveItem(draggedId, item.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 text-xs text-[#5B5A59] md:grid-cols-3">
          <InfoCard title="Formatos" text="PDF, Word, Excel, PowerPoint, TXT, CSV e imágenes." />
          <InfoCard title="Organización" text="Carpetas ilimitadas con subcarpetas y movimiento por arrastre." />
          <InfoCard title="Acciones" text="Clic derecho sobre archivos o carpetas para renombrar o eliminar." />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onOpen={() => {
            const item = contextMenu.item;
            setContextMenu(null);
            if (item.type === "folder") openFolder(item.id);
            else if (item.fileUrl) window.open(item.fileUrl, "_blank", "noopener,noreferrer");
          }}
          onRename={() => { setRenamingItem(contextMenu.item); setContextMenu(null); }}
          onDelete={() => { setDeletingItem(contextMenu.item); setContextMenu(null); }}
        />
      )}

      {folderModalOpen && <FolderModal parentId={currentFolderId} onClose={() => setFolderModalOpen(false)} onSaved={() => { setFolderModalOpen(false); fetchItems(); }} />}
      {renamingItem && <RenameModal item={renamingItem} onClose={() => setRenamingItem(null)} onSaved={() => { setRenamingItem(null); fetchItems(); }} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={deleteItem} />}
    </AdminLayout>
  );
}

function FileCard({ item, dragOver, onOpen, onContextMenu, onDragStart, onDragOver, onDragLeave, onDrop }: { item: CertificateItem; dragOver: boolean; onOpen: () => void; onContextMenu: (event: React.MouseEvent) => void; onDragStart: (event: React.DragEvent) => void; onDragOver: (event: React.DragEvent) => void; onDragLeave: () => void; onDrop: (event: React.DragEvent) => void }) {
  return (
    <button
      type="button"
      draggable
      onDoubleClick={onOpen}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group min-h-[152px] border bg-[#171513] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c4871a]/40 hover:bg-[#1D1A16] hover:shadow-[0_18px_45px_rgba(0,0,0,.28)] ${dragOver ? "scale-[1.02] border-[#c4871a] bg-[#c4871a]/10" : "border-[#c4871a]/10"}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center border ${item.type === "folder" ? "border-[#c4871a]/25 bg-[#c4871a]/10 text-[#c4871a]" : fileTone(item)}`}>{item.type === "folder" ? <FolderIcon /> : <DocumentIcon />}</div>
        <span className="text-[10px] uppercase tracking-[.16em] text-[#5B5A59]">{item.type === "folder" ? "Carpeta" : item.extension || "Archivo"}</span>
      </div>
      <p className="line-clamp-2 break-words font-heading text-sm font-bold uppercase tracking-[.04em] text-white group-hover:text-[#c4871a]">{item.name}</p>
      <div className="mt-3 space-y-1 text-xs text-[#5B5A59]">
        <p>{item.type === "file" ? formatSize(item.size) : "Abrir carpeta"}</p>
        <p>{formatDate(item.updatedAt)}</p>
      </div>
    </button>
  );
}

function ContextMenu({ state, onOpen, onRename, onDelete }: { state: NonNullable<ContextMenuState>; onOpen: () => void; onRename: () => void; onDelete: () => void }) {
  return (
    <div className="fixed z-[80] w-52 overflow-hidden border border-[#c4871a]/20 bg-[#171513] shadow-2xl" style={{ left: Math.min(state.x, window.innerWidth - 220), top: Math.min(state.y, window.innerHeight - 160) }} onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={onOpen} className="block w-full px-4 py-3 text-left text-sm text-[#B2AAA7] transition-colors hover:bg-[#c4871a]/10 hover:text-white">{state.item.type === "folder" ? "Abrir carpeta" : "Abrir archivo"}</button>
      <button type="button" onClick={onRename} className="block w-full px-4 py-3 text-left text-sm text-[#B2AAA7] transition-colors hover:bg-[#c4871a]/10 hover:text-white">Editar nombre</button>
      <button type="button" onClick={onDelete} className="block w-full px-4 py-3 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10">Eliminar</button>
    </div>
  );
}

function FolderModal({ parentId, onClose, onSaved }: { parentId: string | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!name.trim()) { toast.error("Nombre requerido"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/certificados-dccae", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, parentId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear la carpeta");
      toast.success("Carpeta creada correctamente");
      onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear la carpeta"); }
    finally { setSaving(false); }
  };
  return <NameModal title="Crear carpeta" value={name} onChange={setName} onClose={onClose} onSubmit={submit} saving={saving} action="Crear carpeta" />;
}

function RenameModal({ item, onClose, onSaved }: { item: CertificateItem; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item.name);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!name.trim()) { toast.error("Nombre requerido"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/certificados-dccae/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo renombrar");
      toast.success("Nombre actualizado correctamente");
      onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo renombrar"); }
    finally { setSaving(false); }
  };
  return <NameModal title="Editar nombre" value={name} onChange={setName} onClose={onClose} onSubmit={submit} saving={saving} action="Guardar cambios" />;
}

function NameModal({ title, value, onChange, onClose, onSubmit, saving, action }: { title: string; value: string; onChange: (value: string) => void; onClose: () => void; onSubmit: () => void; saving: boolean; action: string }) {
  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-6 font-heading text-xl font-bold uppercase tracking-[.04em] text-white">{title}</h2>
      <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7]">Nombre</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-[#c4871a]/20 bg-[#050403] px-3 py-3 text-sm text-white placeholder-[#5E5A57] transition-colors focus:border-[#c4871a]/60 focus:outline-none" autoFocus maxLength={120} />
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="border border-[#c4871a]/20 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/50 hover:text-white">Cancelar</button>
        <button type="button" onClick={onSubmit} disabled={saving} className="bg-[#c4871a] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#080706] transition-colors hover:bg-[#d6a244] disabled:opacity-60">{saving ? "Guardando..." : action}</button>
      </div>
    </ModalOverlay>
  );
}

function ConfirmDeleteModal({ item, onCancel, onConfirm }: { item: CertificateItem; onCancel: () => void; onConfirm: () => void }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <h2 className="font-heading text-xl font-bold uppercase tracking-[.04em] text-white">Eliminar {item.type === "folder" ? "carpeta" : "archivo"}</h2>
      <p className="mt-4 text-sm text-[#B2AAA7]">Esta acción eliminará <span className="text-white">{item.name}</span>{item.type === "folder" ? " y todo su contenido interno" : ""}. No se puede deshacer.</p>
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="border border-[#c4871a]/20 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7] transition-colors hover:border-[#c4871a]/50 hover:text-white">Cancelar</button>
        <button type="button" onClick={onConfirm} className="bg-red-500 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-red-400">Eliminar</button>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-lg border border-[#c4871a]/20 bg-[#171513] p-6 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return <div className="border border-[#c4871a]/10 bg-[#0F0D0B] p-4"><p className="font-heading text-xs font-bold uppercase tracking-[.12em] text-[#c4871a]">{title}</p><p className="mt-2 leading-relaxed">{text}</p></div>;
}

function FolderIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7"><path d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
}

function DocumentIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="14" y2="17" /></svg>;
}
