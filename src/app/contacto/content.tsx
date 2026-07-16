"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CONTACT, POLYGON_ADDRESS, SITE } from "@/lib/constants";
import { SiteShell } from "@/components/shared/SiteShell";

const MAPS_LINK = "https://maps.app.goo.gl/aoPPrqEmKNNyweXe8";
const mapEmbedUrl = `https://maps.google.com/maps?width=100%25&height=100%25&hl=es&q=${encodeURIComponent(POLYGON_ADDRESS)}&t=k&z=18&ie=UTF8&iwloc=B&output=embed`;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  acceptedPrivacy: boolean;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  acceptedPrivacy: false,
};

function ContactCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="border border-[#c4871a]/12 bg-[#0F0D0B] p-5 transition-colors hover:border-[#c4871a]/35">
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#5B5A59]">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-white">{value}</p>
    </div>
  );

  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="block no-underline">{content}</a> : content;
}

export function ContactoContent() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (form.firstName.trim().length < 2) return "Ingresa tus nombres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.firstName.trim())) return "Los nombres solo pueden contener letras";
    if (form.lastName.trim().length < 2) return "Ingresa tus apellidos";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.lastName.trim())) return "Los apellidos solo pueden contener letras";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Ingresa un correo válido";
    if (!/^3\d{9}$/.test(form.phone)) return "Ingresa un celular colombiano válido de 10 dígitos";
    if (form.message.trim().length < 10) return "Describe tu solicitud con mínimo 10 caracteres";
    if (!form.acceptedPrivacy) return "Debes aceptar políticas de privacidad, términos y condiciones";
    return null;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar el formulario");
      toast.success("Formulario enviado correctamente. Te contactaremos pronto.");
      setForm(emptyForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el formulario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="bg-[#050403] pt-28 text-white md:pt-32">
      <section className="relative overflow-hidden border-b border-[#c4871a]/10 pb-14 pt-8 md:pb-20">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] -translate-x-1/3 rounded-full bg-[#c4871a]/[0.04] blur-[130px]" />
        <SiteShell className="relative">
          <div className="max-w-3xl">
            <span className="inline-block border border-[#c4871a]/30 px-3 py-1 font-['Rajdhani',sans-serif] text-[10px] font-semibold uppercase tracking-[.22em] text-[#c4871a]">
              Contacto
            </span>
            <h1 className="mt-5 font-heading text-[clamp(42px,7vw,88px)] font-black uppercase leading-[.92] tracking-[.02em]">
              Hablemos<br /><span className="text-[#c4871a]">Directo</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#B2AAA7] md:text-lg">
              Estamos listos para atender reservas, entrenamientos, eventos empresariales y consultas sobre nuestros servicios en Villavicencio.
            </p>
          </div>
        </SiteShell>
      </section>

      <section className="py-12 md:py-16">
        <SiteShell>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ContactCard label="Empresa" value={SITE.name} />
            <ContactCard label="Celular principal" value={CONTACT.phone} href="tel:3057138140" />
            <ContactCard label="Correo" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
            <ContactCard label="Dirección" value={CONTACT.address} href={MAPS_LINK} />
          </div>
        </SiteShell>
      </section>

      <section className="pb-16 md:pb-24">
        <SiteShell>
          <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
            <div className="space-y-6">
              <div className="border border-[#c4871a]/12 bg-[#0F0D0B] p-6 md:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#c4871a]">Horario de atención</p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#c4871a]/10 pb-3 text-sm">
                    <span className="font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">Lunes a sábado</span>
                    <span className="font-heading font-bold text-white">8:00 am - 6:00 pm</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#c4871a]/10 pb-3 text-sm">
                    <span className="font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">Domingos</span>
                    <span className="font-heading font-bold text-[#B63A2B]">Cerrado</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">Festivos</span>
                    <span className="font-heading font-bold text-[#B63A2B]">Cerrado</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border border-[#c4871a]/12 bg-[#0F0D0B]">
                <div className="relative h-[360px] md:h-[460px]">
                  <iframe
                    src={mapEmbedUrl}
                    title="Power Guns Polígono - Ubicación"
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[#050403]/15" />
                </div>
                <div className="flex flex-col gap-2 border-t border-[#c4871a]/10 p-4 text-xs text-[#B2AAA7] sm:flex-row sm:items-center sm:justify-between">
                  <span>{POLYGON_ADDRESS}</span>
                  <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="font-semibold uppercase tracking-[.08em] text-[#c4871a] no-underline hover:text-[#d6a244]">Abrir en Maps</a>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="border border-[#c4871a]/12 bg-[#0F0D0B] p-5 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#c4871a]">Formulario de contacto</p>
                <h2 className="mt-2 font-heading text-2xl font-black uppercase tracking-[.03em] text-white">Cuéntanos qué necesitas</h2>
                <p className="mt-2 text-sm leading-6 text-[#B2AAA7]">Un administrador recibirá tu solicitud directamente por correo.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombres"><input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="contact-input" autoComplete="given-name" /></Field>
                <Field label="Apellidos"><input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="contact-input" autoComplete="family-name" /></Field>
                <Field label="Correo electrónico"><input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="contact-input" autoComplete="email" /></Field>
                <Field label="Número de celular">
                  <div className="flex border border-[#3C3A37] bg-[#080706]">
                    <span className="border-r border-[#3C3A37] px-3 py-3 text-sm text-[#B2AAA7]">🇨🇴 +57</span>
                    <input value={form.phone} maxLength={10} inputMode="numeric" onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none" autoComplete="tel-national" />
                  </div>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Detalles de contacto">
                  <textarea value={form.message} onChange={(e) => setField("message", e.target.value)} className="contact-input min-h-36 resize-none" placeholder="Describe el servicio, reserva, evento o información que necesitas." />
                </Field>
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm text-[#B2AAA7]">
                <input type="checkbox" checked={form.acceptedPrivacy} onChange={(e) => setField("acceptedPrivacy", e.target.checked)} className="mt-1 accent-[#c4871a]" />
                <span>
                  Acepto las políticas de privacidad, términos y condiciones. <Link href="/politica-de-privacidad" className="text-[#c4871a] no-underline hover:text-[#d6a244]">Ver política de privacidad</Link>.
                </span>
              </label>

              <button type="submit" disabled={saving} className="mt-6 w-full bg-[#c4871a] px-6 py-4 font-heading text-sm font-bold uppercase tracking-[.14em] text-[#080706] transition-colors hover:bg-[#d6a244] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Enviando..." : "Enviar formulario"}
              </button>

              <style jsx global>{`.contact-input{width:100%;border:1px solid #3C3A37;background:#080706;padding:.75rem;color:white;font-size:.875rem;outline:none}.contact-input:focus{border-color:rgba(196,135,26,.6)}.contact-input::placeholder{color:#5B5A59}`}</style>
            </form>
          </div>
        </SiteShell>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-[#B2AAA7]">{label}</span>{children}</label>;
}
