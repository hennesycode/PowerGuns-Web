"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  generateSlug,
  calculateFinalPrice,
} from "@/lib/validations/service";
import type { ServiceImage } from "@/lib/types/service";
import type { ServiceItem } from "@/lib/types/service";

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumberDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}

function parseNumberDisplay(display: string): string {
  return display.replace(/\./g, "").replace(/\D/g, "");
}

interface ServiceFormModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MINIMUM_INCLUDES = ["Instructor certificado"];

export function ServiceFormModal({
  service,
  onClose,
  onSuccess,
}: ServiceFormModalProps) {
  const isEditing = !!service;

  // Basic info
  const [title, setTitle] = useState(service?.title || "");
  const [slug, setSlug] = useState(service?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isActive, setIsActive] = useState(service?.isActive ?? true);

  // Descriptions
  const [shortDescription, setShortDescription] = useState(
    service?.shortDescription || "",
  );
  const [longDescription, setLongDescription] = useState(
    service?.longDescription || "",
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(service?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    service?.seoDescription || "",
  );
  const [seoKeywords, setSeoKeywords] = useState(service?.seoKeywords || "");
  const [tags, setTags] = useState(service?.tags || "");

  // Price
  const [price, setPrice] = useState(service ? String(service.price) : "");
  const [discountType, setDiscountType] = useState<
    "none" | "percentage" | "fixed"
  >(service?.discountType || "none");
  const [discountValue, setDiscountValue] = useState(
    service?.discountValue ? String(service.discountValue) : "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    service ? String(service.durationMinutes) : "",
  );

  // Includes
  const [includes, setIncludes] = useState<string[]>(
    service?.includes || [...MINIMUM_INCLUDES],
  );
  const [newInclude, setNewInclude] = useState("");

  // Images
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>(
    service?.mainImageUrl || "",
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<ServiceImage[]>(
    service?.images || [],
  );
  const [deletedGalleryKeys, setDeletedGalleryKeys] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugManuallyEdited(true);
  };

  // Final price calculation
  const finalPrice = useMemo(() => {
    const numericPrice = Number(price);
    const numericDiscount = Number(discountValue);
    if (isNaN(numericPrice) || numericPrice < 0) return 0;
    if (discountType === "none" || isNaN(numericDiscount)) return numericPrice;
    return calculateFinalPrice(numericPrice, discountType, numericDiscount);
  }, [price, discountType, discountValue]);

  // Main image handlers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
  };

  // Gallery handlers
  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setGalleryFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (img: ServiceImage) => {
    setExistingGallery((prev) => prev.filter((i) => i.id !== img.id));
    setDeletedGalleryKeys((prev) => [...prev, img.imageKey]);
  };

  // Includes handlers
  const addInclude = () => {
    const trimmed = newInclude.trim();
    if (!trimmed) return;
    setIncludes((prev) => [...prev, trimmed]);
    setNewInclude("");
  };

  const removeInclude = (index: number) => {
    setIncludes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIncludeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInclude();
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      toast.error("Completa los campos básicos requeridos");
      return;
    }

    if (!isEditing && !mainImageFile) {
      toast.error("La imagen principal es obligatoria");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error("El precio debe ser un número válido mayor o igual a 0");
      return;
    }

    const numericDuration = Number(durationMinutes);
    if (isNaN(numericDuration) || numericDuration < 1) {
      toast.error("La duración debe ser al menos 1 minuto");
      return;
    }

    if (discountType === "percentage") {
      const dv = Number(discountValue);
      if (isNaN(dv) || dv < 0 || dv > 100) {
        toast.error("El porcentaje de descuento debe estar entre 0 y 100");
        return;
      }
    }

    if (discountType === "fixed") {
      const dv = Number(discountValue);
      if (isNaN(dv) || dv < 0) {
        toast.error("El descuento fijo debe ser mayor o igual a 0");
        return;
      }
      if (dv > numericPrice) {
        toast.error("El descuento fijo no puede ser mayor al precio");
        return;
      }
    }

    if (includes.length === 0) {
      toast.error("Debe incluir al menos un ítem en Qué incluye");
      return;
    }

    setSaving(true);

    const payload = {
      name: title.trim(),
      title: title.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      seoKeywords: seoKeywords.trim() || undefined,
      tags: tags.trim() || undefined,
      price: numericPrice,
      discountType: discountType || "none",
      discountValue: discountType !== "none" ? Number(discountValue) : undefined,
      durationMinutes: numericDuration,
      includes: includes.filter(Boolean),
      isActive,
    };

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (mainImageFile) {
        formData.append("mainImage", mainImageFile);
      }

      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          formData.append("galleryImages", file);
        }
      }

      if (isEditing && deletedGalleryKeys.length > 0) {
        formData.append("deleteImageKeys", deletedGalleryKeys.join(","));
      }

      const url = isEditing
        ? `/api/dashboard/services/${service!.id}`
        : "/api/dashboard/services";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error del servidor");
      }

      toast.success(
        isEditing
          ? "Servicio actualizado correctamente"
          : "Servicio creado correctamente",
      );
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al guardar el servicio";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "basic", label: "Básico" },
    { id: "description", label: "Descripción" },
    { id: "seo", label: "SEO" },
    { id: "price", label: "Precio" },
    { id: "includes", label: "Incluye" },
    { id: "images", label: "Imágenes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#171513] border border-[#c4871a]/20 shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4871a]/10">
          <h2 className="font-heading font-bold text-lg text-white uppercase tracking-[.04em]">
            {isEditing ? "Editar servicio" : "Crear servicio"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#5B5A59] hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex overflow-x-auto border-b border-[#c4871a]/10">
          {sections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                "px-4 py-2.5 text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] whitespace-nowrap transition-colors border-b-2",
                activeSection === sec.id
                  ? "text-[#c4871a] border-[#c4871a]"
                  : "text-[#5B5A59] border-transparent hover:text-[#B2AAA7]",
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-5">
            {/* Section: Basic */}
            {activeSection === "basic" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Título del servicio *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="Ej: Entrenamiento Básico de Tiro — 2 horas"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-[#B2AAA7] text-sm font-mono focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="entrenamiento-basico-tiro"
                    required
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#c4871a]"
                  />
                  <span className="text-sm text-[#B2AAA7]">Servicio activo</span>
                </label>
              </div>
            )}

            {/* Section: Description */}
            {activeSection === "description" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Descripción corta
                    <span className="text-[#5B5A59] ml-1 font-normal">
                      ({shortDescription.length}/180)
                    </span>
                  </label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59] resize-none h-20"
                    placeholder="Breve descripción del servicio (máx 180 caracteres)"
                    maxLength={180}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Descripción larga *
                    <span className="text-[#5B5A59] ml-1 font-normal">
                      ({longDescription.length})
                    </span>
                  </label>
                  <textarea
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59] resize-none h-32"
                    placeholder="Descripción detallada del servicio (mín 20 caracteres)"
                    minLength={20}
                    required
                  />
                </div>
              </div>
            )}

            {/* Section: SEO */}
            {activeSection === "seo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    SEO Title
                    <span className="text-[#5B5A59] ml-1 font-normal">
                      ({seoTitle.length}/60)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="Título SEO (se usará el título si se deja vacío)"
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    SEO Description
                    <span className="text-[#5B5A59] ml-1 font-normal">
                      ({seoDescription.length}/160)
                    </span>
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59] resize-none h-20"
                    placeholder="Meta description SEO (se usará la descripción corta si se deja vacío)"
                    maxLength={160}
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="polígono, tiro, villavicencio, entrenamiento"
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Etiquetas / Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="básico, principiante, pistola (separado por comas)"
                  />
                </div>
              </div>
            )}

            {/* Section: Price */}
            {activeSection === "price" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Precio base *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberDisplay(price)}
                    onChange={(e) => setPrice(parseNumberDisplay(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="90.000"
                    required
                  />
                  {price && !isNaN(Number(price)) && (
                    <p className="text-[#5B5A59] text-xs mt-1">
                      {formatCOP(Number(price))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Tipo de descuento
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: "none", label: "Ninguno" },
                        { value: "percentage", label: "Porcentaje" },
                        { value: "fixed", label: "Valor fijo" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDiscountType(opt.value)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em] border transition-colors",
                          discountType === opt.value
                            ? "bg-[#c4871a]/15 border-[#c4871a]/40 text-[#c4871a]"
                            : "border-[#3C3A37] text-[#5B5A59] hover:border-[#5B5A59]",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {discountType !== "none" && (
                  <div>
                    <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                      {discountType === "percentage"
                        ? "Porcentaje de descuento"
                        : "Valor del descuento"}
                    </label>
                    <input
                      type={discountType === "percentage" ? "number" : "text"}
                      inputMode={discountType === "percentage" ? "numeric" : "numeric"}
                      value={
                        discountType === "percentage"
                          ? discountValue
                          : formatNumberDisplay(discountValue)
                      }
                      onChange={(e) =>
                        setDiscountValue(
                          discountType === "percentage"
                            ? e.target.value
                            : parseNumberDisplay(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                      placeholder={
                        discountType === "percentage" ? "15" : "10.000"
                      }
                      min="0"
                      max={discountType === "percentage" ? 100 : undefined}
                    />
                  </div>
                )}

                {/* Final price preview */}
                <div className="bg-[#080706] border border-[#c4871a]/15 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">
                      Precio final
                    </span>
                    <span className="font-['Rajdhani',sans-serif] font-bold text-xl text-[#c4871a]">
                      {formatCOP(finalPrice)}
                    </span>
                  </div>
                  {discountType !== "none" && Number(discountValue) > 0 && (
                    <p className="text-[#5B5A59] text-xs mt-1">
                      Ahorro:{" "}
                      {discountType === "percentage"
                        ? `${Number(discountValue)}%`
                        : formatCOP(Number(discountValue))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-1.5">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                    placeholder="120"
                    min="1"
                    required
                  />
                </div>
              </div>
            )}

            {/* Section: Includes */}
            {activeSection === "includes" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-3">
                    Qué incluye *
                  </label>
                  <div className="space-y-2">
                    {includes.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-[#080706] border border-[#3C3A37] px-3 py-2"
                      >
                        <span className="text-[#c4871a] text-xs">-</span>
                        <span className="flex-1 text-sm text-white truncate">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInclude(i)}
                          className="text-[#5B5A59] hover:text-[#B63A2B] transition-colors flex-shrink-0"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newInclude}
                      onChange={(e) => setNewInclude(e.target.value)}
                      onKeyDown={handleIncludeKeyDown}
                      className="flex-1 px-3 py-2 bg-[#080706] border border-[#3C3A37] text-white text-sm focus:border-[#c4871a]/50 focus:outline-none placeholder:text-[#5B5A59]"
                      placeholder="Ej: Instructor certificado"
                    />
                    <button
                      type="button"
                      onClick={addInclude}
                      className="px-3 py-2 border border-[#c4871a]/30 text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors font-['Rajdhani',sans-serif] text-xs font-semibold uppercase tracking-[.06em]"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Images */}
            {activeSection === "images" && (
              <div className="space-y-6">
                {/* Main image */}
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-2">
                    Imagen principal {isEditing ? "" : "*"}
                  </label>
                  {mainImagePreview ? (
                    <div className="relative w-40 h-40 bg-[#080706] border border-[#c4871a]/15 overflow-hidden mb-2">
                      <img
                        src={mainImagePreview}
                        alt="Vista previa principal"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute top-1 right-1 p-1 bg-[#B63A2B]/80 hover:bg-[#B63A2B] text-white rounded-sm transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-40 h-40 bg-[#080706] border-2 border-dashed border-[#3C3A37] hover:border-[#c4871a]/40 transition-colors cursor-pointer mb-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 text-[#5B5A59] mb-1">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="text-[10px] text-[#5B5A59] font-['Rajdhani',sans-serif] uppercase tracking-[.08em]">
                        Subir imagen
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-[#5B5A59] text-[10px]">
                    JPEG, PNG o WebP. Máximo 10 MB. Relación 1:1 recomendada.
                  </p>
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-xs font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.08em] text-[#B2AAA7] mb-2">
                    Galería de imágenes
                  </label>

                  {/* Existing gallery */}
                  {existingGallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {existingGallery.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square bg-[#080706] border border-[#3C3A37] overflow-hidden group"
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.altText || ""}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(img)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="#B63A2B" strokeWidth="1.5" className="w-5 h-5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New gallery previews */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {galleryPreviews.map((preview, i) => (
                        <div
                          key={`new-${i}`}
                          className="relative aspect-square bg-[#080706] border border-[#c4871a]/20 overflow-hidden"
                        >
                          <img
                            src={preview}
                            alt={`Galería ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryFile(i)}
                            className="absolute top-1 right-1 p-0.5 bg-[#B63A2B]/80 hover:bg-[#B63A2B] text-white rounded-sm transition-colors"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-[#3C3A37] hover:border-[#c4871a]/40 text-[#5B5A59] hover:text-[#B2AAA7] transition-colors cursor-pointer text-xs font-['Rajdhani',sans-serif] uppercase tracking-[.06em]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Agregar imágenes
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleGalleryAdd}
                      className="hidden"
                      multiple
                    />
                  </label>
                  <p className="text-[#5B5A59] text-[10px] mt-1">
                    JPEG, PNG o WebP. Máximo 10 MB por imagen.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#c4871a]/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 border border-[#3C3A37] text-[#B2AAA7] hover:text-white hover:border-[#5B5A59] transition-colors font-['Rajdhani',sans-serif] font-semibold text-sm uppercase tracking-[.06em] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#c4871a] text-[#080706] hover:bg-[#d6a244] transition-colors font-heading font-bold text-sm uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#080706] border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Actualizar servicio"
              ) : (
                "Crear servicio"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
