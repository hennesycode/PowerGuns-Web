"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  updatedAt: string;
  breadcrumbs?: Breadcrumb[];
};

type Breadcrumb = { id: string; name: string };
type ContextMenuState = { item: CertificateItem; x: number; y: number } | null;

function formatSize(size: number | null) {
  if (!size) return "--";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function CertificadosDccaeConsultaPage() {
  const router = useRouter();
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const fetchItems = useCallback(async (folderId = currentFolderId, query = debouncedSearch) => {
    setLoading(true);
    try {
      const trimmedQuery = query.trim();
      const params = new URLSearchParams();
      if (trimmedQuery) params.set("q", trimmedQuery);
      else if (folderId) params.set("parentId", folderId);
      const queryString = params.toString();
      const res = await fetch(`/api/certificados-dccae/items${queryString ? `?${queryString}` : ""}`);
      const data = await res.json();
      if (res.status === 401) {
        router.push("/certificados-dccae/login");
        return;
      }
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los certificados");
      setItems(data.items ?? []);
      setBreadcrumbs(data.breadcrumbs ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los certificados");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, debouncedSearch, router]);

  useEffect(() => { fetchItems(); }, [fetchItems]); // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

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
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentFolderId(folderId);
    fetchItems(folderId, "");
  };

  const openFile = (item: CertificateItem) => {
    if (!item.fileUrl) return;
    window.open(item.fileUrl, "_blank", "noopener,noreferrer");
  };

  const downloadFile = (item: CertificateItem) => {
    if (!item.fileUrl) return;
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.download = item.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const logout = async () => {
    await fetch("/api/certificados-dccae/auth/logout", { method: "POST" });
    router.push("/certificados-dccae/login");
  };

  const isSearching = debouncedSearch.length > 0;

  return (
    <main className="min-h-screen bg-[#050403] text-white">
      <header className="sticky top-0 z-40 border-b border-[#c4871a]/12 bg-[#080706]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#c4871a]/30 bg-[#0F0D0B] no-underline"><Image src="/logo.jpg" alt="Power Guns" width={44} height={44} className="h-full w-full object-contain" /></Link>
            <div>
              <p className="font-heading text-lg font-black uppercase tracking-[.08em] text-white">Certificados DCCAE</p>
              <p className="text-xs uppercase tracking-[.16em] text-[#5B5A59]">Consulta autorizada</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="border border-[#c4871a]/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7] no-underline transition-colors hover:border-[#c4871a]/50 hover:text-white">Inicio</Link>
            <button type="button" onClick={logout} className="bg-[#c4871a] px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.12em] text-[#080706] transition-colors hover:bg-[#d6a244]">Salir</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 rounded-sm border border-[#c4871a]/10 bg-[#0F0D0B] p-5 md:p-6">
          <p className="font-heading text-sm font-bold uppercase tracking-[.14em] text-[#c4871a]">Biblioteca documental</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B2AAA7]">Accede en modo solo lectura a carpetas y archivos autorizados. Puedes abrir documentos o descargarlos desde el menú contextual.</p>
        </div>

        <div className="border border-[#c4871a]/10 bg-[#0F0D0B]">
          <div className="border-b border-[#c4871a]/10 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button type="button" onClick={() => openFolder(null)} className="font-heading text-xs font-bold uppercase tracking-[.1em] text-[#c4871a] hover:text-[#d6a244]">Inicio</button>
                {isSearching ? (
                  <span className="flex items-center gap-2 text-[#B2AAA7]"><span className="text-[#5B5A59]">/</span> Resultados</span>
                ) : breadcrumbs.map((crumb) => (
                  <span key={crumb.id} className="flex items-center gap-2">
                    <span className="text-[#5B5A59]">/</span>
                    <button type="button" onClick={() => openFolder(crumb.id)} className="text-[#B2AAA7] hover:text-white">{crumb.name}</button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block w-full sm:w-80">
                  <span className="sr-only">Buscar carpetas y archivos</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5A59]"><SearchIcon /></span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar archivos o carpetas..."
                    className="w-full border border-[#c4871a]/15 bg-[#080706] py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-[#5B5A59] focus:border-[#c4871a]/50"
                  />
                </label>
                <div className="whitespace-nowrap text-xs uppercase tracking-[.12em] text-[#5B5A59]">Solo lectura</div>
              </div>
            </div>
          </div>

          <div className="min-h-[420px] p-4">
            {loading ? (
              <div className="flex justify-center py-24"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center border border-dashed border-[#c4871a]/15 bg-[#050403] p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#c4871a]/20 bg-[#c4871a]/10 text-[#c4871a]"><FolderIcon /></div>
                <p className="font-heading text-sm font-bold uppercase tracking-[.12em] text-white">{isSearching ? "Sin resultados" : "No hay documentos en esta carpeta"}</p>
                <p className="mt-2 max-w-md text-sm text-[#B2AAA7]">{isSearching ? "Intenta con otro nombre de archivo o carpeta." : "Vuelve a una carpeta anterior para continuar consultando."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {items.map((item) => (
                  <button key={item.id} type="button" onClick={() => item.type === "folder" ? openFolder(item.id) : openFile(item)} onContextMenu={(event) => { event.preventDefault(); setContextMenu({ item, x: event.clientX, y: event.clientY }); }} className="group min-h-[152px] border border-[#c4871a]/10 bg-[#171513] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c4871a]/40 hover:bg-[#1D1A16]">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center border border-[#c4871a]/25 bg-[#c4871a]/10 text-[#c4871a]">{item.type === "folder" ? <FolderIcon /> : <DocumentIcon />}</div>
                      <span className="text-[10px] uppercase tracking-[.16em] text-[#5B5A59]">{item.type === "folder" ? "Carpeta" : item.extension || "Archivo"}</span>
                    </div>
                    <p className="line-clamp-2 break-words font-heading text-sm font-bold uppercase tracking-[.04em] text-white group-hover:text-[#c4871a]">{item.name}</p>
                    {isSearching && item.breadcrumbs && item.breadcrumbs.length > 0 && <p className="mt-2 line-clamp-1 text-[11px] text-[#8A8581]">{item.breadcrumbs.map((crumb) => crumb.name).join(" / ")}</p>}
                    <div className="mt-3 space-y-1 text-xs text-[#5B5A59]"><p>{item.type === "file" ? formatSize(item.size) : "Abrir carpeta"}</p><p>{formatDate(item.updatedAt)}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {contextMenu && (
        <div className="fixed z-[80] w-52 overflow-hidden border border-[#c4871a]/20 bg-[#171513] shadow-2xl" style={{ left: Math.min(contextMenu.x, window.innerWidth - 220), top: Math.min(contextMenu.y, window.innerHeight - 160) }} onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => { const item = contextMenu.item; setContextMenu(null); if (item.type === "folder") openFolder(item.id); else openFile(item); }} className="block w-full px-4 py-3 text-left text-sm text-[#B2AAA7] transition-colors hover:bg-[#c4871a]/10 hover:text-white">{contextMenu.item.type === "folder" ? "Abrir carpeta" : "Ver archivo"}</button>
          {contextMenu.item.type === "file" && <button type="button" onClick={() => { const item = contextMenu.item; setContextMenu(null); downloadFile(item); }} className="block w-full px-4 py-3 text-left text-sm text-[#B2AAA7] transition-colors hover:bg-[#c4871a]/10 hover:text-white">Descargar</button>}
        </div>
      )}
    </main>
  );
}

function FolderIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7"><path d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
}

function DocumentIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="14" y2="17" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><circle cx="11" cy="11" r="7" /><line x1="16.65" y1="16.65" x2="21" y2="21" /></svg>;
}
