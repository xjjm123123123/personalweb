import * as THREE from "three"; 
import gsap from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger"; 
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; 
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js"; 

gsap.registerPlugin(ScrollTrigger); 

const canvas = document.querySelector("#webgl"); 
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
const pixelRatio = window.innerWidth < 768 ? 0.45 : 0.35; // 降采样比例，制造像素感
renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, false); 

// 再次减半粒子数量，但稍微提升一点以弥补完全空洞
const particleCount = window.innerWidth < 768 ? 600 : 1500; 
const startPositions = new Float32Array(particleCount * 3); 
const targetPositions = new Float32Array(particleCount * 3); 
const particleColors = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount); 
const particleAlphas = new Float32Array(particleCount); 
const particleSpeeds = new Float32Array(particleCount); 

// 像素风受限调色板
function pickStarColor() { 
  const r = Math.random(); 
  if (r < 0.65) return new THREE.Color("#F8FBFF"); // 冷白 65%
  if (r < 0.83) return new THREE.Color("#BFDFFF"); // 蓝白 18%
  if (r < 0.93) return new THREE.Color("#FFE6A7"); // 暖白 10%
  if (r < 0.96) return new THREE.Color("#5EE6FF"); // 青色 3%
  if (r < 0.99) return new THREE.Color("#FFB84D"); // 金色 3%
  return new THREE.Color("#FF6B5E"); // 红色 1%
} 

// 整数大小的方块星星
function pickPixelStarSize() {
  const r = Math.random();
  // 再次缩小 3 倍 (相比之前 0.02-0.08 的基础)
  if (r < 0.70) return { size: 0.006, alpha: 0.3 };
  if (r < 0.90) return { size: 0.013, alpha: 0.6 };
  if (r < 0.98) return { size: 0.02, alpha: 0.9 };
  return { size: 0.026, alpha: 1.0 };
}

// 远中近三层深度控制
function pickLayer() {
  const r = Math.random();
  // 增加尺寸差异，让远处的星星明显更小
  if (r < 0.70) {
    // 远层星，尺寸乘数从 0.75 降到 0.3
    return { z: -8 - Math.random() * 6, sizeMul: 0.3, alphaMul: 0.65 };
  }
  if (r < 0.95) {
    // 中层星，尺寸乘数 1.0
    return { z: -2 - Math.random() * 4, sizeMul: 1.0, alphaMul: 1.0 };
  }
  // 近层星，尺寸乘数从 1.35 提升到 2.0，拉大对比
  return { z: 2 + Math.random() * 4, sizeMul: 2.0, alphaMul: 0.85 };
}

// 文字避让区
function isInTitleSafeArea(x, y) { 
  return x < -8 && y > -2.5 && y < 2.5; 
} 

// 1. 生成星空起始坐标、颜色、大小、透明度和速度
for (let i = 0; i < particleCount; i++) { 
  const i3 = i * 3; 
  
  let x, y, z;
  let layer;

  // 生成避开标题区的坐标，并完全打散分布，避免出现方形的密集感
  do { 
    layer = pickLayer();
    z = layer.z;
    
    // 改回使用更自然的非线性分布，让整个屏幕都有星星，但不拥挤
    // 使用多次 Math.random() 叠加来制造中间稍密、四周渐稀的自然正态分布感
    // 而不是强硬的 if/else 裁切
    let randX = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    let randY = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    
    x = randX * 80; // X 轴拉得更宽
    y = randY * 40; // Y 轴拉得更宽
    
  } while (isInTitleSafeArea(x, y) && Math.random() < 0.4); // 进一步降低标题避让的排斥力
  
  startPositions[i3 + 0] = x; 
  startPositions[i3 + 1] = y; 
  startPositions[i3 + 2] = z; 
  
  const color = pickStarColor();
  particleColors[i3 + 0] = color.r;
  particleColors[i3 + 1] = color.g;
  particleColors[i3 + 2] = color.b;

  const props = pickPixelStarSize();
  
  // 计算当前星星离中心的距离 (0 到 1 之间，1 表示在极远边缘)
  const distanceFromCenter = Math.min(1.0, Math.sqrt(x*x + y*y) / 40.0);
  
  // 越靠近中心越亮 (透明度越高)，四周越暗
  // 在 JS 中实现 smoothstep 逻辑
  const edge0 = 0.2;
  const edge1 = 1.0;
  const t = Math.max(0.0, Math.min(1.0, (distanceFromCenter - edge0) / (edge1 - edge0)));
  const smoothstepVal = t * t * (3.0 - 2.0 * t);
  
  const centerBrightnessMultiplier = 1.0 - smoothstepVal;
  // 保证最边缘的星星不至于完全消失，保留极微弱的底光 (比如 0.1)
  const finalAlphaMultiplier = Math.max(0.1, centerBrightnessMultiplier) * layer.alphaMul;

  particleSizes[i] = props.size * layer.sizeMul;
  // 将距离衰减应用到透明度上
  particleAlphas[i] = props.alpha * finalAlphaMultiplier;
  
  particleSpeeds[i] = Math.random() * 2.0 + 0.5;
} 

