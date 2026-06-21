import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { content } from "../data/content";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const { core, cards } = content.about;
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scrubbing text reveal for the core statement
      if (titleRef.current) {
        const words = titleRef.current.innerText.split("");
        titleRef.current.innerHTML = "";
        words.forEach((char) => {
          const span = document.createElement("span");
          span.innerText = char;
          span.style.opacity = "0.2";
          titleRef.current?.appendChild(span);
        });

        gsap.to(titleRef.current.children, {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            end: "bottom 40%",
            scrub: true,
          },
        });
      }

      // Fade up the bento cards
      gsap.fromTo(
        ".bento-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 75%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={containerRef} className="py-32 md:py-48 w-full bg-brand-bg relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          ref={titleRef}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-24 max-w-4xl leading-tight"
        >
          {core}
        </h2>

        {/* Gapless Bento Grid */}
        <div className="bento-grid grid grid-cols-1 md:grid-cols-3 grid-flow-dense gap-6 auto-rows-[220px]">
          {cards.map((card, i) => {
            // Mathematical interlocking (3x3 grid total area = 9)
            // i=0: 2x2 (area 4)
            // i=1: 1x1 (area 1)
            // i=2: 1x2 (area 2)
            // i=3: 2x1 (area 2)
            let spanClass = "";
            let bgClass = "bg-brand-card";
            if (i === 0) {
              spanClass = "md:col-span-2 md:row-span-2";
              bgClass = "bg-brand-card/80";
            } else if (i === 1) {
              spanClass = "md:col-span-1 md:row-span-1";
              bgClass = "bg-brand-primary/20";
            } else if (i === 2) {
              spanClass = "md:col-span-1 md:row-span-2";
            } else if (i === 3) {
              spanClass = "md:col-span-2 md:row-span-1";
              bgClass = "bg-white/5";
            }
            
            return (
              <div
                key={card.title}
                className={`bento-card group relative overflow-hidden rounded-[2rem] border border-white/10 p-8 flex flex-col justify-end transition-transform duration-700 ease-out hover:scale-[1.02] hover:border-brand-primary/50 cursor-default ${spanClass} ${bgClass}`}
              >
                {/* Image background for card 0 */}
                {i === 0 && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: "url('https://picsum.photos/seed/bento-1/800/800')" }}
                  />
                )}
                {/* Abstract gradient for others */}
                {i !== 0 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/0 to-brand-primary/0 transition-colors duration-700 group-hover:from-brand-primary/10 group-hover:to-transparent pointer-events-none" />
                )}
                
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">
                    {card.title}
                  </h3>
                  <p className="font-display text-2xl md:text-3xl font-bold text-white leading-snug">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
