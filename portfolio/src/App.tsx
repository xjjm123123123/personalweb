import { useEffect, useRef, useState } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { AboutProjectSeam } from "./components/AboutProjectSeam";
import { Experience } from "./components/Experience";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Beyond } from "./components/Beyond";
import { Contact } from "./components/Contact";
import { ProjectGallery } from "./components/ProjectGallery";
import { ThreePixelStarField } from "./components/ThreePixelStarField";
import PixelTrail from "./components/PixelTrail";
import { getArchiveProjectBySlug, projectArchiveByCategory, type ArchiveProject } from "./data/projectArchive";
import Ribbons from "./components/Ribbons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ArchiveRouteState = {
  category: ArchiveProject["category"] | null;
  projectSlug: string | null;
};

function isArchiveCategory(value: string | null): value is ArchiveProject["category"] {
  return typeof value === "string" && value in projectArchiveByCategory;
}

function parseArchiveRoute(): ArchiveRouteState {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path.startsWith("/projects/")) {
    const slug = decodeURIComponent(path.slice("/projects/".length));
    const project = getArchiveProjectBySlug(slug);

    if (project) {
      return {
        category: project.category,
        projectSlug: project.slug,
      };
    }
  }

  if (path === "/projects") {
    const category = new URLSearchParams(window.location.search).get("category");
    if (isArchiveCategory(category)) {
      return {
        category,
        projectSlug: null,
      };
    }
  }

  return {
    category: null,
    projectSlug: null,
  };
}

function buildCategoryRoute(category: ArchiveProject["category"]) {
  return `/projects?category=${encodeURIComponent(category)}`;
}

function buildProjectRoute(slug: string) {
  return `/projects/${encodeURIComponent(slug)}`;
}

function App() {
  const starFieldRef = useRef<HTMLDivElement>(null);
  const [archiveRoute, setArchiveRoute] = useState<ArchiveRouteState>(() => parseArchiveRoute());

  useEffect(() => {
    const aboutSection = document.querySelector("#about");
    const starField = starFieldRef.current;

    if (!aboutSection || !starField) return;

    let lockedToAbout = false;

    const unlockStarField = () => {
      lockedToAbout = false;
      Object.assign(starField.style, {
        position: "fixed",
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
        height: "100vh",
      });
    };

    const lockStarFieldToAbout = () => {
      lockedToAbout = true;
      const aboutTop = aboutSection.getBoundingClientRect().top + window.scrollY;

      Object.assign(starField.style, {
        position: "absolute",
        top: `${aboutTop}px`,
        right: "0",
        bottom: "auto",
        left: "0",
        height: "100vh",
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: aboutSection,
      start: "top top",
      onEnter: lockStarFieldToAbout,
      onEnterBack: lockStarFieldToAbout,
      onLeaveBack: unlockStarField,
      onRefresh: (self) => {
        if (window.scrollY >= self.start) {
          lockStarFieldToAbout();
          return;
        }

        unlockStarField();
      },
    });

    const handleResize = () => {
      if (lockedToAbout) {
        lockStarFieldToAbout();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      trigger.kill();
      unlockStarField();
    };
  }, []);

  useEffect(() => {
    const syncRouteFromLocation = () => {
      setArchiveRoute(parseArchiveRoute());
    };

    window.addEventListener("popstate", syncRouteFromLocation);
    return () => window.removeEventListener("popstate", syncRouteFromLocation);
  }, []);

  const updateArchiveRoute = (nextRoute: ArchiveRouteState, url: string) => {
    setArchiveRoute(nextRoute);
    window.history.pushState(null, "", url);
  };

  const handleCategorySelect = (category: string) => {
    if (!isArchiveCategory(category)) return;

    updateArchiveRoute(
      {
        category,
        projectSlug: null,
      },
      buildCategoryRoute(category),
    );
  };

  const handleProjectOpen = (project: ArchiveProject) => {
    updateArchiveRoute(
      {
        category: project.category,
        projectSlug: project.slug,
      },
      buildProjectRoute(project.slug),
    );
  };

  const handleProjectClose = (category: string) => {
    if (!isArchiveCategory(category)) return;

    updateArchiveRoute(
      {
        category,
        projectSlug: null,
      },
      buildCategoryRoute(category),
    );
  };

  const handleGalleryClose = () => {
    updateArchiveRoute(
      {
        category: null,
        projectSlug: null,
      },
      "/#projects",
    );

    requestAnimationFrame(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="relative bg-brand-bg text-brand-text min-h-screen selection:bg-brand-primary/30 selection:text-white overflow-x-hidden w-full max-w-full">
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <PixelTrail
          gridSize={200}
          trailSize={0.015}
          maxAge={100}
          interpolate={2}
          color="#ffffff"
        />
      </div>
      <div ref={starFieldRef} className="app-starfield-layer fixed inset-0 z-[50] pointer-events-none">
        <ThreePixelStarField />
      </div>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <Ribbons />
      </div>

      <Nav />

      <main className="relative z-10 overflow-x-hidden w-full max-w-full">
        <Hero />
        <About />
        <AboutProjectSeam />
        <Projects onCategorySelect={handleCategorySelect} />
        <Experience />
        <Skills />
        <Beyond />
      </main>

      <ProjectGallery
        category={archiveRoute.category}
        projectSlug={archiveRoute.projectSlug}
        onProjectOpen={handleProjectOpen}
        onProjectClose={handleProjectClose}
        onClose={handleGalleryClose}
      />

      <Contact />
    </div>
  );
}

export default App;
