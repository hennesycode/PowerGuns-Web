"use client";

import { useEffect, useRef, useState } from "react";

export function BulletScrollDivider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      const start = winH * 0.9;
      const end = -rect.height * 0.5;

      if (rect.top > start) {
        setProgress(0);
        return;
      }
      if (rect.top < end) {
        setProgress(1);
        return;
      }
      const p = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, p)));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  const travel = progress * 100;
  const bulletScale = 0.6 + progress * 0.8;
  const fireOpacity = Math.sin(progress * Math.PI) * 0.95;
  const fireWidth = 90 + progress * 320;
  const dropSize = Math.round(8 + progress * 12);
  const dropAlpha = Math.round((0.4 + fireOpacity * 0.4) * 100) / 100;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050403] overflow-hidden"
      style={{ height: "180px" }}
    >
      {/* Línea guía tenue */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          transform: "translateY(-0.5px)",
          backgroundColor: "rgba(196,135,26,0.08)",
        }}
      />

      {/* CONTENEDOR ÚNICO — solo este elemento se mueve con el scroll */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: `${travel}%`,
          transform: `translate(-50%, -50%) scale(${bulletScale})`,
          width: "200px",
          height: "80px",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* DESTELLO / ESTELA — wrapper centrado verticalmente; la animación va en un div interno para no pisar el translateY */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: `${-fireWidth}px`,
            width: `${fireWidth}px`,
            height: "80px",
            transform: "translateY(-50%)",
            opacity: fireOpacity,
            zIndex: 0,
          }}
        >
          <div
            className="w-full h-full pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 100% 45% at 100% 50%, rgba(196,135,26,0.75) 0%, rgba(214,162,68,0.4) 12%, rgba(180,58,27,0.15) 30%, transparent 65%)",
              filter: "blur(3px)",
              animation: "fire-pulse 0.35s ease-in-out infinite",
            }}
          />
        </div>

        {/* CHISPA / GLOW pegado al culote — detrás de la bala pero delante de la estela */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "-18px",
            width: "24px",
            height: "24px",
            transform: "translateY(-50%)",
            opacity: fireOpacity * 0.6,
            borderRadius: "50%",
            backgroundImage:
              "radial-gradient(circle, rgba(255,200,100,0.5) 0%, transparent 70%)",
            filter: "blur(3px)",
            zIndex: 1,
          }}
        />

        {/* BALA — por encima de todo */}
        <img
          src="/bullet.png"
          alt=""
          className="w-[200px] h-auto select-none"
          draggable={false}
          style={{
            position: "relative",
            zIndex: 2,
            filter: `drop-shadow(0 0 ${dropSize}px rgba(196,135,26,${dropAlpha}))`,
          }}
        />
      </div>
    </section>
  );
}