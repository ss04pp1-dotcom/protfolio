"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ParticleField } from "./particle-field";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** Shared, mutable viewport signals — written by window listeners in */
/* <Scene3D>, read every frame inside the canvas without re-renders.  */
interface Signals {
  /** normalized pointer position, -1 … 1 */
  px: number;
  py: number;
  /** smoothed page scroll progress, 0 … 1 */
  scroll: number;
}

function smoothstep(x: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const damp = THREE.MathUtils.damp;

/** Deterministic PRNG so the scattered field is identical every mount. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* camera rig — pointer parallax + scroll dolly through the field     */
/* ------------------------------------------------------------------ */

function CameraRig({ signals }: { signals: React.RefObject<Signals> }) {
  useFrame(({ camera }, delta) => {
    const s = signals.current;
    if (!s) return;
    const targetX = s.px * 1.35;
    const targetY = -s.py * 0.85;
    camera.position.x = damp(camera.position.x, targetX, 4, delta);
    camera.position.y = damp(camera.position.y, targetY, 4, delta);
    camera.position.z = damp(camera.position.z, 9 + s.scroll * 21, 5, delta);
    camera.lookAt(camera.position.x * 0.35, camera.position.y * 0.35, camera.position.z - 12);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* hero centerpiece — distorted metallic core + orbit rings + moons   */
/* ------------------------------------------------------------------ */

function OrbitMoon({
  radius,
  speed,
  offset,
  color,
  tilt,
}: {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  tilt: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = offset + clock.elapsedTime * speed;
  });
  return (
    <group rotation={tilt}>
      <group ref={ref}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.4}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

function HeroCore({
  signals,
  colors,
  scale,
}: {
  signals: React.RefObject<Signals>;
  colors: { primary: string; accent: string };
  scale: number;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const s = signals.current;
    const scroll = s?.scroll ?? 0;
    const exit = smoothstep(scroll, 0.02, 0.2); // hero → gone
    spin.current += delta * (0.14 + exit * 1.1);

    g.rotation.y = spin.current + (s?.px ?? 0) * 0.22;
    g.rotation.x = -(s?.py ?? 0) * 0.16 + exit * 0.55;
    const k = Math.max(0.001, 1 - exit) * scale;
    g.scale.setScalar(k);
    g.position.y = -exit * 3.4;
  });

  return (
    <group ref={group} position={[0, 0, -1.5]}>
      {/* the core — liquid-metal distorted sphere */}
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.85}>
        <mesh>
          <sphereGeometry args={[1.85, 96, 96]} />
          <MeshDistortMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={0.14}
            metalness={0.62}
            roughness={0.21}
            distort={0.4}
            speed={1.7}
          />
        </mesh>
      </Float>

      {/* orbit rings */}
      <mesh rotation={[Math.PI / 2.18, 0.16, 0]}>
        <torusGeometry args={[2.72, 0.018, 16, 180]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.7, -0.55, 0.35]}>
        <torusGeometry args={[3.3, 0.011, 16, 200]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={0.22}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* moons riding the rings */}
      <OrbitMoon radius={2.72} speed={0.5} offset={0} color={colors.accent} tilt={[Math.PI / 2.18, 0.16, 0]} />
      <OrbitMoon radius={2.72} speed={0.5} offset={Math.PI} color={colors.primary} tilt={[Math.PI / 2.18, 0.16, 0]} />
      <OrbitMoon radius={3.3} speed={-0.34} offset={1.2} color={colors.accent} tilt={[Math.PI / 2.7, -0.55, 0.35]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* deep field — shapes scattered through depth, flown past on scroll  */
/* ------------------------------------------------------------------ */

interface ShapeDef {
  position: [number, number, number];
  size: number;
  kind: "octa" | "knot" | "ico" | "torus";
  wire: boolean;
  tone: "primary" | "accent";
  speed: number;
  rot: [number, number, number];
}

function DeepField({ colors, mobile }: { colors: { primary: string; accent: string }; mobile: boolean }) {
  const shapes = useMemo<ShapeDef[]>(() => {
    const rng = mulberry32(20261027);
    const kinds: ShapeDef["kind"][] = ["octa", "knot", "ico", "torus"];
    const count = mobile ? 7 : 13;
    return Array.from({ length: count }, () => {
      const kind = kinds[Math.floor(rng() * kinds.length)];
      return {
        position: [(rng() * 2 - 1) * 9.5, (rng() * 2 - 1) * 5.5, -6 - rng() * 36],
        size: 0.32 + rng() * 0.55,
        kind,
        wire: rng() > 0.42,
        tone: rng() > 0.5 ? "primary" : "accent",
        speed: 0.8 + rng() * 0.9,
        rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
      };
    });
  }, [mobile]);

  return (
    <>
      {shapes.map((s, i) => {
        const color = s.tone === "primary" ? colors.primary : colors.accent;
        return (
          <Float key={i} speed={s.speed} rotationIntensity={0.7} floatIntensity={1.3}>
            <mesh position={s.position} rotation={s.rot} scale={s.size}>
              {s.kind === "octa" && <octahedronGeometry args={[1, 0]} />}
              {s.kind === "knot" && <torusKnotGeometry args={[0.55, 0.17, 110, 14]} />}
              {s.kind === "ico" && <icosahedronGeometry args={[1, 0]} />}
              {s.kind === "torus" && <torusGeometry args={[0.7, 0.22, 18, 48]} />}
              {s.wire ? (
                <meshBasicMaterial color={color} wireframe transparent opacity={0.32} />
              ) : (
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.18}
                  metalness={0.75}
                  roughness={0.3}
                  transparent
                  opacity={0.85}
                />
              )}
            </mesh>
          </Float>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* lights                                                              */
/* ------------------------------------------------------------------ */

function Lights({ colors }: { colors: { primary: string; accent: string } }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 8]} intensity={1.5} />
      <pointLight position={[7, 5, 6]} color={colors.primary} intensity={85} distance={42} decay={2} />
      <pointLight position={[-8, -5, 4]} color={colors.accent} intensity={75} distance={42} decay={2} />
      <pointLight position={[0, 0, 7]} intensity={14} distance={26} decay={2} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scene3D — full-site immersive WebGL background                      */
/* ------------------------------------------------------------------ */

type Mode = "pending" | "3d" | "2d" | "still";

export function Scene3D() {
  const [mode, setMode] = useState<Mode>("pending");
  const [colors, setColors] = useState({ primary: "#8b5cf6", accent: "#d946ef" });
  const signals = useRef<Signals>({ px: 0, py: 0, scroll: 0 });

  // lazy init: safe during prerender (component renders null until the
  // capability effect runs, so this never causes a hydration mismatch)
  const [mobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  // capability check: reduced motion → nothing; no WebGL → 2D particles
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability detection after mount (SSR-safe)
      setMode("still");
      return;
    }
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") || probe.getContext("webgl");
      setMode(gl ? "3d" : "2d");
    } catch {
      setMode("2d");
    }
  }, []);

  // poll theme CSS vars so admin color changes recolor the 3D world live
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setColors({
        primary: cs.getPropertyValue("--site-primary").trim() || "#8b5cf6",
        accent: cs.getPropertyValue("--site-accent").trim() || "#d946ef",
      });
    };
    read();
    const t = window.setInterval(read, 2500);
    return () => window.clearInterval(t);
  }, []);

  // shared pointer + scroll signals (no React re-renders)
  useEffect(() => {
    let raf = 0;
    const onPointer = (e: PointerEvent) => {
      signals.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      signals.current.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        signals.current.scroll = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      });
    };
    onScroll();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (mode === "pending" || mode === "still") return null;
  if (mode === "2d") return <ParticleField />;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 55, near: 0.1, far: 140 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <fog attach="fog" args={["#07060d", 13, 58]} />
        <CameraRig signals={signals} />
        <Lights colors={colors} />
        <Stars
          radius={75}
          depth={45}
          count={mobile ? 1500 : 2900}
          factor={3.2}
          saturation={0.35}
          fade
          speed={0.7}
        />
        <HeroCore signals={signals} colors={colors} scale={mobile ? 0.72 : 1} />
        <DeepField colors={colors} mobile={mobile} />
      </Canvas>
    </div>
  );
}
