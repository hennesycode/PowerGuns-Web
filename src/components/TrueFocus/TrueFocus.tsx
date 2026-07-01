"use client";

import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import "./TrueFocus.css";

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  focusPadding?: number;
  activeColor?: string;
}

export default function TrueFocus({
  sentence = "ACERCA DE|NUESTRO POLÍGONO",
  separator = "|",
  manualMode = false,
  blurAmount = 2.5,
  borderColor = "#c4871a",
  glowColor = "rgba(196, 135, 26, 0.65)",
  animationDuration = 0.6,
  pauseBetweenAnimations = 1.1,
  focusPadding = 12,
  activeColor,
}: TrueFocusProps) {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  const updateFocusRect = useCallback(() => {
    if (currentIndex === -1) return;
    const el = wordRefs.current[currentIndex];
    const parent = containerRef.current;
    if (!el || !parent) return;

    const parentRect = parent.getBoundingClientRect();
    const activeRect = el.getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left - focusPadding,
      y: activeRect.top - parentRect.top - focusPadding,
      width: activeRect.width + focusPadding * 2,
      height: activeRect.height + focusPadding * 2,
    });
  }, [currentIndex, focusPadding]);

  useEffect(() => {
    requestAnimationFrame(updateFocusRect);
  }, [updateFocusRect]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const ro = new ResizeObserver(() =>
      requestAnimationFrame(updateFocusRect),
    );
    ro.observe(parent);

    window.addEventListener("resize", updateFocusRect);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() =>
        requestAnimationFrame(updateFocusRect),
      );
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateFocusRect);
    };
  }, [updateFocusRect]);

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode && lastActiveIndex !== null) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  if (words.length < 2) {
    return (
      <div className="focus-container" role="heading" aria-level={2}>
        <span className="focus-word">{sentence}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="focus-container"
      role="heading"
      aria-level={2}
      aria-label={words.join(" ")}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          className="focus-word"
          style={
            {
              filter:
                i === currentIndex ? "blur(0px)" : `blur(${blurAmount}px)`,
              opacity: i === currentIndex ? 1 : 0.4,
              color: activeColor && i === currentIndex ? activeColor : undefined,
              "--border-color": borderColor,
              "--glow-color": glowColor,
              transition: `color ${animationDuration}s cubic-bezier(0.22,0.61,0.36,1), filter ${animationDuration}s cubic-bezier(0.22,0.61,0.36,1), opacity ${animationDuration}s cubic-bezier(0.22,0.61,0.36,1)`,
            } as React.CSSProperties
          }
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        >
          {word}
        </span>
      ))}

      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{
          duration: animationDuration,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        style={
          {
            "--border-color": borderColor,
            "--glow-color": glowColor,
          } as React.CSSProperties
        }
      >
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </motion.div>
    </div>
  );
}
