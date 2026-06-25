import { useEffect, useRef } from "react";
import { MeteorShower } from "./MeteorShower";

const IMAGE_PATHS = [
  "/image/small-center-sun-dark-edge-galaxy-kaleidoscope-seed-v6.png"
];

export function KaleidoscopeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const state = {
      image: null as HTMLImageElement | null,
      width: 0,
      height: 0,
      dpr: 1,
      time: 0,
      mouseX: 0,
      mouseY: 0,
      targetMouseX: 0,
      targetMouseY: 0,
      scrollY: 0,
      targetScrollY: 0,
      animationId: 0
    };

    function resize() {
      // 进一步调大像素尺寸，让像素块更加明显。从 8 改为 14
      const PIXEL_SIZE = 14;
      state.dpr = (window.devicePixelRatio || 1) / PIXEL_SIZE;
      state.width = Math.floor(window.innerWidth * state.dpr);
      state.height = Math.floor(window.innerHeight * state.dpr);
      canvas!.width = state.width;
      canvas!.height = state.height;

      // 关键：强制关闭 Canvas 内部的抗锯齿和平滑处理，呈现硬边缘像素
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        // @ts-expect-error - vendor prefixes
        ctx.webkitImageSmoothingEnabled = false;
        // @ts-expect-error - vendor prefixes
        ctx.mozImageSmoothingEnabled = false;
        // @ts-expect-error - vendor prefixes
        ctx.msImageSmoothingEnabled = false;
      }
    }

    function tryLoad(path: string): Promise<{ image: HTMLImageElement; path: string }> {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ image, path });
        image.onerror = reject;
        image.src = `${path}?v=${Date.now()}`;
      });
    }

    async function loadFirstImage() {
      for (const path of IMAGE_PATHS) {
        try {
          return await tryLoad(path);
        } catch {
          // Continue trying
        }
      }
      return null;
    }

    function drawFallback() {
      const { width, height } = state;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.hypot(width, height);

      ctx!.fillStyle = "#050506";
      ctx!.fillRect(0, 0, width, height);
      ctx!.save();
      ctx!.translate(cx, cy);

      for (let i = 0; i < 36; i += 1) {
        const hue = (i * 23 + state.time * 30) % 360;
        ctx!.rotate((Math.PI * 2) / 36);
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.arc(0, 0, radius * 0.46, -0.045, 0.045);
        ctx!.closePath();
        ctx!.fillStyle = `hsla(${hue}, 78%, 58%, 0.26)`;
        ctx!.fill();
      }

      ctx!.restore();
    }

    function drawKaleidoscope() {
      if (!state.image) {
        drawFallback();
        return;
      }

      // 确保在每次绘制时都关闭平滑，防止被状态重置
      ctx!.imageSmoothingEnabled = false;

      const { image, width, height } = state;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.hypot(width, height);
      const segments = 24;
      const wedge = (Math.PI * 2) / segments;
      const organicPhase =
        state.time * 0.055 +
        Math.sin(state.time * 0.31) * 0.22 +
        Math.sin(state.time * 0.73 + 1.7) * 0.075;
      const mouseBreath = 0.7 + Math.sin(state.time * 0.43 + 0.9) * 0.22 + Math.sin(state.time * 0.17) * 0.08;

      // 增加由页面滚动驱动的旋转。0.0015 是旋转速度系数，您可以调整它来控制滚动时旋转的快慢
      const scrollRotation = state.scrollY * 0.0015;
      const rotation = organicPhase + Math.sin(state.time * 0.52) * 0.08 + scrollRotation;

      // 调整基础的放大倍率，并增大脉冲幅度使呼吸效果更明显。将基础缩放调小
      const pulse = 1 + Math.sin(state.time * 0.37) * 0.06 + Math.sin(state.time * 0.91 + 1.2) * 0.03;
      const baseScale = Math.max(width / image.width, height / image.height);
      const scale = baseScale * 0.8 * pulse; // 从 1.1 改为 0.8，让万花筒进一步变小
      const driftX =
        (Math.sin(state.time * 0.19) + Math.sin(state.time * 0.61 + 2.4) * 0.45) * width * 0.038 +
        state.mouseX * width * 0.06 * mouseBreath;
      const driftY =
        (Math.cos(state.time * 0.23) + Math.sin(state.time * 0.47 + 0.8) * 0.5) * height * 0.038 +
        state.mouseY * height * 0.06 * (1.05 - mouseBreath * 0.32);

      ctx!.fillStyle = "#050506";
      ctx!.fillRect(0, 0, width, height);

      for (let i = 0; i < segments; i += 1) {
        ctx!.save();
        ctx!.translate(cx, cy);
        ctx!.rotate(i * wedge + rotation);

        const overlap = 0.02; // Add a small overlap to remove black lines
        ctx!.beginPath();
        ctx!.moveTo(-2, 0); // 稍微向中心点后方延伸，填补中心因为像素裁剪导致的黑点漏洞
        ctx!.lineTo(radius * Math.cos(-wedge / 2 - overlap), radius * Math.sin(-wedge / 2 - overlap));
        ctx!.arc(0, 0, radius, -wedge / 2 - overlap, wedge / 2 + overlap);
        ctx!.closePath();
        ctx!.clip();

        if (i % 2) {
          ctx!.scale(1, -1);
        }

        ctx!.rotate(-rotation * 0.55 + Math.sin(state.time * 0.15 + Math.sin(state.time * 0.29)) * 0.12);
        ctx!.translate(driftX, driftY);
        ctx!.scale(scale, scale);
        ctx!.drawImage(image, -image.width / 2, -image.height / 2);
        ctx!.restore();
      }

      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      const glow = ctx!.createRadialGradient(cx, cy, radius * 0.04, cx, cy, radius * 0.52);
      glow.addColorStop(0, "rgba(255,255,255,0.20)");
      glow.addColorStop(0.42, "rgba(255,255,255,0.05)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, width, height);
      ctx!.restore();

      ctx!.save();
      ctx!.globalCompositeOperation = "multiply";
      // 增加暗角（Vignette）的覆盖范围和不透明度
      const vignette = ctx!.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius * 0.65);
      vignette.addColorStop(0, "rgba(255,255,255,1)");
      vignette.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, width, height);
      ctx!.restore();
    }

    function animate(now: number) {
      state.time = now / 1000;
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.035;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.035;

      // 使用平滑插值 (Lerp) 更新滚动值，使滚动产生的旋转像有了物理惯性一样丝滑
      state.targetScrollY = window.scrollY;
      state.scrollY += (state.targetScrollY - state.scrollY) * 0.05;

      // 实时计算当前的万花筒缩放比例，并将其暴露给 CSS 变量，供文字轨道同步大小
      const imgW = state.image ? state.image.width : 1024;
      const imgH = state.image ? state.image.height : 1024;
      const visualBaseScale = Math.max(window.innerWidth / imgW, window.innerHeight / imgH);
      const pulse = 1 + Math.sin(state.time * 0.37) * 0.015 + Math.sin(state.time * 0.91 + 1.2) * 0.008;
      const visualScale = visualBaseScale * 0.8 * pulse; // 改为 0.8 保持一致
      document.documentElement.style.setProperty('--k-scale', visualScale.toFixed(4));

      drawKaleidoscope();
      state.animationId = requestAnimationFrame(animate);
    }

    const onPointerMove = (event: PointerEvent) => {
      state.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      state.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    resize();

    let isMounted = true;
    loadFirstImage().then((result) => {
      if (!isMounted) return;
      if (result) {
        state.image = result.image;
      }
      state.animationId = requestAnimationFrame(animate);
    });

    return () => {
      isMounted = false;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(state.animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <style>{`
        .k-leaf {
          position: absolute;
          width: var(--size);
          opacity: var(--opacity);
          filter: drop-shadow(0 13px 25px rgba(0, 0, 0, 0.42));
          pointer-events: none;
        }

        .k-leaf.back {
          filter: blur(0.2px) drop-shadow(0 16px 30px rgba(0, 0, 0, 0.48));
        }

        .k-leaf.front {
          z-index: 2;
          filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.5));
        }

        .k-leaf img {
          width: 100%;
          height: auto;
          display: block;
          transform-origin: 18% 52%;
          animation: k-leaf-sway var(--duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
        }

        .k-leaf.top {
          top: var(--edge);
          left: var(--pos);
          transform: translate(-50%, -26%);
        }

        .k-leaf.right {
          right: var(--edge);
          top: var(--pos);
          transform: translate(26%, -50%);
        }

        .k-leaf.bottom {
          bottom: var(--edge);
          left: var(--pos);
          transform: translate(-50%, 26%);
        }

        .k-leaf.left {
          left: var(--edge);
          top: var(--pos);
          transform: translate(-26%, -50%);
        }

        @keyframes k-leaf-sway {
          from {
            transform: rotate(calc(var(--rot) - 2.8deg)) scale(var(--scale));
          }

          to {
            transform: rotate(calc(var(--rot) + 3.6deg)) scale(calc(var(--scale) * 1.025));
          }
        }

        @media (max-width: 760px) {
          .k-leaf.top,
          .k-leaf.bottom {
            --edge: -13vw !important;
          }

          .k-leaf.left,
          .k-leaf.right {
            --edge: -18vw !important;
          }
        }
      `}</style>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block bg-[#050506]" style={{ imageRendering: 'pixelated' }} />

      {/* 流星雨层：放在背景画布之上，但在纹理和蒙版之下 */}
      <MeteorShower />

      {/* 像素化 Dither 纹理叠加（纯 CSS 实现，复古质感），同时调低透明度让底图更亮 */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-overlay opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 2 2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='rgba(255,255,255,0.15)'/%3E%3Crect x='1' y='1' width='1' height='1' fill='rgba(255,255,255,0.15)'/%3E%3Crect x='1' y='0' width='1' height='1' fill='rgba(0,0,0,0.15)'/%3E%3Crect x='0' y='1' width='1' height='1' fill='rgba(0,0,0,0.15)'/%3E%3C/svg%3E")`,
          backgroundSize: '6px 6px',
        }}
      />

      {/* 自定义径向遮罩：把中心保留，但周围和边缘的黑色显著加深 */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.75)_40%,rgba(0,0,0,0.95)_100%)]" />
    </div>
  );
}
