"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SiteData } from "@/lib/types";
import { buildWorld, ZONE_META } from "./world-builder";
import { ZonePanels } from "./zone-panels";
import { WorldHud } from "./world-hud";

const N = ZONE_META.length; // zone count

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(x: number) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/**
 * WorldScene — a scroll-driven cinematic 3D portfolio.
 *
 * The page is one long scroll track (one viewport-height per zone). A fixed
 * WebGL canvas renders a glowing light-rail journey through 8 floating island
 * zones. Scroll position (damped) drives the camera along a Catmull-Rom
 * flight path; each zone has a floating island centerpiece plus a glass HTML
 * content panel that fades in as the camera arrives.
 */
export function WorldScene({
  siteData,
  onToggleClassicMode,
  onAdminClick,
}: {
  siteData: SiteData;
  onToggleClassicMode: () => void;
  onAdminClick: () => void;
}) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState(0);
  const [ready, setReady] = useState(false);

  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressElRef = useRef<HTMLDivElement | null>(null);
  const hintElRef = useRef<HTMLDivElement | null>(null);
  const fallbackRef = useRef(onToggleClassicMode);

  fallbackRef.current = onToggleClassicMode;

  const registerPanel = useCallback((i: number, el: HTMLDivElement | null) => {
    panelsRef.current[i] = el;
  }, []);

  const registerProgressEl = useCallback((el: HTMLDivElement | null) => {
    progressElRef.current = el;
  }, []);

  const registerHintEl = useCallback((el: HTMLDivElement | null) => {
    hintElRef.current = el;
  }, []);

  /** Scroll exactly one viewport-height per zone. */
  const scrollToZone = useCallback((zone: number) => {
    const target = Math.min(Math.max(zone, 0), N - 1);
    window.scrollTo({ top: target * window.innerHeight, behavior: "smooth" });
  }, []);

  /* ---------------------------------------------------------------- */
  /* Capability check — reduced motion / no WebGL → classic site      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fallbackRef.current();
      return;
    }
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") || probe.getContext("webgl");
      if (!gl) fallbackRef.current();
    } catch {
      fallbackRef.current();
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /* Scroll-snap (gentle proximity) while the world is mounted        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("scroll-world-active");
    return () => root.classList.remove("scroll-world-active");
  }, []);

  /* ---------------------------------------------------------------- */
  /* Main Three.js world                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const mobile = window.innerWidth < 768;

    // 1. Renderer / scene / camera
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07060d);
    scene.fog = new THREE.FogExp2(0x07060d, 0.0068);

    const camera = new THREE.PerspectiveCamera(
      58,
      host.clientWidth / host.clientHeight,
      0.1,
      520
    );

    // 2. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(40, 80, 30);
    scene.add(key);

    // 3. World geometry (zones, rail, gates, stars, dust)
    const world = buildWorld(siteData, mobile);
    scene.add(world.group);
    const { cameraCurve, cameraT, zoneFocus } = world;

    // 4. Scroll → progress → camera position on the flight path
    const maxScroll = () => Math.max(1, (N - 1) * window.innerHeight);
    let target = clamp01(window.scrollY / maxScroll());
    let current = target;
    const onScroll = () => {
      target = clamp01(window.scrollY / maxScroll());
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 5. Pointer parallax (written without React re-renders)
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // 6. Resize
    const onResize = () => {
      if (!host) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // 7. Frame loop
    const clock = new THREE.Clock();
    const lookCur = zoneFocus[0].clone();
    let roll = 0;
    let raf = 0;
    let lastZone = 0;
    const camPos = new THREE.Vector3();
    const lookTmp = new THREE.Vector3();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      // damp scroll progress for buttery motion
      current += (target - current) * Math.min(delta * 3.4, 0.3);
      if (Math.abs(target - current) < 0.0004) current = target;

      // piecewise map zone-aligned progress → curve t
      const u = current * (N - 1);
      const i = Math.min(Math.floor(u), N - 2);
      const local = u - i;
      const segT = cameraT[i] + (cameraT[i + 1] - cameraT[i]) * local;

      // camera position + gentle breathing bob + pointer parallax
      cameraCurve.getPointAt(segT, camPos);
      camPos.y += Math.sin(elapsed * 0.55) * 0.12;
      camera.position.set(
        camPos.x + pointer.x * 0.9,
        camPos.y - pointer.y * 0.55,
        camPos.z
      );

      // gaze: blend between zone centerpieces, damped for cinematic pans
      const gaze = smoothstep(local);
      lookTmp.copy(zoneFocus[i]).lerp(zoneFocus[i + 1], gaze);
      lookCur.lerp(lookTmp, 1 - Math.exp(-3.2 * delta));
      camera.lookAt(
        lookCur.x + pointer.x * 1.7,
        lookCur.y - pointer.y * 1.0,
        lookCur.z
      );

      // banking roll through curves
      const tanNow = cameraCurve.getTangentAt(segT);
      const tanNext = cameraCurve.getTangentAt(Math.min(segT + 0.015, 1));
      const yawNow = Math.atan2(tanNow.x, tanNow.z);
      const yawNext = Math.atan2(tanNext.x, tanNext.z);
      const dYaw = wrapAngle(yawNext - yawNow);
      roll += (THREE.MathUtils.clamp(-dYaw * 2.4, -0.14, 0.14) - roll) * Math.min(delta * 3, 0.25);
      camera.rotateZ(roll);

      // world animation (crystals, orbits, gates…)
      world.update(delta, elapsed);

      // panels visibility (direct DOM writes — zero React re-renders)
      for (let z = 0; z < N; z++) {
        const el = panelsRef.current[z];
        if (!el) continue;
        const c = z / (N - 1);
        let v: number;
        if (z === 0) v = 1 - clamp01((current - 0.052) / 0.05);
        else if (z === N - 1) v = 1 - clamp01((0.948 - current) / 0.05);
        else v = 1 - clamp01(Math.abs(current - c) / 0.058);
        const e = smoothstep(v);
        el.style.opacity = e.toFixed(3);
        el.style.visibility = e < 0.015 ? "hidden" : "visible";
        if (e >= 0.5) el.style.pointerEvents = "auto";
        else el.style.pointerEvents = "none";
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.transform = `translate3d(0, ${((1 - e) * 46).toFixed(1)}px, 0) scale(${(
            0.94 +
            e * 0.06
          ).toFixed(4)})`;
        }
      }

      // progress rail + scroll hint
      if (progressElRef.current) {
        progressElRef.current.style.width = `${(current * 100).toFixed(2)}%`;
      }
      if (hintElRef.current) {
        hintElRef.current.style.opacity = current < 0.012 ? "1" : "0";
      }

      // active zone label (throttled to actual changes)
      const z = Math.round(current * (N - 1));
      if (z !== lastZone) {
        lastZone = z;
        setActiveZone(z);
      }

      renderer.render(scene, camera);
    };
    animate();
    setReady(true);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      world.dispose();
      renderer.dispose();
      if (host && renderer.domElement) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [siteData]);

  return (
    <div className="relative bg-[#07060d]">
      {/* Fixed 3D stage: canvas + panels + HUD */}
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div
          ref={canvasHostRef}
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        />

        {/* readability scrims */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent"
        />

        <ZonePanels siteData={siteData} registerPanel={registerPanel} onScrollTo={scrollToZone} />

        <WorldHud
          ownerName={siteData.settings.ownerName}
          zones={ZONE_META}
          activeZone={activeZone}
          onZoneClick={scrollToZone}
          onAdminClick={onAdminClick}
          onToggleClassicMode={onToggleClassicMode}
          registerProgressEl={registerProgressEl}
          registerHintEl={registerHintEl}
        />
      </div>

      {/* Scroll track — exactly one viewport per zone (snap targets) */}
      {ZONE_META.map((zone) => (
        <div key={zone.id} className="h-[100svh] snap-start" aria-hidden />
      ))}
    </div>
  );
}
