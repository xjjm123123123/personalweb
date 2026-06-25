import { useRef, useState, useLayoutEffect } from "react";
import { KaleidoscopeBackground } from "./KaleidoscopeBackground";
import OrbitalCircularText from "./OrbitalCircularText";
import { ThreePixelStarField } from "./ThreePixelStarField";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const meteorRef = useRef<HTMLDivElement>(null);
  const trailPathRef = useRef<SVGPathElement>(null);
  const trailPointsRef = useRef<{ x: number; y: number }[]>([]);
  const [, setEntered] = useState(false);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setEntered(true);
      return;
    }

    let rafId: number;
    let startTime: number | null = null;
    let hasEntered = false;

    const captureDuration = 3400;
    const orbitSpeed = 1.35;

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function easeInOutCubic(t: number) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function createSmoothTrailPath(points: { x: number; y: number }[]) {
      if (points.length < 2) return "";

      let d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length - 1; i += 1) {
        const current = points[i];
        const next = points[i + 1];

        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;

        d += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
      }

      const last = points[points.length - 1];
      d += ` T ${last.x} ${last.y}`;

      return d;
    }

    const animate = (now: number) => {
      if (!startTime) startTime = now;

      const elapsed = now - startTime;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const cx = width / 2;
      const cy = height / 2;

      const textOrbitRadius = Math.min(width, height) * 0.22;
      const meteorOrbitRadius = textOrbitRadius + 48;

      const startX = -width * 0.22;
      const startY = height * 0.18;

      const dx = startX - cx;
      const dy = startY - cy;

      const initialRadius = Math.hypot(dx, dy);
      const initialAngle = Math.atan2(dy, dx);

      let meteorX;
      let meteorY;

      if (elapsed <= captureDuration) {
        const t = clamp(elapsed / captureDuration, 0, 1);

        const radius =
          meteorOrbitRadius + (initialRadius - meteorOrbitRadius) * (1 - easeOutCubic(t));

        const totalTurns = Math.PI * 2.7;
        const angle = initialAngle + totalTurns * easeInOutCubic(t);

        meteorX = cx + radius * Math.cos(angle);
        meteorY = cy + radius * Math.sin(angle);
      } else {
        if (!hasEntered) {
          hasEntered = true;
        }

        const orbitElapsed = (elapsed - captureDuration) / 1000;
        const angle = initialAngle + Math.PI * 2.7 + orbitElapsed * orbitSpeed;

        meteorX = cx + meteorOrbitRadius * Math.cos(angle);
        meteorY = cy + meteorOrbitRadius * Math.sin(angle);
      }

      const trailPoints = trailPointsRef.current;

      trailPoints.push({
        x: meteorX,
        y: meteorY
      });

      if (trailPoints.length > 22) {
        trailPoints.shift();
      }

      if (trailPathRef.current && trailPoints.length > 2) {
        trailPathRef.current.setAttribute(
          "d",
          createSmoothTrailPath(trailPoints)
        );
      }

      const meteor = meteorRef.current;

      if (meteor) {
        meteor.style.transform = `
          translate3d(${meteorX}px, ${meteorY}px, 0)
          translate(-50%, -50%)
        `;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.08), transparent 16%),
          radial-gradient(circle at 78% 76%, rgba(120, 80, 255, 0.1), transparent 24%)
        `
      }}
    >
      <KaleidoscopeBackground />

      {/* 3D Pixel Star Field - Fixed background */}
      <ThreePixelStarField />

      <div className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
        {/* Orbital Circular Stage */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4]">
          <OrbitalCircularText
            text="WELCOME TO MY GALAXY"
            radius={280}
            spinDuration={36}
            introDuration={3.4}
            wordStagger={0.18}
            letterStagger={0.012}
            onHover="none"
            onIntroComplete={() => setEntered(true)}
          />
        </div>

        {/* Meteor Trail SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[1]"
        >
          <path
            ref={trailPathRef}
            fill="none"
            stroke="rgba(155, 205, 255, 0.32)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "blur(6px)",
              opacity: 0.42
            }}
          />
        </svg>

        {/* Meteor */}
        <div
          ref={meteorRef}
          className="absolute left-0 top-0 w-[15px] h-[15px] pointer-events-none z-[2]"
          style={{
            opacity: 0.72,
            transform: "translate3d(-9999px, -9999px, 0)",
            willChange: "transform",
            mixBlendMode: "screen"
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(
                circle,
                rgba(255, 255, 255, 0.88) 0%,
                rgba(185, 225, 255, 0.58) 34%,
                rgba(90, 150, 255, 0.22) 66%,
                transparent 100%
              )`,
              filter: "blur(1.4px)",
              boxShadow: "0 0 18px rgba(150, 205, 255, 0.5), 0 0 58px rgba(80, 120, 255, 0.26)"
            }}
          />
        </div>
      </div>
    </section>
  );
}
