"use client";

import { useEffect, useRef } from "react";
import "./GridScan.css";

interface GridScanProps {
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  scanDuration?: number;
  scanDelay?: number;
  scanGlow?: number;
  scanSoftness?: number;
  opacity?: number;
}

export default function GridScan({
  lineThickness = 1,
  linesColor = "#3A2A12",
  gridScale = 0.12,
  scanColor = "#c4871a",
  scanOpacity = 0.28,
  scanDuration = 5.5,
  scanDelay = 3.5,
  scanGlow = 0.35,
  scanSoftness = 2.8,
  opacity = 0.7,
}: GridScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf: number;
    let startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Grid
      const cellSize = Math.max(w, h) * gridScale;
      ctx.strokeStyle = linesColor;
      ctx.lineWidth = lineThickness;

      for (let x = 0; x <= w; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center crosshair accent
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = linesColor;
      ctx.lineWidth = lineThickness;
      const arm = 20;
      ctx.beginPath();
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
      ctx.stroke();

      // Scan line animation
      const elapsed = (performance.now() - startTime) / 1000;
      const totalCycle = scanDuration + scanDelay;
      const cycleTime = elapsed % totalCycle;
      const scanY = cycleTime < scanDuration
        ? (cycleTime / scanDuration) * h
        : h + 50;

      if (scanY <= h) {
        // Glow behind scan line
        const glowRadius = cellSize * scanSoftness;
        const grad = ctx.createRadialGradient(cx, scanY, 0, cx, scanY, glowRadius);
        grad.addColorStop(0, `rgba(196,135,26,${scanOpacity})`);
        grad.addColorStop(0.4, `rgba(196,135,26,${scanOpacity * 0.3})`);
        grad.addColorStop(1, "rgba(196,135,26,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - glowRadius, w, glowRadius * 2);

        // Scan line
        ctx.strokeStyle = `rgba(196,135,26,${Math.min(1, scanOpacity * 2)})`;
        ctx.lineWidth = Math.max(1, lineThickness * 2);
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [lineThickness, linesColor, gridScale, scanColor, scanOpacity, scanDuration, scanDelay, scanGlow, scanSoftness]);

  return (
    <canvas
      ref={canvasRef}
      className="grid-scan"
      style={{ opacity }}
    />
  );
}
