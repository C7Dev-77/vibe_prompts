import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

interface ScrollWorldCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
}

export const ScrollWorldCanvas: React.FC<ScrollWorldCanvasProps> = ({ scrollProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useStore((s) => s.theme);
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const isDark = theme === 'dark';
    if (isDark) {
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.012);
    } else {
      // In light mode, scene background is null so radiant CSS gradients shine through
      scene.background = null;
      scene.fog = new THREE.FogExp2(0xf8fafc, 0.005);
    }

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- 2. Outlined Triangle Texture Generator ---
    const createTriangleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 64, 64);
      
      // Draw crisp equilateral triangle outline in pure white
      // so vertexColors tint it with 100% fidelity without murky multiplication
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(54, 52);
      ctx.lineTo(10, 52);
      ctx.closePath();
      ctx.stroke();

      // Subtle inner gradient core for luminous gemstone look
      const grad = ctx.createRadialGradient(32, 36, 2, 32, 36, 22);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    };

    const triangleTexture = createTriangleTexture();

    // --- 3. Palette Tokens ---
    // High-end, cohesive, radiant jewel tones in both dark and light modes
    // Balanced so additive blending doesn't wash out into blinding white
    const colorPalette = isDark ? [
      new THREE.Color('#8052ff'), // Electric Iris
      new THREE.Color('#ffb829'), // Saffron Spark
      new THREE.Color('#10b981'), // Emerald Verdant
      new THREE.Color('#00e5ff'), // Cyan
      new THREE.Color('#e040fb'), // Magenta
      new THREE.Color('#c4b5fd')  // Soft Lavender Stardust (was harsh white)
    ] : [
      new THREE.Color('#7c3aed'), // Rich Electric Iris
      new THREE.Color('#0284c7'), // Radiant Sky Blue
      new THREE.Color('#f59e0b'), // Warm Amber
      new THREE.Color('#0d9488'), // Teal Emerald
      new THREE.Color('#ec4899'), // Modern Rose Pink
      new THREE.Color('#8b5cf6')  // Soft Violet
    ];

    // --- 4. Constellation Generation Helpers ---
    // Scene 0: Organic Brain / Neural Constellation at z = 0 (offset to x = 4.6)
    // Scene 1: Distributed Network / Nodes at z = -30
    // Scene 2: Golden Ratio Torus / Geometry at z = -60
    // Scene 3: Quantum Double Helix at z = -90
    // Scene 4: Stellar Vortex Galaxy at z = -120

    const TOTAL_PARTICLES = 2600;
    const positions = new Float32Array(TOTAL_PARTICLES * 3);
    const colors = new Float32Array(TOTAL_PARTICLES * 3);
    const originalPositions = new Float32Array(TOTAL_PARTICLES * 3);

    let idx = 0;

    const addParticle = (x: number, y: number, z: number, color: THREE.Color) => {
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;
      
      originalPositions[idx * 3] = x;
      originalPositions[idx * 3 + 1] = y;
      originalPositions[idx * 3 + 2] = z;

      colors[idx * 3] = color.r;
      colors[idx * 3 + 1] = color.g;
      colors[idx * 3 + 2] = color.b;

      idx++;
    };

    // 4.1 Cluster 0: Brain / Neural Network (center x = 4.6, y = 0.2, z = 0) ~580 particles
    // Shifted to the right half of the hero screen so the left hero typography has 100% breathing room!
    for (let i = 0; i < 580 && idx < TOTAL_PARTICLES; i++) {
      // Hemisphere ellipsoid formula for brain lobes
      const hemisphere = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.8 * Math.cbrt(Math.random());

      // Position shifted to x: +4.6 on the right side
      let x = 4.6 + r * Math.sin(phi) * Math.cos(theta) * 0.85 + hemisphere * 1.35;
      let y = 0.2 + r * Math.sin(phi) * Math.sin(theta) * 0.95 + Math.sin((x - 4.6) * 1.5) * 0.35;
      let z = r * Math.cos(phi) * 1.0;

      // Subtle indentation between hemispheres
      if (Math.abs(x - 4.6) < 0.6) x = 4.6 + (x - 4.6) * 0.6;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      addParticle(x, y, z, col);
    }

    // 4.2 Cluster 1: Frontend Network / Connected Hubs (center z = -30) ~500 particles
    const hubCenters = [
      { x: -4, y: 1.5, z: -30 },
      { x: 3.5, y: -1.2, z: -28 },
      { x: 0, y: 3.2, z: -32 },
      { x: -2, y: -2.8, z: -31 },
      { x: 4.2, y: 2.1, z: -29 }
    ];
    for (let i = 0; i < 500 && idx < TOTAL_PARTICLES; i++) {
      const hub = hubCenters[i % hubCenters.length];
      const spread = 2.8;
      const x = hub.x + (Math.random() - 0.5) * spread * 2;
      const y = hub.y + (Math.random() - 0.5) * spread * 2;
      const z = hub.z + (Math.random() - 0.5) * spread * 2;
      const col = i % 3 === 0 ? colorPalette[0] : (i % 3 === 1 ? colorPalette[1] : colorPalette[3]);
      addParticle(x, y, z, col);
    }

    // 4.3 Cluster 2: Geometric Torus / UI Harmony (center z = -60) ~500 particles
    for (let i = 0; i < 500 && idx < TOTAL_PARTICLES; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const R = 4.8; // major radius
      const r = 1.6 + Math.random() * 0.6; // minor radius
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u) * 0.8;
      const z = -60 + r * Math.sin(v) * 1.5;
      const col = colorPalette[Math.floor(Math.random() * (colorPalette.length - 1))];
      addParticle(x, y, z, col);
    }

    // 4.4 Cluster 3: Quantum Double Helix (center z = -90) ~500 particles
    for (let i = 0; i < 500 && idx < TOTAL_PARTICLES; i++) {
      const t = (i / 500) * Math.PI * 8; // 4 full turns
      const strand = i % 2 === 0 ? 1 : -1;
      const radius = 3.2 + Math.sin(t * 2) * 0.5;
      const x = Math.cos(t) * radius * strand + (Math.random() - 0.5) * 0.6;
      const y = Math.sin(t) * radius * strand + (Math.random() - 0.5) * 0.6;
      const z = -105 + (i / 500) * 30; // spans z = -105 to -75
      const col = strand === 1 ? colorPalette[0] : colorPalette[1];
      addParticle(x, y, z, col);
    }

    // 4.5 Cluster 4: Stellar Vortex Galaxy & Ambient Space (z = -120 to +20) ~500 particles
    for (let i = 0; i < 500 && idx < TOTAL_PARTICLES; i++) {
      if (i < 300) {
        // Celestial spiral galaxy framing the scene with a clear center for text readability
        const angle = Math.random() * Math.PI * 2;
        const dist = 7.5 + Math.pow(Math.random(), 0.7) * 12; // Breathing room for hero CTA
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist * 0.65;
        const z = -122 + (Math.random() - 0.5) * 10;
        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        addParticle(x, y, z, col);
      } else {
        // Deep ambient drifting stars
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 32;
        const z = -140 + Math.random() * 160;
        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        addParticle(x, y, z, col);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isDark ? 1.05 : 0.95,
      map: triangleTexture,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.65 : 0.62,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- 5. Delicate Constellation Lines (Cluster 0 & 1) ---
    // Connect nearby points in the brain and frontend cluster
    const lineIndices: number[] = [];
    const maxLineDist = 1.35;
    const maxLineDistSq = maxLineDist * maxLineDist;

    // Subsample points for performance
    for (let i = 0; i < 500; i += 2) {
      for (let j = i + 1; j < 500; j += 2) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < maxLineDistSq) {
          lineIndices.push(i, j);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    lineGeometry.setIndex(lineIndices);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.15 : 0.14,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // --- 5.5. Tumbling 3D Vibe Crystals / Tokens (inspired by dontlookup.app 3D objects) ---
    const tokenGroup = new THREE.Group();
    const tokenItems: {
      mesh: THREE.Group;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedX: number;
      speedY: number;
      speedZ: number;
      floatSpeed: number;
      floatOffset: number;
    }[] = [];

    // Ambient light and key lights for 3D facets (soft studio grade)
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(isDark ? 0x8052ff : 0x7c3aed, isDark ? 1.8 : 1.5);
    dirLight1.position.set(10, 15, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(isDark ? 0xffb829 : 0xf59e0b, isDark ? 1.4 : 1.1);
    dirLight2.position.set(-10, -10, -50);
    scene.add(dirLight2);

    const tokenZPositions = [6, -8, -25, -45, -70, -95, -118];
    const octGeo = new THREE.OctahedronGeometry(1.05, 0);
    const icoGeo = new THREE.IcosahedronGeometry(0.85, 0);

    tokenZPositions.forEach((zPos, i) => {
      const singleTokenGroup = new THREE.Group();
      const geom = i % 2 === 0 ? octGeo : icoGeo;
      const tokenColor = colorPalette[i % colorPalette.length];

      // Physical crystal / gemstone material with refractive transmission
      const facetMat = new THREE.MeshPhysicalMaterial({
        color: tokenColor,
        roughness: isDark ? 0.2 : 0.12,
        metalness: isDark ? 0.35 : 0.05,
        transmission: isDark ? 0.4 : 0.65,
        ior: 1.52,
        transparent: true,
        opacity: isDark ? 0.75 : 0.48,
        wireframe: false
      });
      const facetMesh = new THREE.Mesh(geom, facetMat);
      singleTokenGroup.add(facetMesh);

      // Glowing delicate wireframe outline (matching jewel color in light mode)
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0xffffff : tokenColor,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.45 : 0.25
      });
      const wireMesh = new THREE.Mesh(geom, wireframeMat);
      wireMesh.scale.setScalar(1.02);
      singleTokenGroup.add(wireMesh);

      const side = (i % 2 === 0 ? 1 : -1);
      // Place crystals in the peripheral field to preserve text legibility
      const baseX = side * (6.5 + (i % 3) * 1.5);
      const baseY = ((i % 4) - 1.5) * 2.2;
      const baseZ = zPos;

      singleTokenGroup.position.set(baseX, baseY, baseZ);
      tokenGroup.add(singleTokenGroup);

      tokenItems.push({
        mesh: singleTokenGroup,
        baseX,
        baseY,
        baseZ,
        speedX: 0.015 + (i * 0.005),
        speedY: 0.02 + (i * 0.004),
        speedZ: 0.01 + (i * 0.003),
        floatSpeed: 1.2 + (i * 0.2),
        floatOffset: i * 1.5
      });
    });

    scene.add(tokenGroup);

    // --- 6. Mouse Interaction & Parallax ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- 7. Responsive Resizing ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 8. Animation & Camera Flight Loop ---
    let animationFrameId: number;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Camera target path based on scrollProgress
    // scrollProgress 0.0 -> z = 16 (looking at brain at z = 0)
    // scrollProgress 0.25 -> z = -14 (approaching frontend cluster at z = -30)
    // scrollProgress 0.50 -> z = -44 (approaching torus at z = -60)
    // scrollProgress 0.75 -> z = -74 (approaching helix at z = -90)
    // scrollProgress 1.00 -> z = -105 (inside vortex galaxy at z = -120)

    let currentZ = 16;
    let currentX = 0;
    let currentY = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Compute target camera coordinates along flight path
      const p = progressRef.current;
      const targetZ = 16 - p * 121; // from +16 to -105
      
      // Cinematic gentle curve & sway
      const targetX = Math.sin(p * Math.PI * 3) * 2.8 + mouse.x * 1.5;
      const targetY = Math.cos(p * Math.PI * 2.5) * 1.6 + mouse.y * 1.2;

      // Camera lerp
      currentZ += (targetZ - currentZ) * 0.06;
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      camera.position.set(currentX, currentY, currentZ);

      // Camera looks ahead into the void
      const lookTargetZ = currentZ - 20;
      const lookTargetX = Math.sin(p * Math.PI * 3 + 0.5) * 1.2;
      const lookTargetY = Math.cos(p * Math.PI * 2.5 + 0.5) * 0.8;
      camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

      // Subtle particle float and organic breathing
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      // Subtle breathing rotation on clusters
      particles.rotation.z = Math.sin(elapsedTime * 0.15) * 0.03;

      // Mouse repulsion on nearby particles
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
      const mouseWorldPos = new THREE.Vector3();
      raycaster.ray.at(15, mouseWorldPos);

      // Subtle wave on a fraction of particles
      for (let i = 0; i < 400; i++) {
        const pIdx = (i * 6) % TOTAL_PARTICLES;
        const origX = originalPositions[pIdx * 3];
        const origY = originalPositions[pIdx * 3 + 1];
        const origZ = originalPositions[pIdx * 3 + 2];

        // Organic oscillation
        const wave = Math.sin(elapsedTime * 1.2 + origX * 0.5 + origY * 0.5) * 0.15;
        posArray[pIdx * 3] = origX + wave;
        posArray[pIdx * 3 + 1] = origY + Math.cos(elapsedTime * 0.8 + origZ * 0.1) * 0.12;

        // Proximity push
        const dx = posArray[pIdx * 3] - mouseWorldPos.x;
        const dy = posArray[pIdx * 3 + 1] - mouseWorldPos.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 9) {
          const force = (9 - distSq) / 9 * 0.3;
          posArray[pIdx * 3] += dx * force;
          posArray[pIdx * 3 + 1] += dy * force;
        }
      }
      posAttr.needsUpdate = true;

      // Also update line geometry position reference
      lineGeometry.attributes.position.needsUpdate = true;

      // 3D Tumbling Vibe Tokens Animation (like tumbling 3D coins in dontlookup)
      tokenItems.forEach((item) => {
        item.mesh.rotation.x += item.speedX;
        item.mesh.rotation.y += item.speedY;
        item.mesh.rotation.z += item.speedZ;

        // Smooth physical floating bounce
        item.mesh.position.y = item.baseY + Math.sin(elapsedTime * item.floatSpeed + item.floatOffset) * 0.45;
        item.mesh.position.x = item.baseX + Math.cos(elapsedTime * (item.floatSpeed * 0.7) + item.floatOffset) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      triangleTexture.dispose();
      octGeo.dispose();
      icoGeo.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      />
      {/* High-Contrast Readability Gradient Overlay:
          Gently shields the text column on the left with a subtle obsidian/ceramic falloff
          so all typography is effortlessly readable without selecting */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-300 bg-gradient-to-r from-white/70 via-white/30 to-transparent dark:from-black/80 dark:via-black/45 dark:to-transparent" 
        style={{ opacity: 0.85 }}
      />
    </div>
  );
};
