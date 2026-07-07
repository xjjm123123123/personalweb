import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
type SceneLabel = {
  text: string;
  top: string;
  left: string;
  mobileTop: string;
  mobileLeft: string;
  scale: number;
  alpha: number;
  depth: number;
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
};

const projectLabels: SceneLabel[] = [
  { text: "Agent", top: "30%", left: "23%", mobileTop: "22%", mobileLeft: "18%", scale: 1.15, alpha: 1, depth: 56, position: [-8.5, 2.75, -3.2], rotation: [0.02, -0.1, -0.03], size: 0.48 },
  { text: "VR", top: "15%", left: "56%", mobileTop: "17%", mobileLeft: "55%", scale: 0.96, alpha: 0.92, depth: -22, position: [0.8, 4.18, -4.9], rotation: [-0.05, 0.08, -0.08], size: 0.34 },
  { text: "PC Game", top: "35%", left: "42%", mobileTop: "34%", mobileLeft: "38%", scale: 0.9, alpha: 0.88, depth: -48, position: [-3.9, 2.35, -4.2], rotation: [0.03, -0.04, 0.02], size: 0.31 },
  { text: "Robot", top: "33%", left: "82%", mobileTop: "30%", mobileLeft: "74%", scale: 0.92, alpha: 0.84, depth: 40, position: [8.0, 2.58, -5.2], rotation: [0.04, 0.12, 0.02], size: 0.27 },
  { text: "Web", top: "39%", left: "63%", mobileTop: "45%", mobileLeft: "60%", scale: 0.76, alpha: 0.74, depth: -74, position: [2.45, 1.85, -4.1], rotation: [0.01, 0.05, -0.02], size: 0.22 },
];

type LabelStyle = CSSProperties & {
  "--label-top-mobile": string;
  "--label-left-mobile": string;
  "--label-top-desktop": string;
  "--label-left-desktop": string;
  "--label-scale": number;
  "--label-alpha": number;
};

type WordStyle = CSSProperties & {
  "--word-x": string;
  "--word-y": string;
  "--word-rot": string;
};

const terrainVertexShader = `
  attribute float aRand;
  attribute float aHeight;
  varying float vAlpha;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.45 + aRand * 6.2831) * 0.045;
    pos.z += cos(uTime * 0.28 + aRand * 8.0) * 0.035;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float distanceFade = clamp(18.0 / -mvPosition.z, 0.18, 1.35);
    float peakGlow = smoothstep(0.2, 4.2, aHeight);
    gl_PointSize = (1.08 + peakGlow * 1.18 + aRand * 0.5) * distanceFade * uPixelRatio;
    vAlpha = mix(0.05, 0.42, peakGlow) * (0.48 + aRand * 0.32);
  }
`;

const terrainFragmentShader = `
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float core = 1.0 - smoothstep(0.0, 0.46, length(uv));
    float halo = 1.0 - smoothstep(0.08, 0.5, length(uv));
    vec3 coldWhite = vec3(0.82, 0.9, 1.0);
    gl_FragColor = vec4(coldWhite, (core * 0.62 + halo * 0.12) * vAlpha);
  }
`;

const starVertexShader = `
  attribute float aRand;
  attribute float aSize;
  varying float vAlpha;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.05 + aRand * 10.0) * 0.06;
    pos.y += cos(uTime * 0.06 + aRand * 12.0) * 0.04;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float twinkle = sin(uTime * (0.4 + aRand * 1.2) + aRand * 18.0) * 0.5 + 0.5;
    gl_PointSize = aSize * (0.72 + twinkle * 0.65) * (26.0 / -mvPosition.z) * uPixelRatio;
    vAlpha = mix(0.12, 0.72, twinkle) * (0.45 + aRand * 0.55);
  }
`;

const starFragmentShader = `
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dotShape = 1.0 - smoothstep(0.0, 0.48, length(uv));
    gl_FragColor = vec4(vec3(0.78, 0.88, 1.0), dotShape * vAlpha);
  }
`;

function seededNoise(x: number, z: number) {
  return Math.sin(x * 1.73 + z * 2.21) * 0.5
    + Math.sin(x * 3.11 - z * 1.37) * 0.28
    + Math.sin(x * 7.7 + z * 5.9) * 0.12;
}

