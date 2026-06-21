import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { content } from "../data/content";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const { experience } = content;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      if (cardEls.length === 0) return;
      
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top+=100", // pin slightly below nav
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top+=100",
          pin: true,
          pinSpacing: false,
        });
        
        gsap.to(card, {
          scale: 0.95,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top+=100",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [experience.length]);

  return (
    <section id="experience" className="py-32 w-full bg-brand-bg relative">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-24 text-center">
          经历与成长
        </h2>

        <div ref={ref} className="relative pb-[50vh]">
          {/* Mock multiple experiences by repeating if needed, just to show the stack effect */}
          {experience.map((exp, i) => (
            <div
              key={exp.id + i}
              className="stack-card sticky top-[100px] w-full pt-8"
              style={{ zIndex: i }}
            >
              <div className="rounded-[2rem] bg-[#0d121f] border border-white/10 p-10 md:p-16 flex flex-col gap-8 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8">
                  <div>
                    <h3 className="font-display text-3xl font-bold text-white mb-2">
                      {exp.company}
                    </h3>
                    <div className="text-xl text-brand-primary font-medium">
                      {exp.role}
                    </div>
                  </div>
                  <div className="text-right text-brand-muted text-sm font-medium tracking-widest uppercase">
                    <div>{exp.date}</div>
                    <div>{exp.location}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6">
                      主要工作
                    </h4>
                    <ul className="flex flex-col gap-4">
                      {exp.responsibilities.map((req, idx) => (
                        <li key={idx} className="flex gap-4 text-brand-text/90 leading-relaxed">
                          <span className="text-brand-primary mt-1 opacity-50">-</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6">
                      代表成果
                    </h4>
                    <ul className="flex flex-col gap-4">
                      {exp.achievements.map((ach, idx) => (
                        <li key={idx} className="flex gap-4 text-brand-text/90 leading-relaxed">
                          <span className="text-brand-primary mt-1 opacity-50">-</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add a dummy card to show stacking if there's only 1 real exp */}
          {experience.length === 1 && (
            <div className="stack-card sticky top-[100px] w-full pt-8" style={{ zIndex: 1 }}>
              <div className="rounded-[2rem] bg-[#0f1424] border border-white/10 p-10 md:p-16 flex flex-col justify-center items-center text-center shadow-2xl min-h-[400px]">
                <h3 className="font-display text-3xl font-bold text-white mb-4">
                  下一个里程碑
                </h3>
                <p className="text-brand-muted max-w-md">
                  始终保持学习的姿态，期待在未来的项目中创造更多价值。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
