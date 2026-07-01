"use client";

import { cn } from "@/lib/utils";
import type { ServiceItem } from "@/lib/types/service";
import { ToggleSwitch } from "./ToggleSwitch";

interface ServicesTableProps {
  services: ServiceItem[];
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
  onToggleStatus: (service: ServiceItem) => void;
  togglingIds: Set<number>;
  onToggleFeatured: (service: ServiceItem) => void;
  featuredTogglingIds: Set<number>;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function DiscountBadge({
  type,
  value,
}: {
  type: string;
  value: number | null;
}) {
  if (type === "none" || !value) return null;
  const label = type === "percentage" ? `${value}%` : formatCOP(value);
  return (
    <span className="ml-1.5 text-[10px] font-heading font-bold uppercase text-[#B63A2B] bg-[#B63A2B]/10 px-1.5 py-0.5">
      -{label}
    </span>
  );
}

export function ServicesTable({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
  togglingIds,
  onToggleFeatured,
  featuredTogglingIds,
}: ServicesTableProps) {
  const safeFeaturedTogglingIds = featuredTogglingIds ?? new Set<number>();
  return (
    <div className="bg-[#171513] border border-[#c4871a]/12 overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#c4871a]/10">
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7] w-12">
                #
              </th>
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7]">
                Servicio
              </th>
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7]">
                Precio
              </th>
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7]">
                Duración
              </th>
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7]">
                Estado
              </th>
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7]">
                Destacado
              </th>
              <th className="py-3 px-4 font-['Rajdhani',sans-serif] font-semibold text-xs uppercase tracking-[.1em] text-[#B2AAA7] text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4871a]/5">
            {services.map((service) => (
              <tr
                key={service.id}
                className="hover:bg-[#c4871a]/3 transition-colors group"
              >
                <td className="py-3 px-4">
                  <div className="w-8 h-8 bg-[#080706] border border-[#c4871a]/15 flex items-center justify-center overflow-hidden">
                    {service.mainImageUrl ? (
                      <img
                        src={service.mainImageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[10px] text-[#5B5A59] font-heading font-bold">
                        PG
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white">
                      {service.name}
                    </div>
                    <div className="text-xs text-[#5B5A59] truncate max-w-[200px]">
                      {service.title}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "font-['Rajdhani',sans-serif] font-semibold text-sm",
                        service.discountType !== "none"
                          ? "text-[#5B5A59] line-through"
                          : "text-white",
                      )}
                    >
                      {formatCOP(service.price)}
                    </span>
                    {service.discountType !== "none" && (
                      <span className="font-['Rajdhani',sans-serif] font-bold text-sm text-[#c4871a]">
                        {formatCOP(service.finalPrice)}
                      </span>
                    )}
                  </div>
                  <DiscountBadge
                    type={service.discountType}
                    value={service.discountValue}
                  />
                </td>
                <td className="py-3 px-4 text-sm text-[#B2AAA7] font-['Rajdhani',sans-serif]">
                  {service.durationMinutes} min
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={service.isActive}
                      disabled={togglingIds.has(service.id)}
                      onChange={() => onToggleStatus(service)}
                      label={service.isActive ? "Desactivar servicio" : "Activar servicio"}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]",
                        service.isActive ? "text-[#c4871a]" : "text-[#5B5A59]",
                      )}
                    >
                      {service.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={service.isFeatured}
                      disabled={safeFeaturedTogglingIds.has(service.id)}
                      onChange={() => onToggleFeatured(service)}
                      label={service.isFeatured ? "Quitar servicio de destacados" : "Marcar servicio como destacado"}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]",
                        service.isFeatured ? "text-[#c4871a]" : "text-[#5B5A59]",
                      )}
                    >
                      {service.isFeatured ? "Destacado" : "No destacado"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(service)}
                      className="p-1.5 text-[#B2AAA7] hover:text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors"
                      title="Editar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(service)}
                      className="p-1.5 text-[#B2AAA7] hover:text-[#B63A2B] hover:bg-[#B63A2B]/10 transition-colors"
                      title="Eliminar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-[#c4871a]/5">
        {services.map((service) => (
          <div key={service.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#080706] border border-[#c4871a]/15 flex-shrink-0 overflow-hidden">
                  {service.mainImageUrl ? (
                    <img
                      src={service.mainImageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full text-[10px] text-[#5B5A59] font-heading font-bold">
                      PG
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white truncate">
                    {service.name}
                  </div>
                  <div className="text-xs text-[#5B5A59] truncate">
                    {service.title}
                  </div>
                </div>
              </div>
              <ToggleSwitch
                checked={service.isActive}
                disabled={togglingIds.has(service.id)}
                onChange={() => onToggleStatus(service)}
                label={service.isActive ? "Desactivar servicio" : "Activar servicio"}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em] text-[#5B5A59]">
                Destacado
              </span>
              <ToggleSwitch
                checked={service.isFeatured}
                disabled={safeFeaturedTogglingIds.has(service.id)}
                onChange={() => onToggleFeatured(service)}
                label={service.isFeatured ? "Quitar servicio de destacados" : "Marcar servicio como destacado"}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="space-y-0.5">
                <span className="text-[#B2AAA7] text-xs">Precio</span>
                <div className="flex items-baseline gap-1.5">
                  {service.discountType !== "none" && (
                    <span className="text-[#5B5A59] line-through text-xs">
                      {formatCOP(service.price)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "font-['Rajdhani',sans-serif] font-semibold",
                      service.discountType !== "none"
                        ? "text-[#c4871a]"
                        : "text-white",
                    )}
                  >
                    {formatCOP(service.finalPrice)}
                  </span>
                </div>
                {service.discountType !== "none" && service.discountValue && (
                  <span className="text-[10px] text-[#B63A2B] font-heading font-bold uppercase">
                    -{service.discountType === "percentage"
                      ? `${service.discountValue}%`
                      : formatCOP(service.discountValue)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-[#B2AAA7] text-xs">Duración</div>
                <div className="font-['Rajdhani',sans-serif] text-sm text-white">
                  {service.durationMinutes} min
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 pt-1 border-t border-[#c4871a]/5">
              <button
                onClick={() => onEdit(service)}
                className="px-3 py-1.5 text-xs text-[#c4871a] hover:bg-[#c4871a]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(service)}
                className="px-3 py-1.5 text-xs text-[#B63A2B] hover:bg-[#B63A2B]/10 transition-colors font-['Rajdhani',sans-serif] font-semibold uppercase tracking-[.06em]"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