function ridgeHeight(x: number, z: number) {
  const leftPeak = Math.exp(-Math.pow((x + 9.2) / 5.2, 2));
  const centerPeak = Math.exp(-Math.pow((x + 1.3) / 8.4, 2));
  const rightPeak = Math.exp(-Math.pow((x - 9.8) / 6.2, 2));
  const depthFade = 1.0 - Math.min(1, Math.abs(z) / 8.5) * 0.62;
  const ridges = leftPeak * 4.8 + centerPeak * 2.65 + rightPeak * 3.3;
  return Math.max(0, (ridges + seededNoise(x * 0.22, z * 0.42) * 0.7) * depthFade);
}

function createTerrain(pointCount: number) {
  const positions = new Float32Array(pointCount * 3);
  const randoms = new Float32Array(pointCount);
  const heights = new Float32Array(pointCount);

  for (let i = 0; i < pointCount; i += 1) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const x = (u - 0.5) * 34;
    const z = (v - 0.5) * 13;
    const height = ridgeHeight(x, z);
    const slopeScatter = Math.pow(Math.random(), 1.55);

    positions[i3] = x;
    positions[i3 + 1] = -3.1 + height * slopeScatter + (Math.random() - 0.5) * 0.08;
    positions[i3 + 2] = z - 1.5 + (Math.random() - 0.5) * 0.06;
    randoms[i] = Math.random();
    heights[i] = height * slopeScatter;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(randoms, 1));
  geometry.setAttribute("aHeight", new THREE.BufferAttribute(heights, 1));

  return geometry;
}

