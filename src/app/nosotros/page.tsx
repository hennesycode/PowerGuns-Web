import type { Metadata } from "next";
import { NosotrosPageContent } from "./content";

export const metadata: Metadata = {
  title: "Nosotros | Power Guns Polígono",
  description:
    "Conoce Power Guns Polígono S.A.S., un espacio profesional en Villavicencio, Meta, especializado en entrenamiento, práctica, simulación virtual y servicios para personas y empresas.",
};

export default function NosotrosPage() {
  return <NosotrosPageContent />;
}
