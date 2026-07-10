"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GridScan from "@/components/GridScan/GridScan";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050403]">
      {/* GridScan background */}
      <GridScan
        lineThickness={1}
        linesColor="#3A2A12"
        gridScale={0.12}
        scanColor="#c4871a"
        scanOpacity={0.28}
        scanDuration={5.5}
        scanDelay={3.5}
        scanGlow={0.35}
        scanSoftness={2.8}
        opacity={0.7}
      />

      {/* Dark overlays for legibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050403]/60 via-transparent to-[#050403]/80 pointer-events-none z-[1]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,135,26,0.04),transparent_70%)] pointer-events-none z-[1]" />

      {/* Volver al inicio */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 inline-flex items-center gap-2 font-['Rajdhani',sans-serif] text-[11px] tracking-[.18em] uppercase text-[#5B5A59] hover:text-[#c4871a] transition-colors duration-200 no-underline"
        aria-label="Volver a la página principal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al inicio
      </Link>

      {/* Login container */}
      <div
        ref={ref}
        className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-4 py-12"
      >
        <div
          className="w-full max-w-[420px]"
          style={{
            opacity: 1,
            transform: "translateY(0)",
            transition:
              "opacity 0.7s cubic-bezier(0.22,0.61,0.36,1), transform 0.7s cubic-bezier(0.22,0.61,0.36,1)",
          }}
        >
          <div
            className="border border-[#c4871a]/22 bg-[#080706]/90"
          >
            <div className="p-8 md:p-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#c4871a]/35 bg-[#0F0D0B] mb-5 overflow-hidden shadow-[0_0_30px_rgba(196,135,26,0.18)]">
                  <Image
                    src="/logo.jpg"
                    alt="Power Guns"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="font-heading font-black text-2xl uppercase tracking-[.04em] text-white">
                  Power Guns
                </h1>
                <p className="font-['Rajdhani',sans-serif] text-xs tracking-[.22em] uppercase text-[#B2AAA7] mt-1">
                  Bienvenido a la experiencia
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block font-['Rajdhani',sans-serif] text-xs tracking-[.18em] uppercase text-[#B2AAA7] mb-1.5"
                  >
                    Correo electrónico o usuario
                  </label>
                  <input
                    id="login-identifier"
                    name="identifier"
                    autoComplete="username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="correo@powerguns.com o usuario"
                    className="w-full bg-[#0F0D0B] border border-[#c4871a]/18 px-4 py-3 text-sm text-white placeholder-[#5B5A59] outline-none focus:border-[#c4871a]/50 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block font-['Rajdhani',sans-serif] text-xs tracking-[.18em] uppercase text-[#B2AAA7] mb-1.5"
                  >
                    Contraseña
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0F0D0B] border border-[#c4871a]/18 px-4 py-3 text-sm text-white placeholder-[#5B5A59] outline-none focus:border-[#c4871a]/50 transition-colors"
                  />
                </div>

                {error && (
                  <div className="text-xs text-[#B63A2B] font-['Rajdhani',sans-serif] font-semibold tracking-[.06em]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c4871a] text-[#080706] font-heading font-bold text-sm tracking-[.14em] uppercase py-3.5 transition-all duration-200 hover:bg-[#d4a244] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>

              {/* Registro */}
              <div className="mt-3">
                <Link
                  href="/register"
                  className="block w-full border border-[#c4871a]/30 text-[#c4871a] font-heading font-bold text-sm tracking-[.14em] uppercase py-3.5 text-center transition-all duration-200 hover:bg-[#c4871a]/10 hover:border-[#c4871a]/60 hover:-translate-y-0.5 active:translate-y-0 no-underline"
                >
                  Registro
                </Link>
              </div>

              {/* Footer */}
              <div className="text-center mt-8">
                <p className="font-['Rajdhani',sans-serif] text-[10px] tracking-[.2em] uppercase text-[#5B5A59]">
                  Power Guns Polígono S.A.S. &copy; {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
