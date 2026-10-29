import * as THREE from "three";
import type { SiteData, Project, Skill, Experience, Service, Testimonial } from "@/lib/types";

export interface ZoneTrigger {
  id: string;
  name: string;
  category: "welcome" | "project" | "skill" | "experience" | "service" | "testimonial" | "contact";
  x: number;
  z: number;
  radius: number;
  title: string;
  subtitle: string;
  details?: Project | Skill | Experience | Service | Testimonial;
}

export class WorldZoneManager {
  public group: THREE.Group;
  public triggers: ZoneTrigger[] = [];
  private animatedMeshes: { mesh: THREE.Object3D; rotSpeed: number; bobSpeed: number; initialY: number }[] = [];
  private primaryColor: number;
  private accentColor: number;

  constructor(siteData: SiteData) {
    this.group = new THREE.Group();
    this.primaryColor = parseInt(siteData.settings.primaryColor.replace("#", ""), 16) || 0x8b5cf6;
    this.accentColor = parseInt(siteData.settings.accentColor.replace("#", ""), 16) || 0xd946ef;

    this.buildWorldTerrain();
    this.buildWelcomePlaza(siteData);
    this.buildProjectsIsland(siteData.projects);
    this.buildSkillsPlayground(siteData.skills);
    this.buildJourneyArena(siteData.experiences, siteData.education);
    this.buildServicesAndPraise(siteData.services, siteData.testimonials);
    this.buildContactPortal(siteData.settings);
  }

  /* ---------------- 1. World Terrain & Roads ---------------- */
  private buildWorldTerrain() {
    // Cyberpunk Grid Ground
    const groundGeo = new THREE.PlaneGeometry(320, 320, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x08060f,
      roughness: 0.85,
      metalness: 0.25,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Grid wire overlay
    const gridHelper = new THREE.GridHelper(300, 75, this.primaryColor, 0x1f1538);
    gridHelper.position.y = 0.02;
    this.group.add(gridHelper);

    // Glowing Neon Perimeter Barrier
    const wallGeo = new THREE.BoxGeometry(300, 2.5, 0.4);
    const wallMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      transparent: true,
      opacity: 0.45,
    });

    const walls = [
      { x: 0, z: -150, rotY: 0 },
      { x: 0, z: 150, rotY: 0 },
      { x: -150, z: 0, rotY: Math.PI / 2 },
      { x: 150, z: 0, rotY: Math.PI / 2 },
    ];
    walls.forEach((w) => {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(w.x, 1.25, w.z);
      wall.rotation.y = w.rotY;
      this.group.add(wall);
    });

