import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import "./ScrambledText.css";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: any;
}

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:",
  className = "",
  style = {},
  children,
  as: Component = "p",
}: ScrambledTextProps) => {
  const rootRef = useRef<any>(null);
  const charsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!rootRef.current) return;

    // Type definition for SplitText doesn't perfectly match, so we use any for now or ignore
    const split = new (SplitText as any)(rootRef.current, {
      type: "chars",
      charsClass: "char",
    });
    charsRef.current = split.chars;

    charsRef.current.forEach((c: HTMLElement) => {
      gsap.set(c, {
        display: "inline-block",
        attr: { "data-content": c.innerHTML },
      });
    });

    const handleMove = (e: PointerEvent) => {
      charsRef.current.forEach((c: HTMLElement) => {
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: c.dataset.content || "",
              chars: scrambleChars,
              speed,
            },
            ease: "none",
          });
        }
      });
    };

    const el = rootRef.current;
    el.addEventListener("pointermove", handleMove);

    return () => {
      el.removeEventListener("pointermove", handleMove);
      split.revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <Component ref={rootRef} className={`scrambled-text-block ${className}`} style={style}>
      {children}
    </Component>
  );
};

export default ScrambledText;
