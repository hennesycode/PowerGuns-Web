"use client";

import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { ActivityFeed } from "@/components/admin/ActivityFeed";

interface Stats {
  activeReservations: number;
  activeReservationsTrend: string;
  activeReservationsTrendUp: boolean;
  totalUsers: number;
  usersThisMonth: number;
  pendingReservations: number;
  todayActivity: number;
  errorsToday: number;
}

export default function DashboardPage() {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = stats
    ? [
        {
          title: "Reservas Activas",
          value: String(stats.activeReservations),
          subtitle: "Todas excepto completadas",
          trend: stats.activeReservationsTrend,
          trendUp: stats.activeReservationsTrendUp,
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
          value: String(stats.totalUsers),
          subtitle: "Total plataforma",
          trend: `${stats.usersThisMonth} este mes`,
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
          title: "Reservas Pendientes",
          value: String(stats.pendingReservations),
          subtitle: "Requieren revisión",
          trend: `${stats.todayActivity} actividades hoy`,
          trendUp: true,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        },
        {
          title: "Actividad Hoy",
          value: String(stats.todayActivity),
          subtitle: "Eventos registrados",
          trend: stats.errorsToday > 0 ? `${stats.errorsToday} errores` : "Sin errores",
          trendUp: stats.errorsToday === 0,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <AdminLayout title="Dashboard">
      <div ref={ref}>
        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#171513] border border-[#c4871a]/12 p-6 animate-pulse"
                >
                  <div className="h-3 w-24 bg-[#c4871a]/10 rounded mb-3" />
                  <div className="h-8 w-16 bg-[#c4871a]/10 rounded mb-2" />
                  <div className="h-3 w-32 bg-[#c4871a]/5 rounded" />
                </div>
              ))
            : summaryCards.map((card, i) => (
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

        {/* Activity feed */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.45s, transform 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.45s",
          }}
        >
          <ActivityFeed />
        </div>
      </div>
    </AdminLayout>
  );
}
