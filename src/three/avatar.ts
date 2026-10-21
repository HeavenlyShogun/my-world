import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

/**
 * Procedural Stylized Explorer Avatar (3-12 Composite Parts)
 * Includes:
 * 1. Head / Visor with emissive holographic glow
 * 2. Articulated Torso / Tech Armor with metallic shoulder pauldrons
 * 3. Left & Right Arms with forearms
 * 4. Left & Right Legs with boots
 * 5. Floating Companion Drone / Energy Halo that orbits gently
 * 6. Soft Ground Contact Shadow
 */
export class AvatarController {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;
  public droneGroup: THREE.Group;

  // Joint nodes for animation
  private torso: THREE.Mesh;
  private head: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private visor: THREE.Mesh;

  // Animation state
  public isMoving: boolean = false;
  private walkTime: number = 0;
  private lastFootstepTime: number = 0;
  private footstepPhase: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PlayerAvatar';

    // Base materials with distinct roughness/metalness
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8,
    });

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.2,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.9,
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9,
    });

    // 1. Torso (Pivot at waist: y ~ 0.9)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.55, 8);
    this.torso = new THREE.Mesh(torsoGeo, bodyMat);
    this.torso.position.y = 1.05;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Armor chest plate
    const chestGeo = new THREE.BoxGeometry(0.42, 0.35, 0.3);
    const chestPlate = new THREE.Mesh(chestGeo, armorMat);
    chestPlate.position.set(0, 0.05, 0.02);
    chestPlate.castShadow = true;
    this.torso.add(chestPlate);

    // Chest core light (Reactor)
    const coreGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12);
    coreGeo.rotateX(Math.PI / 2);
    const coreLight = new THREE.Mesh(coreGeo, glowMat);
    coreLight.position.set(0, 0.08, 0.16);
    this.torso.add(coreLight);

    // 2. Head & Visor
    this.head = new THREE.Group();
    this.head.position.set(0, 0.42, 0);

    const helmetGeo = new THREE.SphereGeometry(0.2, 16, 12);
    const helmet = new THREE.Mesh(helmetGeo, armorMat);
    helmet.castShadow = true;
    this.head.add(helmet);

    // Curved Visor
    const visorGeo = new THREE.BoxGeometry(0.28, 0.12, 0.14);
    this.visor = new THREE.Mesh(visorGeo, glowMat);
    this.visor.position.set(0, 0.02, 0.12);
    this.head.add(this.visor);

    // Antenna / crest
    const crestGeo = new THREE.BoxGeometry(0.04, 0.14, 0.22);
    const crest = new THREE.Mesh(crestGeo, accentMat);
    crest.position.set(0, 0.16, -0.02);
    this.head.add(crest);

    this.torso.add(this.head);

    // 3. Arms
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.3, 0.18, 0);
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.42, 8);
    armGeo.translate(0, -0.18, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, bodyMat);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    // Pauldron
    const pauldronGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const leftPauldron = new THREE.Mesh(pauldronGeo, armorMat);
    leftPauldron.position.set(0, 0, 0);
    this.leftArm.add(leftPauldron);
    this.torso.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.3, 0.18, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, bodyMat);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    const rightPauldron = new THREE.Mesh(pauldronGeo, armorMat);
    rightPauldron.position.set(0, 0, 0);
    this.rightArm.add(rightPauldron);
    this.torso.add(this.rightArm);

    // 4. Legs & Boots (Pivoted at hip: y ~ 0.75)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8);
    legGeo.translate(0, -0.25, 0);

    const bootGeo = new THREE.BoxGeometry(0.16, 0.18, 0.26);
    bootGeo.translate(0, -0.48, 0.04);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.14, 0.75, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, bodyMat);
    leftLegMesh.castShadow = true;
    const leftBoot = new THREE.Mesh(bootGeo, armorMat);
    leftBoot.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    this.leftLeg.add(leftBoot);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.14, 0.75, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, bodyMat);
    rightLegMesh.castShadow = true;
    const rightBoot = new THREE.Mesh(bootGeo, armorMat);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    this.rightLeg.add(rightBoot);
    this.group.add(this.rightLeg);

    // 5. Floating Companion Drone / Orb
    this.droneGroup = new THREE.Group();
    this.droneGroup.position.set(0.65, 1.6, -0.35);

    const droneCoreGeo = new THREE.OctahedronGeometry(0.1, 1);
    const droneCore = new THREE.Mesh(droneCoreGeo, glowMat);
    this.droneGroup.add(droneCore);

    const droneRingGeo = new THREE.TorusGeometry(0.18, 0.02, 8, 24);
    const droneRing = new THREE.Mesh(droneRingGeo, accentMat);
    droneRing.rotation.x = Math.PI / 4;
    this.droneGroup.add(droneRing);

    this.group.add(this.droneGroup);

    // 6. Soft Contact Shadow Plane underneath
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 64, 64);
    const sTexture = new THREE.CanvasTexture(shadowCanvas);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: sTexture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.y = 0.02; // Offset >= 0.02 to avoid coplanar Z-fighting
    this.group.add(this.shadowMesh);
  }

  public update(delta: number, isMoving: boolean, moveSpeed: number = 1.0) {
    this.isMoving = isMoving;

    if (isMoving) {
      this.walkTime += delta * 9.5 * moveSpeed;
      const swing = Math.sin(this.walkTime);

      // Leg swing
      this.leftLeg.rotation.x = swing * 0.65;
      this.rightLeg.rotation.x = -swing * 0.65;

      // Arm counter-swing
      this.leftArm.rotation.x = -swing * 0.55;
      this.rightArm.rotation.x = swing * 0.55;

      // Subtle torso vertical bounce & yaw twist
      this.torso.position.y = 1.05 + Math.abs(Math.sin(this.walkTime * 2)) * 0.05;
      this.torso.rotation.y = swing * 0.12;

      // Footstep sound triggering at peak foot down
      const currentPhase = Math.sin(this.walkTime);
      if (this.footstepPhase * currentPhase < 0) {
        const now = performance.now();
        if (now - this.lastFootstepTime > 240) {
          soundEngine.playFootstep();
          this.lastFootstepTime = now;
        }
      }
      this.footstepPhase = currentPhase;
    } else {
      // Idle breathing damping
      this.walkTime += delta * 2.0;
      const breathe = Math.sin(this.walkTime);

      this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 0, 10, delta);
      this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 0, 10, delta);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, 0, 10, delta);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, 0, 10, delta);

      this.torso.position.y = 1.05 + breathe * 0.02;
      this.torso.rotation.y = THREE.MathUtils.damp(this.torso.rotation.y, 0, 8, delta);
    }

    // Companion drone gentle orbit & float
    const orbitAngle = this.walkTime * 0.8;
    this.droneGroup.position.x = Math.sin(orbitAngle) * 0.55 + 0.2;
    this.droneGroup.position.z = Math.cos(orbitAngle) * 0.55 - 0.2;
    this.droneGroup.position.y = 1.6 + Math.sin(this.walkTime * 1.8) * 0.1;
    this.droneGroup.rotation.y += delta * 1.5;
    this.droneGroup.rotation.x = Math.sin(this.walkTime) * 0.2;
  }
}
