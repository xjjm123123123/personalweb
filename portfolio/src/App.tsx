import { useEffect, useRef } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Experience } from "./components/Experience";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Beyond } from "./components/Beyond";
import { Contact } from "./components/Contact";
import { ThreePixelStarField } from "./components/ThreePixelStarField";
import { MountainStarField } from "./components/MountainStarField";
import Ribbons from "./components/Ribbons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const starFieldRef = useRef<HTMLDivElement>(null);
  const mountainFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const hero = document.querySelector('#hero');
      const projects = document.querySelector('#projects');
      const experience = document.querySelector('#experience');
      const skills = document.querySelector('#skills');

      if (hero && starFieldRef.current) {
        const lockStarFieldToDocument = () => {
          if (!starFieldRef.current) return;

          const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
          Object.assign(starFieldRef.current.style, {
            position: "absolute",
            top: `${heroBottom}px`,
            right: "0",
            bottom: "auto",
            left: "0",
            height: `${window.innerHeight}px`,
            opacity: "1",
          });
        };

        const unlockStarFieldToViewport = () => {
          if (!starFieldRef.current) return;

          Object.assign(starFieldRef.current.style, {
            position: "fixed",
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            height: "auto",
            opacity: "1",
          });
        };

        const syncStarFieldPosition = () => {
          const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
          if (window.scrollY >= heroBottom) {
            lockStarFieldToDocument();
          } else {
            unlockStarFieldToViewport();
          }
        };

        ScrollTrigger.create({
          trigger: hero,
          start: "bottom top",
          end: "max",
          onEnter: lockStarFieldToDocument,
          onLeaveBack: unlockStarFieldToViewport,
          onRefresh: syncStarFieldPosition,
        });
      }

      if (projects && experience && skills && mountainFieldRef.current) {
        ScrollTrigger.create({
          trigger: projects,
          start: "top 90%",
          endTrigger: skills,
          end: "top 30%",
          scrub: true,
          onUpdate: (self) => {
            if (mountainFieldRef.current) {
              mountainFieldRef.current.style.opacity = String(self.progress);
            }
          },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen selection:bg-brand-primary/30 selection:text-white overflow-x-hidden w-full max-w-full">
      <div ref={starFieldRef} className="fixed inset-0 z-[50] pointer-events-none">
        <ThreePixelStarField />
      </div>
      <div ref={mountainFieldRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0 }}>
        <MountainStarField />
      </div>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <Ribbons />
      </div>

      <Nav />

      <main className="relative z-10 overflow-x-hidden w-full max-w-full">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Beyond />
      </main>

      <Contact />
    </div>
  );
}

export default App;
