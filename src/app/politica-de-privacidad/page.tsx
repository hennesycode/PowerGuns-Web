import type { Metadata } from "next";
import { PoliticaDePrivacidadContent } from "./content";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata: Metadata = {
  title: "Política de Privacidad | Power Guns Polígono",
  description:
    "Conoce la política de privacidad, tratamiento de datos personales, cookies y derechos de los usuarios de Power Guns Polígono S.A.S.",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <>
      <PoliticaDePrivacidadContent />
      <HomeFooter />
    </>
  );
}