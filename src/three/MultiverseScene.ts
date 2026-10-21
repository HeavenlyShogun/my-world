import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ProjectPortal, AuthorProfile } from '../types/portfolio';
import { AvatarController } from './avatar';
import { buildMultiverseWorld, WorldBuildResult, PortalNode } from './worldBuilder';
import { soundEngine } from '../audio/soundEngine';

export interface SceneHUDState {
  activePortal: PortalNode | null;
  portalScreenPos: { x: number; y: number; inView: boolean } | null;
  nearAuthorMonument: boolean;
  monumentScreenPos: { x: number; y: number; inView: boolean } | null;
  isWarping: boolean;
  warpProgress: number; // 0 to 1
  cameraMode: 'TPV' | 'FPV';
  playerCoords: { x: number; z: number };
}

// Module-level pre-allocated math objects to avoid GC in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3CamTarget = new THREE.Vector3();
const _screenVec = new THREE.Vector3();

export class MultiverseScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;

  // Actors & World
  private avatar: AvatarController;
  private world: WorldBuildResult | null = null;
  private projects: ProjectPortal[] = [];
  public author: AuthorProfile | null = null;

  // Player Kinematics
  private playerPos = new THREE.Vector3(0, 0, 4.0); // Start slightly south of the center monument
  private playerVelocity = new THREE.Vector3();
  private playerFacing = 0; // Radians
  private targetFacing = 0;
  private moveSpeed = 6.2;
  private sprintMultiplier = 1.6;

  // Camera Orbit
  private cameraMode: 'TPV' | 'FPV' = 'TPV';
  private camYaw = 0;
  private camPitch = 0.35; // ~20 degrees elevation
  private camDistance = 7.0;
  private targetCamDistance = 7.0;

  // Input states
  private keys: { [key: string]: boolean } = {};
  private joystickVector = { x: 0, y: 0 };
  private isPointerDown = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  // Warp State
  private isWarping = false;
  private warpStartTime = 0;
  private warpTargetPortal: PortalNode | null = null;
  private onWarpCompleteCallback?: (url: string) => void;

  // Animation & Loop
  private clock = new THREE.Clock();
  private frameId = 0;
  private isRunning = false;
  private hudStateCallback: (state: SceneHUDState) => void;

  constructor(
    container: HTMLElement,
    projects: ProjectPortal[],
    author: AuthorProfile,
    hudStateCallback: (state: SceneHUDState) => void
  ) {
    this.container = container;
    this.projects = projects;
    this.author = author;
    this.hudStateCallback = hudStateCallback;

    // 1. Detect software WebGL as per guidelines
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup High-fidelity WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05130f);
    // Horizon Fog matching serene misty forest
    this.scene.fog = new THREE.FogExp2(0x05130f, 0.016);

    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      350
    );

    // 4. Studio Environment Lighting (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key Light & Hemisphere Fill (Moonlit forest canopy and rich dark loam)
    const hemiLight = new THREE.HemisphereLight(0x6ee7b7, 0x061a14, 0.95);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xdcfce7, 1.85);
    keyLight.position.set(15, 25, 12);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 80;
      const d = 25;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // 5. Setup Avatar
    this.avatar = new AvatarController();
    this.avatar.group.position.copy(this.playerPos);
    this.scene.add(this.avatar.group);

    // 6. Build Multiverse World
    this.rebuildWorld(projects);

    // 7. Bind Listeners
    this.setupListeners();

    // 8. Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 9. Start Loop
    this.isRunning = true;
    this.startLoop();
  }

  public rebuildWorld(projects: ProjectPortal[]) {
    this.projects = projects;
    if (this.world) {
      this.scene.remove(this.world.rootGroup);
      this.world.dispose();
    }
    this.world = buildMultiverseWorld(this.projects);
    this.scene.add(this.world.rootGroup);
  }

  private setupListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mouse / Touch orbit view
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.renderer.domElement.addEventListener('wheel', this.onWheel, { passive: true });

    // Window resize
    window.addEventListener('resize', this.onResize);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    soundEngine.resume();
    this.keys[e.key.toLowerCase()] = true;

    // Shortcut: 'V' toggles camera mode
    if (e.key.toLowerCase() === 'v') {
      this.toggleCameraMode();
    }
    // Shortcut: 'M' toggles audio mute
    if (e.key.toLowerCase() === 'm') {
      soundEngine.toggleMute();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    soundEngine.resume();
    // Only drag with left or right mouse
    this.isPointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const deltaX = e.clientX - this.lastPointerX;
    const deltaY = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    const sens = 0.005;
    this.camYaw -= deltaX * sens;
    this.camPitch = THREE.MathUtils.clamp(
      this.camPitch - deltaY * sens,
      this.cameraMode === 'FPV' ? -0.8 : 0.05,
      this.cameraMode === 'FPV' ? 0.8 : 1.3
    );
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (this.cameraMode === 'FPV') return;
    this.targetCamDistance = THREE.MathUtils.clamp(
      this.targetCamDistance + e.deltaY * 0.005,
      2.8,
      14.0
    );
  };

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public setJoystickVector(x: number, y: number) {
    this.joystickVector = { x, y };
  }

  public toggleCameraMode() {
    this.cameraMode = this.cameraMode === 'TPV' ? 'FPV' : 'TPV';
    this.avatar.group.visible = this.cameraMode === 'TPV';
    soundEngine.playUiChime(true);
  }

  public getCameraMode(): 'TPV' | 'FPV' {
    return this.cameraMode;
  }

  public teleportToPortal(portalIndex: number) {
    if (!this.world || !this.world.portalNodes[portalIndex]) return;
    const node = this.world.portalNodes[portalIndex];
    // Position player 3 units in front of the portal facing it
    const angle = node.directionAngle;
    const dist = node.position.length() - 3.2;
    this.playerPos.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    this.targetFacing = angle;
    this.playerFacing = angle;
    this.camYaw = -angle - Math.PI / 2;
    soundEngine.playUiChime(true);
  }

  public teleportToCenter() {
    this.playerPos.set(0, 0, 3.8);
    this.targetFacing = Math.PI;
    this.playerFacing = Math.PI;
    this.camYaw = 0;
    soundEngine.playUiChime(true);
  }

  public triggerWarp(portal: PortalNode, onComplete: (url: string) => void) {
    if (this.isWarping) return;
    this.isWarping = true;
    this.warpStartTime = performance.now();
    this.warpTargetPortal = portal;
    this.onWarpCompleteCallback = onComplete;
    soundEngine.playWarpEffect();
  }

  // 3D to 2D Screen projection helper for in-world holographic UI
  private projectToScreen(pos: THREE.Vector3): { x: number; y: number; inView: boolean } {
    _screenVec.copy(pos);
    _screenVec.project(this.camera);

    const inView = _screenVec.z < 1 && _screenVec.z > -1;
    const widthHalf = this.container.clientWidth / 2;
    const heightHalf = this.container.clientHeight / 2;

    const x = _screenVec.x * widthHalf + widthHalf;
    const y = -(_screenVec.y * heightHalf) + heightHalf;

    return { x, y, inView };
  }

  private startLoop() {
    const tick = () => {
      if (!this.isRunning) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      this.updatePhysicsAndAvatar(delta);
      this.updateCamera(delta);
      this.updateWorldAndHUD(delta, elapsed);

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updatePhysicsAndAvatar(delta: number) {
    if (this.isWarping && this.warpTargetPortal) {
      // Warp sequence: smoothly animate avatar directly into the portal vortex
      const targetPos = this.warpTargetPortal.position;
      this.playerPos.lerp(targetPos, delta * 3.5);
      this.avatar.group.position.copy(this.playerPos);
      this.avatar.update(delta, false);
      return;
    }

    // Determine movement direction relative to camera angle
    let inputX = 0;
    let inputZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) inputZ -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) inputZ += 1;
    if (this.keys['a'] || this.keys['arrowleft']) inputX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) inputX += 1;

    // Mobile joystick override
    if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
      inputX = this.joystickVector.x;
      inputZ = -this.joystickVector.y;
    }

    const inputLength = Math.hypot(inputX, inputZ);
    const isMoving = inputLength > 0.05;

    if (isMoving) {
      // Normalize input
      const normX = inputX / (inputLength > 1 ? inputLength : 1);
      const normZ = inputZ / (inputLength > 1 ? inputLength : 1);

      // Rotate movement vector by camera yaw
      const forwardX = -Math.sin(this.camYaw);
      const forwardZ = -Math.cos(this.camYaw);
      const rightX = Math.cos(this.camYaw);
      const rightZ = -Math.sin(this.camYaw);

      const moveDirX = forwardX * -normZ + rightX * normX;
      const moveDirZ = forwardZ * -normZ + rightZ * normX;

      const isSprinting = Boolean(this.keys['shift']);
      const currentSpeed = this.moveSpeed * (isSprinting ? this.sprintMultiplier : 1.0);

      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, moveDirX * currentSpeed, 14, delta);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, moveDirZ * currentSpeed, 14, delta);

      // Face direction of movement
      this.targetFacing = Math.atan2(moveDirX, moveDirZ);
    } else {
      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, 0, 14, delta);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, 0, 14, delta);
    }

    // Apply movement
    this.playerPos.x += this.playerVelocity.x * delta;
    this.playerPos.z += this.playerVelocity.z * delta;

    // World soft radius boundary clamp (e.g. ~42 units max roam)
    const distFromOrigin = Math.hypot(this.playerPos.x, this.playerPos.z);
    const maxBoundary = 40;
    if (distFromOrigin > maxBoundary) {
      const scale = maxBoundary / distFromOrigin;
      this.playerPos.x *= scale;
      this.playerPos.z *= scale;
    }

    // Smooth avatar rotation towards targetFacing
    let angleDiff = this.targetFacing - this.playerFacing;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    this.playerFacing += angleDiff * Math.min(1, delta * 12);

    this.avatar.group.position.copy(this.playerPos);
    this.avatar.group.rotation.y = this.playerFacing;
    this.avatar.update(delta, isMoving, isMoving && this.keys['shift'] ? 1.4 : 1.0);
  }

  private updateCamera(delta: number) {
    if (this.isWarping && this.warpTargetPortal) {
      // Warp camera zoom: pull camera rapidly in front of the vortex
      const targetPos = this.warpTargetPortal.position;
      _vec3CamTarget.set(targetPos.x, targetPos.y + 2.6, targetPos.z);
      this.camera.position.lerp(_vec3CamTarget, delta * 4.5);
      this.camera.lookAt(_vec3CamTarget);
      return;
    }

    // Smooth camera distance zoom
    this.camDistance = THREE.MathUtils.damp(this.camDistance, this.targetCamDistance, 8, delta);

    if (this.cameraMode === 'TPV') {
      // Target camera focal point slightly above avatar chest
      _vec3CamTarget.set(this.playerPos.x, this.playerPos.y + 1.25, this.playerPos.z);

      const offsetX = Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDistance;
      const offsetY = Math.sin(this.camPitch) * this.camDistance;
      const offsetZ = Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDistance;

      _vec3A.set(
        _vec3CamTarget.x + offsetX,
        _vec3CamTarget.y + offsetY,
        _vec3CamTarget.z + offsetZ
      );

      // Smooth camera position damping
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _vec3A.x, 12, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _vec3A.y, 12, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _vec3A.z, 12, delta);

      this.camera.lookAt(_vec3CamTarget);
    } else {
      // First Person View
      _vec3CamTarget.set(this.playerPos.x, this.playerPos.y + 1.45, this.playerPos.z);
      this.camera.position.copy(_vec3CamTarget);

      // Camera look direction based on camYaw and camPitch
      const lookDirX = -Math.sin(this.camYaw) * Math.cos(this.camPitch);
      const lookDirY = Math.sin(this.camPitch);
      const lookDirZ = -Math.cos(this.camYaw) * Math.cos(this.camPitch);

      _vec3B.set(
        _vec3CamTarget.x + lookDirX,
        _vec3CamTarget.y + lookDirY,
        _vec3CamTarget.z + lookDirZ
      );
      this.camera.lookAt(_vec3B);
    }
  }

  private updateWorldAndHUD(delta: number, elapsed: number) {
    if (!this.world) return;

    // Update animations on world (vortices, crystals, sparks, beacon, dust)
    this.world.updateTick(delta, elapsed);

    // 1. Check Author Monument proximity (< 3.2 units from (0,0,0))
    const distToCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
    const nearAuthorMonument = distToCenter < 3.4;

    let monumentScreenPos = null;
    if (nearAuthorMonument) {
      _vec3A.set(0, 3.2, 0); // Position above the monument
      monumentScreenPos = this.projectToScreen(_vec3A);
    }

    // 2. Check Portal Proximities
    let nearestPortal: PortalNode | null = null;
    let minPortalDist = Infinity;

    for (const node of this.world.portalNodes) {
      const dist = this.playerPos.distanceTo(node.position);
      if (dist < minPortalDist) {
        minPortalDist = dist;
        nearestPortal = node;
      }
    }

    // Update spatial soundscape based on distance to center hub and nearest portal
    const themeColor: string | undefined = nearestPortal ? (nearestPortal as PortalNode).project.themeColor : undefined;
    soundEngine.updateSpatialSoundscape(distToCenter, minPortalDist, themeColor);

    let activePortal: PortalNode | null = null;
    let portalScreenPos = null;

    if (nearestPortal && minPortalDist < 4.5) {
      activePortal = nearestPortal;
      // Anchor World Space Holographic UI right above the portal arch (y ~ 4.6)
      _vec3A.set(activePortal.position.x, activePortal.position.y + 4.2, activePortal.position.z);
      portalScreenPos = this.projectToScreen(_vec3A);
    }

    // 3. Handle Warp Progress
    let warpProgress = 0;
    if (this.isWarping && this.warpTargetPortal) {
      const now = performance.now();
      const elapsedWarp = (now - this.warpStartTime) / 1000;
      warpProgress = Math.min(1.0, elapsedWarp / 1.35);

      if (warpProgress >= 1.0) {
        const targetUrl = this.warpTargetPortal.project.url;
        this.isWarping = false;
        if (this.onWarpCompleteCallback) {
          this.onWarpCompleteCallback(targetUrl);
        }
      }
    }

    // Emit state to React HUD
    this.hudStateCallback({
      activePortal,
      portalScreenPos,
      nearAuthorMonument,
      monumentScreenPos,
      isWarping: this.isWarping,
      warpProgress,
      cameraMode: this.cameraMode,
      playerCoords: {
        x: Math.round(this.playerPos.x * 10) / 10,
        z: Math.round(this.playerPos.z * 10) / 10,
      },
    });
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.renderer.domElement.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);

    if (this.world) {
      this.world.dispose();
    }
    soundEngine.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
