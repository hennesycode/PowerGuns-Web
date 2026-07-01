"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/shared/SiteShell";

const sections = [
  {
    id: "introduccion",
    title: "Introducción",
    content: [
      "Power Guns S.A.S. agradece tu confianza y negocio. Somos una empresa con sede en Villavicencio, Meta, Colombia, especializada en entrenamiento táctico y práctica con armas de fuego, traumáticas y ejercicios virtuales.",
      "Por favor, lee esta Política de Privacidad y otorga tu consentimiento para el tratamiento de tus datos personales y el uso de nuestros servicios.",
    ],
  },
  {
    id: "quienes-somos",
    title: "Quiénes somos",
    content: ["Nuestra dirección de sitio web es:"],
    link: { text: "https://powergunspoligono.com", href: "https://powergunspoligono.com" },
  },
  {
    id: "comentarios",
    title: "Comentarios",
    content: [
      "Cuando los visitantes dejan comentarios en el sitio, recopilamos los datos mostrados en el formulario de comentarios, así como la dirección IP del visitante y la cadena del agente de usuario del navegador para ayudar a la detección de spam.",
      'Se puede proporcionar una cadena anónima creada a partir de tu dirección de correo electrónico, también denominada hash, al servicio Gravatar para verificar si lo estás utilizando. La política de privacidad del servicio Gravatar está disponible en:',
    ],
    link: { text: "https://automattic.com/privacy/", href: "https://automattic.com/privacy/" },
    extra: "Después de la aprobación de tu comentario, tu imagen de perfil será visible para el público en el contexto de tu comentario.",
  },
  {
    id: "medios",
    title: "Medios",
    content: [
      "Si subes imágenes al sitio web, debes evitar cargar imágenes con datos de ubicación incrustados, como datos EXIF GPS. Los visitantes del sitio web pueden descargar y extraer los datos de ubicación de las imágenes publicadas en el sitio.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    content: [
      "Si dejas un comentario en nuestro sitio, puedes optar por guardar tu nombre, dirección de correo electrónico y sitio web en cookies. Esto es para tu comodidad, para que no tengas que volver a rellenar tus datos cuando dejes otro comentario. Estas cookies tendrán una duración de un año.",
      "Si visitas nuestra página de acceso, se instalará una cookie temporal para determinar si tu navegador acepta cookies. Esta cookie no contiene datos personales y se elimina al cerrar el navegador.",
      "Cuando inicies sesión, se instalarán varias cookies para guardar tu información de acceso y opciones de visualización de pantalla. Las cookies de acceso permanecerán durante dos días y las cookies de opciones de pantalla se guardarán durante un año.",
      'Si seleccionas "Recuérdame" en tu inicio de sesión, las cookies se guardarán durante dos semanas. Si cierras la sesión de tu cuenta, las cookies de acceso se eliminarán.',
      "Si editas o publicas un artículo, se guardará una cookie adicional en tu navegador. Esta cookie no incluye datos personales y simplemente indica el ID del artículo que acabas de editar. Caduca después de un día.",
    ],
  },
  {
    id: "contenido-incrustado",
    title: "Contenido incrustado de otros sitios web",
    content: [
      "Los artículos de este sitio pueden incluir contenido incrustado, por ejemplo videos, imágenes, artículos u otros elementos. El contenido incrustado de otros sitios web se comporta exactamente de la misma manera que si el visitante hubiera visitado directamente dicho sitio web.",
      "Estos sitios web pueden recopilar datos sobre ti, utilizar cookies, incrustar seguimiento adicional de terceros y supervisar tu interacción con ese contenido incrustado, incluido el seguimiento de tu interacción si tienes una cuenta y estás conectado a ese sitio web.",
    ],
  },
  {
    id: "compartir-datos",
    title: "Con quién compartimos tus datos",
    content: [
      "Si solicitas un restablecimiento de contraseña, tu dirección IP podrá ser incluida en el correo electrónico de restablecimiento.",
    ],
  },
  {
    id: "conservacion-datos",
    title: "Cuánto tiempo conservamos tus datos",
    content: [
      "Si dejas un comentario, el comentario y sus metadatos se conservan indefinidamente. Esto nos permite reconocer y aprobar automáticamente cualquier comentario de seguimiento en lugar de mantenerlo en una cola de moderación.",
      "Para los usuarios que se registren en nuestro sitio web, si los hay, se almacenarán los datos de información personal que proporcionen. Cualquier usuario puede ver, editar o eliminar su información personal cuando lo desee, excepto el nombre de usuario, que no se puede editar. Los administradores del sitio web también pueden ver y editar dicha información.",
    ],
  },
  {
    id: "derechos-datos",
    title: "Qué derechos tienes sobre tus datos",
    content: [
      "Si tienes una cuenta en este sitio o has dejado comentarios, puedes solicitar la exportación de un archivo con los datos personales que tenemos sobre ti, incluyendo cualquier dato que nos hayas proporcionado.",
      "También puedes solicitar la eliminación de cualquier dato personal que conservemos sobre ti. Esto no incluye los datos que estemos obligados a conservar para fines administrativos, legales o de seguridad.",
    ],
  },
  {
    id: "envio-datos",
    title: "Dónde se envían tus datos",
    content: [
      "Los comentarios de los visitantes pueden ser revisados por un servicio automático de detección de spam.",
    ],
  },
];

