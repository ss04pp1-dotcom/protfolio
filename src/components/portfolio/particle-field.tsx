"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleField — canvas "constellation" background: drifting particles
 * connected by lines, gently repelled by the cursor. Fixed, zero-JSX
 * cost, and pauses when the tab is hidden.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: -9999, y: -9999 };

    interface P {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      hue: number;
    }
    let particles: P[] = [];

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      const primary = cs.getPropertyValue("--site-primary").trim() || "#8b5cf6";
      const accent = cs.getPropertyValue("--site-accent").trim() || "#d946ef";
      return { primary, accent };
    }
    let colors = readColors();
    let colorTimer = 0;

    function hexToRgb(hex: string): [number, number, number] {
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
      if (!m) return [139, 92, 246];
      return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(w * h, 1600 * 900);
      const count = reduced ? 0 : Math.max(28, Math.min(90, Math.floor(density / 22000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.7 + 0.7,
        hue: Math.random(),
      }));
    }

    function step() {
      if (document.hidden) {
        raf = requestAnimationFrame(step);
        return;
      }
      // pick up admin theme color changes cheaply
      if (++colorTimer > 240) {
        colorTimer = 0;
        colors = readColors();
      }

      const [pr, pg, pb] = hexToRgb(colors.primary);
      const [ar, ag, ab] = hexToRgb(colors.accent);
      ctx.clearRect(0, 0, w, h);

      const LINK = 120;

      for (const p of particles) {
        // gentle cursor repulsion
        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 130 && dm > 0.01) {
          const f = ((130 - dm) / 130) * 0.045;
          p.vx += (dxm / dm) * f;
          p.vy += (dym / dm) * f;
        }

        p.x += p.vx;
        p.y += p.vy;
        // dampen
        p.vx *= 0.985;
        p.vy *= 0.985;
        // keep minimum drift
        if (Math.abs(p.vx) < 0.06) p.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(p.vy) < 0.06) p.vy += (Math.random() - 0.5) * 0.02;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.22;
            const c = a.hue > 0.5 ? [pr, pg, pb] : [ar, ag, ab];
            ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // dots with glow
      for (const p of particles) {
        const c = p.hue > 0.5 ? [pr, pg, pb] : [ar, ag, ab];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.75)`;
        ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(step);
    }

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
    />
  );
}
