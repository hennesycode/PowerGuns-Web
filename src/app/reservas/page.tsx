import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Turno — Power Guns Polígono S.A.S.",
  description: "Agenda tu turno en el mejor polígono de tiro de Villavicencio. Elige tu paquete, fecha y horario.",
};

export default function ReservasPage() {
  return (
    <div className="pt-24 section-padding">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading font-black text-[clamp(40px,5vw,64px)] uppercase leading-[.96] text-white mb-4">
          TU <span className="text-[#c4871a]">RESERVA</span>
        </h1>
        <p className="text-[#8a8a8a] mb-12 max-w-lg">
          Completa el formulario y recibe confirmación en menos de 2 horas. Todas las reservas
          pasan por validación previa.
        </p>

        <div className="bg-[#111111] border border-[#c4871a]/15 p-8 md:p-12">
          <p className="text-[#8a8a8a] text-center">
            Utiliza el formulario de reserva en la{" "}
            <a href="/#reservar" className="text-[#c4871a]">
              página principal
            </a>{" "}
            para agendar tu sesión.
          </p>
        </div>
      </div>
    </div>
  );
}
