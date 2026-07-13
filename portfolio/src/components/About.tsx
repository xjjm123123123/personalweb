import { useRef } from "react";
import { Envelope, ArrowUpRight } from "@phosphor-icons/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { content } from "../data/content";
import { fallbackExperience, type ExperienceItem } from "../data/experience";
import Shuffle from "./Shuffle";

gsap.registerPlugin(ScrollTrigger);

function getPreviewItems(honors: string[], responsibilities: string[]) {
  if (honors.length === 0) return responsibilities;

  const preview = honors.slice(0, 5);
  return honors.length > 5 ? [...preview, "..."] : preview;
}

type AboutProps = {
  experience?: ExperienceItem[];
};

export function About({ experience = fallbackExperience }: AboutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !contentRef.current) return;

    // 1. Scrubbing Text Reveals & Fade Up
    const elements = gsap.utils.toArray('.reveal-item');
    gsap.fromTo(elements, 
      { y: 40, opacity: 0, filter: "blur(8px)" },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%", 
          end: "top 20%",
          scrub: 1,
        }
      }
    );
    
    // 2. Animated Horizontal Line Expansions
    const lines = gsap.utils.toArray('.divider-line');
    gsap.fromTo(lines,
      { scaleX: 0 },
      {
        scaleX: 1,
        stagger: 0.15,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 55%",
          end: "top 15%",
          scrub: 1,
        }
      }
    );
  }, { scope: containerRef });

  return (
    // 保留 about 模块的 id 和高度，用于触发星空的滚动动画，左侧为高定排版
    <section 
      id="about" 
      ref={containerRef}
      className="min-h-[112vh] md:min-h-[118vh] w-full relative z-10 pointer-events-auto"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-start px-6 md:px-16 lg:px-24 pointer-events-auto overflow-hidden">
        {/* Left side content panel - Editorial Split Layout */}
        <div 
          ref={contentRef}
          className="w-full max-w-2xl flex flex-col justify-center text-brand-text pointer-events-auto h-full py-20"
        >
          
          {/* Header Area */}
          <div className="reveal-item mb-4">
            <Shuffle
              text="XuJiaming"
              className="relative z-10 mb-2 pb-1 text-3xl font-bold tracking-widest font-pixel uppercase leading-[1.08] md:text-5xl"
              style={{ visibility: "visible" }}
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={2}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              triggerOnce={false}
              triggerOnHover={true}
              respectReducedMotion={true}
              scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*"
              tag="h2"
              textAlign="left"
            />
            <div className="text-base md:text-lg text-brand-text/60 font-light max-w-xl leading-relaxed mt-2 whitespace-pre-line">
              {content.about.core}
            </div>
          </div>

          <div className="divider-line h-px bg-white/10 mb-5 w-full origin-left"></div>
          
          <div className="flex flex-col gap-6">
            
            {/* Education */}
            <div className="reveal-item group">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[9px] font-pixel tracking-widest text-brand-primary/80 uppercase">Academic</span>
                <div className="divider-line h-px flex-1 bg-white/10 origin-left group-hover:bg-brand-primary/30 transition-colors duration-500"></div>
              </div>
              <div className="space-y-4">
                {/* SJTU */}
                <div className="group/edu flex flex-col justify-center cursor-default relative py-1">
                  {/* Highlight bar behind */}
                  <div className="absolute -inset-x-3 -inset-y-1 z-0 bg-brand-primary/5 opacity-0 group-hover/edu:opacity-100 transition-opacity duration-500 rounded-md pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 transition-transform duration-500 ease-out group-hover/edu:translate-x-1.5 relative z-10">
                    <div>
                      {/* Content (School / Company) */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg md:text-xl font-display font-medium text-brand-primary group-hover/edu:text-brand-highlight transition-colors">
                          上海交通大学
                        </h3>
                        <span className="text-[9px] font-pixel bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-[2px] tracking-widest border border-brand-primary/20 leading-none">CURRENT</span>
                      </div>
                      {/* Sub Content */}
                      <div className="text-brand-secondary font-sans text-xs mb-0.5 opacity-90 group-hover/edu:opacity-100 transition-opacity">
                        设计学 (信息交互) / 硕士研究生
                      </div>
                      <div className="text-brand-text/50 font-sans text-[10px] max-w-sm opacity-70 group-hover/edu:opacity-100 transition-opacity leading-tight">
                          主修课程：交互设计研究、设计计算、用户研究、人因工学与应用研究
                        </div>
                    </div>
                    <div className="text-[9px] font-pixel tracking-widest text-brand-muted/70 group-hover/edu:text-brand-muted transition-colors mt-1 md:mt-0">2026 — 2029</div>
                  </div>
                </div>

                {/* HIT */}
                <div className="group/edu flex flex-col justify-center cursor-default relative py-1">
                  <div className="absolute -inset-x-3 -inset-y-1 z-0 bg-white/5 opacity-0 group-hover/edu:opacity-100 transition-opacity duration-500 rounded-md pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 transition-transform duration-500 ease-out group-hover/edu:translate-x-1.5 relative z-10">
                    <div>
                      {/* Content (School / Company) */}
                      <h3 className="text-base md:text-lg font-display font-medium text-brand-text/70 group-hover/edu:text-brand-text transition-colors mb-1">
                        哈尔滨工业大学
                      </h3>
                      {/* Sub Content */}
                      <div className="text-brand-secondary font-sans text-[11px] mb-0.5 opacity-60 group-hover/edu:opacity-90 transition-opacity">
                        数字媒体艺术 / 本科
                      </div>
                      <div className="text-brand-text/50 font-sans text-[10px] max-w-sm opacity-50 group-hover/edu:opacity-80 transition-opacity leading-tight">
                          主修课程：交互设计、网站与网络程序基础、移动应用开发、数字仿真工程
                        </div>
                    </div>
                    <div className="text-[9px] font-pixel tracking-widest text-brand-muted/40 group-hover/edu:text-brand-muted/70 transition-colors mt-1 md:mt-0">2022 — 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="reveal-item group/section">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[9px] font-pixel tracking-widest text-brand-primary/80 uppercase">Professional</span>
                <div className="divider-line h-px flex-1 bg-white/10 origin-left group-hover/section:bg-brand-primary/30 transition-colors duration-500"></div>
              </div>
              <div className="flex flex-col gap-3">
                {experience.filter((exp) => exp.id !== "exp-hit-monitor").map((exp) => (
                  <div key={exp.id} className="group/item relative transition-transform duration-500 ease-out hover:translate-x-1.5 py-1">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 mb-1.5">
                      <div>
                        {/* Content (School / Company) */}
                        <h3 className="text-lg md:text-xl font-display font-medium text-brand-text group-hover/item:text-brand-highlight transition-colors mb-1">
                          {exp.company}
                        </h3>
                        {/* Sub Content */}
                        <div className="text-brand-secondary font-sans text-xs opacity-90 group-hover/item:opacity-100 transition-opacity">
                          {exp.role}
                        </div>
                      </div>
                      <div className="text-[9px] font-pixel tracking-widest text-brand-muted mt-1 md:mt-0">{exp.date}</div>
                    </div>
                      <ul className="flex flex-col gap-1">
                        {getPreviewItems(exp.honors, exp.responsibilities).map((item, i) => (
                          <li key={i} className="text-brand-text/60 text-[11px] leading-snug flex gap-2 items-start">
                            <span className="text-brand-primary/50 mt-[4px] text-[6px]">■</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Contact Action */}
          <div className="reveal-item mt-6 pt-5 border-t border-white/5">
            <a 
              href={`mailto:${content.contact.email}`} 
              className="group flex items-center gap-5 w-fit"
            >
              <div className="w-14 h-14 rounded-full bg-brand-card border border-white/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-500 ease-out group-hover:scale-110">
                <Envelope size={24} className="text-brand-text group-hover:text-brand-bg transition-colors" />
              </div>
              <div>
                <div className="text-xs font-pixel tracking-widest text-brand-muted mb-1 uppercase">Get in touch</div>
                <div className="text-xl font-display text-brand-text group-hover:text-brand-primary transition-colors flex items-center gap-2">
                  {content.contact.email}
                  <ArrowUpRight size={20} className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out" />
                </div>
              </div>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
