import * as THREE from 'three';
import { ProjectPortal } from '../types/portfolio';
import {
  createPortalVortexTexture,
  createForestRuneTileTexture,
  createForestFloorDaisTexture,
  createForestMegalithTexture,
  createParticleDiscTexture,
  createFireflyTexture,
  createForestTerrainTexture,
  createTreeBarkTexture,
} from './materials';

export interface PortalNode {
  project: ProjectPortal;
  position: THREE.Vector3;
  directionAngle: number;
  portalGroup: THREE.Group;
  vortexMesh: THREE.Mesh;
  crystalMesh: THREE.Mesh;
  pointLight: THREE.PointLight;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  particles: THREE.Points;
}

export interface WorldBuildResult {
  rootGroup: THREE.Group;
  portalNodes: PortalNode[];
  centerMonumentPosition: THREE.Vector3;
  centerMonumentGroup: THREE.Group;
  fireflies: THREE.Points;
  updateTick: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

export function buildMultiverseWorld(
  projects: ProjectPortal[],
  options: { pathRadius?: number } = {}
): WorldBuildResult {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'SereneForestMultiverseWorld';

  const count = Math.max(1, projects.length);
  const pathRadius = options.pathRadius || Math.max(18, 14 + count * 1.4);

  const portalNodes: PortalNode[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  // ==========================================
  // 1. EXTENSIVE FOREST TERRAIN FLOOR
  // ==========================================
  const terrainTex = createForestTerrainTexture();
  disposables.push(terrainTex);

  const terrainMat = new THREE.MeshStandardMaterial({
    map: terrainTex,
    roughness: 0.85,
    metalness: 0.1,
  });
  disposables.push(terrainMat);

  // Large circular terrain covering the forest floor out to 75m
  const terrainGeo = new THREE.CircleGeometry(75, 48);
  terrainGeo.rotateX(-Math.PI / 2);
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.position.y = -0.3;
  terrainMesh.receiveShadow = true;
  rootGroup.add(terrainMesh);
  disposables.push(terrainGeo);

  // ==========================================
  // 2. CENTER SANCTUARY CLEARING & DAIS
  // ==========================================
  const hubGroup = new THREE.Group();
  hubGroup.name = 'CenterSanctuaryClearing';

  const daisTexture = createForestFloorDaisTexture();
  disposables.push(daisTexture);

  const stoneMat = new THREE.MeshStandardMaterial({
    map: daisTexture,
    roughness: 0.7,
    metalness: 0.2,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  disposables.push(stoneMat);

  const darkMossyBorderMat = new THREE.MeshStandardMaterial({
    color: 0x0c241b,
    roughness: 0.85,
    metalness: 0.2,
  });
  disposables.push(darkMossyBorderMat);

  // Lower stone terrace
  const tier1Geo = new THREE.CylinderGeometry(8.5, 9.2, 0.4, 32);
  const tier1Mesh = new THREE.Mesh(tier1Geo, darkMossyBorderMat);
  tier1Mesh.position.y = -0.2;
  tier1Mesh.receiveShadow = true;
  hubGroup.add(tier1Mesh);
  disposables.push(tier1Geo);

  // Upper ancient stone dais
  const tier2Geo = new THREE.CylinderGeometry(7.5, 7.8, 0.35, 32);
  const tier2Mesh = new THREE.Mesh(tier2Geo, stoneMat);
  tier2Mesh.position.y = 0.05;
  tier2Mesh.receiveShadow = true;
  hubGroup.add(tier2Mesh);
  disposables.push(tier2Geo);

  // Glowing emerald perimeter ring
  const ringGeo = new THREE.TorusGeometry(7.6, 0.08, 16, 64);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.65,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 0.22;
  hubGroup.add(ringMesh);
  disposables.push(ringGeo, ringMat);

  // ==========================================
  // 3. ANCIENT WORLD-TREE MEGALITH (AUTHOR MONUMENT)
  // ==========================================
  const centerMonumentPosition = new THREE.Vector3(0, 0, 0);
  const centerMonumentGroup = new THREE.Group();
  centerMonumentGroup.name = 'WorldTreeMegalith';

  const megalithTex = createForestMegalithTexture();
  disposables.push(megalithTex);

  const megalithMat = new THREE.MeshStandardMaterial({
    map: megalithTex,
    roughness: 0.45,
    metalness: 0.65,
    emissive: 0x064e3b,
    emissiveIntensity: 0.35,
  });
  disposables.push(megalithMat);

  // Hexagonal ancient mossy pedestal
  const obeliskBaseGeo = new THREE.CylinderGeometry(1.3, 1.6, 0.45, 6);
  const obeliskBase = new THREE.Mesh(obeliskBaseGeo, darkMossyBorderMat);
  obeliskBase.position.y = 0.22;
  obeliskBase.castShadow = true;
  obeliskBase.receiveShadow = true;
  centerMonumentGroup.add(obeliskBase);
  disposables.push(obeliskBaseGeo);

  // Central monolith pillar
  const obeliskSpireGeo = new THREE.CylinderGeometry(0.55, 0.95, 3.8, 6);
  const obeliskSpire = new THREE.Mesh(obeliskSpireGeo, megalithMat);
  obeliskSpire.position.y = 2.25;
  obeliskSpire.castShadow = true;
  centerMonumentGroup.add(obeliskSpire);
  disposables.push(obeliskSpireGeo);

  // Emerald leaf apex crystal
  const obeliskTipGeo = new THREE.ConeGeometry(0.55, 0.85, 6);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x6ee7b7,
    emissive: 0x10b981,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.8,
  });
  const obeliskTip = new THREE.Mesh(obeliskTipGeo, tipMat);
  obeliskTip.position.y = 4.55;
  centerMonumentGroup.add(obeliskTip);
  disposables.push(obeliskTipGeo, tipMat);

  // Levitating Botanical Halo Ring
  const haloGeo = new THREE.TorusGeometry(1.65, 0.06, 12, 36);
  haloGeo.rotateX(Math.PI / 2);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.85,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.y = 3.25;
  centerMonumentGroup.add(haloMesh);
  disposables.push(haloGeo, haloMat);

  // Soft emerald sanctuary beacon
  const beaconLight = new THREE.PointLight(0x34d399, 2.5, 14, 1.6);
  beaconLight.position.set(0, 4.6, 0);
  centerMonumentGroup.add(beaconLight);

  // Bioluminescent Mushrooms around base of monument
  const mushroomColors = [0x34d399, 0x6ee7b7, 0x38bdf8, 0xa7f3d0];
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xecfdf5, roughness: 0.7 });
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.25, 6);
  const capGeo = new THREE.ConeGeometry(0.14, 0.16, 8);
  disposables.push(stemMat, stemGeo, capGeo);

  for (let m = 0; m < 9; m++) {
    const mAngle = (m * Math.PI * 2) / 9 + Math.random() * 0.2;
    const mDist = 1.6 + (m % 3) * 0.35;
    const mx = Math.cos(mAngle) * mDist;
    const mz = Math.sin(mAngle) * mDist;

    const mGroup = new THREE.Group();
    mGroup.position.set(mx, 0.1, mz);

    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.12;
    mGroup.add(stem);

    const mColor = mushroomColors[m % mushroomColors.length];
    const capMat = new THREE.MeshStandardMaterial({
      color: mColor,
      emissive: mColor,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.26;
    mGroup.add(cap);
    disposables.push(capMat);

    centerMonumentGroup.add(mGroup);
  }

  hubGroup.add(centerMonumentGroup);
  rootGroup.add(hubGroup);

  // ==========================================
  // 4. PROCEDURAL FOREST TREES (NATURAL PERIMETERS)
  // ==========================================
  const forestTreesGroup = new THREE.Group();
  forestTreesGroup.name = 'AncientForestTrees';

  const barkTexture = createTreeBarkTexture();
  disposables.push(barkTexture);

  const trunkMat = new THREE.MeshStandardMaterial({
    map: barkTexture,
    roughness: 0.85,
    metalness: 0.15,
  });
  disposables.push(trunkMat);

  // Deep foliage shades with varied roughness
  const foliageMats = [
    new THREE.MeshStandardMaterial({ color: 0x0c3121, roughness: 0.75, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0x113e2b, roughness: 0.8, metalness: 0.05 }),
    new THREE.MeshStandardMaterial({ color: 0x164b35, roughness: 0.7, metalness: 0.15 }),
    new THREE.MeshStandardMaterial({ color: 0x0a261a, roughness: 0.85, metalness: 0.1 }),
  ];
  disposables.push(...foliageMats);

  // Procedural tree factory function
  const createProceduralTree = (heightScale: number = 1.0): THREE.Group => {
    const tree = new THREE.Group();

    // 1. Trunk (Tapered Cylinder with rooted base)
    const trunkH = 3.2 * heightScale;
    const trunkGeo = new THREE.CylinderGeometry(0.35 * heightScale, 0.65 * heightScale, trunkH, 7);
    trunkGeo.translate(0, trunkH / 2, 0);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    disposables.push(trunkGeo);

    // Root flairs
    const rootGeo = new THREE.ConeGeometry(0.85 * heightScale, 0.6 * heightScale, 6);
    rootGeo.translate(0, 0.3 * heightScale, 0);
    const roots = new THREE.Mesh(rootGeo, trunkMat);
    tree.add(roots);
    disposables.push(rootGeo);

    // 2. Layered Stylized Conical Foliage Canopies (3 Tiers)
    const tiers = 3;
    for (let t = 0; t < tiers; t++) {
      const tierH = (2.2 - t * 0.3) * heightScale;
      const tierR = (2.6 - t * 0.55) * heightScale;
      const coneGeo = new THREE.ConeGeometry(tierR, tierH, 7);
      const tierMat = foliageMats[(t + Math.floor(Math.random() * 2)) % foliageMats.length];
      const cone = new THREE.Mesh(coneGeo, tierMat);
      cone.position.y = (2.4 + t * 1.5) * heightScale;
      cone.rotation.y = (t * Math.PI) / 4;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
      disposables.push(coneGeo);
    }

    return tree;
  };

  // Place trees in organic natural clusters around the forest clearing perimeter
  // Inner ring of gentle trees (radius 14 - 17m, between paths)
  const innerTreeCount = 14;
  for (let i = 0; i < innerTreeCount; i++) {
    const angle = (i * Math.PI * 2) / innerTreeCount + (Math.random() - 0.5) * 0.25;
    const dist = 14.5 + Math.random() * 3.5;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const scale = 0.85 + Math.random() * 0.4;
    const tree = createProceduralTree(scale);
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    forestTreesGroup.add(tree);
  }

  // Outer dense protective forest perimeter (radius 26 - 48m)
  const outerTreeCount = 38;
  for (let i = 0; i < outerTreeCount; i++) {
    const angle = (i * Math.PI * 2) / outerTreeCount + (Math.random() - 0.5) * 0.15;
    const dist = pathRadius + 6 + Math.random() * 20;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const scale = 1.1 + Math.random() * 0.7;
    const tree = createProceduralTree(scale);
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    forestTreesGroup.add(tree);
  }

  rootGroup.add(forestTreesGroup);

  // ==========================================
  // 5. MOSSY FOREST BOULDERS
  // ==========================================
  const boulderGroup = new THREE.Group();
  const boulderGeo = new THREE.DodecahedronGeometry(1.0, 1);
  disposables.push(boulderGeo);

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x1b2820,
    roughness: 0.9,
    metalness: 0.1,
  });
  disposables.push(rockMat);

  for (let b = 0; b < 24; b++) {
    const bAngle = (b * Math.PI * 2) / 24 + Math.random() * 0.3;
    const bDist = 10.5 + Math.random() * (pathRadius + 8);
    const bx = Math.cos(bAngle) * bDist;
    const bz = Math.sin(bAngle) * bDist;

    const bScale = 0.6 + Math.random() * 1.4;
    const boulder = new THREE.Mesh(boulderGeo, rockMat);
    boulder.position.set(bx, 0.2 + (bScale * 0.5) - 0.2, bz);
    boulder.scale.set(bScale, bScale * 0.65, bScale * 1.1);
    boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    boulderGroup.add(boulder);
  }
  rootGroup.add(boulderGroup);

  // ==========================================
  // 6. RADIAL PATHS & FOREST STAR GATES (PORTALS)
  // ==========================================
  const pathsGroup = new THREE.Group();
  pathsGroup.name = 'ForestPathsAndStarGates';

  const particleTexture = createParticleDiscTexture();
  disposables.push(particleTexture);

  projects.forEach((proj, index) => {
    // Radial distribution
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);

    const endPos = new THREE.Vector3(dirX * pathRadius, 0, dirZ * pathRadius);

    // Forest stone rune texture & vortex texture
    const runeTex = createForestRuneTileTexture(proj.themeColor);
    const vortexTex = createPortalVortexTexture(proj.themeColor);
    disposables.push(runeTex, vortexTex);

    const runeMat = new THREE.MeshStandardMaterial({
      map: runeTex,
      roughness: 0.5,
      metalness: 0.45,
      emissive: new THREE.Color(proj.themeColor),
      emissiveIntensity: 0.25,
    });
    disposables.push(runeMat);

    // 6a. Stepping stone slabs from Hub edge to Portal
    const startRadius = 7.2;
    const endRadius = pathRadius - 2.8;
    const stepSteps = Math.floor((endRadius - startRadius) / 1.7);

    for (let s = 1; s <= stepSteps; s++) {
      const t = s / (stepSteps + 1);
      const r = THREE.MathUtils.lerp(startRadius, endRadius, t);
      const slabPos = new THREE.Vector3(dirX * r, 0.08, dirZ * r);

      const slabGeo = new THREE.BoxGeometry(1.6, 0.16, 1.2);
      const slab = new THREE.Mesh(slabGeo, runeMat);
      slab.position.copy(slabPos);
      slab.rotation.y = -angle + Math.PI / 2;
      slab.receiveShadow = true;
      pathsGroup.add(slab);
      disposables.push(slabGeo);

      // Soft emerald / theme ground glow beneath steps
      if (s % 2 === 0) {
        const glowGeo = new THREE.PlaneGeometry(1.8, 1.4);
        glowGeo.rotateX(-Math.PI / 2);
        const glowSubMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(proj.themeColor),
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowSubMat);
        glowMesh.position.set(slabPos.x, 0.01, slabPos.z);
        pathsGroup.add(glowMesh);
        disposables.push(glowGeo, glowSubMat);
      }
    }

    // 6b. Portal Island Glade
    const portalIslandGroup = new THREE.Group();
    portalIslandGroup.position.copy(endPos);
    portalIslandGroup.rotation.y = -angle - Math.PI / 2; // Facing back to hub

    // Island dais
    const islandGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.45, 24);
    const islandMesh = new THREE.Mesh(islandGeo, stoneMat);
    islandMesh.position.y = -0.15;
    islandMesh.receiveShadow = true;
    portalIslandGroup.add(islandMesh);
    disposables.push(islandGeo);

    // Glowing rim
    const islandRimGeo = new THREE.TorusGeometry(3.65, 0.08, 12, 48);
    islandRimGeo.rotateX(Math.PI / 2);
    const islandRimMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(proj.themeColor),
      transparent: true,
      opacity: 0.75,
    });
    const islandRim = new THREE.Mesh(islandRimGeo, islandRimMat);
    islandRim.position.y = 0.1;
    portalIslandGroup.add(islandRim);
    disposables.push(islandRimGeo, islandRimMat);

    // 6c. Ancient Forest Star Gate (Arch & Pillars)
    const portalArchGroup = new THREE.Group();

    // Outer Heavy Ancient Weathered Stone Arch
    const outerRingGeo = new THREE.TorusGeometry(2.4, 0.2, 16, 48);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x182c22,
      roughness: 0.7,
      metalness: 0.3,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, archMat);
    outerRing.position.set(0, 2.6, 0);
    outerRing.castShadow = true;
    portalArchGroup.add(outerRing);
    disposables.push(outerRingGeo, archMat);

    // Inner Glowing Botanical Energy Ring
    const innerRingGeo = new THREE.TorusGeometry(2.1, 0.07, 12, 36);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(proj.themeColor),
      emissive: new THREE.Color(proj.themeColor),
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.85,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.position.set(0, 2.6, 0);
    portalArchGroup.add(innerRing);
    disposables.push(innerRingGeo, innerRingMat);

    // Flanking Twin Weathered Monoliths with vine coil details
    const pylonGeo = new THREE.BoxGeometry(0.45, 3.5, 0.45);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x102119,
      roughness: 0.8,
      metalness: 0.25,
    });
    const leftPylon = new THREE.Mesh(pylonGeo, pylonMat);
    leftPylon.position.set(-2.55, 1.75, 0);
    leftPylon.castShadow = true;
    portalArchGroup.add(leftPylon);

    const rightPylon = new THREE.Mesh(pylonGeo, pylonMat);
    rightPylon.position.set(2.55, 1.75, 0);
    rightPylon.castShadow = true;
    portalArchGroup.add(rightPylon);
    disposables.push(pylonGeo, pylonMat);

    // Swirling Forest Spirit Vortex Disc
    const vortexGeo = new THREE.CircleGeometry(2.0, 36);
    const vortexMat = new THREE.MeshBasicMaterial({
      map: vortexTex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
    vortexMesh.position.set(0, 2.6, 0);
    portalArchGroup.add(vortexMesh);
    disposables.push(vortexGeo, vortexMat);

    // Levitating Floating Spirit Crystal Core
    const crystalGeo = new THREE.OctahedronGeometry(0.35, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(proj.themeColor),
      emissive: new THREE.Color(proj.themeColor),
      emissiveIntensity: 0.95,
      roughness: 0.1,
      metalness: 0.9,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(0, 2.6, 0.45);
    portalArchGroup.add(crystalMesh);
    disposables.push(crystalGeo, crystalMat);

    // Portal PointLight
    const pointLight = new THREE.PointLight(
      new THREE.Color(proj.themeColor),
      2.8,
      9.5,
      1.8
    );
    pointLight.position.set(0, 2.6, 0.5);
    portalArchGroup.add(pointLight);

    // Ascending Forest Spirit Motes / Particles
    const pCount = 36;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pVelocities = new Float32Array(pCount * 3);

    for (let p = 0; p < pCount; p++) {
      const theta = Math.random() * Math.PI * 2;
      const rad = Math.random() * 1.8;
      pPositions[p * 3] = Math.cos(theta) * rad;
      pPositions[p * 3 + 1] = 0.5 + Math.random() * 3.5;
      pPositions[p * 3 + 2] = (Math.random() - 0.5) * 0.8;

      pVelocities[p * 3] = (Math.random() - 0.5) * 0.12;
      pVelocities[p * 3 + 1] = 0.25 + Math.random() * 0.4;
      pVelocities[p * 3 + 2] = (Math.random() - 0.5) * 0.12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.userData = { velocities: pVelocities, pCount };

    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color(proj.themeColor),
      size: 0.35,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    portalArchGroup.add(particles);
    disposables.push(pGeo, pMat);

    portalIslandGroup.add(portalArchGroup);
    pathsGroup.add(portalIslandGroup);

    portalNodes.push({
      project: proj,
      position: endPos,
      directionAngle: angle,
      portalGroup: portalIslandGroup,
      vortexMesh,
      crystalMesh,
      pointLight,
      outerRing,
      innerRing,
      particles,
    });
  });

  rootGroup.add(pathsGroup);

  // ==========================================
  // 7. FIREFLIES & LUMINESCENT SPORES SWARM
  // ==========================================
  const fireflyTex = createFireflyTexture();
  disposables.push(fireflyTex);

  const fireflyCount = 360;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPos = new Float32Array(fireflyCount * 3);
  const fireflySpeeds = new Float32Array(fireflyCount);

  for (let f = 0; f < fireflyCount; f++) {
    // Scattered across forest floor and trees
    const dist = Math.random() * (pathRadius + 14);
    const angle = Math.random() * Math.PI * 2;
    fireflyPos[f * 3] = Math.cos(angle) * dist;
    fireflyPos[f * 3 + 1] = 0.4 + Math.random() * 5.5;
    fireflyPos[f * 3 + 2] = Math.sin(angle) * dist;
    fireflySpeeds[f] = 0.5 + Math.random() * 1.5;
  }
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
  fireflyGeo.userData = { speeds: fireflySpeeds };

  const fireflyMat = new THREE.PointsMaterial({
    size: 0.48,
    map: fireflyTex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
  rootGroup.add(fireflies);
  disposables.push(fireflyGeo, fireflyMat);

  // ==========================================
  // 8. TRANSLUCENT MOONBEAMS (CANOPY LIGHT SHAFTS)
  // ==========================================
  const moonbeamGeo = new THREE.CylinderGeometry(0.8, 3.2, 18, 8, 1, true);
  moonbeamGeo.translate(0, 9, 0);
  const moonbeamMat = new THREE.MeshBasicMaterial({
    color: 0x6ee7b7,
    transparent: true,
    opacity: 0.045,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(moonbeamGeo, moonbeamMat);

  for (let mb = 0; mb < 3; mb++) {
    const beam = new THREE.Mesh(moonbeamGeo, moonbeamMat);
    const bAngle = (mb * Math.PI * 2) / 3;
    beam.position.set(Math.cos(bAngle) * 4.5, -0.5, Math.sin(bAngle) * 4.5);
    beam.rotation.z = 0.15;
    beam.rotation.x = -0.15;
    rootGroup.add(beam);
  }

  // ==========================================
  // UPDATE TICK FUNCTION
  // ==========================================
  const updateTick = (delta: number, elapsed: number) => {
    // 1. Author monument halo & beacon animation
    haloMesh.rotation.z += delta * 0.35;
    haloMesh.position.y = 3.25 + Math.sin(elapsed * 1.4) * 0.12;
    beaconLight.intensity = 2.5 + Math.sin(elapsed * 2.2) * 0.35;

    // 2. Fireflies floating & breathing dance
    const fPositions = fireflies.geometry.attributes.position.array as Float32Array;
    const fSpeeds = fireflies.geometry.userData.speeds as Float32Array;
    for (let f = 0; f < fireflyCount; f++) {
      const spd = fSpeeds[f];
      // Gentle horizontal drift
      fPositions[f * 3] += Math.sin(elapsed * spd + f) * 0.008;
      fPositions[f * 3 + 2] += Math.cos(elapsed * spd + f) * 0.008;
      // Gentle vertical bobbing
      fPositions[f * 3 + 1] += Math.sin(elapsed * spd * 1.5 + f * 2) * 0.006;
      if (fPositions[f * 3 + 1] > 6.0) fPositions[f * 3 + 1] = 0.5;
      if (fPositions[f * 3 + 1] < 0.3) fPositions[f * 3 + 1] = 0.4;
    }
    fireflies.geometry.attributes.position.needsUpdate = true;

    // 3. Portal vortex spin, crystal rotation & spark particles
    portalNodes.forEach((node, idx) => {
      node.vortexMesh.rotation.z += delta * (1.1 + (idx % 3) * 0.25);

      node.crystalMesh.rotation.x += delta * 1.4;
      node.crystalMesh.rotation.y += delta * 1.8;
      node.crystalMesh.position.y = 2.6 + Math.sin(elapsed * 1.8 + idx) * 0.1;

      node.innerRing.rotation.z -= delta * 0.5;
      node.outerRing.rotation.z += delta * 0.2;

      node.pointLight.intensity = 2.8 + Math.sin(elapsed * 2.8 + idx * 1.2) * 0.5;

      const posAttr = node.particles.geometry.attributes.position.array as Float32Array;
      const vels = node.particles.geometry.userData.velocities as Float32Array;
      const pCount = node.particles.geometry.userData.pCount as number;

      for (let p = 0; p < pCount; p++) {
        posAttr[p * 3 + 1] += vels[p * 3 + 1] * delta;
        posAttr[p * 3] += Math.sin(elapsed * 2.5 + p) * 0.004;

        if (posAttr[p * 3 + 1] > 4.5) {
          posAttr[p * 3 + 1] = 0.6;
          const theta = Math.random() * Math.PI * 2;
          const rad = Math.random() * 1.8;
          posAttr[p * 3] = Math.cos(theta) * rad;
          posAttr[p * 3 + 2] = (Math.random() - 0.5) * 0.6;
        }
      }
      node.particles.geometry.attributes.position.needsUpdate = true;
    });
  };

  const dispose = () => {
    disposables.forEach((item) => {
      if (item && 'dispose' in item) {
        item.dispose();
      }
    });
  };

  return {
    rootGroup,
    portalNodes,
    centerMonumentPosition,
    centerMonumentGroup,
    fireflies,
    updateTick,
    dispose,
  };
}
