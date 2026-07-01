import type { Metadata } from "next";
import { ReservaContent } from "@/components/reservations/ReservaContent";

export const metadata: Metadata = {
  title: "Reservar Turno — Power Guns Polígono S.A.S.",
  description: "Agenda tu turno en el mejor polígono de tiro de Villavicencio.",
};

export default function ReservasPage() {
  return <ReservaContent />;
}
