import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projectLabels = [
  { text: "Campus Trade", top: "16%", left: "13%", mobileTop: "14%", mobileLeft: "10%", scale: 1.08, alpha: 0.9, depth: 34 },
  { text: "Data Analysis", top: "27%", left: "29%", mobileTop: "24%", mobileLeft: "45%", scale: 0.9, alpha: 0.7, depth: -28 },
  { text: "Study Companion", top: "12%", left: "54%", mobileTop: "38%", mobileLeft: "12%", scale: 0.82, alpha: 0.62, depth: -58 },
  { text: "Figma", top: "36%", left: "62%", mobileTop: "18%", mobileLeft: "66%", scale: 1.12, alpha: 0.92, depth: 44 },
  { text: "Python", top: "21%", left: "79%", mobileTop: "48%", mobileLeft: "60%", scale: 0.78, alpha: 0.56, depth: -70 },
  { text: "Tableau", top: "43%", left: "40%", mobileTop: "61%", mobileLeft: "20%", scale: 1, alpha: 0.8, depth: 18 },
  { text: "User Research", top: "48%", left: "70%", mobileTop: "67%", mobileLeft: "55%", scale: 0.86, alpha: 0.68, depth: -36 },
  { text: "Prototype", top: "31%", left: "8%", mobileTop: "36%", mobileLeft: "66%", scale: 0.74, alpha: 0.55, depth: -82 },
  { text: "AI Solution", top: "9%", left: "33%", mobileTop: "54%", mobileLeft: "8%", scale: 1.18, alpha: 0.95, depth: 60 },
];

const ambientStars = [
  { top: "7%", left: "8%", size: 1, opacity: 0.24 }, { top: "9%", left: "31%", size: 2, opacity: 0.5 },
  { top: "5%", left: "68%", size: 1, opacity: 0.2 }, { top: "12%", left: "74%", size: 1, opacity: 0.38 },
  { top: "16%", left: "81%", size: 2, opacity: 0.36 }, { top: "19%", left: "88%", size: 1, opacity: 0.22 },
  { top: "23%", left: "72%", size: 1, opacity: 0.18 }, { top: "26%", left: "84%", size: 1, opacity: 0.34 },
  { top: "29%", left: "6%", size: 1, opacity: 0.18 }, { top: "31%", left: "17%", size: 2, opacity: 0.42 },
  { top: "34%", left: "24%", size: 1, opacity: 0.2 }, { top: "36%", left: "75%", size: 1, opacity: 0.32 },
  { top: "39%", left: "82%", size: 2, opacity: 0.46 }, { top: "42%", left: "91%", size: 1, opacity: 0.2 },
  { top: "46%", left: "12%", size: 1, opacity: 0.28 }, { top: "48%", left: "19%", size: 1, opacity: 0.18 },
  { top: "52%", left: "54%", size: 2, opacity: 0.42 }, { top: "56%", left: "61%", size: 1, opacity: 0.22 },
  { top: "18%", left: "41%", size: 1, opacity: 0.16 }, { top: "14%", left: "47%", size: 1, opacity: 0.3 },
  { top: "25%", left: "51%", size: 2, opacity: 0.34 }, { top: "10%", left: "93%", size: 1, opacity: 0.24 },
  { top: "6%", left: "57%", size: 1, opacity: 0.18 }, { top: "44%", left: "35%", size: 1, opacity: 0.22 },
];

type LabelStyle = CSSProperties & {
  "--label-top-mobile": string;
  "--label-left-mobile": string;
  "--label-top-desktop": string;
  "--label-left-desktop": string;
  "--label-scale": number;
  "--label-alpha": number;
  "--label-depth": string;
};

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRefs = useRef<HTMLDivElement[]>([]);
  const starRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        labelRefs.current,
        {
          autoAlpha: 0,
          y: 22,
          filter: "blur(8px)",
          textShadow: "0 0 0 rgba(255,255,255,0)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          textShadow: "0 0 14px rgba(255,255,255,0.72), 0 0 34px rgba(255,255,255,0.25)",
          duration: 1.1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            end: "top 26%",
            scrub: 1,
          },
        }
      );

      labelRefs.current.forEach((label, index) => {
        gsap.to(label, {
          x: index % 2 === 0 ? 5 : -4,
          y: index % 3 === 0 ? 8 : -6,
          filter: index % 2 === 0 ? "blur(0.35px)" : "blur(0px)",
          duration: 3.8 + index * 0.23,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.11,
        });
      });

      starRefs.current.forEach((star, index) => {
        gsap.to(star, {
          opacity: index % 3 === 0 ? 0.65 : 0.16,
          scale: index % 4 === 0 ? 1.8 : 0.7,
          duration: 2.8 + index * 0.09,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-[120vh] overflow-hidden bg-transparent"
      aria-label="Projects visual field"
    >
      <style>{`
        @media (min-width: 768px) {
          #projects [data-project-label] {
            top: var(--label-top-desktop);
            left: var(--label-left-desktop);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.11),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.07),transparent_22%),linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.12)_58%,rgba(0,0,0,0.02))]" />

      <div className="pointer-events-none absolute left-6 top-8 z-10 hidden font-pixel text-[11px] tracking-[0.18em] text-white/70 drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] md:block">
        XUJIAMING / PROJECT FIELD
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[48vh] bg-[radial-gradient(ellipse_at_50%_92%,rgba(255,255,255,0.13),transparent_44%),linear-gradient(to_top,rgba(255,255,255,0.07),transparent_58%)] mix-blend-screen" />

      {ambientStars.map((star, index) => (
        <span
          key={`${star.top}-${star.left}`}
          ref={(el) => {
            if (el) starRefs.current[index] = el;
          }}
          className="pointer-events-none absolute z-[1] rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: "0 0 8px rgba(255,255,255,0.65), 0 0 18px rgba(255,255,255,0.24)",
          }}
        />
      ))}

      <div className="relative z-10 h-[88vh] min-h-[640px] [perspective:900px] [transform-style:preserve-3d]">
        {projectLabels.map((label, index) => (
          <div
            key={label.text}
            data-project-label={index}
            ref={(el) => {
              if (el) labelRefs.current[index] = el;
            }}
            className="absolute whitespace-nowrap font-pixel text-[15px] tracking-[0.03em] text-white/78 mix-blend-screen md:text-[17px]"
            style={{
              top: "var(--label-top-mobile)",
              left: "var(--label-left-mobile)",
              opacity: "var(--label-alpha)",
              transform: "translate3d(-50%, -50%, var(--label-depth)) scale(var(--label-scale))",
              "--label-top-mobile": label.mobileTop,
              "--label-left-mobile": label.mobileLeft,
              "--label-top-desktop": label.top,
              "--label-left-desktop": label.left,
              "--label-scale": label.scale,
              "--label-alpha": label.alpha,
              "--label-depth": `${label.depth}px`,
            } as LabelStyle}
          >
            <span
              className="hidden md:inline"
              style={{
                position: "absolute",
                inset: "-0.8rem -1.1rem",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0.045) 36%, transparent 66%)",
                filter: "blur(10px)",
              }}
            />
            <span className="relative">{label.text}</span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </section>
  );
}
