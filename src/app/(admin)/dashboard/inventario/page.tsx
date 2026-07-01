"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

type Category = { id: string; name: string; slug: string; description: string | null; isActive: boolean; sortOrder: number; parentId: string | null; productCount: number; children: { id: string; name: string; productCount: number; parentId: string | null }[] };
type FlatCategory = { id: string; name: string; parentId: string | null };
type Product = { id: string; name: string; slug: string; sku: string | null; description: string | null; quantity: number; minStock: number; location: string | null; isActive: boolean; imageUrl: string | null; categoryId: string; categoryName: string; updatedAt: string };
type HistoryEntry = { id: string; action: string; field: string | null; oldValue: string | null; newValue: string | null; note: string | null; changedByName: string | null; createdAt: string };

function formatDate(iso: string) { return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }); }

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCats, setFlatCats] = useState<FlatCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoriesListOpen, setCategoriesListOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (stockFilter !== "all") params.set("stock", stockFilter);
    return `/api/dashboard/inventory/products?${params.toString()}`;
  }, [query, selectedCategoryId, statusFilter, stockFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, flatRes] = await Promise.all([
        fetch(buildUrl()),
        fetch("/api/dashboard/inventory/categories"),
        fetch("/api/dashboard/inventory/categories?mode=select"),
      ]);
      const [prodData, catData, flatData] = await Promise.all([prodRes.json(), catRes.json(), flatRes.json()]);
      setProducts(prodData.products ?? []);
      setCategories(catData.categories ?? []);
      setFlatCats(flatData.categories ?? []);
    } catch { toast.error("No se pudieron cargar los datos"); }
    finally { setLoading(false); }
  }, [buildUrl]);

  useEffect(() => { fetchData(); }, [fetchData]); // eslint-disable-line react-hooks/set-state-in-effect

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(), 350);
  };

  const handleCategoryFilter = (id: string) => {
    setSelectedCategoryId(id);
    setTimeout(() => fetchData(), 0);
  };

  const openCreateCat = () => { setEditingCategory(null); setCategoryFormOpen(true); };

  return (
    <AdminLayout title="Inventario">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase text-white">Inventario</h1>
            <p className="text-sm text-[#B2AAA7]">Gestiona categorías, productos, existencias e historial de movimientos.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={openCreateCat} className="border border-[#c4871a]/40 px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors">+ Crear categoría</button>
            <button type="button" onClick={() => { setEditingProduct(null); setProductFormOpen(true); }} className="bg-[#c4871a] px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] text-[#080706] hover:bg-[#d6a244] transition-colors">+ Crear Producto</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <div className="hidden lg:block">
            <CategorySidebar categories={categories} selectedId={selectedCategoryId} onSelect={handleCategoryFilter} onManage={() => setCategoriesListOpen(true)} />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por nombre, SKU o ubicación..." className="flex-1 border border-[#3C3A37] bg-[#0F0D0B] px-3 py-2.5 text-sm text-white placeholder-[#5B5A59] focus:border-[#c4871a]/60 focus:outline-none" />
              <div className="flex gap-2 lg:hidden">
                <CategoryDropdown cats={categories} selectedId={selectedCategoryId} onChange={handleCategoryFilter} />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); handleSearch(query); }} className="border border-[#3C3A37] bg-[#0F0D0B] px-3 py-2.5 text-sm text-white focus:border-[#c4871a]/60 focus:outline-none">
                <option value="all">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option>
              </select>
              <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); handleSearch(query); }} className="border border-[#3C3A37] bg-[#0F0D0B] px-3 py-2.5 text-sm text-white focus:border-[#c4871a]/60 focus:outline-none">
                <option value="all">Todo stock</option><option value="low">Bajo stock</option><option value="none">Sin stock</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div>
            ) : products.length === 0 ? (
              <div className="border border-[#c4871a]/10 bg-[#0F0D0B] p-12 text-center text-sm text-[#B2AAA7]">
                No se encontraron productos. {query && <button type="button" onClick={() => { setQuery(""); fetchData(); }} className="ml-2 text-[#c4871a] hover:underline">Limpiar búsqueda</button>}
              </div>
            ) : (
              <ProductsTable products={products} onEdit={(p) => { setEditingProduct(p); setProductFormOpen(true); }} onDelete={setDeletingProduct} onHistory={setHistoryProduct} />
            )}
          </div>
        </div>
      </div>

      {productFormOpen && <ProductFormModal product={editingProduct} allCats={flatCats} onClose={() => { setProductFormOpen(false); setEditingProduct(null); }} onSaved={() => { setProductFormOpen(false); setEditingProduct(null); fetchData(); }} />}
      {deletingProduct && <DeleteProductModal product={deletingProduct} onCancel={() => setDeletingProduct(null)} onConfirm={async () => { if (!deletingProduct) return; await fetch(`/api/dashboard/inventory/products/${deletingProduct.id}`, { method: "DELETE" }); toast.success("Producto eliminado"); setDeletingProduct(null); fetchData(); }} />}
      {categoryFormOpen && <CategoryFormModal category={editingCategory} allCats={flatCats} onClose={() => { setCategoryFormOpen(false); setEditingCategory(null); }} onSaved={() => { setCategoryFormOpen(false); setEditingCategory(null); fetchData(); }} />}
      {categoriesListOpen && <CategoriesListModal categories={categories} onClose={() => setCategoriesListOpen(false)} onEdit={(c) => { setEditingCategory(c); setCategoriesListOpen(false); setCategoryFormOpen(true); }} onDelete={setDeletingCategory} onNew={() => { setCategoriesListOpen(false); openCreateCat(); }} />}
      {deletingCategory && <DeleteCategoryModal category={deletingCategory} onCancel={() => setDeletingCategory(null)} onConfirm={async () => { const res = await fetch(`/api/dashboard/inventory/categories/${deletingCategory.id}`, { method: "DELETE" }); const data = await res.json(); if (!res.ok) { toast.error(data.error || "No se pudo eliminar"); } else { toast.success("Categoría eliminada"); } setDeletingCategory(null); fetchData(); }} />}
      {historyProduct && <ProductHistoryModal productId={historyProduct.id} productName={historyProduct.name} onClose={() => setHistoryProduct(null)} />}
    </AdminLayout>
  );
}

