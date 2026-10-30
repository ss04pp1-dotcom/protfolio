import * as THREE from "three";
import type {
  SiteData,
  Project,
  Skill,
  Experience,
  Education,
  Service,
  Testimonial,
  Stat,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Zone metadata — shared by the 3D world, panels and HUD             */
/* ------------------------------------------------------------------ */

export interface ZoneMeta {
  id: string;
  label: string;
  navLabel: string;
  /** which side the HTML content panel occupies */
  panelSide: "left" | "right" | "center";
}

export const ZONE_META: ZoneMeta[] = [
  { id: "home", label: "Home", navLabel: "01", panelSide: "center" },
  { id: "about", label: "About", navLabel: "02", panelSide: "left" },
  { id: "skills", label: "Skills", navLabel: "03", panelSide: "right" },
  { id: "projects", label: "Projects", navLabel: "04", panelSide: "left" },
  { id: "journey", label: "Journey", navLabel: "05", panelSide: "right" },
  { id: "services", label: "Services", navLabel: "06", panelSide: "left" },
  { id: "testimonials", label: "Praise", navLabel: "07", panelSide: "right" },
  { id: "contact", label: "Contact", navLabel: "08", panelSide: "center" },
];

/** Serpentine, ascending waypoints through space (one per zone). */
const ZONE_POS: [number, number, number][] = [
  [0, 0, 0], // home
  [17, 2.5, -54], // about
  [-15, 5, -108], // skills
  [17, 7.5, -164], // projects
  [-17, 10, -220], // journey
  [15, 12.5, -276], // services
  [-13, 15, -332], // praise
  [0, 18, -388], // contact
];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Deterministic PRNG so scattered geometry is identical every mount. */
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
/* Animation registry                                                  */
/* ------------------------------------------------------------------ */

interface Spin {
  obj: THREE.Object3D;
  rotY?: number;
  rotX?: number;
  rotZ?: number;
  bob?: { base: number; amp: number; speed: number; phase: number };
}

export interface WorldBuild {
  group: THREE.Group;
  /** camera flight path (passes through a stop-point per zone) */
  cameraCurve: THREE.CatmullRomCurve3;
  /** arc-length t on cameraCurve matching each zone's stop-point */
  cameraT: number[];
  /** camera gaze target per zone (the zone centerpiece) */
  zoneFocus: THREE.Vector3[];
  update: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

export function buildWorld(siteData: SiteData, mobile: boolean): WorldBuild {
  const rng = mulberry32(20261030);
  const group = new THREE.Group();
  const spins: Spin[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  const track = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const primary =
    parseInt((siteData.settings.primaryColor || "#8b5cf6").replace("#", ""), 16) || 0x8b5cf6;
  const accent =
    parseInt((siteData.settings.accentColor || "#d946ef").replace("#", ""), 16) || 0xd946ef;

  const zoneVecs = ZONE_POS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const n = zoneVecs.length;
  const up = new THREE.Vector3(0, 1, 0);

  /** travel direction at each zone (central difference) */
  const travelDirs = zoneVecs.map((p, i) => {
    const a = zoneVecs[Math.max(0, i - 1)];
    const b = zoneVecs[Math.min(n - 1, i + 1)];
    return b.clone().sub(a).normalize();
  });
  /** right-hand side vector at each zone */
  const sideDirs = travelDirs.map((d) => new THREE.Vector3().crossVectors(up, d).normalize());

  /* --------------------------------------------------------------- */
  /* Camera path — stops 15.5 units "before" each platform, elevated  */
  /* --------------------------------------------------------------- */

  const camPoints = zoneVecs.map((p, i) =>
    p.clone().addScaledVector(travelDirs[i], -15.5).add(new THREE.Vector3(0, 4.6, 0))
  );
  const cameraCurve = new THREE.CatmullRomCurve3(camPoints, false, "catmullrom", 0.35);

  // resolve arc-length t for every stop-point (monotonic nearest-sample scan)
  const SAMPLES = 600;
  const cameraT: number[] = [];
  let searchFrom = 0;
  for (const cp of camPoints) {
    let bestT = 0;
    let bestD = Infinity;
    for (let s = searchFrom; s <= SAMPLES; s++) {
      const t = s / SAMPLES;
      const d = cameraCurve.getPointAt(t).distanceToSquared(cp);
      if (d < bestD) {
        bestD = d;
        bestT = t;
      }
    }
    cameraT.push(clamp(bestT, 0, 1));
    searchFrom = Math.floor(bestT * SAMPLES);
  }
  cameraT[n - 1] = 1;

  /* --------------------------------------------------------------- */
  /* Centerpiece lateral offsets — opposite the content panel side    */
  /* --------------------------------------------------------------- */

  const cpOffsets = ZONE_META.map((z, i) => {
    if (z.panelSide === "center") return new THREE.Vector3();
    const sign = z.panelSide === "left" ? 1 : -1; // centerpiece on the free side
    return sideDirs[i].clone().multiplyScalar(7.2 * sign);
  });

  const zoneFocus: THREE.Vector3[] = zoneVecs.map((p, i) =>
    p.clone().add(cpOffsets[i]).add(new THREE.Vector3(0, 2.6, 0))
  );

  /* --------------------------------------------------------------- */
  /* Shared builders                                                  */
  /* --------------------------------------------------------------- */

  const stdMat = (color: number, emissive: number, intensity = 0.5, metal = 0.8, rough = 0.3) =>
    track(
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: intensity,
        metalness: metal,
        roughness: rough,
      })
    );

  const basicMat = (color: number, opacity: number, additive = false) =>
    track(
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        ...(additive ? { blending: THREE.AdditiveBlending, depthWrite: false } : {}),
      })
    );

  const wireMat = (color: number, opacity: number) =>
    track(
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity })
    );

  /** Floating platform disc + neon rim */
  function buildPlatform(pos: THREE.Vector3, dir: THREE.Vector3, radius: number) {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.lookAt(pos.clone().add(dir)); // orient platform facing travel direction

    const disc = new THREE.Mesh(
      track(new THREE.CylinderGeometry(radius, radius * 1.12, 0.65, 42)),
      stdMat(0x150f28, 0x0a0718, 0.25, 0.75, 0.45)
    );
    disc.position.y = -0.33;
    g.add(disc);

    const rim = new THREE.Mesh(
      track(new THREE.TorusGeometry(radius * 0.99, 0.11, 10, 64)),
      basicMat(primary, 0.95)
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.02;
    g.add(rim);

    const innerRing = new THREE.Mesh(
      track(new THREE.TorusGeometry(radius * 0.62, 0.05, 8, 48)),
      basicMat(accent, 0.5)
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.04;
    g.add(innerRing);
    spins.push({ obj: innerRing, rotZ: 0.12 });

    group.add(g);
    return g;
  }

  /* --------------------------------------------------------------- */
  /* Zone 0 — HOME: giant hologram crystal + orbit rings + moons      */
  /* --------------------------------------------------------------- */

  {
    const i = 0;
    buildPlatform(zoneVecs[i], travelDirs[i], 12);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(new THREE.Vector3(0, 0.4, 0)));
    group.add(center);

    // liquid crystal
    const crystal = new THREE.Mesh(
      track(new THREE.OctahedronGeometry(2.3, 0)),
      track(
        new THREE.MeshPhysicalMaterial({
          color: accent,
          emissive: accent,
          emissiveIntensity: 0.32,
          metalness: 0.25,
          roughness: 0.12,
          transparent: true,
          opacity: 0.92,
        })
      )
    );
    crystal.position.y = 3.6;
    center.add(crystal);
    spins.push({ obj: crystal, rotY: 0.45, bob: { base: 3.6, amp: 0.35, speed: 1.1, phase: 0 } });

    // counter-rotating wireframe shell
    const shell = new THREE.Mesh(track(new THREE.OctahedronGeometry(3.1, 1)), wireMat(primary, 0.3));
    shell.position.y = 3.6;
    center.add(shell);
    spins.push({ obj: shell, rotY: -0.22, bob: { base: 3.6, amp: 0.35, speed: 1.1, phase: 0 } });

    // orbit rings
    const ring1 = new THREE.Mesh(
      track(new THREE.TorusGeometry(4.4, 0.05, 8, 90)),
      basicMat(primary, 0.85)
    );
    ring1.position.y = 3.6;
    ring1.rotation.x = Math.PI / 2.15;
    center.add(ring1);
    spins.push({ obj: ring1, rotZ: 0.3 });

    const ring2 = new THREE.Mesh(
      track(new THREE.TorusGeometry(5.4, 0.04, 8, 100)),
      basicMat(accent, 0.6)
    );
    ring2.position.y = 3.6;
    ring2.rotation.x = Math.PI / 2.6;
    ring2.rotation.y = 0.5;
    center.add(ring2);
    spins.push({ obj: ring2, rotZ: -0.2 });

    // moons riding ring 1
    for (let m = 0; m < 3; m++) {
      const orbit = new THREE.Group();
      orbit.position.y = 3.6;
      orbit.rotation.x = Math.PI / 2.15;
      const moon = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.22 + m * 0.06, 18, 18)),
        stdMat(m === 1 ? accent : primary, m === 1 ? accent : primary, 1.6, 0.4, 0.3)
      );
      moon.position.x = 4.4;
      orbit.add(moon);
      center.add(orbit);
      spins.push({ obj: orbit, rotZ: 0.3 + m * 0.14 });
    }

    const glow = new THREE.PointLight(primary, 90, 42, 2);
    glow.position.set(0, 5, 0);
    center.add(glow);
  }

  /* --------------------------------------------------------------- */
  /* Zone 1 — ABOUT: wireframe icosahedron + stat cubes in orbit      */
  /* --------------------------------------------------------------- */

  {
    const i = 1;
    buildPlatform(zoneVecs[i], travelDirs[i], 9.5);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(cpOffsets[i]));
    group.add(center);

    const core = new THREE.Mesh(track(new THREE.IcosahedronGeometry(1.9, 0)), wireMat(accent, 0.55));
    core.position.y = 3.1;
    center.add(core);
    spins.push({
      obj: core,
      rotY: 0.3,
      rotX: 0.12,
      bob: { base: 3.1, amp: 0.3, speed: 0.9, phase: 1 },
    });

    // stat cubes orbit the core
    const stats: Stat[] = siteData.stats.slice(0, 6);
    const orbit = new THREE.Group();
    orbit.position.y = 3.1;
    center.add(orbit);
    stats.forEach((st, s) => {
      const size = 0.55 + Math.min(st.value, 100) / 140;
      const cube = new THREE.Mesh(
        track(new THREE.BoxGeometry(size, size, size)),
        stdMat(primary, primary, 0.85, 0.7, 0.3)
      );
      const a = (s / Math.max(stats.length, 1)) * Math.PI * 2;
      const r = 4.3;
      cube.position.set(Math.cos(a) * r, Math.sin(a * 2) * 0.8, Math.sin(a) * r);
      orbit.add(cube);
      spins.push({
        obj: cube,
        rotY: 0.7 + s * 0.13,
        rotX: 0.3,
        bob: { base: cube.position.y, amp: 0.4, speed: 1.2, phase: s * 1.3 },
      });
    });
    spins.push({ obj: orbit, rotY: 0.16 });
  }

  /* --------------------------------------------------------------- */
  /* Zone 2 — SKILLS: core + skill cubes sized by mastery             */
  /* --------------------------------------------------------------- */

  {
    const i = 2;
    buildPlatform(zoneVecs[i], travelDirs[i], 9.5);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(cpOffsets[i]));
    group.add(center);

    const core = new THREE.Mesh(
      track(new THREE.DodecahedronGeometry(1.5, 0)),
      stdMat(accent, accent, 0.55, 0.85, 0.25)
    );
    core.position.y = 3.4;
    center.add(core);
    spins.push({ obj: core, rotY: 0.35, bob: { base: 3.4, amp: 0.25, speed: 1, phase: 2 } });

    const skills: Skill[] = siteData.skills.slice(0, 8);
    const orbit = new THREE.Group();
    orbit.position.y = 3.4;
    orbit.rotation.x = 0.18;
    center.add(orbit);
    skills.forEach((sk, s) => {
      const size = 0.55 + (sk.level / 100) * 0.85;
      const cube = new THREE.Mesh(
        track(new THREE.BoxGeometry(size, size, size)),
        stdMat(primary, primary, 0.4 + (sk.level / 100) * 0.8, 0.8, 0.25)
      );
      const a = (s / Math.max(skills.length, 1)) * Math.PI * 2;
      const r = 4.6;
      cube.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      orbit.add(cube);
      spins.push({
        obj: cube,
        rotY: 0.6,
        rotZ: 0.25,
        bob: { base: 0, amp: 0.35, speed: 1.15, phase: s * 0.9 },
      });
    });
    spins.push({ obj: orbit, rotY: -0.14 });
  }

  /* --------------------------------------------------------------- */
  /* Zone 3 — PROJECTS: gallery arc of hologram screens               */
  /* --------------------------------------------------------------- */

  {
    const i = 3;
    buildPlatform(zoneVecs[i], travelDirs[i], 10.5);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(cpOffsets[i]));
    group.add(center);

    const projects: Project[] = siteData.projects.slice(0, 5);
    projects.forEach((proj, p) => {
      const t = projects.length === 1 ? 0.5 : p / (projects.length - 1);
      const ang = -Math.PI / 2 + (t - 0.5) * 1.9; // arc facing the incoming camera
      const r = 5.6;
      const item = new THREE.Group();
      item.position.set(Math.cos(ang) * r, 3.2, Math.sin(ang) * r);
      item.lookAt(new THREE.Vector3(0, 3.2, 0));

      // dark frame
      const frame = new THREE.Mesh(
        track(new THREE.BoxGeometry(3.9, 2.55, 0.16)),
        stdMat(0x1b1330, 0x0a0718, 0.2, 0.8, 0.35)
      );
      item.add(frame);

      // emissive screen
      const screen = new THREE.Mesh(
        track(new THREE.PlaneGeometry(3.55, 2.2)),
        stdMat(
          proj.featured ? 0xf59e0b : primary,
          proj.featured ? 0xf59e0b : primary,
          proj.featured ? 1.05 : 0.8,
          0.6,
          0.3
        )
      );
      screen.position.z = 0.1;
      item.add(screen);

      // pedestal pillar down to the platform
      const pillar = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.22, 0.3, 3.1, 12)),
        stdMat(0x241a42, 0x120b24, 0.3, 0.85, 0.4)
      );
      pillar.position.y = -2.7;
      item.add(pillar);

      center.add(item);
      spins.push({
        obj: item,
        bob: { base: 3.2, amp: 0.32, speed: 0.85, phase: p * 1.15 },
      });
    });
  }

  /* --------------------------------------------------------------- */
  /* Zone 4 — JOURNEY: milestone pillars + education slabs            */
  /* --------------------------------------------------------------- */

  {
    const i = 4;
    buildPlatform(zoneVecs[i], travelDirs[i], 10);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(cpOffsets[i]));
    group.add(center);

    const exps: Experience[] = siteData.experiences.slice(0, 5);
    const total = Math.max(exps.length, 1);
    exps.forEach((exp, e) => {
      const lateral = (e - (total - 1) / 2) * 4.4;
      const h = exp.current ? 6.4 : 4.2 + rng() * 0.8;
      const pillar = new THREE.Mesh(
        track(new THREE.BoxGeometry(1.7, h, 1.7)),
        stdMat(
          exp.current ? 0x10b981 : primary,
          exp.current ? 0x10b981 : primary,
          exp.current ? 0.9 : 0.55,
          0.85,
          0.3
        )
      );
      pillar.position.set(lateral, h / 2 + 0.2, 0);
      center.add(pillar);

      const cap = new THREE.Mesh(
        track(new THREE.OctahedronGeometry(0.42, 0)),
        stdMat(accent, accent, 1.2, 0.5, 0.3)
      );
      cap.position.set(lateral, h + 0.85, 0);
      center.add(cap);
      spins.push({ obj: cap, rotY: 0.8, bob: { base: h + 0.85, amp: 0.18, speed: 1.3, phase: e } });
    });

    const edu: Education[] = siteData.education.slice(0, 3);
    edu.forEach((ed, e) => {
      const slab = new THREE.Mesh(
        track(new THREE.BoxGeometry(2.6, 0.7, 1.2)),
        stdMat(0x38bdf8, 0x38bdf8, 0.5, 0.8, 0.3)
      );
      slab.position.set((e - (edu.length - 1) / 2) * 3.6, 1.4, -4.6);
      center.add(slab);
      spins.push({ obj: slab, bob: { base: 1.4, amp: 0.3, speed: 0.9, phase: e * 1.7 } });
    });
  }

  /* --------------------------------------------------------------- */
  /* Zone 5 — SERVICES: rotating cone podiums                         */
  /* --------------------------------------------------------------- */

  {
    const i = 5;
    buildPlatform(zoneVecs[i], travelDirs[i], 9.5);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(cpOffsets[i]));
    group.add(center);

    const services: Service[] = siteData.services.slice(0, 4);
    services.forEach((sv, s) => {
      const a = (s / Math.max(services.length, 1)) * Math.PI * 2 + Math.PI / 4;
      const r = 3.9;
      const podium = new THREE.Group();
      podium.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);

      const base = new THREE.Mesh(
        track(new THREE.CylinderGeometry(1.15, 1.35, 0.5, 20)),
        stdMat(0x1e1440, 0x0c0820, 0.3, 0.8, 0.35)
      );
      base.position.y = 0.45;
      podium.add(base);

      const cone = new THREE.Mesh(
        track(new THREE.ConeGeometry(1.05, 2.9, 6)),
        stdMat(s % 2 === 0 ? primary : accent, s % 2 === 0 ? primary : accent, 0.7, 0.75, 0.3)
      );
      cone.position.y = 2.2;
      podium.add(cone);
      center.add(podium);
      spins.push({ obj: cone, rotY: 0.65 + s * 0.1 });
      spins.push({ obj: podium, bob: { base: 0, amp: 0.22, speed: 0.95, phase: s * 1.4 } });
    });
  }

  /* --------------------------------------------------------------- */
  /* Zone 6 — TESTIMONIALS: rotating ring of glass shards             */
  /* --------------------------------------------------------------- */

  {
    const i = 6;
    buildPlatform(zoneVecs[i], travelDirs[i], 9.5);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(cpOffsets[i]));
    group.add(center);

    const testimonials: Testimonial[] = siteData.testimonials.slice(0, 6);
    const ring = new THREE.Group();
    ring.position.y = 3.3;
    center.add(ring);

    const shards = Math.max(testimonials.length, 3);
    for (let s = 0; s < shards; s++) {
      const a = (s / shards) * Math.PI * 2;
      const shard = new THREE.Mesh(
        track(new THREE.PlaneGeometry(2.5, 1.55)),
        track(
          new THREE.MeshPhysicalMaterial({
            color: s % 2 === 0 ? primary : accent,
            emissive: s % 2 === 0 ? primary : accent,
            emissiveIntensity: 0.28,
            metalness: 0.4,
            roughness: 0.15,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
          })
        )
      );
      const r = 5.2;
      shard.position.set(Math.cos(a) * r, Math.sin(a * 3) * 0.5, Math.sin(a) * r);
      shard.lookAt(0, 0, 0);
      ring.add(shard);
      spins.push({ obj: shard, bob: { base: shard.position.y, amp: 0.3, speed: 1.05, phase: s } });
    }
    spins.push({ obj: ring, rotY: 0.13 });

    const halo = new THREE.Mesh(
      track(new THREE.TorusGeometry(3.1, 0.05, 8, 72)),
      basicMat(0xffffff, 0.35)
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 3.3;
    center.add(halo);
  }

  /* --------------------------------------------------------------- */
  /* Zone 7 — CONTACT: warp portal + sky beam                         */
  /* --------------------------------------------------------------- */

  {
    const i = 7;
    buildPlatform(zoneVecs[i], travelDirs[i], 12);

    const center = new THREE.Group();
    center.position.copy(zoneVecs[i].clone().add(new THREE.Vector3(0, 0.2, 0)));
    group.add(center);

    const portal = new THREE.Group();
    portal.position.y = 4.4;

    const ring = new THREE.Mesh(
      track(new THREE.TorusGeometry(3.2, 0.24, 14, 90)),
      stdMat(accent, accent, 1.5, 0.85, 0.25)
    );
    portal.add(ring);

    const innerRing = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.5, 0.07, 10, 72)),
      basicMat(0xffffff, 0.6, true)
    );
    portal.add(innerRing);
    spins.push({ obj: innerRing, rotZ: -0.45 });

    const veil = new THREE.Mesh(
      track(new THREE.CircleGeometry(2.9, 48)),
      track(
        new THREE.MeshBasicMaterial({
          color: primary,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      )
    );
    portal.add(veil);

    center.add(portal);
    portal.lookAt(
      zoneVecs[i].clone().sub(travelDirs[i].clone().multiplyScalar(20)).add(new THREE.Vector3(0, 4.4, 0))
    );
    spins.push({ obj: portal, rotZ: 0.1 });

    // sky beam
    const beam = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.5, 1.1, 46, 18, 1, true)),
      track(
        new THREE.MeshBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.14,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      )
    );
    beam.position.y = 26;
    center.add(beam);

    const glow = new THREE.PointLight(accent, 110, 50, 2);
    glow.position.set(0, 5, 0);
    center.add(glow);
  }

  /* --------------------------------------------------------------- */
  /* Environment: light rail, gates, stars, dust                      */
  /* --------------------------------------------------------------- */

  // glowing rail the camera rides
  const rail = new THREE.Mesh(
    track(new THREE.TubeGeometry(cameraCurve, 240, 0.075, 8, false)),
    basicMat(primary, 0.4, true)
  );
  group.add(rail);

  const rail2 = new THREE.Mesh(
    track(new THREE.TubeGeometry(cameraCurve, 240, 0.16, 8, false)),
    track(
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  group.add(rail2);

  // light gates along the rail
  const gateCount = mobile ? 14 : 26;
  for (let g = 1; g <= gateCount; g++) {
    const t = g / (gateCount + 1);
    const p = cameraCurve.getPointAt(t);
    const tan = cameraCurve.getTangentAt(t);
    const gate = new THREE.Mesh(
      track(new THREE.TorusGeometry(1.45, 0.045, 8, 40)),
      basicMat(g % 2 === 0 ? accent : primary, 0.5, true)
    );
    gate.position.copy(p);
    gate.lookAt(p.clone().add(tan));
    group.add(gate);
    spins.push({ obj: gate, rotZ: 0.25 + rng() * 0.2 });
  }

  // starfield
  {
    const count = mobile ? 900 : 1600;
    const pos = new Float32Array(count * 3);
    for (let s = 0; s < count; s++) {
      pos[s * 3] = (rng() * 2 - 1) * 110;
      pos[s * 3 + 1] = rng() * 110 - 12;
      pos[s * 3 + 2] = 50 - rng() * 480;
    }
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = track(
      new THREE.PointsMaterial({
        color: 0xd8b4fe,
        size: 0.9,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      })
    );
    group.add(new THREE.Points(geo, mat));
  }

  // drifting dust corridor around the rail
  {
    const count = mobile ? 200 : 380;
    const pos = new Float32Array(count * 3);
    for (let s = 0; s < count; s++) {
      const t = rng();
      const p = cameraCurve.getPointAt(t);
      pos[s * 3] = p.x + (rng() * 2 - 1) * 13;
      pos[s * 3 + 1] = p.y + (rng() * 2 - 1) * 8;
      pos[s * 3 + 2] = p.z + (rng() * 2 - 1) * 13;
    }
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = track(
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.22,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(new THREE.Points(geo, mat));
  }

  /* --------------------------------------------------------------- */
  /* Update + dispose                                                 */
  /* --------------------------------------------------------------- */

  const update = (delta: number, elapsed: number) => {
    for (const s of spins) {
      if (s.rotY) s.obj.rotation.y += s.rotY * delta;
      if (s.rotX) s.obj.rotation.x += s.rotX * delta;
      if (s.rotZ) s.obj.rotation.z += s.rotZ * delta;
      if (s.bob) {
        s.obj.position.y = s.bob.base + Math.sin(elapsed * s.bob.speed + s.bob.phase) * s.bob.amp;
      }
    }
  };

  const dispose = () => {
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    disposables.forEach((d) => d.dispose());
  };

  return { group, cameraCurve, cameraT, zoneFocus, update, dispose };
}
