import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { AboutProjectSeam } from "./components/AboutProjectSeam";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Beyond } from "./components/Beyond";
import { Contact } from "./components/Contact";
import { getArchiveProjectBySlug, projectArchiveByCategory, type ArchiveProject } from "./data/projectArchive";
import { fallbackExperience, fetchExperiences, type ExperienceItem } from "./data/experience";
import Ribbons from "./components/Ribbons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LazyProjects = lazy(() =>
  import("./components/Projects").then((module) => ({ default: module.Projects })),
);
const LazyProjectGallery = lazy(() =>
  import("./components/ProjectGallery").then((module) => ({ default: module.ProjectGallery })),
);
const LazyThreePixelStarField = lazy(() =>
  import("./components/ThreePixelStarField").then((module) => ({
    default: module.ThreePixelStarField,
  })),
);
const LazyPixelTrail = lazy(() => import("./components/PixelTrail"));

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

function ProjectsSectionFallback() {
  return (
    <section
      id="projects"
      className="relative min-h-[100dvh] overflow-hidden bg-transparent"
      aria-label="Projects section loading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(114,100,255,0.12),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.36)_30%,rgba(0,0,0,0.72))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-black/30" />
    </section>
  );
}

function ProjectGalleryFallback() {
  return <div className="fixed inset-0 z-[120] bg-black/82 backdrop-blur-md" aria-hidden="true" />;
}

function App() {
  const starFieldRef = useRef<HTMLDivElement>(null);
  const [archiveRoute, setArchiveRoute] = useState<ArchiveRouteState>(() => parseArchiveRoute());
  const projectsLoadTriggerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadProjectsSection, setShouldLoadProjectsSection] = useState(() => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    return path === "/projects" || path.startsWith("/projects/");
  });
  const [shouldLoadDeferredThree, setShouldLoadDeferredThree] = useState(false);
  const [shouldLoadPixelTrail, setShouldLoadPixelTrail] = useState(false);
  const [experience, setExperience] = useState<ExperienceItem[]>(fallbackExperience);

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

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncPixelTrailAvailability = () => {
      setShouldLoadPixelTrail(!motionQuery.matches && pointerQuery.matches);
    };

    syncPixelTrailAvailability();
    motionQuery.addEventListener("change", syncPixelTrailAvailability);
    pointerQuery.addEventListener("change", syncPixelTrailAvailability);

    const timerId = window.setTimeout(() => {
      setShouldLoadDeferredThree(true);
    }, 180);

    return () => {
      window.clearTimeout(timerId);
      motionQuery.removeEventListener("change", syncPixelTrailAvailability);
      pointerQuery.removeEventListener("change", syncPixelTrailAvailability);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchExperiences(controller.signal)
      .then((nextExperience) => {
        if (nextExperience.length > 0) {
          setExperience(nextExperience);
        }
      })
      .catch(() => {
        setExperience(fallbackExperience);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (shouldLoadProjectsSection) return;

    const trigger = projectsLoadTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setShouldLoadProjectsSection(true);
        observer.disconnect();
      },
      {
        rootMargin: "900px 0px",
        threshold: 0,
      },
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [shouldLoadProjectsSection]);

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
      <div className="fixed inset-0 z-[100001] pointer-events-none">
        <Suspense fallback={null}>
          {shouldLoadDeferredThree && shouldLoadPixelTrail ? (
            <LazyPixelTrail
              gridSize={200}
              trailSize={0.015}
              maxAge={100}
              interpolate={2}
              color="#ffffff"
              gooeyFilter={null}
            />
          ) : null}
        </Suspense>
      </div>
      <div ref={starFieldRef} className="app-starfield-layer fixed inset-0 z-[50] pointer-events-none">
        <Suspense fallback={null}>
          {shouldLoadDeferredThree ? <LazyThreePixelStarField /> : null}
        </Suspense>
      </div>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <Ribbons />
      </div>

      <Nav />

      <main className="relative z-10 overflow-x-hidden w-full max-w-full">
        <Hero />
        <About experience={experience} />
        <AboutProjectSeam />
        <div ref={projectsLoadTriggerRef} className="h-px w-full" aria-hidden="true" />
        <Suspense fallback={<ProjectsSectionFallback />}>
          {shouldLoadProjectsSection ? (
            <LazyProjects onCategorySelect={handleCategorySelect} />
          ) : (
            <ProjectsSectionFallback />
          )}
        </Suspense>
        <Experience experience={experience} />
        <Skills />
        <Beyond />
      </main>

      <Suspense fallback={archiveRoute.category ? <ProjectGalleryFallback /> : null}>
        {archiveRoute.category ? (
          <LazyProjectGallery
            category={archiveRoute.category}
            projectSlug={archiveRoute.projectSlug}
            onProjectOpen={handleProjectOpen}
            onProjectClose={handleProjectClose}
            onClose={handleGalleryClose}
          />
        ) : null}
      </Suspense>

      <Contact />
    </div>
  );
}

export default App;
