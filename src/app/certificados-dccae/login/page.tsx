"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GridScan from "@/components/GridScan/GridScan";

export default function CertificadosDccaeLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/certificados-dccae/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        return;
      }
      router.push("/certificados-dccae/consulta");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050403]">
      <GridScan lineThickness={1} linesColor="#3A2A12" gridScale={0.12} scanColor="#c4871a" scanOpacity={0.25} scanDuration={5.5} scanDelay={3.5} scanGlow={0.32} scanSoftness={2.8} opacity={0.7} />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[#050403]/50 via-[#050403]/20 to-[#050403]/90 pointer-events-none" />
      <Link href="/" className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-[#5B5A59] no-underline transition-colors hover:text-[#c4871a] md:left-8 md:top-8">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5"><polyline points="15 18 9 12 15 6" /></svg>
        Volver al inicio
      </Link>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] border border-[#c4871a]/22 bg-[#080706]/92 shadow-[0_24px_80px_rgba(0,0,0,.45)]">
          <div className="p-8 md:p-10">
            <div className="mb-8 text-center">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#c4871a]/35 bg-[#0F0D0B] shadow-[0_0_30px_rgba(196,135,26,0.18)]">
                <Image src="/logo.jpg" alt="Power Guns" width={64} height={64} className="h-full w-full object-contain" />
              </div>
              <h1 className="font-heading text-2xl font-black uppercase tracking-[.04em] text-white">Consulta DCCAE</h1>
              <p className="mt-2 text-sm leading-relaxed text-[#B2AAA7]">Acceso seguro para visualizar certificados y documentos autorizados.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="dccae-username" className="mb-1.5 block text-xs uppercase tracking-[.18em] text-[#B2AAA7]">Usuario autorizado</label>
                <input id="dccae-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="w-full border border-[#c4871a]/18 bg-[#0F0D0B] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5B5A59] focus:border-[#c4871a]/50" placeholder="usuario" />
              </div>
              <div>
                <label htmlFor="dccae-password" className="mb-1.5 block text-xs uppercase tracking-[.18em] text-[#B2AAA7]">Contraseña</label>
                <input id="dccae-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="w-full border border-[#c4871a]/18 bg-[#0F0D0B] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5B5A59] focus:border-[#c4871a]/50" placeholder="••••••••" />
              </div>
              {error && <div className="text-xs font-semibold tracking-[.06em] text-[#B63A2B]">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-[#c4871a] py-3.5 font-heading text-sm font-bold uppercase tracking-[.14em] text-[#080706] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4a244] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{loading ? "Validando..." : "Ingresar a certificados"}</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