function CategorySidebar({ categories, selectedId, onSelect, onManage }: { categories: Category[]; selectedId: string; onSelect: (id: string) => void; onManage: () => void }) {
  return (
    <div className="border border-[#c4871a]/10 bg-[#0F0D0B] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7]">Categorías</h3>
        <button type="button" onClick={onManage} className="text-[10px] text-[#5B5A59] hover:text-[#c4871a] uppercase tracking-[.1em] transition-colors">Admin</button>
      </div>
      <div className="space-y-0.5">
        <button type="button" onClick={() => onSelect("")} className={`block w-full px-3 py-2 text-left text-sm transition-colors ${!selectedId ? "border-l-2 border-[#c4871a] bg-[#c4871a]/10 text-[#c4871a]" : "text-[#B2AAA7] hover:text-white hover:bg-[#c4871a]/5"}`}>Todas</button>
        {categories.map((cat) => (
          <div key={cat.id}>
            <button type="button" onClick={() => onSelect(cat.id)} className={`block w-full px-3 py-2 text-left text-sm transition-colors ${selectedId === cat.id ? "border-l-2 border-[#c4871a] bg-[#c4871a]/10 text-[#c4871a]" : "text-[#B2AAA7] hover:text-white hover:bg-[#c4871a]/5"}`}>{cat.name} ({cat.productCount})</button>
            {cat.children.map((child) => (
              <button key={child.id} type="button" onClick={() => onSelect(child.id)} className={`block w-full py-1.5 pl-6 pr-3 text-left text-sm transition-colors ${selectedId === child.id ? "border-l-2 border-[#c4871a] bg-[#c4871a]/10 text-[#c4871a]" : "text-[#5B5A59] hover:text-[#B2AAA7]"}`}>└ {child.name} ({child.productCount})</button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryDropdown({ cats, selectedId, onChange }: { cats: Category[]; selectedId: string; onChange: (id: string) => void }) {
  return (
    <select value={selectedId} onChange={(e) => onChange(e.target.value)} className="border border-[#3C3A37] bg-[#0F0D0B] px-3 py-2.5 text-sm text-white focus:border-[#c4871a]/60 focus:outline-none">
      <option value="">Todas</option>
      {cats.map((c) => (<React.Fragment key={c.id}>{c.children.length === 0 ? <option value={c.id}>{c.name}</option> : <optgroup label={c.name}>{c.children.map((ch) => <option key={ch.id} value={ch.id}>└ {ch.name}</option>)}</optgroup>}</React.Fragment>))}
    </select>
  );
}

import React from "react";

function SearchableSelect({ options, value, onChange, placeholder }: { options: FlatCategory[]; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = options.filter((o) => o.name.toLowerCase().includes(s.toLowerCase()));
  const sel = options.find((o) => o.id === value);
  const parents = filtered.filter((o) => !o.parentId);
  const children = filtered.filter((o) => o.parentId);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="w-full border border-[#c4871a]/20 bg-[#050403] px-3 py-3 text-left text-sm text-white focus:border-[#c4871a]/60 focus:outline-none transition-colors">{sel ? sel.name : <span className="text-[#5E5A57]">{placeholder}</span>}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B5A59] transition-transform ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full border border-[#c4871a]/15 bg-[#171513] shadow-2xl max-h-56 overflow-y-auto">
          <input type="text" value={s} onChange={(e) => setS(e.target.value)} className="sticky top-0 w-full border-b border-[#c4871a]/10 bg-[#0F0D0B] px-3 py-2.5 text-sm text-white placeholder-[#5E5A57] focus:outline-none" placeholder="Buscar..." autoFocus />
          {parents.length === 0 && children.length === 0 ? <p className="px-3 py-4 text-xs text-[#5B5A59] text-center">No se encontraron categorías</p> : (
            <>
              {parents.map((o) => (
                <button key={o.id} type="button" onClick={() => { onChange(o.id); setOpen(false); setS(""); }} className={`block w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#c4871a]/10 ${o.id === value ? "text-[#c4871a] bg-[#c4871a]/5" : "text-[#B2AAA7]"}`}>{o.name}</button>
              ))}
              {children.map((o) => (
                <button key={o.id} type="button" onClick={() => { onChange(o.id); setOpen(false); setS(""); }} className={`block w-full py-2.5 pl-6 pr-3 text-left text-sm transition-colors hover:bg-[#c4871a]/10 ${o.id === value ? "text-[#c4871a] bg-[#c4871a]/5" : "text-[#5B5A59]"}`}>└ {o.name}</button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryFormModal({ category, allCats, onClose, onSaved }: { category: Category | null; allCats: FlatCategory[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [desc, setDesc] = useState(category?.description ?? "");
  const [type, setType] = useState<"parent" | "child">(category?.parentId ? "child" : "parent");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
  const [saving, setSaving] = useState(false);
  const parentOptions = allCats.filter((c) => c.id !== category?.id && !c.parentId);

  const inputClass = "w-full border border-[#c4871a]/20 bg-[#050403] px-3 py-3 text-sm text-white placeholder-[#5E5A57] focus:border-[#c4871a]/60 focus:bg-[#0B0A08] focus:outline-none transition-colors";
  const submit = async () => {
    if (!name.trim()) { toast.error("Nombre requerido"); return; }
    if (type === "child" && !parentId) { toast.error("Selecciona una categoría padre"); return; }
    setSaving(true);
    try {
      const body = { name, description: desc || null, isActive, sortOrder: Number(sortOrder), type, parentId: type === "child" ? parentId : null };
      const res = await fetch(category ? `/api/dashboard/inventory/categories/${category.id}` : "/api/dashboard/inventory/categories", {
        method: category ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      toast.success(category ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
      onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar"); }
    finally { setSaving(false); }
  };

  return <ModalOverlay onClose={onClose}>
    <h2 className="font-heading text-xl font-bold uppercase tracking-[.04em] text-white mb-6">{category ? "Editar Categoría" : "Crear Categoría"}</h2>
    <div className="space-y-5">
      <Field label="Nombre *"><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nombre de la categoría" /></Field>
      <Field label="Descripción"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} className={`${inputClass} min-h-[100px] resize-none`} placeholder="Descripción opcional" /></Field>
      <Field label="Tipo de categoría">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setType("parent")} className={`border px-4 py-3 text-center text-sm font-bold uppercase tracking-[.1em] transition-all ${type === "parent" ? "border-[#c4871a] bg-[#c4871a]/15 text-[#c4871a] shadow-[0_0_20px_rgba(196,135,26,.1)]" : "border-[#c4871a]/20 bg-[#050403] text-[#B2AAA7] hover:border-[#c4871a]/40 hover:text-[#c4871a]"}`}>Principal</button>
          <button type="button" onClick={() => setType("child")} className={`border px-4 py-3 text-center text-sm font-bold uppercase tracking-[.1em] transition-all ${type === "child" ? "border-[#c4871a] bg-[#c4871a]/15 text-[#c4871a] shadow-[0_0_20px_rgba(196,135,26,.1)]" : "border-[#c4871a]/20 bg-[#050403] text-[#B2AAA7] hover:border-[#c4871a]/40 hover:text-[#c4871a]"}`}>Subcategoría</button>
        </div>
      </Field>
      {type === "child" && (
        <Field label="Categoría padre *"><SearchableSelect options={parentOptions} value={parentId} onChange={setParentId} placeholder="Seleccionar categoría padre..." /></Field>
      )}
      <Field label="Configuración">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Orden"><input type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} /></Field>
          <Field label="Estado"><select value={isActive ? "true" : "false"} onChange={(e) => setIsActive(e.target.value === "true")} className={inputClass}><option value="true">Activa</option><option value="false">Inactiva</option></select></Field>
        </div>
      </Field>
    </div>
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} className="w-full border border-[#c4871a]/20 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white transition-all sm:w-auto">Cancelar</button>
      <button type="button" onClick={submit} disabled={saving} className="w-full bg-[#c4871a] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#080706] hover:bg-[#d6a244] transition-all disabled:opacity-60 sm:w-auto">{saving ? "Guardando..." : "Guardar categoría"}</button>
    </div>
  </ModalOverlay>;
}

function CategoriesListModal({ categories, onClose, onEdit, onDelete, onNew }: { categories: Category[]; onClose: () => void; onEdit: (c: Category) => void; onDelete: (c: Category) => void; onNew: () => void }) {
  return <ModalOverlay onClose={onClose}>
    <div className="mb-5 flex items-center justify-between">
      <h2 className="font-heading text-xl font-bold uppercase tracking-[.04em] text-white">Administrar Categorías</h2>
      <button type="button" onClick={onNew} className="bg-[#c4871a] px-4 py-2.5 text-xs font-bold uppercase tracking-[.1em] text-[#080706] hover:bg-[#d6a244] transition-colors">+ Nueva</button>
    </div>
    <div className="max-h-[60vh] overflow-y-auto space-y-1.5">
      {categories.map((c) => (
        <div key={c.id}>
          <div className="flex items-center justify-between border border-[#c4871a]/10 bg-[#0a0908] px-4 py-3 hover:border-[#c4871a]/25 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-semibold text-white">{c.name}</span>
              <span className="shrink-0 rounded border border-[#c4871a]/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-[#c4871a]">Padre</span>
              <span className="text-[11px] text-[#5B5A59]">{c.productCount} prod.</span>
            </div>
            <div className="flex gap-2 shrink-0 ml-3">
              <button type="button" onClick={() => onEdit(c)} className="text-[#5B5A59] hover:text-[#c4871a] transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
              <button type="button" onClick={() => onDelete(c)} className="text-[#5B5A59] hover:text-[#B63A2B] transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
            </div>
          </div>
          {c.children.map((child) => (
            <div key={child.id} className="ml-5 flex items-center justify-between border border-l-2 border-l-[#c4871a]/20 border-[#c4871a]/10 border-t-0 bg-[#0a0908] px-4 py-3 hover:border-[#c4871a]/25 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate text-[#B2AAA7]">└ {child.name}</span>
                <span className="shrink-0 rounded border border-[#c4871a]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-[#5B5A59]">Hija</span>
                <span className="text-[11px] text-[#5B5A59]">{child.productCount} prod.</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </ModalOverlay>;
}

function ProductFormModal({ product, allCats, onClose, onSaved }: { product: Product | null; allCats: FlatCategory[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [quantity, setQuantity] = useState(String(product?.quantity ?? 0));
  const [minStock, setMinStock] = useState(String(product?.minStock ?? 0));
  const [location, setLocation] = useState(product?.location ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);
  const inp = "w-full border border-[#c4871a]/20 bg-[#050403] px-3 py-3 text-sm text-white placeholder-[#5E5A57] focus:border-[#c4871a]/60 focus:bg-[#0B0A08] focus:outline-none transition-colors";

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) { toast.error("Solo JPG, PNG o WebP"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!name.trim()) { toast.error("Nombre requerido"); return; }
    if (!categoryId) { toast.error("Selecciona una categoría"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("payload", JSON.stringify({ name, sku: sku || null, categoryId, quantity: Number(quantity), minStock: Number(minStock), location: location || null, description: desc || null, isActive }));
      if (imageFile) fd.append("image", imageFile);
      const url = product ? `/api/dashboard/inventory/products/${product.id}` : "/api/dashboard/inventory/products";
      const res = await fetch(url, { method: product ? "PUT" : "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      toast.success(product ? "Producto actualizado correctamente" : "Producto creado correctamente");
      onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar"); }
    finally { setSaving(false); }
  };

  return <ModalOverlay onClose={onClose}><div className="max-h-[90vh] overflow-y-auto"><h2 className="font-heading text-xl font-bold uppercase text-white mb-5">{product ? "Editar Producto" : "Crear Producto"}</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre *"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} placeholder="Nombre del producto" /></Field>
      <Field label="SKU"><input value={sku} onChange={(e) => setSku(e.target.value)} className={inp} /></Field>
      <Field label="Categoría *"><SearchableSelect options={allCats} value={categoryId} onChange={setCategoryId} placeholder="Seleccionar categoría..." /></Field>
      <Field label="Ubicación"><input value={location} onChange={(e) => setLocation(e.target.value)} className={inp} /></Field>
      <Field label="Cantidad"><input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inp} /></Field>
      <Field label="Stock Mínimo"><input type="number" min={0} value={minStock} onChange={(e) => setMinStock(e.target.value)} className={inp} /></Field>
    </div>
    <Field label="Descripción / Notas" className="mt-4"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} className={`${inp} min-h-[100px] resize-none`} /></Field>
    <div className="mt-4 flex items-center gap-3">
      <Field label="Estado"><select value={isActive ? "true" : "false"} onChange={(e) => setIsActive(e.target.value === "true")} className={inp}><option value="true">Activo</option><option value="false">Inactivo</option></select></Field>
      <div className="self-end"><label className={`inline-block px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-[.08em] cursor-pointer transition-colors ${imagePreview ? "border border-green-500/40 text-green-400" : "border border-[#c4871a]/40 text-[#c4871a] hover:bg-[#c4871a]/10"}`}>📷 Imagen<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" /></label></div>
      {imagePreview && <img src={imagePreview} alt="Vista previa" className="h-10 w-10 border border-[#c4871a]/10 bg-[#080706] object-cover" />}
    </div>
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="w-full border border-[#c4871a]/20 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white transition-all sm:w-auto">Cancelar</button><button type="button" onClick={submit} disabled={saving} className="w-full bg-[#c4871a] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#080706] hover:bg-[#d6a244] transition-all disabled:opacity-60 sm:w-auto">{saving ? "Guardando..." : "Guardar"}</button></div>
  </div></ModalOverlay>;
}

function DeleteProductModal({ product, onCancel, onConfirm }: { product: Product; onCancel: () => void; onConfirm: () => void }) {
  return <ModalOverlay onClose={onCancel}>
    <h2 className="font-heading text-lg font-bold uppercase tracking-[.04em] text-white mb-3">¿Seguro que deseas eliminar este producto?</h2>
    <p className="text-sm text-[#B2AAA7] mb-1">{product.name}</p>
    <p className="text-xs text-[#B63A2B] mb-6">Esta acción no se puede deshacer. El producto se desactivará.</p>
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="w-full border border-[#c4871a]/20 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white transition-all sm:w-auto">Cancelar</button>
      <button type="button" onClick={onConfirm} className="w-full bg-[#B63A2B] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-[#c94a3a] transition-all sm:w-auto">Eliminar</button>
    </div>
  </ModalOverlay>;
}

function DeleteCategoryModal({ category, onCancel, onConfirm }: { category: Category; onCancel: () => void; onConfirm: () => void }) {
  const hasChildren = category.children.length > 0;
  return <ModalOverlay onClose={onCancel}>
    <h2 className="font-heading text-lg font-bold uppercase tracking-[.04em] text-white mb-3">¿Eliminar categoría?</h2>
    <p className="text-sm text-[#B2AAA7] mb-1">{category.name}</p>
    {hasChildren && <p className="text-xs text-[#B63A2B] mb-5">No puedes eliminar esta categoría porque tiene subcategorías asociadas.</p>}
    {category.productCount > 0 && !hasChildren && <p className="text-xs text-[#B63A2B] mb-5">No puedes eliminar esta categoría porque tiene productos asociados.</p>}
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="w-full border border-[#c4871a]/20 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-[#B2AAA7] hover:border-[#c4871a]/50 hover:text-white transition-all sm:w-auto">Cancelar</button>
      {(!hasChildren && category.productCount === 0) && <button type="button" onClick={onConfirm} className="w-full bg-[#B63A2B] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-[#c94a3a] transition-all sm:w-auto">Eliminar</button>}
    </div>
  </ModalOverlay>;
}

function ProductHistoryModal({ productId, productName, onClose }: { productId: string; productName: string; onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(`/api/dashboard/inventory/products/${productId}/history`).then((r) => r.json()).then((d) => setEntries(d.history ?? [])).finally(() => setLoading(false)); }, [productId]);
  return <ModalOverlay onClose={onClose}><div className="max-h-[80vh] overflow-y-auto"><h2 className="font-heading text-xl font-bold uppercase text-white mb-1">Historial</h2><p className="text-xs text-[#5B5A59] mb-5">{productName}</p>
    {loading ? <div className="flex justify-center py-8"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c4871a] border-t-transparent" /></div> : entries.length === 0 ? <p className="text-sm text-[#B2AAA7]">Sin cambios registrados.</p> : (
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="border border-[#3C3A37] bg-[#080706] p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[#5B5A59]"><span>{formatDate(e.createdAt)}</span><span>{e.changedByName}</span></div>
            <p className="mt-1 font-semibold text-[#c4871a] uppercase">{e.action === "created" ? "Producto creado" : e.action === "deleted" ? "Producto desactivado" : `${e.field} modificado`}</p>
            {e.oldValue && e.newValue && e.oldValue !== "undefined" && <p className="mt-1"><span className="text-[#B63A2B] line-through mr-2">{e.oldValue}</span><span className="text-green-400">{e.newValue}</span></p>}
            {e.note && <p className="mt-1 text-[#5B5A59]">{e.note}</p>}
          </div>
        ))}
      </div>
    )}
  </div></ModalOverlay>;
}

function ProductsTable({ products, onEdit, onDelete, onHistory }: { products: Product[]; onEdit: (p: Product) => void; onDelete: (p: Product) => void; onHistory: (p: Product) => void }) {
  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1000px] text-left text-sm border border-[#c4871a]/10">
          <thead className="bg-[#080706] text-[10px] uppercase tracking-[.12em] text-[#5B5A59]"><tr>{["Imagen","Producto","Categoría","Cantidad","Stock Mín.","Ubicación","Estado","Actualizado","Acciones"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#c4871a]/8">
            {products.map((p) => (
              <tr key={p.id} className="text-[#B2AAA7] hover:bg-[#c4871a]/5 transition-colors">
                <td className="px-4 py-3">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-10 w-10 object-cover border border-[#c4871a]/10 bg-[#080706]" loading="lazy" /> : <span className="flex h-10 w-10 items-center justify-center border border-[#3C3A37] bg-[#080706] text-xs text-[#5B5A59]">—</span>}</td>
                <td className="px-4 py-3 font-semibold text-white">{p.name}{p.sku && <span className="ml-2 text-xs text-[#5B5A59]">{p.sku}</span>}</td>
                <td className="px-4 py-3">{p.categoryName}</td>
                <td className="px-4 py-3"><span className={p.quantity <= p.minStock && p.minStock > 0 ? "text-[#B63A2B]" : p.quantity === 0 ? "text-[#B63A2B]/60" : "text-white"}>{p.quantity}</span></td>
                <td className="px-4 py-3">{p.minStock}</td>
                <td className="px-4 py-3">{p.location || "—"}</td>
                <td className="px-4 py-3"><span className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[.08em] ${p.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[#3C3A37] text-[#5B5A59] bg-[#080706]"}`}>{p.isActive ? "Activo" : "Inactivo"}</span></td>
                <td className="px-4 py-3 text-xs">{formatDate(p.updatedAt)}</td>
                <td className="px-4 py-3"><div className="flex gap-2">
                  <button type="button" onClick={() => onEdit(p)} title="Editar" className="text-[#5B5A59] hover:text-[#c4871a] transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                  <button type="button" onClick={() => onDelete(p)} title="Eliminar" className="text-[#5B5A59] hover:text-[#B63A2B] transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                  <button type="button" onClick={() => onHistory(p)} title="Historial" className="text-[#5B5A59] hover:text-[#c4871a] transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 xl:hidden">
        {products.map((p) => (
          <div key={p.id} className="border border-[#c4871a]/10 bg-[#171513] p-4">
            <div className="flex items-start gap-3">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-14 w-14 shrink-0 border border-[#c4871a]/10 bg-[#080706] object-cover" loading="lazy" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#3C3A37] bg-[#080706] text-xs text-[#5B5A59]">—</span>}
              <div className="min-w-0 flex-1"><h3 className="font-heading text-sm font-bold uppercase text-white">{p.name}</h3><p className="text-xs text-[#5B5A59]">{p.categoryName} · {p.location || "Sin ubicación"}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-xs"><span className={p.quantity <= p.minStock && p.minStock > 0 ? "text-[#B63A2B]" : "text-[#B2AAA7]"}>Cant: {p.quantity}</span><span className="text-[#5B5A59]">Mín: {p.minStock}</span><span className={`inline-block border px-1.5 py-0.5 text-[9px] uppercase tracking-[.08em] ${p.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[#3C3A37] text-[#5B5A59] bg-[#080706]"}`}>{p.isActive ? "Activo" : "Inactivo"}</span></div></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => onEdit(p)} className="flex-1 border border-[#3C3A37] py-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] hover:text-white hover:border-[#c4871a]/50">Editar</button>
              <button onClick={() => onDelete(p)} className="flex-1 border border-[#3C3A37] py-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] hover:text-white hover:border-[#c4871a]/50">Eliminar</button>
              <button onClick={() => onHistory(p)} className="flex-1 border border-[#3C3A37] py-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] hover:text-white hover:border-[#c4871a]/50">Historial</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-3 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-[#c4871a]/20 bg-[#0F0D0B] p-5 shadow-[0_24px_100px_rgba(0,0,0,.7)] sm:p-7" onClick={(e) => e.stopPropagation()}>{children}</div></div>;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className ?? ""}`}><span className="mb-1.5 block font-medium text-[10px] uppercase tracking-[.14em] text-[#B2AAA7]">{label}</span>{children}</label>;
}
