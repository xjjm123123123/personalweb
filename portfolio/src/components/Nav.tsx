import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
      if (latest < 100) {
        setActiveSection("");
      }
    });
  }, [scrollY]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { id: "about", label: "ABOUT" },
    { id: "projects", label: "PROJECTS" },
    { id: "experience", label: "EXPERIENCE" },
    { id: "contact", label: "CONTACT" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Update URL hash without jumping
      window.history.pushState(null, "", `#${id}`);
    }
  };

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
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              // 在 Landing page 顶部时（!scrolled），所有文字变暗 (text-white/30)
              // 滚动后，当前模块高亮 (text-white + 放大 + 发光)，其他模块半暗 (text-white/50)
              const textClass = !scrolled
                ? "text-white/30"
                : isActive
                  ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-110"
                  : "text-white/50";

              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`inline-block font-display text-[11px] font-black uppercase tracking-[0.25em] hover:text-white transition-all duration-500 ${textClass}`}
                >
                  {link.label}
                </a>
              );
            })}
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
