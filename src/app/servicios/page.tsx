import type { Metadata } from "next";
import { ServiciosPageContent } from "./content";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata: Metadata = {
  title: "Servicios | Power Guns Polígono",
  description:
    "Conoce los servicios, entrenamientos, certificaciones y experiencias disponibles en Power Guns Polígono en Villavicencio, Meta.",
};

export default function ServiciosPage() {
  return (
    <>
      <ServiciosPageContent />
      <HomeFooter />
    </>
  );
}
