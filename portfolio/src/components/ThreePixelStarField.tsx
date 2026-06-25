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
    let animationFrameId: number;
    const scrollTriggerInstances: ScrollTrigger[] = [];

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentMouseForce = 0;
    let targetMouseForce = 0;
    const ndcMouse = new THREE.Vector2(-1000, -1000);
    const raycaster = new THREE.Raycaster();
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    const calculateLookAt = () => {
      if (window.innerWidth < 768) {
        return 0;
      }

      // 相机在 z=7，视野角为 45 度
      // 在 z=0 平面上，画面宽度一半对应的世界坐标距离 = Math.tan(45 / 2 * Math.PI / 180) * 7
      const vFov = (45 * Math.PI) / 180;
      const heightAtZ0 = 2 * Math.tan(vFov / 2) * 7;
      const widthAtZ0 = heightAtZ0 * (window.innerWidth / window.innerHeight);

      // 我们想要模型 (x=0) 距离右边缘 20px (大概是屏幕宽度的 20/window.innerWidth)
      // 模型占据的空间大概是半径 1.5 的球体
      // 算出相机需要往左偏多少的世界坐标
      const rightEdgeX = widthAtZ0 / 2;
      const modelRadius = 1.5;
      const pixelToWorld = widthAtZ0 / window.innerWidth;
      const paddingWorld = 80 * pixelToWorld;

      // 摄像机看左边，所以是负数
      return -(rightEdgeX - modelRadius - paddingWorld);
    };

    lookAtTarget.x = calculateLookAt();

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2);
      mouseY = (event.clientY - window.innerHeight / 2);

      ndcMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      ndcMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      targetMouseForce = 1.0; // 鼠标移动时产生扰动力度
    };
    window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();

    async function initParticles(targetMesh: THREE.Mesh, isFallback = false) {
      targetMesh.geometry.center();
      if (!isFallback) {
        // 根据新模型的尺寸调整放大倍数，再次缩小一倍 (从 3 改为 1.5)
        targetMesh.geometry.scale(1.5, 1.5, 1.5);
        // 让模型默认正面朝向相机
        targetMesh.rotation.x = 0;
      }

      let sampler: any;
      try {
        const { MeshSurfaceSampler } = await import("three/examples/jsm/math/MeshSurfaceSampler.js");
        // 增加根据面的面积权重进行采样，但我们稍后会在 Shader 里用菲涅尔效应强调边缘
        sampler = new MeshSurfaceSampler(targetMesh).build();
      } catch (e) {
        console.error("Failed to load MeshSurfaceSampler", e);
        return;
      }
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
        const loader = new GLTFLoader();
        // 这里替换为您自己的 3D 模型路径，模型需要放在 public 文件夹下
        loader.load('/models/Meshy_AI_Portrait_of_a_Young_M_0622073025_generate.glb', (gltf) => {
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
          uRayOrigin: { value: new THREE.Vector3() },
          uRayDirection: { value: new THREE.Vector3() },
          uMouseForce: { value: 0 },
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
          uniform vec3 uRayOrigin;
          uniform vec3 uRayDirection;
          uniform float uMouseForce;

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
            
            // 鼠标扰动逻辑
            vec3 pToRay = worldPos3 - uRayOrigin;
            vec3 crossProd = cross(pToRay, uRayDirection);
            float distToRay = length(crossProd);
            
            float hoverRadius = 1.2;
            if (distToRay < hoverRadius) {
              float disturbance = (1.0 - distToRay / hoverRadius);
              disturbance = disturbance * disturbance; // 平滑衰减
              disturbance *= uMouseForce; // 乘以鼠标力度，鼠标停止时自动恢复
              
              vec3 closestPoint = uRayOrigin + dot(pToRay, uRayDirection) * uRayDirection;
              vec3 pushDirection = worldPos3 - closestPoint;
              float pushLen = length(pushDirection);
              
              if (pushLen > 0.001) {
                pushDirection /= pushLen;
                // 向外排斥 + 一点点随机浮动
                worldPos3 += pushDirection * disturbance * 1.0; // 稍微加大一点力度以补偿衰减
                worldPos3.x += sin(uTime * 10.0 + worldPos3.y) * disturbance * 0.2;
                worldPos3.y += cos(uTime * 10.0 + worldPos3.x) * disturbance * 0.2;
              }
            }
            
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
      scene.add(particlesMesh);

      setupScroll(material, particlesMesh);
      animate();
    }

    function setupScroll(material: THREE.ShaderMaterial, particles: THREE.Points) {
      // 绑定到 #about 模块，滑动到 about 时形变恰好完成
      const aboutSection = document.querySelector('#about');
      const triggerOpts = aboutSection
        ? { trigger: aboutSection, start: "top bottom", end: "top top" }
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
        animation: gsap.to(particles.rotation, {
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
      const elapsed = clock.getElapsedTime();

      if (particlesMesh) {
        particlesMesh.rotation.y += 0.001; // 恢复围绕自身中心的缓慢旋转

        targetX = mouseX * 0.002;
        targetY = mouseY * 0.002;

        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(lookAtTarget); // 让相机看向左边，从而让模型显示在画面右边

        // 更新鼠标射线用于粒子扰动
        raycaster.setFromCamera(ndcMouse, camera);

        // 计算鼠标扰动力度的衰减与平滑恢复
        targetMouseForce = Math.max(0, targetMouseForce - 0.05); // 快速衰减
        currentMouseForce += (targetMouseForce - currentMouseForce) * 0.2; // 弹性平滑

        const material = particlesMesh.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uRayOrigin.value.copy(raycaster.ray.origin);
        material.uniforms.uRayDirection.value.copy(raycaster.ray.direction);
        material.uniforms.uMouseForce.value = currentMouseForce;
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
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
      scrollTriggerInstances.forEach(st => st.kill());
      if (particlesMesh) {
        particlesMesh.geometry.dispose();
        (particlesMesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[50] pointer-events-none overflow-hidden mix-blend-difference">
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
