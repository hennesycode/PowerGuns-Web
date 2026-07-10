"use client";

import { useEffect, useState, useCallback } from "react";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  userId: number | null;
  userFullName: string;
  userUsername: string;
  userIdentificationType: string;
  userIdentificationNumber: string;
  description: string;
  status: "success" | "error";
  errorMessage: string | null;
  page: string | null;
  section: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  timeAgo: string;
  formattedDate: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  reservation_created: "Reserva creada",
  reservation_updated: "Reserva actualizada",
  reservation_status_changed: "Estado de reserva cambiado",
  reservation_deleted: "Reserva eliminada",
  service_created: "Servicio creado",
  service_updated: "Servicio actualizado",
  service_status_changed: "Estado de servicio cambiado",
  service_deleted: "Servicio eliminado",
  product_created: "Producto creado",
  product_updated: "Producto actualizado",
  product_deleted: "Producto eliminado",
  category_created: "Categoría creada",
  category_updated: "Categoría actualizada",
  category_deleted: "Categoría eliminada",
  business_hours_updated: "Horario actualizado",
  user_created: "Usuario creado",
  user_updated: "Usuario actualizado",
  user_deleted: "Usuario eliminado",
  user_registered: "Usuario registrado",
  login: "Inicio de sesión",
};

function getActionColor(action: string) {
  if (action.includes("deleted")) return "bg-[#B63A2B]";
  if (action.includes("created") || action.includes("registered")) return "bg-green-500";
  if (action.includes("changed") || action === "login") return "bg-blue-500";
  return "bg-[#c4871a]";
}

function getActionLabel(action: string) {
  return ACTION_LABELS[action] || action.replace(/_/g, " ");
}

function DetailModal({
  log,
  onClose,
}: {
  log: ActivityLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#171513] border border-[#c4871a]/20 w-full max-w-lg max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4871a]/10">
            <h3 className="font-heading font-bold text-base uppercase tracking-[.04em] text-white">
              Detalle de Actividad
            </h3>
            <button
              onClick={onClose}
              className="text-[#B2AAA7] hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${getActionColor(log.action)}`} />
              <span className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white">
                {getActionLabel(log.action)}
              </span>
              <span className={`text-[10px] font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase ml-auto px-2 py-0.5 ${
                log.status === "success"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-[#B63A2B]/10 text-[#B63A2B]"
              }`}>
                {log.status === "success" ? "Correcto" : "Error"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <DetailRow label="Descripción" value={log.description} />
              <DetailRow label="Entidad" value={`${log.entityType}${log.entityName ? ` — ${log.entityName}` : ""}`} />
              {log.entityId && <DetailRow label="ID Entidad" value={log.entityId} />}
              <DetailRow label="Usuario" value={`${log.userFullName} (@${log.userUsername})`} />
              <DetailRow label="Identificación" value={`${log.userIdentificationType.toUpperCase()}: ${log.userIdentificationNumber}`} />
              {log.page && <DetailRow label="Página" value={log.page} />}
              {log.section && <DetailRow label="Sección" value={log.section} />}
              <DetailRow label="Fecha y hora" value={log.formattedDate} />
              <DetailRow label="Hace" value={log.timeAgo} />
              {log.errorMessage && (
                <div>
                  <span className="text-[#B63A2B] text-[10px] font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase">Error</span>
                  <p className="text-[#B63A2B] mt-1 text-xs bg-[#B63A2B]/5 p-2 border border-[#B63A2B]/10">
                    {log.errorMessage}
                  </p>
                </div>
              )}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <span className="text-[#5B5A59] text-[10px] font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase">Metadatos</span>
                  <pre className="text-xs text-[#B2AAA7] mt-1 bg-[#080706] p-2 border border-[#c4871a]/8 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[#5B5A59] text-[10px] font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase">
        {label}
      </span>
      <p className="text-[#B2AAA7] mt-0.5">{value}</p>
    </div>
  );
}

export function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/activity?page=${p}&limit=15`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => fetchLogs(page), 0);
    return () => window.clearTimeout(timeout);
  }, [page, fetchLogs]);

  return (
    <>
      <div className="bg-[#171513] border border-[#c4871a]/12">
        <div className="px-6 py-5 border-b border-[#c4871a]/8">
          <h2 className="font-heading font-bold text-lg uppercase tracking-[.04em] text-white">
            Actividad Reciente
          </h2>
        </div>

        {loading && logs.length === 0 ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#c4871a]/20" />
                  <div>
                    <div className="h-3 w-32 bg-[#c4871a]/10 rounded" />
                    <div className="h-2 w-24 bg-[#c4871a]/5 rounded mt-1" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-2 w-16 bg-[#c4871a]/5 rounded" />
                  <div className="h-2 w-12 bg-[#c4871a]/5 rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[#5B5A59] text-sm">No hay actividad registrada</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#c4871a]/8">
              {logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-[#c4871a]/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getActionColor(log.action)}`} />
                    <div className="min-w-0">
                      <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white truncate">
                        {getActionLabel(log.action)}
                      </div>
                      <div className="text-xs text-[#5B5A59] truncate">
                        {log.userFullName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs text-[#B2AAA7]">{log.timeAgo}</div>
                    <div className={`text-[10px] font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase ${
                      log.status === "success" ? "text-green-500" : "text-[#B63A2B]"
                    }`}>
                      {log.status === "success" ? "Correcto" : "Error"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#c4871a]/8">
                <span className="text-xs text-[#5B5A59]">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-xs font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase border border-[#c4871a]/20 text-[#B2AAA7] hover:text-white hover:border-[#c4871a]/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasMore}
                    className="px-3 py-1.5 text-xs font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase border border-[#c4871a]/20 text-[#B2AAA7] hover:text-white hover:border-[#c4871a]/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
