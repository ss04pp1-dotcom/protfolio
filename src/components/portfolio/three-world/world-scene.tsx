"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { SiteData } from "@/lib/types";
import { CyberVehicle, type VehicleInput } from "./vehicle";
import { WorldZoneManager, type ZoneTrigger } from "./world-zones";
import { WorldHud } from "./world-hud";
import { sound } from "./audio";

export function WorldScene({
  siteData,
  onToggleClassicMode,
  onAdminClick,
}: {
  siteData: SiteData;
  onToggleClassicMode: () => void;
  onAdminClick: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState({
    speed: 0,
    vehicleX: 0,
    vehicleZ: 0,
    heading: 0,
  });
  const [activeTrigger, setActiveTrigger] = useState<ZoneTrigger | null>(null);

  // References across animation frames
  const vehicleRef = useRef<CyberVehicle | null>(null);
  const inputRef = useRef<VehicleInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    drift: false,
  });
  const triggersRef = useRef<ZoneTrigger[]>([]);
  const lastActiveTriggerId = useRef<string | null>(null);

  // Mobile Input bridge
  const handleMobileInput = useCallback(
    (action: "forward" | "backward" | "left" | "right" | "boost", active: boolean) => {
      inputRef.current[action] = active;
      if (active) sound.startEngine();
    },
    []
  );

  const resetCarPosition = useCallback(() => {
    if (vehicleRef.current) {
      vehicleRef.current.position.set(0, 0, 0);
      vehicleRef.current.speed = 0;
      vehicleRef.current.heading = 0;
      vehicleRef.current.steerAngle = 0;
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080611);
    scene.fog = new THREE.FogExp2(0x080611, 0.012);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    camera.position.set(0, 10, -18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(60, 100, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 250;
    sun.shadow.camera.left = -90;
    sun.shadow.camera.right = 90;
    sun.shadow.camera.top = 90;
    sun.shadow.camera.bottom = -90;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // Cosmic sky starfield
    const starsCount = 400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3 + 0] = (Math.random() - 0.5) * 450;
      starPositions[i * 3 + 1] = 20 + Math.random() * 120;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 450;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xd8b4fe,
      size: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 3. Build World Zones
    const zoneManager = new WorldZoneManager(siteData);
    scene.add(zoneManager.group);
    triggersRef.current = zoneManager.triggers;

    // 4. Build Cyber Vehicle
    const vehicle = new CyberVehicle(
      siteData.settings.primaryColor,
      siteData.settings.accentColor
    );
    scene.add(vehicle.mesh);
    vehicleRef.current = vehicle;

    // 5. Keyboard Input Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") inputRef.current.forward = true;
      if (key === "s" || key === "arrowdown") inputRef.current.backward = true;
      if (key === "a" || key === "arrowleft") inputRef.current.left = true;
      if (key === "d" || key === "arrowright") inputRef.current.right = true;
      if (key === "shift") inputRef.current.boost = true;
      if (key === " ") inputRef.current.drift = true;
      if (key === "h") sound.playHonk();

      sound.startEngine();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") inputRef.current.forward = false;
      if (key === "s" || key === "arrowdown") inputRef.current.backward = false;
      if (key === "a" || key === "arrowleft") inputRef.current.left = false;
      if (key === "d" || key === "arrowright") inputRef.current.right = false;
      if (key === "shift") inputRef.current.boost = false;
      if (key === " ") inputRef.current.drift = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // 6. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animId = 0;
    let hudThrottle = 0;

    const currentCamPos = new THREE.Vector3(0, 10, -18);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update vehicle physics
      vehicle.update(delta, inputRef.current);

      // Update animated meshes in zones (floating crystals, screens, pods)
      zoneManager.update(delta, elapsed);

      // Third-Person Smooth Chase Camera
      // Camera sits behind and slightly above the car based on vehicle heading
      const camDistance = 11.0 + Math.abs(vehicle.speed) * 0.18;
      const camHeight = 5.2 + Math.abs(vehicle.speed) * 0.08;

      const idealOffset = new THREE.Vector3(
        -Math.sin(vehicle.heading) * camDistance,
        camHeight,
        -Math.cos(vehicle.heading) * camDistance
      );

      const idealCamPos = vehicle.position.clone().add(idealOffset);

      // Smooth camera lag interpolation
      currentCamPos.lerp(idealCamPos, Math.min(delta * 4.5, 0.25));
      camera.position.copy(currentCamPos);

      // Camera looks at point slightly in front of the vehicle
      const lookTarget = vehicle.position.clone().add(
        new THREE.Vector3(
          Math.sin(vehicle.heading) * 4.0,
          1.2,
          Math.cos(vehicle.heading) * 4.0
        )
      );
      camera.lookAt(lookTarget);

      // Check proximity to zone triggers
      let foundTrigger: ZoneTrigger | null = null;
      for (const trig of triggersRef.current) {
        const dx = vehicle.position.x - trig.x;
        const dz = vehicle.position.z - trig.z;
        const distSq = dx * dx + dz * dz;
        if (distSq <= trig.radius * trig.radius) {
          foundTrigger = trig;
          break;
        }
      }

      if (foundTrigger?.id !== lastActiveTriggerId.current) {
        lastActiveTriggerId.current = foundTrigger ? foundTrigger.id : null;
        setActiveTrigger(foundTrigger);
        if (foundTrigger) sound.playTriggerChime();
      }

      // Update HUD at throttled interval (e.g. 20Hz for zero React overhead)
      hudThrottle += delta;
      if (hudThrottle > 0.05) {
        hudThrottle = 0;
        setHudState({
          speed: vehicle.speed,
          vehicleX: vehicle.position.x,
          vehicleZ: vehicle.position.z,
          heading: vehicle.heading,
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", handleResize);
      sound.dispose();

      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [siteData]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#080611]">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {/* Floating HUD Overlay */}
      <WorldHud
        speed={hudState.speed}
        vehicleX={hudState.vehicleX}
        vehicleZ={hudState.vehicleZ}
        heading={hudState.heading}
        activeTrigger={activeTrigger}
        onInspect={(trig) => setActiveTrigger(trig)}
        onResetCar={resetCarPosition}
        onToggleClassicMode={onToggleClassicMode}
        onAdminClick={onAdminClick}
        onMobileInput={handleMobileInput}
        siteData={siteData}
      />
    </div>
  );
}
