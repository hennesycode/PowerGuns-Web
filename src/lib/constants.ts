export const SITE = {
  name: "Power Guns Polígono S.A.S.",
  description:
    "Polígono de tiro certificado en Villavicencio, Meta. Instalaciones de clase mundial con armería premium, instructores certificados y el ambiente táctico más profesional de los Llanos Orientales.",
  url: "https://powergunspoligono.com",
  city: "Villavicencio, Meta",
  country: "Colombia",
  phone: "+57 300 000 0000",
  email: "info@powergunspoligono.com",
  whatsapp: "573000000000",
};

export const NAV_LINKS = [
  { label: "Servicios", href: "/servicios" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Galería", href: "#galeria" },
  { label: "Contacto", href: "#contacto" },
];

export const HOURS = {
  weekday: "Lun – Sáb: 8:00 am – 6:00 pm",
  sunday: "Domingo y Festivos: Cerrado",
};

export const CONTACT = {
  address: "Calle 34 #41-32 Barzal Alto",
  email: "poligonopowerguns@gmail.com",
  phone: "3057138140",
};

export const STATS = [
  { value: "4", suffix: "+", label: "Estaciones de Tiro" },
  { value: "15", suffix: "m", label: "Distancia Máxima" },
  { value: "15", suffix: "+", label: "Calibres Disponibles" },
  { value: "100", suffix: "%", label: "Certificado & Legal" },
];

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING_VALIDATION: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

export const TIME_SLOTS = [
  { start: "08:00", end: "10:00", label: "8:00 am – 10:00 am" },
  { start: "10:00", end: "12:00", label: "10:00 am – 12:00 pm" },
  { start: "14:00", end: "16:00", label: "2:00 pm – 4:00 pm" },
  { start: "16:00", end: "18:00", label: "4:00 pm – 6:00 pm" },
];
