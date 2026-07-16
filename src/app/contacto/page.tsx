import type { Metadata } from "next";
import { ContactoContent } from "@/app/contacto/content";

export const metadata: Metadata = {
  title: "Contacto | Power Guns Polígono S.A.S.",
  description: "Comunícate con Power Guns Polígono S.A.S. en Villavicencio, Meta. Teléfono, correo, ubicación, horario y formulario de contacto.",
};

export default function ContactoPage() {
  return <ContactoContent />;
}
