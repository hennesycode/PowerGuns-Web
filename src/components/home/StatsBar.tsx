"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SiteShell } from "@/components/shared/SiteShell";
import { STATS } from "@/lib/constants";

const TOTAL = STATS.length;
const INTERVAL = 3500;

export function StatsBar() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOff, setDragOff] = useState(0);
  const lock = useRef(false);
  const dragStart = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const slide = useCallback((dir: 1 | -1) => {
    if (lock.current) return;
    lock.current = true;
    setLeaving(active);
    setPhase("exit");

    setTimeout(() => {
      setPhase("enter");
      setActive((p) => (p + dir + TOTAL) % TOTAL);
    }, 280);

    setTimeout(() => {
      setPhase("idle");
      setLeaving(null);
      lock.current = false;
    }, 650);
  }, [active]);

  const goNext = useCallback(() => slide(1), [slide]);
  const goPrev = useCallback(() => slide(-1), [slide]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(goNext, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, goNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    dragStart.current = e.touches[0].clientX;
    setDragOff(0);
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    setDragOff(e.touches[0].clientX - dragStart.current);
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (dragOff < -45) goNext();
    else if (dragOff > 45) goPrev();
    else setPaused(false);
    setDragOff(0);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setPaused(true);
    dragStart.current = e.clientX;
    setDragOff(0);
    setDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragOff(e.clientX - dragStart.current);
  };
  const onMouseUp = () => {
    setDragging(false);
    if (dragOff < -45) goNext();
    else if (dragOff > 45) goPrev();
    else setPaused(false);
    setDragOff(0);
  };

  const current = phase === "enter" ? active : leaving ?? active;

  return (
    <div className="bg-[#0F0D0B] border-t border-[#c4871a]/25 border-b border-[#c4871a]/15">
      <SiteShell>
        <div
          className="relative h-[130px] md:hidden select-none overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* ─── FASE EXIT ─── */}
          {phase === "exit" && leaving !== null && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center">
                <div
                  className="font-heading font-black text-[46px] leading-none text-[#c4871a] tracking-[-.02em]"
                  style={{ animation: "exit-up 0.2s ease-out both" }}
                >
                  {STATS[leaving].value}
                  <span className="text-2xl text-[#d4a244]">{STATS[leaving].suffix}</span>
                </div>
                <div
                  className="font-['Rajdhani',sans-serif] font-medium text-[11px] tracking-[.22em] uppercase text-[#B2AAA7] mt-1.5"
                  style={{ animation: "exit-up 0.2s ease-out 0.08s both" }}
                >
                  {STATS[leaving].label}
                </div>
              </div>
            </div>
          )}

          {/* ─── FASE ENTER ─── */}
          {phase === "enter" && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center">
                <div
                  className="font-heading font-black text-[46px] leading-none text-[#c4871a] tracking-[-.02em]"
                  style={{ animation: "enter-right 0.25s ease-out both" }}
                >
                  {STATS[active].value}
                  <span className="text-2xl text-[#d4a244]">{STATS[active].suffix}</span>
                </div>
                <div
                  className="font-['Rajdhani',sans-serif] font-medium text-[11px] tracking-[.22em] uppercase text-[#B2AAA7] mt-1.5"
                  style={{ animation: "enter-right 0.25s ease-out 0.12s both" }}
                >
                  {STATS[active].label}
                </div>
              </div>
            </div>
          )}

          {/* ─── IDLE (estático) ─── */}
          {phase === "idle" && !dragging && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center">
                <div className="font-heading font-black text-[46px] leading-none text-[#c4871a] tracking-[-.02em]">
                  {STATS[active].value}
                  <span className="text-2xl text-[#d4a244]">{STATS[active].suffix}</span>
                </div>
                <div className="font-['Rajdhani',sans-serif] font-medium text-[11px] tracking-[.22em] uppercase text-[#B2AAA7] mt-1.5">
                  {STATS[active].label}
                </div>
              </div>
            </div>
          )}

          {/* ─── DRAG ─── */}
          {dragging && (
            <div
              className="absolute inset-0 flex items-center justify-center px-4"
              style={{
                transform: `translateX(${dragOff}px)`,
                transition: "none",
              }}
            >
              <div className="text-center">
                <div className="font-heading font-black text-[46px] leading-none text-[#c4871a] tracking-[-.02em]">
                  {STATS[current].value}
                  <span className="text-2xl text-[#d4a244]">{STATS[current].suffix}</span>
                </div>
                <div className="font-['Rajdhani',sans-serif] font-medium text-[11px] tracking-[.22em] uppercase text-[#B2AAA7] mt-1.5">
                  {STATS[current].label}
                </div>
              </div>
            </div>
          )}

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {STATS.map((_, i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "w-5 bg-[#c4871a]" : "w-2 bg-[#c4871a]/30"
                }`}
                aria-label={`Ir a ${STATS[i].label}`}
                onClick={() => {
                  if (lock.current || i === active) return;
                  lock.current = true;
                  setLeaving(active);
                  setPhase("exit");

                  setTimeout(() => {
                    setPhase("enter");
                    setActive(i);
                  }, 280);

                  setTimeout(() => {
                    setPhase("idle");
                    setLeaving(null);
                    lock.current = false;
                  }, 650);
                }}
              />
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`relative px-4 py-10 text-center ${
                i > 0
                  ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-14 before:w-px before:bg-[#c4871a]/18"
                  : ""
              }`}
            >
              <div className="font-heading font-black text-[56px] leading-none text-[#c4871a] tracking-[-.02em]">
                {stat.value}
                <span className="text-2xl text-[#d4a244]">{stat.suffix}</span>
              </div>
              <div className="font-['Rajdhani',sans-serif] font-medium text-[11px] tracking-[.22em] uppercase text-[#B2AAA7] mt-1.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </SiteShell>
    </div>
  );
}
