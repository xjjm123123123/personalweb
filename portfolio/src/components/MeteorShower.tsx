import { useEffect, useRef } from 'react';

interface Meteor {
  x: number;
  y: number;
  length: number;
  baseSpeed: number;
  cycleDuration: number;
  phase: number;
  opacity: number;
  active: boolean;
  color: string;
  thickness: number;
}

export function MeteorShower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);

    const meteors: Meteor[] = [];
    const maxMeteors = 6; // 稍微增加流星密度，但按照要求减少2/3（原来18，现在6）
    // 颜色包含纯白、淡金黄（呼应万花筒）、淡蓝
    const colors = ['255, 255, 255', '255, 220, 100', '200, 230, 255'];

    const createMeteor = (isInitial = false): Meteor => {
      return {
        // 如果是初始化，允许在全屏随机分布；否则在屏幕右上方生成
        x: isInitial ? Math.random() * width : Math.random() * width * 1.5,
        y: isInitial ? Math.random() * height : Math.random() * -height * 0.5,
        length: Math.random() * 100 + 60, // 稍微加长
        baseSpeed: Math.random() * 12 + 8,   // 基础速度提升，整体变快
        cycleDuration: Math.random() * 2 + 3, // 3-5秒的周期
        phase: Math.random() * 5, // 初始相位错开
        opacity: Math.random() * 0.5 + 0.4, // 提高透明度，更明显
        active: true,
        color: colors[Math.floor(Math.random() * colors.length)],
        thickness: Math.random() * 2.0 + 1.0 // 稍微加粗，更明显
      };
    };

    for (let i = 0; i < maxMeteors; i++) {
      meteors.push(createMeteor(true));
    }

    let animationFrameId: number;
    let startTime = Date.now();

    const draw = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      meteors.forEach((meteor, index) => {
        if (!meteor.active) {
          // 随机重生，错开流星的下落节奏。因为数量少了，稍微降低一下重生的概率让其更稀有
          if (Math.random() > 0.995) {
            meteors[index] = createMeteor();
          }
          return;
        }

        const headX = meteor.x;
        const headY = meteor.y;

        // 像素块大小（为了明显的像素风）
        const pixelSize = 4;

        // 将头部坐标对齐到像素网格，保证方块在移动时具有复古的跳跃感
        const gridX = Math.round(headX / pixelSize) * pixelSize;
        const gridY = Math.round(headY / pixelSize) * pixelSize;

        // 流星长度转化为像素块的数量
        const numBlocks = Math.floor(meteor.length / pixelSize);

        // 去掉原生阴影，使用纯粹的矩形填充来呈现像素画风格
        ctx.shadowBlur = 0;

        for (let j = 0; j < numBlocks; j++) {
          // 尾迹向右上方延伸（与移动方向左下方相反）
          const blockX = gridX + j * pixelSize;
          const blockY = gridY - j * pixelSize;

          // 越靠近尾部透明度越低，用平方让头部更亮、尾巴迅速变暗
          const blockOpacity = meteor.opacity * Math.pow(1 - j / numBlocks, 1.5);

          ctx.fillStyle = `rgba(${meteor.color}, ${blockOpacity})`;
          ctx.fillRect(blockX, blockY, pixelSize, pixelSize);
        }

        // 间隔3s-5s突然减速然后再加速
        const cyclePos = (elapsed + meteor.phase) % meteor.cycleDuration;
        let speedMult = 1.0;

        // 假设每次减速过程持续 1.2 秒
        if (cyclePos < 1.2) {
          // 使用正弦波构造一个平滑的深坑，最低点达到原来速度的 5%
          speedMult = 1.0 - 0.95 * Math.sin((cyclePos / 1.2) * Math.PI);
        }

        const currentSpeed = meteor.baseSpeed * speedMult;

        // 沿45度角向下和向左移动
        meteor.x -= currentSpeed * 0.707;
        meteor.y += currentSpeed * 0.707;

        // 如果飞出屏幕左侧或下侧，则标记为不活跃
        if (meteor.x < -meteor.length || meteor.y > height + meteor.length) {
          meteor.active = false;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
    />
  );
}