import {
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiUnity,
} from "react-icons/si";
import { DiDotnet } from "react-icons/di";
import { ClaudeCode, Codex } from "modelicons";
import LogoLoop, { type LogoItem } from "./LogoLoop";

const seamLogos: LogoItem[] = [
  { node: <SiGithub size={18} />, title: "GitHub", ariaLabel: "GitHub" },
  { node: <DiDotnet size={18} />, title: "C#", ariaLabel: "C sharp and dotnet" },
  { node: <SiJavascript size={18} />, title: "JS", ariaLabel: "JavaScript" },
  { node: <SiUnity size={18} />, title: "Unity", ariaLabel: "Unity" },
  { node: <Codex size={18} />, title: "Codex", ariaLabel: "Codex" },
  { node: <SiHtml5 size={18} />, title: "HTML", ariaLabel: "HTML" },
  { node: <ClaudeCode size={18} />, title: "Claude Code", ariaLabel: "Claude Code" },
];

export function AboutProjectSeam() {
  return (
    <section
      aria-label="About and Projects transition"
      className="relative z-20 -mt-[12vh] mb-[3vh] flex min-h-[8vh] items-center overflow-hidden md:-mt-[15vh] md:mb-[4vh] md:min-h-[10vh]"
    >
      <div className="w-full -translate-y-[16%] overflow-hidden py-0.5 md:-translate-y-[20%] md:py-1">
        <LogoLoop
          logos={seamLogos}
          speed={56}
          direction="left"
          logoHeight={28}
          gap={30}
          hoverSpeed={18}
          scaleOnHover
          ariaLabel="About and Projects transition loop"
          renderItem={(item, key) => {
            if (!("node" in item)) return null;

            return (
              <div
                key={key}
                className="flex items-center gap-3 px-5 py-2 text-white/82 transition-colors duration-300 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center text-[21px] text-brand-primary md:h-9 md:w-9 md:text-[24px]">
                  {item.node}
                </span>
                <span className="whitespace-nowrap font-pixel text-[12px] uppercase tracking-[0.22em] md:text-[14px]">
                  {item.title}
                </span>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
