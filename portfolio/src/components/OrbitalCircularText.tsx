import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import './OrbitalCircularText.css';

const DEG_TO_RAD = Math.PI / 180;

interface OrbitalCircularTextProps {
  text?: string;
  radius?: number;
  spinDuration?: number;
  introDuration?: number;
  wordStagger?: number;
  letterStagger?: number;
  onHover?: 'speedUp' | 'slowDown' | 'pause' | 'goBonkers' | 'none';
  className?: string;
  onIntroComplete?: () => void;
}

export default function OrbitalCircularText({
  text = '',
  radius = 150,
  spinDuration = 20,
  introDuration = 2.8,
  wordStagger = 0.16,
  letterStagger = 0.025,
  onHover = 'speedUp',
  className = '',
  onIntroComplete
}: OrbitalCircularTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const { width, height } = useViewportSize();
  const [settled, setSettled] = useState(false);

  const letters = useMemo(() => buildLetterData(text), [text]);

  const startRadius = useMemo(() => {
    if (!width || !height) return radius * 5.5;
    return Math.hypot(width, height) * 0.62;
  }, [width, height, radius]);

  const maxDelay = useMemo(() => {
    if (!letters.length) return 0;

    return Math.max(
      ...letters.map((item) => {
        return item.wordIndex * wordStagger + item.charInWord * letterStagger;
      })
    );
  }, [letters, wordStagger, letterStagger]);

  useEffect(() => {
    setSettled(false);

    if (prefersReducedMotion) {
      setSettled(true);
      onIntroComplete?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setSettled(true);
      onIntroComplete?.();
    }, (introDuration + maxDelay) * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [text, introDuration, maxDelay, prefersReducedMotion, onIntroComplete]);

  const hoverDuration = getHoverDuration(spinDuration, onHover);

  return (
    <div
      className={[
        'orbital-circular-text',
        settled ? 'is-settled' : '',
        className
      ].join(' ')}
      data-hover={onHover || 'none'}
      aria-label={text}
      style={{
        '--orbital-size': `${radius * 2 + 90}px`,
        '--spin-duration': `${spinDuration}s`,
        '--hover-spin-duration': `${hoverDuration}s`
      } as React.CSSProperties}
    >
      <div className="orbital-spin-layer">
        {letters.map((item, index) => {
          const totalLetters = letters.length;
          const wordCount = Math.max(...letters.map((l) => l.wordIndex)) + 1;
          const wordGap = 10;
          const availableAngle = 360 - wordCount * wordGap;
          const letterAngle = availableAngle / totalLetters;

          const previousItems = letters.slice(0, index);
          const previousWordGaps = previousItems.filter(
            (prev, prevIndex) => {
              const next = letters[prevIndex + 1];
              return next && next.wordIndex !== prev.wordIndex;
            }
          ).length;

          const finalAngle = -90 + index * letterAngle + previousWordGaps * wordGap;

          const path = createOrbitalPath({
            finalAngle,
            radius,
            startRadius,
            wordIndex: item.wordIndex,
            charInWord: item.charInWord
          });

          const delay =
            item.wordIndex * wordStagger + item.charInWord * letterStagger;

          if (prefersReducedMotion) {
            const finalPoint = polarToPoint(finalAngle, radius);

            return (
              <span
                key={`${item.char}-${index}`}
                className="orbital-letter"
                style={{
                  transform: `
                    translate3d(${finalPoint.x}px, ${finalPoint.y}px, 0)
                    rotate(${finalAngle + 90}deg)
                  `
                }}
                aria-hidden="true"
              >
                <span className="orbital-glyph font-pixel uppercase">
                  {item.char === ' ' ? '\u00A0' : item.char}
                </span>
              </span>
            );
          }

          return (
            <motion.span
              key={`${item.char}-${index}`}
              className="orbital-letter"
              initial={{
                x: path.x[0],
                y: path.y[0],
                rotate: path.rotate[0],
                opacity: 0,
                scale: 0.72,
                filter: 'blur(7px)'
              }}
              animate={{
                x: path.x,
                y: path.y,
                rotate: path.rotate,
                opacity: [0, 0.7, 1, 1, 1, 1, 1],
                scale: [0.68, 0.88, 1.08, 1.02, 0.98, 1.01, 1],
                filter: [
                  'blur(10px)',
                  'blur(6px)',
                  'blur(3px)',
                  'blur(1.5px)',
                  'blur(0.5px)',
                  'blur(0px)',
                  'blur(0px)'
                ]
              }}
              transition={{
                duration: introDuration,
                delay,
                times: [0, 0.18, 0.36, 0.55, 0.72, 0.88, 1],
                ease: [0.22, 1, 0.36, 1]
              }}
              aria-hidden="true"
            >
              <span className="orbital-glyph font-pixel uppercase">
                {item.char === ' ' ? '\u00A0' : item.char}
              </span>
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

function buildLetterData(text: string) {
  const words = text
    .replaceAll('*', ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const items: { char: string; wordIndex: number; charInWord: number; isLastInWord: boolean; }[] = [];

  words.forEach((word, wordIndex) => {
    Array.from(word).forEach((char, charInWord) => {
      items.push({
        char,
        wordIndex,
        charInWord,
        isLastInWord: charInWord === word.length - 1
      });
    });
  });

  return items;
}

function createOrbitalPath({
  finalAngle,
  radius,
  startRadius,
  wordIndex,
  charInWord
}: {
  finalAngle: number;
  radius: number;
  startRadius: number;
  wordIndex: number;
  charInWord: number;
}) {
  const entryAngle = -132 + wordIndex * 9 + charInWord * 0.35;

  const p0 = polarToPoint(entryAngle, startRadius + wordIndex * 42);
  const p1 = polarToPoint(entryAngle + 26, startRadius * 0.72);
  const p2 = polarToPoint(entryAngle + 68, startRadius * 0.42);
  const p3 = polarToPoint(finalAngle - 150, radius * 2.05);
  const p4 = polarToPoint(finalAngle - 92, radius * 1.48);
  const p5 = polarToPoint(finalAngle - 38, radius * 1.12);
  const p6 = polarToPoint(finalAngle, radius);

  const r0 = getVelocityRotation(p0, p1);
  const r1 = getVelocityRotation(p1, p2);
  const r2 = getVelocityRotation(p2, p3);
  const r3 = getVelocityRotation(p3, p4);
  const r4 = getVelocityRotation(p4, p5);
  const r5 = getVelocityRotation(p5, p6);
  const r6 = finalAngle + 90;

  return {
    x: [p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x],
    y: [p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y],
    rotate: [r0, r1, r2, r3, r4, r5, r6]
  };
}

function polarToPoint(angleDeg: number, distance: number) {
  const rad = angleDeg * DEG_TO_RAD;

  return {
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance
  };
}

function getVelocityRotation(from: {x: number, y: number}, to: {x: number, y: number}) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x) / DEG_TO_RAD;

  return angle + 90;
}

function getHoverDuration(spinDuration: number, onHover: string) {
  switch (onHover) {
    case 'slowDown':
      return spinDuration * 2;
    case 'speedUp':
      return spinDuration / 4;
    case 'goBonkers':
      return spinDuration / 12;
    case 'pause':
      return spinDuration;
    default:
      return spinDuration;
  }
}

function useViewportSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const update = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    update();

    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  return size;
}