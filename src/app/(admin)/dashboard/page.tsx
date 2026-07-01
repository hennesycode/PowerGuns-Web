"use client";

import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardCard } from "@/components/admin/DashboardCard";

const summaryCards = [
  {
    title: "Reservas Activas",
    value: "12",
    subtitle: "Últimas 24 horas",
    trend: "8% vs ayer",
    trendUp: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Usuarios Registrados",
    value: "486",
    subtitle: "Total plataforma",
    trend: "12 este mes",
    trendUp: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "Paquetes Disponibles",
    value: "6",
    subtitle: "3 niveles activos",
    trend: "2 nuevos",
    trendUp: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Solicitudes Pendientes",
    value: "3",
    subtitle: "Requieren revisión",
    trend: "1 urgente",
    trendUp: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

const recentActivity = [
  { action: "Nueva reserva", user: "Carlos Méndez", time: "Hace 15 min", status: "Confirmada" },
  { action: "Solicitud de contacto", user: "Ana Lucía Rojas", time: "Hace 42 min", status: "Pendiente" },
  { action: "Paquete Elite adquirido", user: "Pedro Salazar", time: "Hace 2 h", status: "Completada" },
  { action: "Registro de usuario", user: "Laura Vega", time: "Hace 3 h", status: "Activo" },
  { action: "Reserva cancelada", user: "Miguel Ángel Ruiz", time: "Hace 5 h", status: "Cancelada" },
];

export default function DashboardPage() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div ref={ref}>
        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, i) => (
            <div
              key={card.title}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.08}s, transform 0.5s cubic-bezier(0.22,0.61,0.36,1) ${0.1 + i * 0.08}s`,
              }}
            >
              <DashboardCard {...card} />
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div
          className="bg-[#171513] border border-[#c4871a]/12 p-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.45s, transform 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.45s",
          }}
        >
          <h2 className="font-heading font-bold text-lg uppercase tracking-[.04em] text-white mb-5">
            Actividad Reciente
          </h2>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${
                  i < recentActivity.length - 1
                    ? "border-b border-[#c4871a]/8"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.status === "Confirmada" || item.status === "Completada" || item.status === "Activo"
                        ? "bg-green-500"
                        : item.status === "Pendiente"
                          ? "bg-[#c4871a]"
                          : "bg-[#B63A2B]"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="font-['Rajdhani',sans-serif] font-semibold text-sm text-white truncate">
                      {item.action}
                    </div>
                    <div className="text-xs text-[#5B5A59]">{item.user}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-xs text-[#B2AAA7]">{item.time}</div>
                  <div
                    className={`text-[10px] font-['Rajdhani',sans-serif] font-semibold tracking-[.08em] uppercase ${
                      item.status === "Confirmada" || item.status === "Completada" || item.status === "Activo"
                        ? "text-green-500"
                        : item.status === "Pendiente"
                          ? "text-[#c4871a]"
                          : "text-[#B63A2B]"
                    }`}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
