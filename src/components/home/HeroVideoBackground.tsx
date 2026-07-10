"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const R2_BASE = "https://pub-9c0c7be46cdc4a4994c3753b557fdd68.r2.dev/hero";

const VIDEO_SOURCES = [
  "10480648-hd_1920_1080_30fps.web.mp4",
  "5243138-hd_1920_1080_25fps.web.mp4",
  "5243157-hd_1080_1920_25fps.web.mp4",
  "5243160-hd_1920_1080_25fps.web.mp4",
  "6037232_People_Person_3840x2160.web.mp4",
  "6037233_People_Person_3840x2160.web.mp4",
  "6090892-uhd_3840_2160_25fps.web.mp4",
  "6091709-uhd_2160_3840_25fps.web.mp4",
  "6092105-uhd_3840_2160_25fps.web.mp4",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HeroVideoBackground() {
  const [mounted, setMounted] = useState(false);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const timerRef = useRef<number>(0);

  const total = shuffled.length;

  const setVideoRef = useCallback((src: string) => (el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(src, el);
    else videoRefs.current.delete(src);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShuffled(shuffle(VIDEO_SOURCES));
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  // Autoplay active video
  useEffect(() => {
    if (!mounted || total === 0) return;
    const activeSrc = shuffled[current];
    const activeEl = videoRefs.current.get(activeSrc);
    if (activeEl) {
      activeEl.play().catch(() => {});
    }
    // Pause others
    shuffled.forEach((src, i) => {
      if (i !== current) {
        const el = videoRefs.current.get(src);
        if (el) { el.pause(); el.currentTime = 0; }
      }
    });
  }, [current, mounted, shuffled, total]);

  // Rotation timer
  useEffect(() => {
    if (!mounted || total === 0) return;
    const run = () => {
      setCurrent((prev) => (prev + 1) % total);
    };
    timerRef.current = window.setTimeout(run, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, mounted, total]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050403]">
      {mounted && shuffled.map((src, i) => {
        const url = `${R2_BASE}/${src}`;
        const isActive = i === current;

        return (
          <video
            key={src}
            ref={setVideoRef(src)}
            src={url}
            muted
            loop
            playsInline
            autoPlay={isActive}
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1.8s] ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
          />
        );
      })}

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#080706]/70 via-[#080706]/55 to-[#080706]/70" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(5,4,3,0.92),rgba(5,4,3,0.45),rgba(5,4,3,0.90))]" />
    </div>
  );
}
