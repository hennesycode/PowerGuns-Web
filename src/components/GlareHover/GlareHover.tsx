"use client";

import type { ReactNode, CSSProperties } from "react";
import "./GlareHover.css";

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  let r: number, g: number, b: number;

  if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  } else if (/^[0-9A-Fa-f]{3}$/.test(clean)) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    return hex;
  }

  return `rgba(${r},${g},${b},${opacity})`;
}

interface GlareHoverProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
}

export default function GlareHover({
  children,
  className = "",
  style,
  width,
  height,
  background,
  borderRadius,
  borderColor,
  glareColor = "#c4871a",
  glareOpacity = 0.18,
  glareAngle = -35,
  glareSize = 280,
  transitionDuration = 800,
  playOnce = false,
}: GlareHoverProps) {
  const glareRgba = hexToRgba(glareColor, glareOpacity);

  const vars = {
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": glareRgba,
  } as Record<string, string>;

  if (width) vars["--gh-width"] = width;
  if (height) vars["--gh-height"] = height;
  if (background) vars["--gh-bg"] = background;
  if (borderRadius) vars["--gh-br"] = borderRadius;
  if (borderColor) vars["--gh-border"] = borderColor;

  return (
    <div
      className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