// 2. 加载模型或使用降级几何体
const loader = new GLTFLoader(); 

function initParticles(targetMesh, isFallback = false) {
  targetMesh.geometry.center(); 
  if (!isFallback) {
    targetMesh.geometry.scale(3, 3, 3); 
  }

  const sampler = new MeshSurfaceSampler(targetMesh).build(); 
  const tempPosition = new THREE.Vector3(); 

  // 吸附到网格，制造体素/像素化模型的感觉
  function snapToGrid(value, gridSize) { 
    return Math.round(value / gridSize) * gridSize; 
  }

  for (let i = 0; i < particleCount; i++) { 
    const i3 = i * 3; 
    sampler.sample(tempPosition); 
    
    // 吸附
    targetPositions[i3 + 0] = snapToGrid(tempPosition.x, 0.08); 
    targetPositions[i3 + 1] = snapToGrid(tempPosition.y, 0.08); 
    targetPositions[i3 + 2] = snapToGrid(tempPosition.z, 0.08); 
  } 

  createParticles(); 
}

loader.load(
  "/models/person.glb", 
  (gltf) => { 
    let targetMesh = null; 
    gltf.scene.traverse((child) => { 
      if (child.isMesh && !targetMesh) { 
        targetMesh = child; 
      } 
    }); 
    if (targetMesh) {
      initParticles(targetMesh);
    } else {
      fallbackGeometry();
    }
  },
  undefined,
  (error) => {
    console.warn("未能加载 /models/person.glb 模型，使用默认几何体代替。请在 public/models/ 中放置 person.glb", error);
    fallbackGeometry();
  }
); 

function fallbackGeometry() {
  // 当没有人物模型时，使用一个稍微复杂的几何体作为目标演示形变效果
  const geometry = new THREE.TorusKnotGeometry(2, 0.6, 150, 20);
  const targetMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  initParticles(targetMesh, true);
}

