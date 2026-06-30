import { useEffect, useRef } from "react";
import * as THREE from "three";

export function MountainStarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 2, 18);
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setClearColor(0x050508, 1);

    const isMobile = window.innerWidth < 768;
    let pixelRatio = isMobile ? 0.5 : 0.4;
    renderer.setSize(
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio,
      false
    );

    const clock = new THREE.Clock();

    const starCount = isMobile ? 1800 : 4500;
    const mountainParticleCount = isMobile ? 6000 : 15000;

    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starAlphas = new Float32Array(starCount);
    const starTwinkleSpeeds = new Float32Array(starCount);
    const starTwinklePhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 60;
      const y = Math.random() * 25 - 3;
      const z = -Math.random() * 40 - 5;

      starPositions[i3] = x;
      starPositions[i3 + 1] = y;
      starPositions[i3 + 2] = z;

      const brightness = 0.4 + Math.random() * 0.6;
      const tint = Math.random();
      if (tint < 0.7) {
        starColors[i3] = brightness;
        starColors[i3 + 1] = brightness;
        starColors[i3 + 2] = brightness * (0.9 + Math.random() * 0.1);
      } else if (tint < 0.88) {
        starColors[i3] = brightness * 0.75;
        starColors[i3 + 1] = brightness * 0.85;
        starColors[i3 + 2] = brightness;
      } else {
        starColors[i3] = brightness;
        starColors[i3 + 1] = brightness * 0.9;
        starColors[i3 + 2] = brightness * 0.7;
      }

      starSizes[i] = 0.02 + Math.random() * 0.03;
      starAlphas[i] = 0.2 + Math.random() * 0.6;
      starTwinkleSpeeds[i] = 0.3 + Math.random() * 0.8;
      starTwinklePhases[i] = Math.random() * Math.PI * 2;
    }

    function frontMountainHeight(x: number) {
      return (
        Math.sin(x * 0.35) * 2.2 +
        Math.sin(x * 0.7 + 1.2) * 1.0 +
        Math.sin(x * 1.5 + 0.5) * 0.4 +
        Math.sin(x * 3.2 + 2.1) * 0.15
      );
    }

    function backMountainHeight(x: number) {
      return (
        Math.sin(x * 0.25 + 2.0) * 1.6 +
        Math.sin(x * 0.6 + 0.8) * 0.7 +
        Math.sin(x * 1.3 + 3.5) * 0.25
      );
    }

    const mountainPositions = new Float32Array(mountainParticleCount * 3);
    const mountainColors = new Float32Array(mountainParticleCount * 3);
    const mountainSizes = new Float32Array(mountainParticleCount);
    const mountainAlphas = new Float32Array(mountainParticleCount);
    const mountainLayers = new Float32Array(mountainParticleCount);
    const mountainDriftSpeeds = new Float32Array(mountainParticleCount);

    for (let i = 0; i < mountainParticleCount; i++) {
      const i3 = i * 3;
      const layer = Math.random();
      mountainLayers[i] = layer;

      let x: number, y: number, z: number;
      let ridgeH: number;
      let baseAlpha: number;
      let baseSize: number;
      let r: number, g: number, b: number;

      if (layer < 0.55) {
        x = (Math.random() - 0.5) * 50;
        ridgeH = frontMountainHeight(x);
        const depth = Math.random();
        const depthPow = Math.pow(depth, 0.6);
        y = ridgeH - depthPow * 4.5 - 2.5;
        z = -2 + Math.random() * 4;

        const ridgeFactor = 1.0 - depthPow;
        baseAlpha = 0.5 + ridgeFactor * 0.75;
        baseSize = 0.02 + ridgeFactor * 0.05;
        const whiteness = 0.62 + ridgeFactor * 0.55;
        r = whiteness;
        g = whiteness;
        b = whiteness * (0.95 + ridgeFactor * 0.05);
      } else if (layer < 0.82) {
        x = (Math.random() - 0.5) * 55;
        ridgeH = backMountainHeight(x);
        const depth = Math.random();
        const depthPow = Math.pow(depth, 0.5);
        y = ridgeH - depthPow * 3.5 - 3.0;
        z = -8 + Math.random() * 4;

        const ridgeFactor = 1.0 - depthPow;
        baseAlpha = 0.22 + ridgeFactor * 0.44;
        baseSize = 0.014 + ridgeFactor * 0.028;
        const dimness = 0.32 + ridgeFactor * 0.26;
        r = dimness * 0.8;
        g = dimness * 0.85;
        b = dimness;
      } else {
        x = (Math.random() - 0.5) * 55;
        const h = Math.random();
        y = -3 + Math.sin(x * 0.3 + 1) * 0.5 - h * 6;
        z = -3 - Math.random() * 5;

        baseAlpha = 0.12 + (1 - h) * 0.22;
        baseSize = 0.01 + Math.random() * 0.016;
        const dim = 0.2 + (1 - h) * 0.2;
        r = dim * 0.7;
        g = dim * 0.75;
        b = dim * 0.9;
      }

      mountainPositions[i3] = x;
      mountainPositions[i3 + 1] = y;
      mountainPositions[i3 + 2] = z;
      mountainColors[i3] = r;
      mountainColors[i3 + 1] = g;
      mountainColors[i3 + 2] = b;
      mountainSizes[i] = baseSize;
      mountainAlphas[i] = baseAlpha;
      mountainDriftSpeeds[i] = 0.02 + Math.random() * 0.08;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("aColor", new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(starAlphas, 1));
    starGeometry.setAttribute("aTwinkleSpeed", new THREE.BufferAttribute(starTwinkleSpeeds, 1));
    starGeometry.setAttribute("aTwinklePhase", new THREE.BufferAttribute(starTwinklePhases, 1));

    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        attribute float aTwinkleSpeed;
        attribute float aTwinklePhase;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vColor = aColor;
          float twinkle = sin(uTime * aTwinkleSpeed + aTwinklePhase) * 0.5 + 0.5;
          vAlpha = aAlpha * (0.6 + twinkle * 0.4);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = aSize * (200.0 / -mvPos.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, dist);
          glow = pow(glow, 1.5);
          gl_FragColor = vec4(vColor, vAlpha * glow);
        }
      `,
    });

    const starMesh = new THREE.Points(starGeometry, starMaterial);
    scene.add(starMesh);

    const mountainGeometry = new THREE.BufferGeometry();
    mountainGeometry.setAttribute("position", new THREE.BufferAttribute(mountainPositions, 3));
    mountainGeometry.setAttribute("aColor", new THREE.BufferAttribute(mountainColors, 3));
    mountainGeometry.setAttribute("aSize", new THREE.BufferAttribute(mountainSizes, 1));
    mountainGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(mountainAlphas, 1));
    mountainGeometry.setAttribute("aLayer", new THREE.BufferAttribute(mountainLayers, 1));
    mountainGeometry.setAttribute("aDriftSpeed", new THREE.BufferAttribute(mountainDriftSpeeds, 1));

    const mountainMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        attribute float aLayer;
        attribute float aDriftSpeed;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vLayer;
        uniform float uTime;
        void main() {
          vColor = aColor;
          vLayer = aLayer;
          vec3 pos = position;
          float drift = sin(uTime * aDriftSpeed * 0.3 + position.x * 0.5 + position.y) * 0.08;
          pos.y += drift * (1.0 - aLayer);
          float breath = sin(uTime * 0.15 + aLayer * 6.28) * 0.05 + 0.95;
          vAlpha = aAlpha * breath;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = aSize * (310.0 / -mvPos.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vLayer;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float core = smoothstep(0.5, 0.0, dist);
          core = pow(core, 1.2);
          float edge = smoothstep(0.5, 0.3, dist) * 0.42;
          gl_FragColor = vec4(vColor, vAlpha * (core + edge) * 1.12);
        }
      `,
    });

    const mountainMesh = new THREE.Points(mountainGeometry, mountainMaterial);
    scene.add(mountainMesh);

    let animationId: number;

    function animate() {
      const elapsed = clock.getElapsedTime();
      starMaterial.uniforms.uTime.value = elapsed;
      mountainMaterial.uniforms.uTime.value = elapsed;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const mobile = window.innerWidth < 768;
      pixelRatio = mobile ? 0.5 : 0.4;
      renderer.setSize(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio,
        false
      );
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationId);
      starGeometry.dispose();
      starMaterial.dispose();
      mountainGeometry.dispose();
      mountainMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-[4] opacity-10"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.015) 0,
            rgba(255,255,255,0.015) 1px,
            transparent 1px,
            transparent 4px
          )`,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
