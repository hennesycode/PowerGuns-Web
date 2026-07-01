"use client";

import { SiteShell } from "@/components/shared/SiteShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TIME_SLOTS } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function BookingPanel() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    persons: "1",
    timeSlot: "",
    serviceId: "",
    packageId: "",
    notes: "",
    acceptedTerms: false,
  });

  const update = (k: string, v: string | boolean | null) => setForm((p) => ({ ...p, [k]: v ?? "" }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return toast.error("Selecciona una fecha");
    if (!form.acceptedTerms) return toast.error("Debes aceptar los términos");

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: format(date, "yyyy-MM-dd"),
          serviceId: parseInt(form.serviceId),
          packageId: parseInt(form.packageId),
          persons: parseInt(form.persons),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al reservar");
      }
      toast.success("Reserva enviada. Te confirmaremos en breve.");
      router.push("/reservas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reservar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-[#171513] border-[#c4871a]/18 text-white font-sans text-sm py-3 px-4 w-full outline-none focus:border-[#c4871a] transition-colors placeholder:text-[#B2AAA7]/60 rounded-none";

  return (
    <section id="reservar" className="py-16 md:py-24">
      <SiteShell>
        <SectionHeader
          eyebrow="Agenda tu sesión"
          title={<>HACER <span className="text-[#c4871a]">RESERVA</span></>}
        />

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-10 lg:gap-18 mt-14">
          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Nombre Completo
              </label>
              <Input
                required
                placeholder="Tu nombre completo"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Teléfono / WhatsApp
              </label>
              <Input
                required
                type="tel"
                placeholder="300 000 0000"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Número de Personas
              </label>
              <select
                required
                value={form.persons}
                onChange={(e) => update("persons", e.target.value)}
                className={cn(inputClass, "appearance-none")}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Fecha Preferida
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      inputClass,
                      "flex items-center text-left",
                      !date && "text-[#B2AAA7]/60"
                    )}
                  >
                    {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#171513] border-[#c4871a]/18">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={{ before: new Date() }}
                    className="bg-[#171513] text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time slot */}
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Horario
              </label>
              <Select value={form.timeSlot} onValueChange={(v) => update("timeSlot", v)}>
                <SelectTrigger className={cn(inputClass, "h-auto")}>
                  <SelectValue placeholder="Seleccionar turno" />
                </SelectTrigger>
                <SelectContent className="bg-[#171513] border-[#c4871a]/18 text-white">
                  {TIME_SLOTS.map((s) => (
                    <SelectItem key={s.start} value={`${s.start}-${s.end}`}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Packages */}
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Paquete
              </label>
              <Select value={form.packageId} onValueChange={(v) => update("packageId", v)}>
                <SelectTrigger className={cn(inputClass, "h-auto")}>
                  <SelectValue placeholder="Seleccionar paquete" />
                </SelectTrigger>
                <SelectContent className="bg-[#171513] border-[#c4871a]/18 text-white">
                  <SelectItem value="1">Iniciación — $85.000</SelectItem>
                  <SelectItem value="2">Táctico — $165.000</SelectItem>
                  <SelectItem value="3">Elite — $280.000</SelectItem>
                  <SelectItem value="0">Evento Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service */}
            <div className="col-span-2 sm:col-span-1">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Servicio
              </label>
              <Select value={form.serviceId} onValueChange={(v) => update("serviceId", v)}>
                <SelectTrigger className={cn(inputClass, "h-auto")}>
                  <SelectValue placeholder="Tipo de actividad" />
                </SelectTrigger>
                <SelectContent className="bg-[#171513] border-[#c4871a]/18 text-white">
                  <SelectItem value="1">Tiro con Pistola</SelectItem>
                  <SelectItem value="2">Tiro con Rifle</SelectItem>
                  <SelectItem value="3">Defensa Personal</SelectItem>
                  <SelectItem value="4">Evento Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="font-['Rajdhani',sans-serif] font-semibold text-[10px] tracking-[.25em] uppercase text-[#c4871a] mb-1.5 block">
                Observaciones
              </label>
              <Textarea
                placeholder="Cuéntanos qué necesitas o requerimientos especiales..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className={cn(inputClass, "min-h-24 resize-y")}
              />
            </div>

            {/* Terms */}
            <div className="col-span-2 flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={form.acceptedTerms}
                onChange={(e) => update("acceptedTerms", e.target.checked)}
                className="mt-1 accent-[#c4871a]"
              />
              <label htmlFor="terms" className="text-sm text-[#B2AAA7] leading-relaxed cursor-pointer">
                Acepto las normas de seguridad del polígono y confirmo que cumplo con los requisitos
                legales para el uso de armas de fuego en Colombia. Entiendo que mi reserva está sujeta
                a validación previa.
              </label>
            </div>

            {/* Submit */}
            <div className="col-span-2 mt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c4871a] text-[#080706] font-heading font-bold text-[15px] tracking-[.14em] uppercase py-5 hover:bg-[#d4a244] transition-colors rounded-none"
              >
                {loading ? "ENVIANDO..." : "CONFIRMAR RESERVA"}
              </Button>
            </div>
          </div>

          {/* Side info */}
          <div className="text-sm text-[#B2AAA7] leading-relaxed space-y-4">
            <p>
              Confirma tu turno directamente aquí respondemos en menos de 2 horas en horario de
              atención.
            </p>
            <p className="text-xs text-[#B2AAA7]/60 mt-4">
              Todas las reservas pasan por un proceso de validación. Recibirás confirmación por
              WhatsApp o correo electrónico.
            </p>
            <p className="text-xs text-[#B2AAA7]/60">
              Debes presentar documento de identidad vigente el día de tu sesión.
            </p>
          </div>
        </form>
      </SiteShell>
    </section>
  );
}
