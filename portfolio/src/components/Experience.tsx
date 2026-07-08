import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fallbackExperience, type ExperienceItem } from "../data/experience";
import { byteStarProjects } from "../data/byteStarProjects";
import ScrambledText from "./ScrambledText";
import PixelBlast from "./PixelBlast/PixelBlast";
import "./Experience.css";

const GOLD = "#E8B923";

gsap.registerPlugin(ScrollTrigger);

function getPreviewItems(honors: string[], responsibilities: string[]) {
  if (honors.length === 0) return responsibilities;

  const preview = honors.slice(0, 5);
  return honors.length > 5 ? [...preview, "..."] : preview;
}

type ExperienceProps = {
  experience?: ExperienceItem[];
};

export function Experience({ experience = fallbackExperience }: ExperienceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stickyOffset = 56;
  const [activeExperienceId, setActiveExperienceId] = useState<string | null>(null);
  const [showStarDetails, setShowStarDetails] = useState(false);
  const [openStarIndex, setOpenStarIndex] = useState<number | null>(null);
  const activeExperience =
    experience.find((item) => item.id === activeExperienceId) ?? null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      if (cardEls.length === 0) return;
      
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: `top top+=${stickyOffset}`,
          endTrigger: cardEls[cardEls.length - 1],
          end: `top top+=${stickyOffset}`,
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
            end: `top top+=${stickyOffset}`,
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [experience.length, stickyOffset]);

  useEffect(() => {
    if (!activeExperience) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveExperienceId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeExperience]);

  useEffect(() => {
    setShowStarDetails(false);
    setOpenStarIndex(null);
  }, [activeExperienceId]);

  return (
    <section id="experience" className="relative isolate min-h-[760px] w-full overflow-hidden bg-black py-32 font-pixel">
      <div
        className="absolute -inset-x-[18vw] -inset-y-24 z-0 min-h-[calc(100%+12rem)] opacity-52"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 14%, rgba(0,0,0,0.62) 30%, black 62%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 14%, rgba(0,0,0,0.62) 30%, black 62%)",
        }}
      >
        <PixelBlast
          variant="circle"
          className=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          antialias={false}
          pixelSize={6}
          color="#FFFFFF"
          patternScale={2.4}
          patternDensity={0.86}
          pixelSizeJitter={0.18}
          enableRipples={false}
          liquid={false}
          speed={0.35}
          edgeFade={0.12}
          autoPauseOffscreen={false}
          transparent
        />
      </div>
      <div className="experience-particle-field pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="experience-particle-burst experience-particle-burst--top-left" />
        <div className="experience-particle-burst experience-particle-burst--top-right" />
        <div className="experience-particle-burst experience-particle-burst--middle-left" />
        <div className="experience-particle-burst experience-particle-burst--middle-right" />
        <div className="experience-particle-burst experience-particle-burst--bottom" />
      </div>
      
      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        <ScrambledText as="h2" className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 text-center">
          经历与成长
        </ScrambledText>
        
        <div ref={ref} className="relative pb-[50vh]">
          {experience.map((exp, i) => {
            const previewItems = getPreviewItems(exp.honors, exp.responsibilities);
            const isAcademic = exp.id === "exp-hit-monitor";
            const accentColor = isAcademic ? "#9B5CFF" : "#325ab4"; // 哈工大紫 / 字节蓝
            const accentClass = isAcademic ? "text-[#9B5CFF]" : "text-[#325ab4]";
            const borderClass = isAcademic ? "border-[#9B5CFF]" : "border-[#325ab4]";
            const bgHoverClass = isAcademic ? "hover:bg-[#9B5CFF]" : "hover:bg-[#325ab4]";
            const LogoIcon = isAcademic ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M4 14l8 4 8-4M4 10l8 4 8-4M12 2L4 6l8 4 8-4-8-4z" />
              </svg>
            );

            return (
              <div
                key={exp.id + i}
                className="stack-card sticky w-full pt-0"
                data-sticky-offset={stickyOffset}
                style={{ zIndex: i, top: `${stickyOffset}px` }}
              >
                <div 
                  className={`group/card relative border-2 ${borderClass} bg-black/82 p-8 md:p-10 backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-2`}
                  style={{ boxShadow: `8px 8px 0px ${accentColor}` }}
                >
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between gap-4 border-b-2 border-white/20 pb-5 text-[10px] uppercase tracking-[0.22em] text-white/60">
                      <span>{String(i + 1).padStart(2, "0")} / RECORD</span>
                      <span className={accentClass}>{isAcademic ? "ACADEMIC MODE" : "AI SOLUTION MODE"}</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="relative">
                          <div className={`mb-4 flex items-center gap-4 font-display text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-[-0.04em] uppercase ${accentClass}`}>
                          {LogoIcon}
                            {exp.company}
                        </div>
                        <h3 className="text-sm md:text-base font-bold tracking-[0.1em] text-white/50 uppercase">
                            {exp.role}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="border-2 border-white/20 bg-black px-4 py-3 text-right text-brand-muted text-xs tracking-[0.18em] uppercase">
                          <div className="mb-1">{exp.date}</div>
                          <div className={accentClass}>{exp.location}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveExperienceId(exp.id)}
                          className={`flex h-12 w-12 items-center justify-center border-2 border-white/20 bg-black text-white transition-all duration-300 ${borderClass} ${bgHoverClass} hover:text-black hover:-translate-y-1 hover:translate-x-1`}
                          style={{ boxShadow: `4px 4px 0px ${accentColor}` }}
                          aria-label={`${exp.company} 详情`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                            <path d="M9 18l6-6-6-6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {!isAcademic && (
                      <div
                        className="flex items-center gap-3 border-2 bg-[#E8B923]/10 px-4 py-3"
                        style={{ borderColor: GOLD, boxShadow: `4px 4px 0px ${GOLD}` }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="shrink-0">
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.5 12.5 17 22l-5-3-5 3 1.5-9.5" />
                        </svg>
                        <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                          获得 2026 Q1 Lark Spot Bonus
                        </span>
                      </div>
                    )}

                    {previewItems.length > 0 && (
                      <div className="grid gap-4 pt-4 md:grid-cols-[170px_1fr] border-t-2 border-dashed border-white/20 mt-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-muted mt-4">
                          {exp.honors.length > 0 ? "个人荣誉" : "主要工作"}
                        </h4>
                        <ul className="grid gap-3 mt-4">
                          {previewItems.map((item, idx) => (
                            <li key={idx} className="group/item flex gap-3 text-white/80 leading-relaxed font-sans text-sm md:text-base">
                              <span className={`mt-2 h-2 w-2 shrink-0 ${isAcademic ? "bg-[#9B5CFF]" : "bg-[#325ab4]"}`} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {experience.length === 1 && (
            <div className="stack-card sticky w-full pt-0" data-sticky-offset={stickyOffset} style={{ zIndex: 1, top: `${stickyOffset}px` }}>
              <div className="border-2 border-white/20 bg-black/82 p-10 md:p-16 flex flex-col justify-center items-center text-center backdrop-blur-[1px] transition-transform hover:-translate-y-2" style={{ boxShadow: '8px 8px 0px rgba(255,255,255,0.2)' }}>
                <ScrambledText as="h3" className="font-display text-3xl font-bold text-white mb-4 uppercase">
                  下一个里程碑
                </ScrambledText>
                <ScrambledText as="p" className="text-brand-muted max-w-md font-sans">
                  始终保持学习的姿态，期待在未来的项目中创造更多价值。
                </ScrambledText>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeExperience && (
        <div
          className="fixed inset-0 z-[100000] flex items-start md:items-center justify-center bg-black/80 px-4 md:px-6 py-8 md:py-12 overflow-y-auto"
          onClick={() => setActiveExperienceId(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeExperience.company} 详情`}
        >
          <div
            className={`w-full max-w-4xl my-auto bg-black border-4 ${activeExperience.id === "exp-hit-monitor" ? "border-[#9B5CFF]" : "border-[#325ab4]"} p-8 md:p-12`}
            style={{ boxShadow: `12px 12px 0px ${activeExperience.id === "exp-hit-monitor" ? "#9B5CFF" : "#325ab4"}` }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b-4 border-white/20 pb-6">
              <div>
                <ScrambledText as="h3" className={`flex items-center gap-4 font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight ${activeExperience.id === "exp-hit-monitor" ? "text-[#9B5CFF]" : "text-[#325ab4]"}`}>
                  {activeExperience.id === "exp-hit-monitor" ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="shrink-0">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="shrink-0">
                      <path d="M4 14l8 4 8-4M4 10l8 4 8-4M12 2L4 6l8 4 8-4-8-4z" />
                    </svg>
                  )}
                  {activeExperience.company}
                </ScrambledText>
                <ScrambledText as="div" className="mt-4 text-sm md:text-base font-bold tracking-[0.1em] text-white/50 uppercase">
                  {activeExperience.role}
                </ScrambledText>
              </div>
              <button
                type="button"
                onClick={() => setActiveExperienceId(null)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-white/20 bg-black text-white transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 ${activeExperience.id === "exp-hit-monitor" ? "hover:bg-[#9B5CFF]" : "hover:bg-[#325ab4]"} hover:text-black`}
                style={{ boxShadow: `4px 4px 0px ${activeExperience.id === "exp-hit-monitor" ? "#9B5CFF" : "#325ab4"}` }}
                aria-label="关闭详情"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.18em] text-white/60">
              <ScrambledText as="span">{activeExperience.date} / {activeExperience.location}</ScrambledText>
            </div>

            <div className="mt-10 space-y-10 font-sans">
              {activeExperience.honors.length > 0 && (
                <div>
                  <ScrambledText as="h4" className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6 font-pixel">
                    个人荣誉
                  </ScrambledText>
                  <ul className="flex flex-col gap-4">
                    {activeExperience.honors.map((item, index) => (
                      <li key={index} className={`flex gap-4 text-white/90 leading-relaxed border-l-2 border-white/10 pl-4 transition-colors ${activeExperience.id === "exp-hit-monitor" ? "hover:border-[#9B5CFF]" : "hover:border-[#325ab4]"}`}>
                        <span className={`mt-1 font-bold ${activeExperience.id === "exp-hit-monitor" ? "text-[#9B5CFF]" : "text-[#325ab4]"}`}>{">"}</span>
                        <ScrambledText as="span">{item}</ScrambledText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeExperience.responsibilities.length > 0 && (
                <div>
                  <ScrambledText as="h4" className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6 font-pixel">
                    主要工作
                  </ScrambledText>
                  <ul className="flex flex-col gap-4">
                    {activeExperience.responsibilities.map((item, index) => (
                      <li key={index} className={`flex gap-4 text-white/90 leading-relaxed border-l-2 border-white/10 pl-4 transition-colors ${activeExperience.id === "exp-hit-monitor" ? "hover:border-[#9B5CFF]" : "hover:border-[#325ab4]"}`}>
                        <span className={`mt-1 font-bold ${activeExperience.id === "exp-hit-monitor" ? "text-[#9B5CFF]" : "text-[#325ab4]"}`}>{">"}</span>
                        <ScrambledText as="span">{item}</ScrambledText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeExperience.achievements.length > 0 && (() => {
                const isByte = activeExperience.id === "exp-1";
                const accent = activeExperience.id === "exp-hit-monitor" ? "#9B5CFF" : "#325ab4";
                return (
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <ScrambledText as="h4" className="text-xs font-bold uppercase tracking-widest text-brand-muted font-pixel">
                      {activeExperience.honors.length > 0 && activeExperience.responsibilities.length === 0 ? "竞赛/科研" : "代表成果"}
                    </ScrambledText>
                    {isByte && (
                      <button
                        type="button"
                        onClick={() => setShowStarDetails((prev) => !prev)}
                        className="flex shrink-0 items-center gap-2 border-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:text-black"
                        style={{ borderColor: accent, boxShadow: `3px 3px 0px ${accent}`, backgroundColor: showStarDetails ? accent : "transparent", color: showStarDetails ? "#000" : undefined }}
                        aria-expanded={showStarDetails}
                      >
                        {showStarDetails ? "收起详情" : "展示详情"}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" style={{ transform: showStarDetails ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isByte && showStarDetails ? (
                    <ul className="flex flex-col gap-3">
                      {byteStarProjects.map((project, index) => {
                        const isOpen = openStarIndex === index;
                        return (
                          <li key={index} className="border-2 border-white/15" style={isOpen ? { borderColor: accent } : undefined}>
                            <button
                              type="button"
                              onClick={() => setOpenStarIndex(isOpen ? null : index)}
                              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-white/5"
                              aria-expanded={isOpen}
                            >
                              <span className="flex items-center gap-3">
                                <span className="text-xs font-bold tabular-nums" style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</span>
                                <span className="text-sm md:text-base font-bold text-white">{project.title}</span>
                              </span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" className="shrink-0" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                            {isOpen && (
                              <dl className="flex flex-col gap-3 border-t-2 border-dashed border-white/15 px-4 py-4 text-sm leading-relaxed">
                                {[
                                  { k: "S", label: "情境 Situation", v: project.situation },
                                  { k: "T", label: "任务 Task", v: project.task },
                                  { k: "A", label: "行动 Action", v: project.action },
                                  { k: "R", label: "结果 Result", v: project.result },
                                ].map((seg) => (
                                  <div key={seg.k} className="grid grid-cols-[auto_1fr] gap-3">
                                    <dt className="flex h-6 w-6 items-center justify-center border text-[11px] font-bold" style={{ borderColor: accent, color: accent }}>{seg.k}</dt>
                                    <dd className="text-white/85">
                                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">{seg.label}</span>
                                      {seg.v}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {activeExperience.achievements.map((item, index) => (
                        <li key={index} className={`flex gap-4 text-white/90 leading-relaxed border-l-2 border-white/10 pl-4 transition-colors ${activeExperience.id === "exp-hit-monitor" ? "hover:border-[#9B5CFF]" : "hover:border-[#325ab4]"}`}>
                          <span className={`mt-1 font-bold ${activeExperience.id === "exp-hit-monitor" ? "text-[#9B5CFF]" : "text-[#325ab4]"}`}>{">"}</span>
                          <ScrambledText as="span">{item}</ScrambledText>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
