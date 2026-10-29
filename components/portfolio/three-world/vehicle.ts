import * as THREE from "three";
import { sound } from "./audio";

export interface VehicleInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  drift: boolean;
}

export class CyberVehicle {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public heading: number = 0; // rotation around Y in radians
  public speed: number = 0;
  public maxSpeed: number = 18;
  public maxReverseSpeed: number = -8;
  public acceleration: number = 18;
  public brakeDecel: number = 24;
  public friction: number = 0.96;
  public steerAngle: number = 0;
  public maxSteerAngle: number = 0.52; // ~30 degrees
  public steerSpeed: number = 3.5;

  private wheels: THREE.Mesh[] = [];
  private frontWheels: THREE.Group[] = [];
  private underglowLight!: THREE.PointLight;
  private headlightLeft!: THREE.SpotLight;
  private headlightRight!: THREE.SpotLight;
  private exhaustParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleLifetimes!: Float32Array;
  private primaryColorHex: number;
  private accentColorHex: number;

  constructor(primaryHex: string = "#8b5cf6", accentHex: string = "#d946ef") {
    this.primaryColorHex = parseInt(primaryHex.replace("#", ""), 16) || 0x8b5cf6;
    this.accentColorHex = parseInt(accentHex.replace("#", ""), 16) || 0xd946ef;
    this.mesh = new THREE.Group();
    this.buildVehicle();
    this.initExhaustParticles();
  }

  private buildVehicle() {
    // 1. Chassis Body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.55, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x120d20,
      metalness: 0.85,
      roughness: 0.22,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // Front wedge
    const noseGeo = new THREE.CylinderGeometry(0.7, 1.05, 1.2, 4);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.y = Math.PI / 4;
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.48, 2.5);
    nose.scale.set(1.4, 0.8, 0.6);
    this.mesh.add(nose);

