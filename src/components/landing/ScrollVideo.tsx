"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollVideo.module.css";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_FRAME_COUNT = 360;
const MOBILE_FRAME_COUNT = 240;
const MOBILE_BREAKPOINT = 768;

function frameUrl(isMobile: boolean, index: number): string {
  const dir = isMobile ? "mobile" : "desktop";
  const padded = String(index + 1).padStart(4, "0");
  return `/video-frames/${dir}/frame-${padded}.jpg`;
}

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const frameCount = isMobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const images: HTMLImageElement[] = [];

    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image();
      img.src = frameUrl(isMobile, i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) drawFrame(0);
      };
      images.push(img);
    }

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawFrame(index: number) {
      const img = images[Math.min(index, images.length - 1)];
      if (!img || !img.complete || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const state = { frame: 0 };
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        state.frame = Math.round(self.progress * (frameCount - 1));
        drawFrame(state.frame);
      },
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.scrollContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