// 3. 创建 Shader 粒子系统
function createParticles() { 
  const geometry = new THREE.BufferGeometry(); 

  geometry.setAttribute( 
    "position", 
    new THREE.BufferAttribute(startPositions, 3) 
  ); 

  geometry.setAttribute( 
    "aTargetPosition", 
    new THREE.BufferAttribute(targetPositions, 3) 
  ); 
  
  geometry.setAttribute(
    "aColor",
    new THREE.BufferAttribute(particleColors, 3)
  );
  
  geometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(particleSizes, 1)
  );

  geometry.setAttribute(
    "aAlpha",
    new THREE.BufferAttribute(particleAlphas, 1)
  );

  geometry.setAttribute(
    "aSpeed",
    new THREE.BufferAttribute(particleSpeeds, 1)
  );

  const material = new THREE.ShaderMaterial({ 
    transparent: true, 
    depthWrite: false, 
    // 将 AdditiveBlending 换为 NormalBlending，避免堆叠过曝
    blending: THREE.NormalBlending,
    uniforms: { 
      uProgress: { value: 0 }, 
      uTime: { value: 0 }, 
    }, 
    vertexShader: ` 
      attribute vec3 aTargetPosition; 
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAlpha;
      attribute float aSpeed;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      uniform float uProgress; 
      uniform float uTime;

      void main() { 
        vColor = aColor; 
        
        // 星星闪烁逻辑 
        float twinkle = sin(uTime * aSpeed + position.x * 10.0) * 0.5 + 0.5;
        float morphBoost = smoothstep(0.35, 1.0, uProgress);
        vAlpha = aAlpha * mix(0.5 + twinkle * 0.5, 1.0, uProgress);
        vAlpha = vAlpha * mix(1.0, 1.35, morphBoost);
        
        float p = smoothstep(0.0, 1.0, uProgress); 
        vec3 currentPos = position;
        
        currentPos.x += sin(uTime * aSpeed * 0.2 + currentPos.z) * 0.5 * (1.0 - p);
        currentPos.y += cos(uTime * aSpeed * 0.2 + currentPos.x) * 0.5 * (1.0 - p);
        
        float wave = sin(currentPos.x * 2.0 + uProgress * 6.0) * 0.15; 
        
        vec3 finalPosition = mix(currentPos, aTargetPosition, p); 
        finalPosition.y += wave * (1.0 - abs(uProgress - 0.5) * 2.0);
        
        // 像素化空间运动，聚合时抖动更明显，形成网格感
        float pixelStrength = smoothstep(0.2, 1.0, uProgress); 
        float grid = mix(0.015, 0.045, pixelStrength); 
        // 降低像素化步进带来的突变刷新感，改用更平滑的吸附
        // 或者直接去掉运动过程中的强制 floor 截断，保留最终人物模型的 snapToGrid 即可
        // finalPosition.xy = floor(finalPosition.xy / grid) * grid; 
        
        vec4 modelPosition = modelMatrix * vec4(finalPosition, 1.0); 
        vec4 viewPosition = viewMatrix * modelPosition; 
        vec4 projectedPosition = projectionMatrix * viewPosition; 

        gl_Position = projectedPosition; 
        
        // 加大深度（Z轴）对粒子大小的衰减影响
        // 原本是 300.0 / -viewPosition.z，现在增加一个更陡峭的衰减曲线
        float sizeAttenuation = 300.0 / pow(-viewPosition.z, 1.5);
        
        // 大小保持整数感，并确保哪怕很小也能至少有 1px 的感觉，或者允许变成极其微弱的点
        gl_PointSize = max(1.0, floor(aSize * sizeAttenuation)); 
      } 
    `, 
    fragmentShader: ` 
      varying vec3 vColor;
      varying float vAlpha;

      void main() { 
        // 像素风：硬边方块，取消距离 discard
        vec2 uv = gl_PointCoord; 
        float border = step(0.08, uv.x) * step(0.08, uv.y) 
                     * step(uv.x, 0.92) * step(uv.y, 0.92); 
        
        gl_FragColor = vec4(vColor, vAlpha * border); 
      } 
    `, 
  }); 

  const particles = new THREE.Points(geometry, material); 
  scene.add(particles); 

  setupScroll(material, particles); 
  animate(particles); 
} 

// 4. 绑定滚动动画
function setupScroll(material, particles) { 
  gsap.to(material.uniforms.uProgress, { 
    value: 1, 
    ease: "none", 
    scrollTrigger: { 
      trigger: ".morph-section", 
      start: "top bottom", 
      end: "bottom top", 
      scrub: true, 
    }, 
  }); 

  gsap.to(particles.rotation, { 
    y: Math.PI * 0.5, 
    ease: "none", 
    scrollTrigger: { 
      trigger: ".morph-section", 
      start: "top bottom", 
      end: "bottom top", 
      scrub: true, 
    }, 
  }); 

  gsap.to(camera.position, { 
    z: 7, 
    ease: "none", 
    scrollTrigger: { 
      trigger: ".morph-section", 
      start: "top bottom", 
      end: "bottom top", 
      scrub: true, 
    }, 
  }); 
} 

// 5. 渲染循环
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
});

function animate(particles) { 
  const clock = new THREE.Clock(); 

  function tick() { 
    const elapsed = clock.getElapsedTime(); 
    // 人物成型后保持轻微呼吸感和滚动引发的旋转
    particles.rotation.y += 0.0008; 
    
    // 鼠标移动带来的视差效果 (平滑移动相机 X/Y 轴)
    targetX = mouseX * 0.002;
    targetY = mouseY * 0.002;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // 更新 shader 的时间变量，驱动星星闪烁和游荡
    particles.material.uniforms.uTime.value = elapsed;

    renderer.render(scene, camera); 
    requestAnimationFrame(tick); 
  } 
  tick(); 
} 

window.addEventListener("resize", () => { 
  const pixelRatio = window.innerWidth < 768 ? 0.45 : 0.35; 
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix(); 
  renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, false); 
});