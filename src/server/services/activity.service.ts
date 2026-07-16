import { prisma } from "@/lib/prisma";
import { COLOMBIA_TIME_ZONE } from "@/lib/timezone";
import type { AuthPayload } from "@/lib/auth";

export interface ActivityLogInput {
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  userId?: number | null;
  userFullName: string;
  userUsername: string;
  userIdentificationType: string;
  userIdentificationNumber: string;
  description: string;
  status?: "success" | "error";
  errorMessage?: string | null;
  page?: string;
  section?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  status?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `Hace ${diffSec} seg`;
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHour < 24) return `Hace ${diffHour} h`;
  if (diffDay < 7) return `Hace ${diffDay} d`;
  return date.toLocaleDateString("es-CO", {
    timeZone: COLOMBIA_TIME_ZONE,
    day: "numeric",
    month: "short",
  });
}

function formatColombiaDateTime(date: Date): string {
  return date.toLocaleString("es-CO", {
    timeZone: COLOMBIA_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function serializeLog(log: Record<string, unknown> & {
  id: string; action: string; entityType: string; entityId: string | null;
  entityName: string | null; userId: number | null;
  userFullName: string; userUsername: string;
  userIdentificationType: string; userIdentificationNumber: string;
  description: string; status: string; errorMessage: string | null;
  page: string | null; section: string | null;
  metadata: string | null; createdAt: Date;
}) {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    entityName: log.entityName,
    userId: log.userId,
    userFullName: log.userFullName,
    userUsername: log.userUsername,
    userIdentificationType: log.userIdentificationType,
    userIdentificationNumber: log.userIdentificationNumber,
    description: log.description,
    status: log.status,
    errorMessage: log.errorMessage,
    page: log.page,
    section: log.section,
    metadata: log.metadata ? JSON.parse(log.metadata) : null,
    createdAt: log.createdAt.toISOString(),
    timeAgo: formatTimeAgo(log.createdAt),
    formattedDate: formatColombiaDateTime(log.createdAt),
  };
}

export const activityService = {
  async log(input: ActivityLogInput) {
    try {
      return await prisma.activityLog.create({
        data: {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId || null,
          entityName: input.entityName || null,
          userId: input.userId || null,
          userFullName: input.userFullName,
          userUsername: input.userUsername,
          userIdentificationType: input.userIdentificationType,
          userIdentificationNumber: input.userIdentificationNumber,
          description: input.description,
          status: input.status || "success",
          errorMessage: input.errorMessage || null,
          page: input.page || null,
          section: input.section || null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    } catch (error) {
      console.error("[ActivityService] Error logging activity:", error);
    }
  },

  async logFromSession(
    session: AuthPayload,
    input: Omit<ActivityLogInput, "userId" | "userFullName" | "userUsername" | "userIdentificationType" | "userIdentificationNumber">,
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, firstName: true, lastName: true, username: true, identificationType: true, identificationNumber: true },
      });
      if (!user) return;
      return this.log({
        ...input,
        userId: user.id,
        userFullName: `${user.firstName} ${user.lastName}`,
        userUsername: user.username,
        userIdentificationType: user.identificationType,
        userIdentificationNumber: user.identificationNumber,
      });
    } catch (error) {
      console.error("[ActivityService] Error logging from session:", error);
    }
  },

  async getFeed(filters: ActivityLogFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.status) where.status = filters.status;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where: where as never }),
      prisma.activityLog.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      logs: logs.map(serializeLog),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  },

  async getStats() {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    const [
      activeReservations,
      totalUsers,
      usersThisMonth,
      pendingReservations,
      todayActivity,
      errorsToday,
    ] = await Promise.all([
      prisma.reservation.count({ where: { status: { notIn: ["completed", "canceled"] } } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.reservation.count({ where: { status: "pending" } }),
      prisma.activityLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.activityLog.count({ where: { createdAt: { gte: todayStart }, status: "error" } }),
    ]);

    let yesterdayCount = 0;
    try {
      const yesterdayStart = new Date(todayStart.getTime() - 86400000);
      yesterdayCount = await prisma.reservation.count({
        where: { createdAt: { gte: yesterdayStart, lt: todayStart }, status: { notIn: ["completed", "canceled"] } },
      });
    } catch { /* silent */ }

    const trendPercent = yesterdayCount > 0
      ? Math.round(((activeReservations - yesterdayCount) / yesterdayCount) * 100)
      : 0;

    return {
      activeReservations,
      activeReservationsTrend: trendPercent >= 0 ? `${trendPercent}% vs ayer` : `${trendPercent}% vs ayer`,
      activeReservationsTrendUp: trendPercent >= 0,
      totalUsers,
      usersThisMonth,
      pendingReservations,
      todayActivity,
      errorsToday,
    };
  },
};
