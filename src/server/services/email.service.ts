import nodemailer from "nodemailer";
import path from "node:path";
import { CONTACT, POLYGON_ADDRESS, SITE } from "@/lib/constants";
import { companySettingsService } from "@/server/services/company-settings.service";

type ReservationEmailData = {
  id: string;
  reservationCode: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  reservationDate: string;
  reservationTimeLabel: string;
  durationHours: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethodLabel: string | null;
  notes: string;
  services: Array<{
    serviceTitle: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

type SendResult = { success: true } | { success: false; error: string };

type ContactEmailData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

type MailAttachment = {
  filename: string;
  path: string;
  cid: string;
};

const MAPS_URL = "https://maps.app.goo.gl/aoPPrqEmKNNyweXe8";
const LOGO_CID = "powerguns-logo";
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_review: "En revisión",
  confirmed: "Confirmada",
  completed: "Completada",
  canceled: "Cancelada",
};

function getAdminEmails() {
  return (process.env.ADMIN_NOTIFICATION_EMAILS || process.env.SMTP_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

async function getReservationNotificationEmails() {
  try {
    const company = await companySettingsService.get();
    if (company.companyEmail) return [company.companyEmail];
  } catch (error) {
    console.error("[EmailService:company-email]", error);
  }

  return getAdminEmails();
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
  });
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatReservationDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function detailRow(label: string, value: string) {
  return `<tr><td style="padding:10px 0;color:#8f8782;font-size:13px;">${label}</td><td style="padding:10px 0;color:#f7f2eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(value)}</td></tr>`;
}

function reservationItemsHtml(reservation: ReservationEmailData) {
  return reservation.services
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a2520;color:#f7f2eb;font-size:14px;">
            ${escapeHtml(item.serviceTitle)}<br>
            <span style="color:#8f8782;font-size:12px;">Cantidad: ${item.quantity} · ${formatCOP(item.unitPrice)} c/u</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #2a2520;color:#c4871a;font-size:14px;font-weight:700;text-align:right;">${formatCOP(item.total)}</td>
        </tr>
      `,
    )
    .join("");
}

function buildReservationEmail(reservation: ReservationEmailData, variant: "customer" | "admin") {
  const logoUrl = `cid:${LOGO_CID}`;
  const customerName = `${reservation.firstName} ${reservation.lastName}`;
  const title = variant === "admin" ? "Nueva reserva recibida" : "Confirmación de reserva";
  const intro = variant === "admin"
    ? `Hay una nueva reserva registrada por ${customerName}. Revisa los detalles y valida el seguimiento administrativo.`
    : `Hola ${reservation.firstName}, recibimos tu reserva en ${SITE.name}. Estos son los datos confirmados para tu visita.`;

  const html = `
    <!doctype html>
    <html lang="es">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
      <body style="margin:0;background:#080706;font-family:Arial,Helvetica,sans-serif;color:#f7f2eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080706;padding:28px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#0f0d0b;border:1px solid rgba(196,135,26,.22);">
              <tr>
                <td style="padding:26px;background:linear-gradient(135deg,#171513 0%,#0f0d0b 58%,#251909 100%);border-bottom:1px solid rgba(196,135,26,.18);">
                  <table role="presentation" width="100%"><tr>
                    <td><img src="${logoUrl}" width="74" height="74" alt="Power Guns" style="display:block;border-radius:50%;border:1px solid rgba(196,135,26,.45);object-fit:cover;"></td>
                    <td align="right" style="font-size:12px;color:#c4871a;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">${escapeHtml(reservation.reservationCode)}</td>
                  </tr></table>
                  <h1 style="margin:22px 0 8px;font-size:30px;line-height:1.05;text-transform:uppercase;letter-spacing:.04em;color:#fff;">${title}</h1>
                  <p style="margin:0;color:#b2aaa7;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
                </td>
              </tr>
              <tr><td style="padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(196,135,26,.16);background:#080706;padding:14px 18px;margin-bottom:18px;">
                  ${detailRow("Cliente", customerName)}
                  ${detailRow("Identificación", reservation.identificationNumber)}
                  ${detailRow("Correo", reservation.email)}
                  ${detailRow("Teléfono", reservation.phone)}
                  ${detailRow("Fecha", formatReservationDate(reservation.reservationDate))}
                  ${detailRow("Hora", reservation.reservationTimeLabel)}
                  ${detailRow("Duración", `${reservation.durationHours} ${reservation.durationHours === 1 ? "hora" : "horas"}`)}
                  ${detailRow("Estado", STATUS_LABELS[reservation.status] ?? reservation.status)}
                  ${detailRow("Método de pago", reservation.paymentMethodLabel || "No registrado")}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(196,135,26,.16);background:#171513;padding:14px 18px;margin-bottom:18px;">
                  <tr><td colspan="2" style="padding-bottom:8px;color:#c4871a;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Servicios reservados</td></tr>
                  ${reservationItemsHtml(reservation)}
                  <tr><td style="padding-top:14px;color:#b2aaa7;font-size:14px;">Subtotal</td><td style="padding-top:14px;color:#f7f2eb;font-size:14px;text-align:right;">${formatCOP(reservation.subtotal)}</td></tr>
                  ${reservation.discount > 0 ? `<tr><td style="padding-top:8px;color:#c4871a;font-size:14px;">Descuento ${escapeHtml(reservation.couponCode || "")}</td><td style="padding-top:8px;color:#c4871a;font-size:14px;text-align:right;">-${formatCOP(reservation.discount)}</td></tr>` : ""}
                  <tr><td style="padding-top:12px;color:#fff;font-size:18px;font-weight:800;text-transform:uppercase;">Total</td><td style="padding-top:12px;color:#c4871a;font-size:18px;font-weight:800;text-align:right;">${formatCOP(reservation.total)}</td></tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(196,135,26,.16);background:#080706;padding:18px;margin-bottom:18px;">
                  <tr><td style="color:#c4871a;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Ubicación</td></tr>
                  <tr><td style="padding-top:8px;color:#f7f2eb;font-size:15px;font-weight:700;">${escapeHtml(POLYGON_ADDRESS)}</td></tr>
                  <tr><td style="padding-top:6px;color:#8f8782;font-size:13px;">Dirección del cliente: ${escapeHtml(reservation.address)}, ${escapeHtml(reservation.city)}, ${escapeHtml(reservation.department)}</td></tr>
                  <tr><td style="padding-top:18px;"><a href="${MAPS_URL}" style="display:inline-block;background:#c4871a;color:#080706;text-decoration:none;padding:13px 18px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">Abrir ubicación en Maps</a></td></tr>
                </table>

                ${reservation.notes ? `<div style="border:1px solid rgba(196,135,26,.16);background:#171513;padding:16px;margin-bottom:18px;"><p style="margin:0 0 8px;color:#c4871a;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Notas</p><p style="margin:0;color:#b2aaa7;font-size:14px;line-height:1.6;">${escapeHtml(reservation.notes)}</p></div>` : ""}

                <p style="margin:0;color:#8f8782;font-size:12px;line-height:1.6;">Si necesitas soporte, comunícate con Power Guns al ${escapeHtml(CONTACT.phone)} o responde este correo. Presenta tu documento de identidad el día de la reserva.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `;

  const text = [
    `${title} - ${reservation.reservationCode}`,
    `Cliente: ${customerName}`,
    `Fecha: ${formatReservationDate(reservation.reservationDate)}`,
    `Hora: ${reservation.reservationTimeLabel}`,
    `Duración: ${reservation.durationHours} ${reservation.durationHours === 1 ? "hora" : "horas"}`,
    `Servicios: ${reservation.services.map((item) => `${item.serviceTitle} x ${item.quantity}`).join(", ")}`,
    `Total: ${formatCOP(reservation.total)}`,
    `Ubicación: ${POLYGON_ADDRESS}`,
    `Maps: ${MAPS_URL}`,
  ].join("\n");

  return { html, text };
}

function buildContactEmail(contact: ContactEmailData) {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const logoUrl = `cid:${LOGO_CID}`;
  const html = `
    <!doctype html>
    <html lang="es">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nuevo formulario de contacto</title></head>
      <body style="margin:0;background:#080706;font-family:Arial,Helvetica,sans-serif;color:#f7f2eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080706;padding:28px 12px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#0f0d0b;border:1px solid rgba(196,135,26,.22);">
              <tr>
                <td style="padding:26px;background:linear-gradient(135deg,#171513 0%,#0f0d0b 58%,#251909 100%);border-bottom:1px solid rgba(196,135,26,.18);">
                  <table role="presentation" width="100%"><tr>
                    <td><img src="${logoUrl}" width="72" height="72" alt="Power Guns" style="display:block;border-radius:50%;border:1px solid rgba(196,135,26,.45);"></td>
                    <td align="right" style="font-size:12px;color:#c4871a;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Contacto web</td>
                  </tr></table>
                  <h1 style="margin:22px 0 8px;font-size:30px;line-height:1.05;text-transform:uppercase;letter-spacing:.04em;color:#fff;">Nuevo formulario de contacto</h1>
                  <p style="margin:0;color:#b2aaa7;font-size:15px;line-height:1.6;">Un visitante envió una solicitud desde la página de contacto de ${SITE.name}.</p>
                </td>
              </tr>
              <tr><td style="padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(196,135,26,.16);background:#080706;padding:14px 18px;margin-bottom:18px;">
                  ${detailRow("Nombre completo", fullName)}
                  ${detailRow("Correo", contact.email)}
                  ${detailRow("Celular", `+57${contact.phone}`)}
                </table>
                <div style="border:1px solid rgba(196,135,26,.16);background:#171513;padding:18px;margin-bottom:18px;">
                  <p style="margin:0 0 10px;color:#c4871a;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Detalles de contacto</p>
                  <p style="margin:0;color:#f7f2eb;font-size:14px;line-height:1.7;white-space:pre-line;">${escapeHtml(contact.message)}</p>
                </div>
                <p style="margin:0;color:#8f8782;font-size:12px;line-height:1.6;">Este mensaje fue generado automáticamente desde el formulario público de contacto.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `;

  const text = [
    "Nuevo formulario de contacto",
    `Nombre: ${fullName}`,
    `Correo: ${contact.email}`,
    `Celular: +57${contact.phone}`,
    `Mensaje: ${contact.message}`,
  ].join("\n");

  return { html, text };
}

function getLogoAttachment(): MailAttachment {
  return {
    filename: "powerguns-logo.jpg",
    path: path.join(process.cwd(), "public", "logo.jpg"),
    cid: LOGO_CID,
  };
}

async function sendMail(options: { to: string | string[]; subject: string; html: string; text: string }): Promise<SendResult> {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: "SMTP no está configurado" };
  }

  try {
    await transporter.sendMail({
      from: {
        name: process.env.SMTP_FROM_NAME || SITE.name,
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || CONTACT.email,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: [getLogoAttachment()],
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar el correo";
    console.error("[EmailService]", message);
    return { success: false, error: message };
  }
}

export const emailService = {
  async sendReservationConfirmation(reservation: ReservationEmailData): Promise<SendResult> {
    const email = buildReservationEmail(reservation, "customer");
    return sendMail({
      to: reservation.email,
      subject: `Confirmación de reserva ${reservation.reservationCode} | ${SITE.name}`,
      ...email,
    });
  },

  async sendReservationAdminNotification(reservation: ReservationEmailData): Promise<SendResult> {
    const admins = await getReservationNotificationEmails();
    if (admins.length === 0) return { success: false, error: "No hay correo de empresa configurado" };

    const email = buildReservationEmail(reservation, "admin");
    return sendMail({
      to: admins,
      subject: `Nueva reserva ${reservation.reservationCode} | ${reservation.firstName} ${reservation.lastName}`,
      ...email,
    });
  },

  async sendContactAdminNotification(contact: ContactEmailData, recipients: string[]): Promise<SendResult> {
    const admins = recipients.map((email) => email.trim()).filter(Boolean);
    if (admins.length === 0) return { success: false, error: "No hay administradores configurados" };

    const email = buildContactEmail(contact);
    return sendMail({
      to: admins,
      subject: `Nuevo formulario de contacto | ${contact.firstName} ${contact.lastName}`,
      ...email,
    });
  },
};
