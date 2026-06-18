import type { Metadata } from "next";
import { PackagesSection } from "@/components/home/PackagesSection";

export const metadata: Metadata = {
  title: "Paquetes y Planes — Power Guns Polígono S.A.S.",
  description: "Descubre nuestros paquetes de tiro: Iniciación, Táctico y Elite. Experiencias desde $85.000 COP.",
};

export default function PlanesPage() {
  return (
    <div className="pt-24">
      <PackagesSection />
    </div>
  );
}