export function PoliticaDePrivacidadContent() {
  const [inview, setInview] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInview(true);
          observer.unobserve(heroEl);
        }
      },
      { threshold: 0.06 },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#050403]">
      <div ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#c4871a_30%,#d4a244_50%,#c4871a_70%,transparent)] opacity-20" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c4871a]/[0.015] rounded-full blur-[100px] pointer-events-none" />

        <SiteShell>
          <div
            className="max-w-[720px]"
            style={{
              opacity: inview ? 1 : 0,
              transform: inview ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 0.6s cubic-bezier(0.22,0.61,0.36,1), transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#5B5A59] no-underline transition-colors hover:text-[#c4871a] focus:outline-none focus:ring-2 focus:ring-[#c4871a]/30 mb-8"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver al inicio
            </Link>

            <span className="inline-block font-['Rajdhani',sans-serif] text-[10px] font-semibold uppercase tracking-[.22em] text-[#c4871a] border border-[#c4871a]/30 px-3 py-1 mb-4">
              Legal
            </span>
            <h1 className="font-heading font-black text-[clamp(32px,4.5vw,48px)] uppercase leading-[1.05] text-white mb-3">
              Política de<span className="text-[#c4871a]"> Privacidad</span>
            </h1>
            <p className="text-base md:text-lg text-[#B2AAA7] font-heading font-bold uppercase tracking-[.06em] mb-1">
              Tratamiento y protección de datos personales
            </p>
            <p className="text-sm text-[#5B5A59] font-['Rajdhani',sans-serif] tracking-[.1em] uppercase">
              Power Guns Polígono S.A.S.
            </p>
          </div>
        </SiteShell>
      </div>

      <SiteShell className="pb-20 md:pb-28">
        <div className="max-w-[760px] mx-auto space-y-8">
          {sections.map((section, index) => (
            <ContentBlock key={section.id} section={section} index={index} />
          ))}
        </div>
      </SiteShell>
    </div>
  );
}

function ContentBlock({
  section,
  index,
}: {
  section: (typeof sections)[number];
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const blockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={blockRef}
      className="border border-[#c4871a]/10 bg-[#0F0D0B] p-6 md:p-8"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.22,0.61,0.36,1) ${index * 0.05}s, transform 0.6s cubic-bezier(0.22,0.61,0.36,1) ${index * 0.05}s`,
      }}
    >
      <h2 className="font-heading font-bold text-lg md:text-xl uppercase tracking-[.06em] text-white mb-4">
        {section.title}
      </h2>
      <div className="w-12 h-[2px] bg-[#c4871a]/50 mb-5" />

      <div className="space-y-4">
        {section.content.map((paragraph, i) => (
          <p key={i} className="text-sm md:text-base text-[#B2AAA7] leading-relaxed">
            {paragraph}
          </p>
        ))}

        {section.link && (
          <a
            href={section.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-[#c4871a] hover:text-[#d6a244] transition-colors no-underline font-semibold break-all"
          >
            {section.link.text}
          </a>
        )}

        {section.extra && (
          <p className="text-sm md:text-base text-[#B2AAA7] leading-relaxed mt-4">
            {section.extra}
          </p>
        )}
      </div>
    </div>
  );
}
