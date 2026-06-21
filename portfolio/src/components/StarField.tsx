import { useMemo } from 'react';

interface StarFieldProps {
  count?: number;
}

export function StarField({ count = 120 }: StarFieldProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const typeRand = Math.random();
      const y = Math.pow(Math.random(), 1.45) * 100;

      let type = 'small';
      if (typeRand > 0.94) type = 'large';
      else if (typeRand > 0.76) type = 'medium';

      return {
        id: i,
        x: Math.random() * 100,
        y,
        size:
          type === 'large'
            ? 2.2 + Math.random() * 1.8
            : type === 'medium'
            ? 1.4 + Math.random() * 1.1
            : 0.8 + Math.random() * 0.8,
        opacity:
          type === 'large'
            ? 0.7 + Math.random() * 0.25
            : 0.22 + Math.random() * 0.45,
        type
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${
            star.type === 'small'
              ? 'bg-white/90 shadow-[0_0_4px_rgba(255,255,255,0.2)]'
              : star.type === 'medium'
              ? 'bg-[#ebf2ff]/95 shadow-[0_0_7px_rgba(255,255,255,0.32),0_0_14px_rgba(120,170,255,0.12)]'
              : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.45),0_0_18px_rgba(155,195,255,0.18)]'
          }`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  );
}