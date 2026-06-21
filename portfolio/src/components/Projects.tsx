import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@phosphor-icons/react";
import { content } from "../data/content";

gsap.registerPlugin(ScrollTrigger);

export function Projects() {
  const { projects } = content;
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // If we are on mobile, don't do horizontal hijack, let it stack
      const isMobile = window.innerWidth < 1024;
      if (isMobile || !wrapRef.current || !trackRef.current) return;

      const distance = trackRef.current.scrollWidth - window.innerWidth;
      
      gsap.to(trackRef.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={wrapRef} className="relative overflow-hidden bg-[#0a0f1c]">
      <div 
        ref={trackRef} 
        className="flex flex-col lg:flex-row lg:h-[100dvh] items-center px-6 lg:px-24 py-24 lg:py-0 gap-12 lg:gap-32 w-full lg:w-max"
      >
        <div className="lg:w-[400px] shrink-0">
          <h2 className="font-display text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            精选<br className="hidden lg:block"/>项目
          </h2>
          <p className="text-brand-muted text-lg max-w-sm">
            基于真实场景与用户需求，探索产品与设计的边界。
          </p>
        </div>

        {projects.map((project) => (
          <div
            key={project.id}
            className="group flex flex-col rounded-[2rem] bg-brand-card border border-white/5 overflow-hidden transition-colors hover:border-brand-primary/50 shrink-0 w-full max-w-[500px] lg:w-[600px] lg:max-w-none"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-brand-bg relative">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 mix-blend-luminosity"
              />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-1">
              <h3 className="font-display text-3xl font-bold text-white mb-4">
                {project.title}
              </h3>
              <p className="text-brand-text mb-8 text-lg">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {project.tools.map(tool => (
                  <span key={tool} className="text-xs font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 rounded-full px-3 py-1.5">
                    {tool}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                <a
                  href={project.link}
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:text-brand-highlight"
                >
                  查看详情
                  <ArrowUpRight weight="bold" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