    // Paved glowing road network connecting the 5 islands
    this.createRoadStrip(0, 0, 0, 50, 8); // To Projects (North)
    this.createRoadStrip(0, 0, 50, 0, 8); // To Skills (East)
    this.createRoadStrip(0, 0, 0, -50, 8); // To Journey (South)
    this.createRoadStrip(0, 0, -50, 0, 8); // To Services (West)
    this.createRoadStrip(0, 0, 35, 35, 6); // To Contact (Northeast)
  }

  private createRoadStrip(x1: number, z1: number, x2: number, z2: number, width: number) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const roadGeo = new THREE.PlaneGeometry(width, length);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x110c22,
      roughness: 0.5,
      metalness: 0.3,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = -angle;
    road.position.set((x1 + x2) / 2, 0.04, (z1 + z2) / 2);
    road.receiveShadow = true;
    this.group.add(road);

    // Glowing edge curbs
    const curbGeo = new THREE.BoxGeometry(0.2, 0.15, length);
    const curbMat = new THREE.MeshBasicMaterial({ color: this.accentColor, transparent: true, opacity: 0.6 });

    const curb1 = new THREE.Mesh(curbGeo, curbMat);
    const curb2 = new THREE.Mesh(curbGeo, curbMat);
    curb1.position.set(-width / 2, 0.1, 0);
    curb2.position.set(width / 2, 0.1, 0);

    const curbGroup = new THREE.Group();
    curbGroup.rotation.y = angle;
    curbGroup.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    curbGroup.add(curb1);
    curbGroup.add(curb2);
    this.group.add(curbGroup);
  }

  /* ---------------- 2. Welcome Plaza ---------------- */
  private buildWelcomePlaza(siteData: SiteData) {
    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(0, 0, 0);

    // Central circular holographic stage
    const stageGeo = new THREE.CylinderGeometry(11, 12, 0.6, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x18112d,
      metalness: 0.8,
      roughness: 0.3,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = 0.3;
    stage.receiveShadow = true;
    plazaGroup.add(stage);

    // Outer stage neon ring
    const ringGeo = new THREE.TorusGeometry(11.4, 0.15, 12, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: this.primaryColor });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.62;
    plazaGroup.add(ring);

    // Floating Holographic Core Crystal
    const crystalGeo = new THREE.OctahedronGeometry(1.6, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: this.accentColor,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      metalness: 0.1,
      roughness: 0.1,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 3.4, 0);
    plazaGroup.add(crystal);
    this.animatedMeshes.push({ mesh: crystal, rotSpeed: 0.9, bobSpeed: 1.5, initialY: 3.4 });

    // Hologram vertical beacon light
    const beaconLight = new THREE.PointLight(this.primaryColor, 6, 18);
    beaconLight.position.set(0, 3.5, 0);
    plazaGroup.add(beaconLight);

    // 3D Billboard Arch: "MD SALAHUDDIN — FULL-STACK ARCHITECT"
    const archMat = new THREE.MeshStandardMaterial({ color: 0x221740, metalness: 0.8, roughness: 0.3 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 0.8), archMat);
    p1.position.set(-7, 3.5, 7);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 0.8), archMat);
    p2.position.set(7, 3.5, 7);
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(15, 0.8, 0.8), archMat);
    crossbar.position.set(0, 7, 7);
    plazaGroup.add(p1);
    plazaGroup.add(p2);
    plazaGroup.add(crossbar);

    // Arch neon sign banner
    const signGeo = new THREE.BoxGeometry(13, 1.4, 0.15);
    const signMat = new THREE.MeshBasicMaterial({ color: this.accentColor });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 7.8, 7);
    plazaGroup.add(sign);

    this.group.add(plazaGroup);

    // Register trigger
    this.triggers.push({
      id: "trig-welcome",
      name: "Welcome Plaza",
      category: "welcome",
      x: 0,
      z: 0,
      radius: 9,
      title: siteData.settings.ownerName,
      subtitle: siteData.settings.heroRoles.split(",")[0] || "Full-Stack Developer",
    });
  }

  /* ---------------- 3. Projects Island (North, z: 52) ---------------- */
  private buildProjectsIsland(projects: Project[]) {
    const centerZ = 55;
    const islandGeo = new THREE.CylinderGeometry(20, 22, 0.8, 32);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x140e26, metalness: 0.7, roughness: 0.4 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0, 0.4, centerZ);
    island.receiveShadow = true;
    this.group.add(island);

    // Island neon ring
    const ringGeo = new THREE.TorusGeometry(20.4, 0.2, 12, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0.82, centerZ);
    this.group.add(ring);

    // Floating Monolith Project Pedestals
    projects.forEach((proj, idx) => {
      const angle = (idx / Math.max(projects.length, 1)) * Math.PI - Math.PI / 2;
      const px = Math.cos(angle) * 11;
      const pz = centerZ + Math.sin(angle) * 11;

      // Pedestal base
      const pedGeo = new THREE.CylinderGeometry(2.2, 2.6, 1.2, 16);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x1f143a, metalness: 0.85, roughness: 0.2 });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.set(px, 0.6, pz);
      this.group.add(ped);

      // Floating Project Hologram Screen
      const screenGeo = new THREE.BoxGeometry(3.6, 2.2, 0.2);
      const screenMat = new THREE.MeshStandardMaterial({
        color: proj.featured ? 0xf59e0b : 0x8b5cf6,
        metalness: 0.9,
        roughness: 0.2,
        emissive: proj.featured ? 0x92400e : 0x4c1d95,
        emissiveIntensity: 0.6,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(px, 3.0, pz);
      this.group.add(screen);
      this.animatedMeshes.push({ mesh: screen, rotSpeed: 0.6, bobSpeed: 1.2, initialY: 3.0 });

      // Neon spotlight illuminating project
      const projLight = new THREE.PointLight(proj.featured ? 0xf59e0b : 0xa855f7, 5, 8);
      projLight.position.set(px, 3.8, pz);
      this.group.add(projLight);

      // Register interactive zone trigger
      this.triggers.push({
        id: `proj-${proj.id}`,
        name: proj.title,
        category: "project",
        x: px,
        z: pz,
        radius: 4.8,
        title: proj.title,
        subtitle: `Tech: ${proj.tags}`,
        details: proj,
      });
    });
  }

  /* ---------------- 4. Skills Playground (East, x: 55) ---------------- */
  private buildSkillsPlayground(skills: Skill[]) {
    const centerX = 55;
    const centerZ = 0;

    const arenaGeo = new THREE.CylinderGeometry(18, 20, 0.7, 32);
    const arenaMat = new THREE.MeshStandardMaterial({ color: 0x120c24, metalness: 0.8, roughness: 0.35 });
    const arena = new THREE.Mesh(arenaGeo, arenaMat);
    arena.position.set(centerX, 0.35, centerZ);
    this.group.add(arena);

    // Interactive Floating Skill Cubes (knocking / trigger zone)
    skills.slice(0, 8).forEach((sk, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const sx = centerX + Math.cos(angle) * 9;
      const sz = centerZ + Math.sin(angle) * 9;

      const cubeGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: this.primaryColor,
        metalness: 0.85,
        roughness: 0.2,
        emissive: this.accentColor,
        emissiveIntensity: 0.45,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.set(sx, 2.2, sz);
      this.group.add(cube);
      this.animatedMeshes.push({ mesh: cube, rotSpeed: 0.8 + i * 0.1, bobSpeed: 1.6, initialY: 2.2 });

      // Trigger
      this.triggers.push({
        id: `sk-${sk.id}`,
        name: sk.name,
        category: "skill",
        x: sx,
        z: sz,
        radius: 3.8,
        title: `${sk.name} (${sk.level}%)`,
        subtitle: `Category: ${sk.category || "Frontend"}`,
        details: sk,
      });
    });
  }

  /* ---------------- 5. Journey Arena (South, z: -55) ---------------- */
  private buildJourneyArena(experiences: Experience[], education: import("@/lib/types").Education[]) {
    const centerZ = -55;
    const arenaGeo = new THREE.BoxGeometry(32, 0.6, 18);
    const arenaMat = new THREE.MeshStandardMaterial({ color: 0x110a22, metalness: 0.8, roughness: 0.4 });
    const arena = new THREE.Mesh(arenaGeo, arenaMat);
    arena.position.set(0, 0.3, centerZ);
    this.group.add(arena);

    // Milestone Pillars for Experiences
    experiences.forEach((exp, idx) => {
      const px = -8 + idx * 8;
      const pz = centerZ;

      const pillarGeo = new THREE.BoxGeometry(2.4, 6.0, 2.4);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: exp.current ? 0x10b981 : 0x7c3aed,
        metalness: 0.9,
        roughness: 0.2,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 3.0, pz);
      this.group.add(pillar);

      this.triggers.push({
        id: `exp-${exp.id}`,
        name: exp.role,
        category: "experience",
        x: px,
        z: pz,
        radius: 4.8,
        title: `${exp.role} @ ${exp.company}`,
        subtitle: `${exp.period} — ${exp.description.slice(0, 60)}…`,
        details: exp,
      });
    });
  }

  /* ---------------- 6. Services & Testimonials (West, x: -55) ---------------- */
  private buildServicesAndPraise(services: Service[], testimonials: Testimonial[]) {
    const centerX = -55;
    const centerZ = 0;

    const pavilionGeo = new THREE.CylinderGeometry(18, 20, 0.7, 32);
    const pavilionMat = new THREE.MeshStandardMaterial({ color: 0x150d28, metalness: 0.8, roughness: 0.3 });
    const pavilion = new THREE.Mesh(pavilionGeo, pavilionMat);
    pavilion.position.set(centerX, 0.35, centerZ);
    this.group.add(pavilion);

    // Spotlight Podiums
    services.slice(0, 4).forEach((sv, i) => {
      const angle = (i / 4) * Math.PI * 2;
      const sx = centerX + Math.cos(angle) * 8;
      const sz = centerZ + Math.sin(angle) * 8;

      const podGeo = new THREE.ConeGeometry(1.6, 3.2, 6);
      const podMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8, roughness: 0.25 });
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.position.set(sx, 1.6, sz);
      this.group.add(pod);

      this.triggers.push({
        id: `sv-${sv.id}`,
        name: sv.title,
        category: "service",
        x: sx,
        z: sz,
        radius: 4.2,
        title: sv.title,
        subtitle: sv.description.slice(0, 65) + "…",
        details: sv,
      });
    });
  }

  /* ---------------- 7. Contact Beacon Portal (Northeast, x: 38, z: 38) ---------------- */
  private buildContactPortal(settings: import("@/lib/types").SiteSettings) {
    const px = 38;
    const pz = 38;

    // Glowing Platform
    const platGeo = new THREE.CylinderGeometry(6, 7, 0.8, 24);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x18102f, metalness: 0.9, roughness: 0.2 });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.set(px, 0.4, pz);
    this.group.add(plat);

    // Vertical Sky Beam Cylinder
    const beamGeo = new THREE.CylinderGeometry(0.8, 1.4, 45, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(px, 22.5, pz);
    this.group.add(beam);

    // Beacon Point Light
    const beaconLight = new THREE.PointLight(0x38bdf8, 8, 24);
    beaconLight.position.set(px, 3, pz);
    this.group.add(beaconLight);

    this.triggers.push({
      id: "trig-contact",
      name: "Contact Beacon",
      category: "contact",
      x: px,
      z: pz,
      radius: 6.0,
      title: "Get In Touch",
      subtitle: `${settings.email} · ${settings.location}`,
    });
  }

  public update(delta: number, elapsed: number) {
    this.animatedMeshes.forEach((item) => {
      item.mesh.rotation.y += item.rotSpeed * delta;
      item.mesh.position.y = item.initialY + Math.sin(elapsed * item.bobSpeed) * 0.25;
    });
  }
}
