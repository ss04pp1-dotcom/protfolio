"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  hue: number;
}

/**
 * Optimized 60fps ParticleField — respects prefers-reduced-motion, pauses when
 * tab is hidden, avoids per-frame shadowBlur, and uses squared distance checks.
 */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let isVisible = true;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(w * h, 1600 * 900);
      const count = Math.max(20, Math.min(48, Math.floor(density / 32000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.45 + 0.15,
        hue: Math.random() > 0.5 ? 268 : 302,
      }));
    }

    const LINK_DIST_SQ = 128 * 128;
    const MOUSE_DIST_SQ = 140 * 140;

    function tick() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, w, h);

      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < MOUSE_DIST_SQ && dSq > 1) {
          const d = Math.sqrt(dSq);
          const f = (140 - d) / 140;
          p.x += (dx / d) * f * 1.4;
          p.y += (dy / d) * f * 1.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 72%, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < len; j++) {
          const q = particles[j];
          const lx = p.x - q.x;
          const ly = p.y - q.y;
          const distSq = lx * lx + ly * ly;
          if (distSq < LINK_DIST_SQ) {
            const a = (1 - distSq / LINK_DIST_SQ) * 0.13;
            ctx.strokeStyle = `hsla(280, 85%, 70%, ${a})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onVisibility() {
      const next = document.visibilityState === "visible";
      if (next && !isVisible) {
        isVisible = true;
        raf = requestAnimationFrame(tick);
      } else if (!next) {
        isVisible = false;
        cancelAnimationFrame(raf);
      }
    }

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-75"
    />
  );
}
