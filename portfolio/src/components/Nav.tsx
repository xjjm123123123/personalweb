import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <>
      <div 
        className={`fixed top-0 left-0 right-0 h-48 z-40 pointer-events-none bg-gradient-to-b from-black/90 via-black/30 to-transparent transition-opacity duration-700 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center justify-center py-8 w-full">
          <nav className="hidden md:flex items-center gap-24">
            <a href="#about" className="font-display text-[11px] font-black uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">ABOUT</a>
            <a href="#projects" className="font-display text-[11px] font-black uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">PROJECTS</a>
            <a href="#experience" className="font-display text-[11px] font-black uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">EXPERIENCE</a>
            <a href="#contact" className="font-display text-[11px] font-black uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">CONTACT</a>
          </nav>
          <button className="md:hidden text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </motion.header>
    </>
  );
}