    // 2. Cockpit / Tinted Glass Canopy
    const canopyGeo = new THREE.BoxGeometry(1.4, 0.5, 2.2);
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x05040a,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 1.0, -0.2);
    this.mesh.add(canopy);

    // 3. Neon Cyber Trim Lines
    const trimGeo = new THREE.BoxGeometry(2.14, 0.08, 4.44);
    const trimMat = new THREE.MeshBasicMaterial({
      color: this.accentColorHex,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 0.55;
    this.mesh.add(trim);

    // Rear Spoiler
    const spoilerWingGeo = new THREE.BoxGeometry(2.3, 0.08, 0.6);
    const spoilerMat = new THREE.MeshStandardMaterial({
      color: 0x1e1533,
      metalness: 0.9,
      roughness: 0.3,
    });
    const spoiler = new THREE.Mesh(spoilerWingGeo, spoilerMat);
    spoiler.position.set(0, 1.35, -2.0);
    this.mesh.add(spoiler);

    const pillarGeo = new THREE.BoxGeometry(0.12, 0.5, 0.2);
    const pillarL = new THREE.Mesh(pillarGeo, spoilerMat);
    pillarL.position.set(-0.9, 1.05, -2.0);
    const pillarR = new THREE.Mesh(pillarGeo, spoilerMat);
    pillarR.position.set(0.9, 1.05, -2.0);
    this.mesh.add(pillarL);
    this.mesh.add(pillarR);

    // 4. Rugged Cyber Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.42, 20);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.5,
      roughness: 0.6,
    });
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.44, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: this.primaryColorHex });

    const wheelPositions = [
      { x: -1.18, y: 0.48, z: 1.45, isFront: true },
      { x: 1.18, y: 0.48, z: 1.45, isFront: true },
      { x: -1.18, y: 0.48, z: -1.45, isFront: false },
      { x: 1.18, y: 0.48, z: -1.45, isFront: false },
    ];

    wheelPositions.forEach((wp) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(wp.x, wp.y, wp.z);

      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, rimMat);

      const wheelMeshGroup = new THREE.Group();
      wheelMeshGroup.add(tire);
      wheelMeshGroup.add(rim);

      wheelAssembly.add(wheelMeshGroup);
      this.mesh.add(wheelAssembly);
      this.wheels.push(tire);

      if (wp.isFront) {
        this.frontWheels.push(wheelAssembly);
      }
    });

    // 5. Headlights with real 3D SpotLight beams
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlGeo = new THREE.BoxGeometry(0.35, 0.12, 0.08);

    const hlLeftMesh = new THREE.Mesh(hlGeo, hlMat);
    hlLeftMesh.position.set(-0.7, 0.62, 2.3);
    const hlRightMesh = new THREE.Mesh(hlGeo, hlMat);
    hlRightMesh.position.set(0.7, 0.62, 2.3);
    this.mesh.add(hlLeftMesh);
    this.mesh.add(hlRightMesh);

    this.headlightLeft = new THREE.SpotLight(0xffffff, 12, 35, Math.PI / 7, 0.4, 1.2);
    this.headlightLeft.position.set(-0.7, 0.62, 2.3);
    const targetL = new THREE.Object3D();
    targetL.position.set(-0.7, 0, 16);
    this.mesh.add(targetL);
    this.headlightLeft.target = targetL;
    this.mesh.add(this.headlightLeft);

    this.headlightRight = new THREE.SpotLight(0xffffff, 12, 35, Math.PI / 7, 0.4, 1.2);
    this.headlightRight.position.set(0.7, 0.62, 2.3);
    const targetR = new THREE.Object3D();
    targetR.position.set(0.7, 0, 16);
    this.mesh.add(targetR);
    this.headlightRight.target = targetR;
    this.mesh.add(this.headlightRight);

    // 6. Neon Underglow
    this.underglowLight = new THREE.PointLight(this.primaryColorHex, 4.5, 7.5, 1.5);
    this.underglowLight.position.set(0, 0.25, 0);
    this.mesh.add(this.underglowLight);

    // Tail Lights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const tailGeo = new THREE.BoxGeometry(1.8, 0.08, 0.08);
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0.72, -2.22);
    this.mesh.add(tail);
  }

  private initExhaustParticles() {
    const count = 40;
    const geometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(count * 3);
    this.particleLifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      this.particleLifetimes[i] = Math.random();
      this.particlePositions[i * 3 + 0] = 0;
      this.particlePositions[i * 3 + 1] = 0.3;
      this.particlePositions[i * 3 + 2] = -2.3;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(this.particlePositions, 3));
    const mat = new THREE.PointsMaterial({
      color: this.accentColorHex,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.exhaustParticles = new THREE.Points(geometry, mat);
    this.mesh.add(this.exhaustParticles);
  }

  public update(delta: number, input: VehicleInput) {
    const dt = Math.min(delta, 0.05);

    // Acceleration & Braking
    const maxSpd = input.boost ? this.maxSpeed * 1.45 : this.maxSpeed;
    if (input.boost) {
      sound.playBoost();
    }

    if (input.forward) {
      this.speed += this.acceleration * dt;
      if (this.speed > maxSpd) this.speed = maxSpd;
    } else if (input.backward) {
      this.speed -= this.acceleration * 0.75 * dt;
      if (this.speed < this.maxReverseSpeed) this.speed = this.maxReverseSpeed;
    } else {
      // Natural rolling friction
      this.speed *= Math.pow(this.friction, dt * 60);
      if (Math.abs(this.speed) < 0.08) this.speed = 0;
    }

    // Steering
    if (input.left) {
      this.steerAngle = Math.min(this.steerAngle + this.steerSpeed * dt, this.maxSteerAngle);
    } else if (input.right) {
      this.steerAngle = Math.max(this.steerAngle - this.steerSpeed * dt, -this.maxSteerAngle);
    } else {
      // Return steer to center
      this.steerAngle *= Math.pow(0.82, dt * 60);
      if (Math.abs(this.steerAngle) < 0.01) this.steerAngle = 0;
    }

    // Update front wheels visual rotation
    this.frontWheels.forEach((w) => {
      w.rotation.y = this.steerAngle;
    });

    // Rotate wheels based on distance travelled
    const wheelCircumference = 2 * Math.PI * 0.48;
    const wheelRotDelta = (this.speed * dt) / wheelCircumference;
    this.wheels.forEach((w) => {
      w.rotation.x += wheelRotDelta * (Math.PI * 2);
    });

    // Turning vehicle heading (turning radius depends on forward movement)
    if (Math.abs(this.speed) > 0.05) {
      const turnMultiplier = input.drift ? 1.6 : 1.0;
      const turnDelta = (this.speed / 4.4) * Math.sin(this.steerAngle) * turnMultiplier * dt;
      this.heading += turnDelta;
    }

    // Update position in world coordinates
    this.velocity.set(
      Math.sin(this.heading) * this.speed,
      0,
      Math.cos(this.heading) * this.speed
    );

    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;

    // World Boundary Collision Bounce (prevent driving into infinite void)
    const WORLD_BOUND = 145;
    if (Math.abs(this.position.x) > WORLD_BOUND) {
      this.position.x = Math.sign(this.position.x) * WORLD_BOUND;
      this.speed = -this.speed * 0.4;
    }
    if (Math.abs(this.position.z) > WORLD_BOUND) {
      this.position.z = Math.sign(this.position.z) * WORLD_BOUND;
      this.speed = -this.speed * 0.4;
    }

    // Update mesh transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.heading;

    // Vehicle chassis roll/tilt when turning at speed
    const targetRoll = -(this.steerAngle * (this.speed / this.maxSpeed)) * 0.16;
    this.mesh.rotation.z = targetRoll;

    // Update sound synthesizer pitch
    sound.updateEnginePitch(this.speed / this.maxSpeed);

    // Animate exhaust thruster particles
    const posAttr = this.exhaustParticles.geometry.attributes.position;
    const len = this.particleLifetimes.length;
    for (let i = 0; i < len; i++) {
      this.particleLifetimes[i] += dt * (1.2 + Math.abs(this.speed) * 0.2);
      if (this.particleLifetimes[i] > 1.0) {
        this.particleLifetimes[i] = 0;
        this.particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
        this.particlePositions[i * 3 + 1] = 0.4 + (Math.random() - 0.5) * 0.2;
        this.particlePositions[i * 3 + 2] = -2.25;
      } else {
        // Drift backwards
        this.particlePositions[i * 3 + 2] -= dt * (2.5 + Math.abs(this.speed) * 0.5);
      }
    }
    posAttr.needsUpdate = true;
  }
}
