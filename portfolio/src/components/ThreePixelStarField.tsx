import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ThreePixelStarField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);

    let pixelRatio = window.innerWidth < 768 ? 0.45 : 0.35;
    renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, false);

    // 生成散落的星空坐标 (增加数量到原来的两倍，保证最终聚合时有足够的粒子)
    const particleCount = window.innerWidth < 768 ? 2400 : 6000;
    const startPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleAlphas = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleIsExtra = new Float32Array(particleCount);

    function pickStarColor() {
      const r = Math.random();
      if (r < 0.65) return new THREE.Color("#F8FBFF");
      if (r < 0.83) return new THREE.Color("#BFDFFF");
      if (r < 0.93) return new THREE.Color("#FFE6A7");
      if (r < 0.96) return new THREE.Color("#5EE6FF");
      if (r < 0.99) return new THREE.Color("#FFB84D");
      return new THREE.Color("#FF6B5E");
    }

    function pickPixelStarSize() {
      const r = Math.random();
      if (r < 0.70) return { size: 0.006, alpha: 0.3 };
      if (r < 0.90) return { size: 0.013, alpha: 0.6 };
      if (r < 0.98) return { size: 0.02, alpha: 0.9 };
      return { size: 0.026, alpha: 1.0 };
    }

    function pickLayer() {
      const r = Math.random();
      if (r < 0.70) {
        return { z: -8 - Math.random() * 6, sizeMul: 0.3, alphaMul: 0.65 };
      }
      if (r < 0.95) {
        return { z: -2 - Math.random() * 4, sizeMul: 1.0, alphaMul: 1.0 };
      }
      return { z: 2 + Math.random() * 4, sizeMul: 2.0, alphaMul: 0.85 };
    }

    function isInTitleSafeArea(x: number, y: number) {
      return x < -8 && y > -2.5 && y < 2.5;
    }

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      let x: number;
      let y: number;
      let z: number;
      let layer;

      do {
        layer = pickLayer();
        z = layer.z;
        const randX = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        const randY = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        x = randX * 80;
        y = randY * 40;
      } while (isInTitleSafeArea(x, y) && Math.random() < 0.4);

      startPositions[i3 + 0] = x;
      startPositions[i3 + 1] = y;
      startPositions[i3 + 2] = z;

      const color = pickStarColor();
      particleColors[i3 + 0] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;

      const props = pickPixelStarSize();
      const distanceFromCenter = Math.min(1.0, Math.sqrt(x * x + y * y) / 40.0);

      const edge0 = 0.2;
      const edge1 = 1.0;
      const t = Math.max(0.0, Math.min(1.0, (distanceFromCenter - edge0) / (edge1 - edge0)));
      const smoothstepVal = t * t * (3.0 - 2.0 * t);

      const centerBrightnessMultiplier = 1.0 - smoothstepVal;
      const finalAlphaMultiplier = Math.max(0.1, centerBrightnessMultiplier) * layer.alphaMul;

      particleSizes[i] = props.size * layer.sizeMul;
      particleAlphas[i] = props.alpha * finalAlphaMultiplier;
      particleSpeeds[i] = Math.random() * 2.0 + 0.5;
      // 后一半的粒子被标记为 "额外粒子"
      particleIsExtra[i] = i >= (particleCount / 2) ? 1.0 : 0.0;
    }

    let particlesMesh: THREE.Points | null = null;
    let scrollRotationGroup: THREE.Group | null = null;
    let idleRotationGroup: THREE.Group | null = null;
    let pointerInteractionGroup: THREE.Group | null = null;
    let animationFrameId: number;
    const scrollTriggerInstances: ScrollTrigger[] = [];
    let cancelled = false;
    let aboutSection: HTMLElement | null = null;
    let isPointerInModelZone = false;
    let activePointerId: number | null = null;
    let isDraggingModel = false;
    let lastPointerClientX: number | null = null;
    let pointerRotationY = 0;
    let currentIdleSpinFactor = 1;
    let elapsedTime = 0;

    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    const calculateLookAt = () => {
      if (window.innerWidth < 768) {
        return 0;
      }

      const vFov = (45 * Math.PI) / 180;
      const heightAtZ0 = 2 * Math.tan(vFov / 2) * 7;
      const widthAtZ0 = heightAtZ0 * (window.innerWidth / window.innerHeight);
      const rightEdgeX = widthAtZ0 / 2;
      const modelRadius = 1.5;
      const pixelToWorld = widthAtZ0 / window.innerWidth;
      const paddingWorld = 96 * pixelToWorld;

      return -(rightEdgeX - modelRadius - paddingWorld);
    };

    lookAtTarget.x = calculateLookAt();
    document.body.classList.remove("hide-ribbons");

    const clock = new THREE.Clock();

    const resolveModelZoneState = (event: PointerEvent) => {
      if (!aboutSection) return;

      const rect = aboutSection.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xRatio = x / rect.width;
      const yRatio = y / rect.height;

      const withinBounds = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      isPointerInModelZone =
        withinBounds && xRatio >= 0.42 && xRatio <= 0.98 && yRatio >= 0.08 && yRatio <= 0.94;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      resolveModelZoneState(event);
      if (!isPointerInModelZone || !aboutSection) return;

      isDraggingModel = true;
      activePointerId = event.pointerId;
      lastPointerClientX = event.clientX;
      aboutSection.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      resolveModelZoneState(event);

      if (!isDraggingModel || activePointerId !== event.pointerId) {
        if (!isPointerInModelZone) {
          lastPointerClientX = null;
        }
        return;
      }

      if (lastPointerClientX === null) {
        lastPointerClientX = event.clientX;
        return;
      }

      const deltaX = event.clientX - lastPointerClientX;
      lastPointerClientX = event.clientX;

      if (Math.abs(deltaX) < 0.25) return;

      pointerRotationY += deltaX * 0.0055;
    };

    const stopDragging = (event?: PointerEvent) => {
      if (event && aboutSection && activePointerId === event.pointerId) {
        if (aboutSection.hasPointerCapture(event.pointerId)) {
          aboutSection.releasePointerCapture(event.pointerId);
        }
      }

      isDraggingModel = false;
      activePointerId = null;
      if (!isPointerInModelZone) {
        lastPointerClientX = null;
      }
    };

    const resetPointerTarget = () => {
      isPointerInModelZone = false;
      stopDragging();
      lastPointerClientX = null;
    };

    async function initParticles(targetMesh: THREE.Mesh, isFallback = false) {
      if (cancelled) return;
      targetMesh.geometry.center();
      if (!isFallback) {
        targetMesh.geometry.scale(1.5, 1.5, 1.5);
        targetMesh.rotation.x = 0;
      }

      let sampler: any;
      try {
        const { MeshSurfaceSampler } = await import("three/examples/jsm/math/MeshSurfaceSampler.js");
        if (cancelled) return;
        sampler = new MeshSurfaceSampler(targetMesh).build();
      } catch (e) {
        console.error("Failed to load MeshSurfaceSampler", e);
        return;
      }
      if (cancelled) return;
      const tempPosition = new THREE.Vector3();
      const tempNormal = new THREE.Vector3();
      const targetNormals = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // 同时采样位置和法线
        sampler.sample(tempPosition, tempNormal);

        // 旋转法线以匹配模型的旋转
        tempNormal.applyEuler(targetMesh.rotation);

        // 取消网格吸附，直接使用模型的真实表面坐标
        targetPositions[i3 + 0] = tempPosition.x;
        targetPositions[i3 + 1] = tempPosition.y;
        targetPositions[i3 + 2] = tempPosition.z;

        targetNormals[i3 + 0] = tempNormal.x;
        targetNormals[i3 + 1] = tempNormal.y;
        targetNormals[i3 + 2] = tempNormal.z;
      }

      createParticles(targetNormals);
    }

    function fallbackGeometry() {
      if (cancelled) return;
      // 粒子最终聚合成的形状
      // 这里可以替换成其他 THREE.js 内置几何体，如 THREE.IcosahedronGeometry, THREE.SphereGeometry 等
      // 例如：const geometry = new THREE.IcosahedronGeometry(2.5, 2);
      const geometry = new THREE.TorusKnotGeometry(2, 0.6, 150, 20);
      const targetMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      initParticles(targetMesh, true);
    }

    function loadModelGeometry() {
      // 动态导入 GLTFLoader 避免顶部 import 报错
      import("three/examples/jsm/loaders/GLTFLoader.js").then(({ GLTFLoader }) => {
        if (cancelled) return;
        const loader = new GLTFLoader();
        // 这里替换为您自己的 3D 模型路径，模型需要放在 public 文件夹下
        loader.load('/models/Meshy_AI_Portrait_of_a_Young_M_0622073025_generate.glb', (gltf) => {
          if (cancelled) return;
          let targetMesh: THREE.Mesh | null = null;

          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !targetMesh) {
              targetMesh = child;
            }
          });

          if (targetMesh) {
            initParticles(targetMesh, false);
          } else {
            fallbackGeometry();
          }
        }, undefined, (error) => {
          if (cancelled) return;
          console.error('An error happened while loading the model:', error);
          fallbackGeometry();
        });
      });
    }

    // 您可以选择调用 loadModelGeometry() 来加载外部模型，或者继续使用 fallbackGeometry()
    loadModelGeometry();
    // fallbackGeometry();

    function createParticles(targetNormals: Float32Array) {
      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute("position", new THREE.BufferAttribute(startPositions, 3));
      geometry.setAttribute("aTargetPosition", new THREE.BufferAttribute(targetPositions, 3));
      geometry.setAttribute("aTargetNormal", new THREE.BufferAttribute(targetNormals, 3));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(particleColors, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));
      geometry.setAttribute("aAlpha", new THREE.BufferAttribute(particleAlphas, 1));
      geometry.setAttribute("aSpeed", new THREE.BufferAttribute(particleSpeeds, 1));
      geometry.setAttribute("aIsExtra", new THREE.BufferAttribute(particleIsExtra, 1));

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: `
          attribute vec3 aTargetPosition;
          attribute vec3 aTargetNormal;
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aAlpha;
          attribute float aSpeed;
          attribute float aIsExtra;
          
          varying vec3 vColor;
          varying float vAlpha;
          
          uniform float uProgress;
          uniform float uTime;

          void main() {
            vColor = aColor;
            
            float twinkle = sin(uTime * aSpeed + position.x * 10.0) * 0.5 + 0.5;
            float morphBoost = smoothstep(0.35, 1.0, uProgress);
            
            // 额外增加的粒子在 landing page 时透明度为 0，滚动时逐渐显现
            float visibility = mix(1.0 - aIsExtra, 1.0, uProgress);
            
            // 菲涅尔边缘效应：计算法线和相机视线的夹角
            // 越靠近边缘的地方（法线与视线垂直），粒子越亮、越密集；正对相机的地方（面部平坦处）则变暗变稀疏
            vec3 viewDir = normalize(cameraPosition - aTargetPosition);
            float fresnel = 1.0 - max(0.0, dot(normalize(aTargetNormal), viewDir));
            fresnel = pow(fresnel, 1.5); // 增强边缘对比度
            
            // 在聚合完成时（uProgress=1.0）应用菲涅尔效果，并且如果不是边缘，有概率将其隐藏（变小变暗）
            float edgeEmphasis = mix(1.0, mix(0.1, 2.5, fresnel), uProgress);
            
            vAlpha = aAlpha * mix(0.5 + twinkle * 0.5, 1.0, uProgress);
            vAlpha = vAlpha * mix(1.0, 1.35, morphBoost) * visibility * edgeEmphasis;
            
            float p = smoothstep(0.0, 1.0, uProgress);
            vec3 currentPos = position;
            
            currentPos.x += sin(uTime * aSpeed * 0.2 + currentPos.z) * 0.5 * (1.0 - p);
            currentPos.y += cos(uTime * aSpeed * 0.2 + currentPos.x) * 0.5 * (1.0 - p);
            
            float wave = sin(currentPos.x * 2.0 + uProgress * 6.0) * 0.15;
            
            vec3 finalPosition = mix(currentPos, aTargetPosition, p);
            finalPosition.y += wave * (1.0 - abs(uProgress - 0.5) * 2.0);
            
            vec4 worldPos = modelMatrix * vec4(finalPosition, 1.0);
            vec3 worldPos3 = worldPos.xyz;
            
            vec4 viewPosition = viewMatrix * vec4(worldPos3, 1.0);
            vec4 projectedPosition = projectionMatrix * viewPosition;

            gl_Position = projectedPosition;
            
            float sizeAttenuation = 300.0 / pow(-viewPosition.z, 1.5);
            float finalSize = aSize * sizeAttenuation * mix(1.0, mix(0.2, 1.5, fresnel), uProgress);
            gl_PointSize = max(0.0, floor(finalSize));
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vec2 uv = gl_PointCoord;
            float border = step(0.08, uv.x) * step(0.08, uv.y)
                         * step(uv.x, 0.92) * step(uv.y, 0.92);
            
            gl_FragColor = vec4(vColor, vAlpha * border);
          }
        `,
      });

      particlesMesh = new THREE.Points(geometry, material);
      scrollRotationGroup = new THREE.Group();
      idleRotationGroup = new THREE.Group();
      pointerInteractionGroup = new THREE.Group();
      pointerInteractionGroup.add(particlesMesh);
      idleRotationGroup.add(pointerInteractionGroup);
      scrollRotationGroup.add(idleRotationGroup);
      scene.add(scrollRotationGroup);

      setupScroll(material, scrollRotationGroup);
      animate();
    }

    function setupScroll(material: THREE.ShaderMaterial, rotationGroup: THREE.Group) {
      const heroSection = document.querySelector('#hero');
      const triggerOpts = heroSection
        ? { trigger: heroSection, start: "top top", end: "bottom top" }
        : { trigger: document.body, start: "top top", end: "bottom bottom" };

      const st1 = ScrollTrigger.create({
        ...triggerOpts,
        scrub: true,
        animation: gsap.to(material.uniforms.uProgress, {
          value: 1,
          ease: "none",
        })
      });

      const st2 = ScrollTrigger.create({
        ...triggerOpts,
        scrub: true,
        animation: gsap.to(rotationGroup.rotation, {
          y: Math.PI * 0.5,
          ease: "none",
        })
      });

      const st3 = ScrollTrigger.create({
        ...triggerOpts,
        scrub: true,
        animation: gsap.to(camera.position, {
          z: 7,
          ease: "none",
        })
      });

      scrollTriggerInstances.push(st1, st2, st3);
    }

    function animate() {
      const delta = Math.min(clock.getDelta(), 0.05);
      const frameFactor = delta * 60;
      elapsedTime += delta;

      if (particlesMesh && idleRotationGroup) {
        currentIdleSpinFactor = THREE.MathUtils.lerp(
          currentIdleSpinFactor,
          1,
          0.08,
        );
        idleRotationGroup.rotation.y += 0.005 * currentIdleSpinFactor * frameFactor;

        if (pointerInteractionGroup) {
          pointerInteractionGroup.rotation.x = 0;
          pointerInteractionGroup.rotation.y = pointerRotationY;
        }

        camera.lookAt(lookAtTarget);

        const material = particlesMesh.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = elapsedTime;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    const onResize = () => {
      pixelRatio = window.innerWidth < 768 ? 0.45 : 0.35;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, false);
      lookAtTarget.x = calculateLookAt();
    };

    aboutSection = document.querySelector("#about");
    window.addEventListener("resize", onResize);
    aboutSection?.addEventListener("pointerdown", handlePointerDown);
    aboutSection?.addEventListener("pointermove", handlePointerMove);
    aboutSection?.addEventListener("pointerup", stopDragging);
    aboutSection?.addEventListener("pointercancel", stopDragging);
    aboutSection?.addEventListener("pointerleave", resetPointerTarget);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      aboutSection?.removeEventListener("pointerdown", handlePointerDown);
      aboutSection?.removeEventListener("pointermove", handlePointerMove);
      aboutSection?.removeEventListener("pointerup", stopDragging);
      aboutSection?.removeEventListener("pointercancel", stopDragging);
      aboutSection?.removeEventListener("pointerleave", resetPointerTarget);
      document.body.classList.remove("hide-ribbons");
      cancelAnimationFrame(animationFrameId);
      scrollTriggerInstances.forEach(st => st.kill());
      if (particlesMesh) {
        particlesMesh.geometry.dispose();
        (particlesMesh.material as THREE.Material).dispose();
      }
      if (scrollRotationGroup) {
        scene.remove(scrollRotationGroup);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-[50] pointer-events-none overflow-hidden mix-blend-difference">
      {/* 增加 CRT 扫描线 */}
      <div
        className="absolute inset-0 pointer-events-none z-[4] opacity-15"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.02) 0,
            rgba(255,255,255,0.02) 1px,
            transparent 1px,
            transparent 4px
          )`
        }}
      />

      {/* 增加像素网格 */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-20 mix-blend-overlay"
        style={{
          background: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
          `,
          backgroundSize: '4px 4px'
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