function createStars(pointCount: number) {
  const positions = new Float32Array(pointCount * 3);
  const randoms = new Float32Array(pointCount);
  const sizes = new Float32Array(pointCount);

  for (let i = 0; i < pointCount; i += 1) {
    const i3 = i * 3;
    const layer = Math.random();
    const depth = layer < 0.62 ? -28 - Math.random() * 14 : layer < 0.88 ? -16 - Math.random() * 10 : -7 - Math.random() * 5;
    const verticalSpread = Math.pow(Math.random(), 0.82) * 18.5 - 0.4;

    positions[i3] = (Math.random() - 0.5) * 46;
    positions[i3 + 1] = verticalSpread;
    positions[i3 + 2] = depth;
    randoms[i] = Math.random();
    sizes[i] = layer < 0.62 ? 1.1 : layer < 0.88 ? 1.8 : 2.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(randoms, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  return geometry;
}

function getDeviceProfile(isMobile: boolean) {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

  if (isMobile || cores <= 4 || memory <= 4) {
    return {
      terrainPoints: isMobile ? 9000 : 24000,
      starPoints: isMobile ? 600 : 1200,
      dpr: isMobile ? 1 : 1.35,
      bloomStrength: isMobile ? 0.28 : 0.45,
    };
  }

  return {
    terrainPoints: 48000,
    starPoints: 1800,
    dpr: 1.8,
    bloomStrength: 0.58,
  };
}

interface ProjectsProps {
  onCategorySelect: (category: string) => void;
}

export function Projects({ onCategorySelect }: ProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 2.2, 12);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 1);

    const isMobile = window.innerWidth < 768;
    const profile = getDeviceProfile(isMobile);
    const dpr = Math.min(window.devicePixelRatio || 1, profile.dpr);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), profile.bloomStrength, 0.62, 0.18);
    const outputPass = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    const terrainUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
    };
    const starUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
    };

    const terrain = new THREE.Points(
      createTerrain(profile.terrainPoints),
      new THREE.ShaderMaterial({
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        uniforms: terrainUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    terrain.rotation.x = -0.18;
    scene.add(terrain);

    const stars = new THREE.Points(
      createStars(profile.starPoints),
      new THREE.ShaderMaterial({
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        uniforms: starUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(stars);

    let frameId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let visible = false;
    const clock = new THREE.Clock();

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      targetMouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetMouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );

    const render = () => {
      const elapsed = clock.getElapsedTime();
      mouseX += (targetMouseX - mouseX) * 0.035;
      mouseY += (targetMouseY - mouseY) * 0.035;

      camera.position.x += (mouseX * 1.15 - camera.position.x) * 0.035;
      camera.position.y += (2.2 - mouseY * 0.55 - camera.position.y) * 0.035;
      camera.lookAt(0, 0.7, -1.5);

      terrain.rotation.y = mouseX * 0.035 + Math.sin(elapsed * 0.08) * 0.018;
      stars.rotation.y = mouseX * 0.02;

      terrainUniforms.uTime.value = elapsed;
      starUniforms.uTime.value = elapsed;

      if (visible) {
        composer.render();
      }

      frameId = requestAnimationFrame(render);
    };

    resize();
    observer.observe(section);
    section.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
      terrain.geometry.dispose();
      (terrain.material as THREE.Material).dispose();
      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden bg-transparent"
      aria-label="Projects particle mountain field"
    >
      <style>{`
        @keyframes project-word-drift {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(var(--word-x), var(--word-y), 0) rotate(var(--word-rot));
          }
        }

        @media (min-width: 768px) {
          #projects [data-project-label] {
            top: var(--label-top-desktop);
            left: var(--label-left-desktop);
          }
        }

        #projects [data-project-label] {
          transform:
            translate3d(-50%, -50%, 0)
            scale(var(--label-scale));
        }

        #projects [data-project-word] {
          transform-origin: 50% 70%;
          padding: 0.28em 0.18em;
          margin: -0.28em -0.18em;
          pointer-events: auto;
          transition: transform 200ms ease, filter 200ms ease, text-shadow 200ms ease;
        }

        #projects [data-project-word]:hover {
          transform: translate3d(0, -3px, 0) rotate(4deg) scale(1.08);
          filter: brightness(1.25);
          text-shadow: 0 0 10px rgba(255,255,255,0.95), 0 0 22px rgba(180,210,255,0.58);
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full"
        style={{
          imageRendering: "auto",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 8%, black 22%, black 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 8%, black 22%, black 100%)",
        }}
      />



      <div className="absolute right-4 top-0 z-20 hidden rounded-full border border-white/70 px-8 py-2 font-pixel text-[11px] uppercase tracking-[0.12em] text-white/90 md:block">
        Let's Talk
      </div>

      <div className="relative z-10 h-[88vh] min-h-[620px]">
        {projectLabels.map((label, index) => (
          <div
            key={label.text}
            data-project-label={index}
            onClick={() => onCategorySelect(label.text)}
            className="group pointer-events-auto absolute whitespace-nowrap font-pixel text-[18px] tracking-[0.04em] text-white/80 mix-blend-screen transition-colors duration-300 hover:text-white md:text-[22px] cursor-pointer"
            style={{
              top: "var(--label-top-mobile)",
              left: "var(--label-left-mobile)",
              opacity: "var(--label-alpha)",
              "--label-top-mobile": label.mobileTop,
              "--label-left-mobile": label.mobileLeft,
              "--label-top-desktop": label.top,
              "--label-left-desktop": label.left,
              "--label-scale": label.scale,
              "--label-alpha": label.alpha,
              textShadow: "0 0 10px rgba(255,255,255,0.78), 0 0 34px rgba(180,210,255,0.32)",
            } as LabelStyle}
          >
            <span className="relative inline-block">
              {label.text.split("\n").map((line, lineIndex) => (
                <span key={`${label.text}-${lineIndex}`} className="block">
                  {line.split(/(\s+)/).map((word, wordIndex) => {
                    if (/^\s+$/.test(word)) {
                      return <span key={`${line}-${wordIndex}`}>{"\u00A0"}</span>;
                    }

                    const driftIndex = lineIndex * 7 + wordIndex;
                    return (
                      <span
                        key={`${line}-${wordIndex}`}
                        className="inline-block"
                        style={{
                          "--word-x": `${((driftIndex % 3) - 1) * 0.9}px`,
                          "--word-y": `${(driftIndex % 2 === 0 ? -1 : 1) * 1.0}px`,
                          "--word-rot": `${((driftIndex % 5) - 2) * 0.26}deg`,
                          animation: `project-word-drift ${4.2 + (driftIndex % 5) * 0.35}s ease-in-out infinite`,
                          animationDelay: `${driftIndex * -0.19}s`,
                        } as WordStyle}
                      >
                          <span data-project-word className="inline-block">
                            {word}
                          </span>
                      </span>
                    );
                  })}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}
