export const COLOMBIA_TIME_ZONE = "America/Bogota";
export const MIN_RESERVATION_LEAD_MINUTES = 30;
export const DEFAULT_SLOT_INTERVAL_MINUTES = 60;

export const BASE_RESERVATION_SLOTS = [
  { time: "08:00", label: "8:00 AM" },
  { time: "09:00", label: "9:00 AM" },
  { time: "10:00", label: "10:00 AM" },
  { time: "11:00", label: "11:00 AM" },
  { time: "14:00", label: "2:00 PM" },
  { time: "15:00", label: "3:00 PM" },
  { time: "16:00", label: "4:00 PM" },
  { time: "17:00", label: "5:00 PM" },
] as const;

export type AvailabilityReason = "available" | "past" | "reserved" | "closed";

export interface AvailabilitySlot {
  time: string;
  label: string;
  available: boolean;
  reason: AvailabilityReason | null;
}

export interface BusinessHourSlot {
  openTime: string;
  closeTime: string;
}

export interface BusinessHourData {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  slots: BusinessHourSlot[];
}

function getColombiaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function getColombiaNow() {
  return getColombiaParts();
}

export function isValidDateKey(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function dateKeyToDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export function dateToDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDayOfWeek(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isSunday(date: string) {
  return getDayOfWeek(date) === 0;
}

export function isKnownReservationTime(time: string) {
  return BASE_RESERVATION_SLOTS.some((slot) => slot.time === time);
}

export function getSlotLabel(time: string) {
  const hour = Number(time.split(":")[0]);
  const minute = time.split(":")[1];
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute} ${period}`;
}

export function isPastSlot(
  date: string,
  time: string,
  leadMinutes = MIN_RESERVATION_LEAD_MINUTES,
) {
  const now = getColombiaNow();
  if (date < now.date) return true;
  if (date > now.date) return false;

  const [hour, minute] = time.split(":").map(Number);
  const slotMinutes = hour * 60 + minute;
  return slotMinutes < now.minutes + leadMinutes;
}

export function formatColombiaDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

export function generateSlotsFromBusinessHours(
  businessHours: BusinessHourData | null,
  date: string,
  reservedTimes: Set<string>,
  intervalMinutes = DEFAULT_SLOT_INTERVAL_MINUTES,
): AvailabilitySlot[] {
  if (!businessHours || !businessHours.isOpen || businessHours.slots.length === 0) {
    return [];
  }

  const slots: AvailabilitySlot[] = [];

  for (const block of businessHours.slots) {
    const [openHour, openMin] = block.openTime.split(":").map(Number);
    const [closeHour, closeMin] = block.closeTime.split(":").map(Number);
    const openTotal = openHour * 60 + openMin;
    const closeTotal = closeHour * 60 + closeMin;

    for (let min = openTotal; min + intervalMinutes <= closeTotal; min += intervalMinutes) {
      const hour = Math.floor(min / 60);
      const minute = min % 60;
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const label = getSlotLabel(time);

      let reason: AvailabilitySlot["reason"] = null;
      if (isPastSlot(date, time)) reason = "past";
      else if (reservedTimes.has(time)) reason = "reserved";

      slots.push({
        time,
        label,
        available: !reason,
        reason,
      });
    }
  }

  return slots;
}

export function isTimeWithinBusinessHours(
  time: string,
  businessHours: BusinessHourData | null,
): boolean {
  if (!businessHours || !businessHours.isOpen) return false;

  const [timeHour, timeMin] = time.split(":").map(Number);
  const timeTotal = timeHour * 60 + timeMin;

  for (const block of businessHours.slots) {
    const [openHour, openMin] = block.openTime.split(":").map(Number);
    const [closeHour, closeMin] = block.closeTime.split(":").map(Number);
    const openTotal = openHour * 60 + openMin;
    const closeTotal = closeHour * 60 + closeMin;

    if (timeTotal >= openTotal && timeTotal + DEFAULT_SLOT_INTERVAL_MINUTES <= closeTotal) {
      return true;
    }
  }

  return false;
}
