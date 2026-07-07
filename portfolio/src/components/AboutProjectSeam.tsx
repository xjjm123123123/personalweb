import {
  Brain,
  Cpu,
  DeviceMobile,
  GameController,
  GlobeHemisphereWest,
  Robot,
} from "@phosphor-icons/react";
import LogoLoop, { type LogoItem } from "./LogoLoop";

const seamLogos: LogoItem[] = [
  { node: <Robot weight="duotone" />, title: "Agent Systems", ariaLabel: "Agent Systems" },
  { node: <Brain weight="duotone" />, title: "Interaction Design", ariaLabel: "Interaction Design" },
  { node: <Cpu weight="duotone" />, title: "Creative Coding", ariaLabel: "Creative Coding" },
  { node: <GameController weight="duotone" />, title: "Game Prototyping", ariaLabel: "Game Prototyping" },
  { node: <GlobeHemisphereWest weight="duotone" />, title: "Web Experiences", ariaLabel: "Web Experiences" },
  { node: <DeviceMobile weight="duotone" />, title: "Product Interfaces", ariaLabel: "Product Interfaces" },
];

export function AboutProjectSeam() {
  return (
    <section
      aria-label="About and Projects transition"
      className="relative z-20 -mt-[5vh] flex min-h-[18vh] items-start overflow-hidden pt-2 md:-mt-[7vh] md:min-h-[24vh] md:pt-4"
    >
      <div className="w-full overflow-hidden py-3 md:py-4">
        <LogoLoop
          logos={seamLogos}
          speed={56}
          direction="left"
          logoHeight={22}
          gap={26}
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
                <span className="flex h-7 w-7 items-center justify-center text-[17px] text-brand-primary md:h-8 md:w-8 md:text-[19px]">
                  {item.node}
                </span>
                <span className="whitespace-nowrap font-pixel text-[11px] uppercase tracking-[0.22em] md:text-[12px]">
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
