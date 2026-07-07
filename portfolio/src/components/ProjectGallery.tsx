import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { projectArchiveByCategory, type ArchiveProject } from "../data/projectArchive";

interface ProjectGalleryProps {
  category: string | null;
  projectSlug: string | null;
  onProjectOpen: (project: ArchiveProject) => void;
  onProjectClose: (category: string) => void;
  onClose: () => void;
}

function DetailImageWatermark() {
  const watermarkItems = Array.from({ length: 24 });

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 grid w-[155%] -translate-x-1/2 -translate-y-1/2 -rotate-12 grid-cols-3 gap-x-14 gap-y-11 opacity-42 mix-blend-difference md:grid-cols-4 md:gap-x-20 md:gap-y-14">
        {watermarkItems.map((_, index) => (
          <span
            key={index}
            className="select-none whitespace-nowrap font-pixel text-[10px] uppercase tracking-[0.3em] text-white md:text-[11px]"
          >
            bananacat
          </span>
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 grid w-[155%] -translate-x-1/2 -translate-y-1/2 -rotate-12 grid-cols-3 gap-x-14 gap-y-11 opacity-12 md:grid-cols-4 md:gap-x-20 md:gap-y-14">
        {watermarkItems.map((_, index) => (
          <span
            key={index}
            className="select-none whitespace-nowrap font-pixel text-[10px] uppercase tracking-[0.3em] text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.62),0_0_8px_rgba(255,255,255,0.24)] md:text-[11px]"
          >
            bananacat
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProjectGallery({
  category,
  projectSlug,
  onProjectOpen,
  onProjectClose,
  onClose,
}: ProjectGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<ArchiveProject | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [projects, setProjects] = useState<ArchiveProject[]>([]);
  const isWebCategory = category === "Web";
  const isDetail = Boolean(selectedProject);

  useEffect(() => {
    if (category) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("gallery-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("gallery-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("gallery-open");
    };
  }, [category]);

  useEffect(() => {
    setPreviewImage(null);
  }, [category, projectSlug]);

  useEffect(() => {
    let cancelled = false;

    if (!category) {
      setProjects([]);
      return () => {
        cancelled = true;
      };
    }

    const fallbackProjects =
      projectArchiveByCategory[category as keyof typeof projectArchiveByCategory] ?? [];
    setProjects(fallbackProjects);

    const controller = new AbortController();

    fetch(`/api/project-archive?category=${encodeURIComponent(category)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Archive API failed with ${response.status}`);
        }

        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;

        const nextProjects = Array.isArray(payload?.projects) ? payload.projects : [];
        const fallbackSlugs = new Set(fallbackProjects.map((project) => project.slug));
        const hasArchiveIdentityMatch =
          fallbackSlugs.size === 0 ||
          nextProjects.some((project: ArchiveProject) => fallbackSlugs.has(project.slug));

        if (nextProjects.length > 0 && hasArchiveIdentityMatch) {
          setProjects(nextProjects);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjects(fallbackProjects);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category]);

  useEffect(() => {
    if (!projectSlug) {
      setSelectedProject(null);
      return;
    }

    const nextProject = projects.find((project) => project.slug === projectSlug) ?? null;
    setSelectedProject(nextProject);
  }, [projectSlug, projects]);

  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  const getTitleMeasure = (title: string) => {
    return Array.from(title).reduce((width, char) => {
      if (/[\u4e00-\u9fff]/.test(char)) return width + 1.1;
      if (/[A-Z0-9]/.test(char)) return width + 0.72;
      return width + 0.55;
    }, 0);
  };

  const getCardStyle = (project: ArchiveProject) => {
    const titleMeasure = getTitleMeasure(project.title);
    const minWidth = project.slug === "northeast-revitalization-interactive-news" ? 46 : 18;
    const maxWidth = project.slug === "northeast-revitalization-interactive-news" ? 58 : 32;
    const preferredWidth = Math.min(maxWidth, Math.max(minWidth, titleMeasure * 2.7 + 10));

    return { width: `min(100%, ${preferredWidth.toFixed(1)}rem)` };
  };

  const getPreviewImageSrc = (image: string) => {
    if (/^\/project-archive\/pages\/page-\d{2}\.jpg$/.test(image)) {
      return image.replace(".jpg", "@2x.jpg");
    }

    if (/\/project-archive\/pages\/page-\d{2}\.jpg$/i.test(image)) {
      return image.replace(/\.jpg$/i, "@2x.jpg");
    }

    return image;
  };

  return (
    <AnimatePresence>
      {category && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#050506] overflow-y-auto overflow-x-hidden"
        >
          {isWebCategory && !isDetail && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(119,78,176,0.18)_0%,rgba(7,11,23,0.72)_48%,rgba(5,5,6,0.96)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.38)_0%,rgba(5,5,6,0.08)_18%,rgba(5,5,6,0.62)_68%,rgba(5,5,6,0.92)_100%)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(40,40,50,0.4)_0%,#050506_60%)] pointer-events-none" />

          <div
            className={`z-[999999] flex items-center justify-between px-6 py-6 md:px-12 md:py-8 pointer-events-none ${
              isDetail
                ? "sticky top-0 bg-[#050506]/88 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_24px_80px_rgba(5,5,6,0.72)]"
                : "relative"
            }`}
          >
            <div
              className={`font-pixel text-[10px] uppercase tracking-[0.2em] ${
                isDetail
                  ? "rounded-full border border-white/10 bg-black/35 px-3 py-2 text-white/65 backdrop-blur-xl"
                  : "text-white/50 mix-blend-difference"
              }`}
            >
              {selectedProject ? "DETAIL ARCHIVE" : `${projects.length} PROJECTS FOUND`}
            </div>

            <button
              onClick={() => {
                if (selectedProject) {
                  onProjectClose(selectedProject.category);
                  return;
                }
                onClose();
              }}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white hover:scale-105 pointer-events-auto cursor-pointer shadow-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-black transition-colors duration-500 pointer-events-none">
                {selectedProject ? (
                  <>
                    <line x1="15" y1="18" x2="9" y2="12"></line>
                    <line x1="9" y1="12" x2="15" y2="6"></line>
                  </>
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>

          <div
            className={`relative z-10 mx-auto max-w-7xl px-6 md:px-12 pb-32 ${
              isDetail ? "pt-4 md:pt-8" : "pt-12 md:pt-24"
            }`}
          >
            {!isDetail && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-16 md:mb-24 flex items-baseline gap-6"
              >
                <h2 className="font-display text-[2.5rem] md:text-[5rem] leading-[1] font-black uppercase tracking-tight text-white whitespace-nowrap">
                  {category}
                </h2>
                <span className="font-display text-[2rem] md:text-[4rem] font-bold text-white/40 tracking-tight whitespace-nowrap">
                  {selectedProject ? "DETAIL" : "ARCHIVE"}
                </span>
              </motion.div>
            )}

            {!selectedProject && projects.length > 0 && (
              <div className="flex flex-wrap items-start gap-4 md:gap-6">
                {projects.map((project, index) => (
                  <motion.button
                    type="button"
                    key={project.slug}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => onProjectOpen(project)}
                    style={getCardStyle(project)}
                    className="group relative h-[320px] w-full overflow-hidden rounded-2xl border border-transparent bg-white/5 text-left cursor-pointer md:h-[420px] md:flex-none"
                  >
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-1000 ease-out group-hover:scale-105 opacity-65 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(122,86,255,0.22)_0%,rgba(12,12,18,0.12)_38%,rgba(5,5,6,0.96)_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/55 to-[#050506]/10 opacity-95 transition-opacity duration-700 group-hover:opacity-75" />

                    <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                      <div className="mx-auto w-fit max-w-full transition-transform duration-700 ease-out group-hover:-translate-y-1">
                        <div className="mb-5 flex items-start justify-between gap-5">
                          {project.year && (
                            <span className="font-pixel text-[11px] uppercase tracking-[0.28em] text-white/62">
                              {project.year}
                            </span>
                          )}
                          <div className="flex flex-wrap justify-end gap-2">
                            {project.tags.map((tag) => (
                              <span key={tag} className="rounded-full border border-white/16 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white/78 backdrop-blur-md">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <h3
                          className={`font-display font-black leading-[0.95] text-white tracking-tight max-w-4xl ${
                            project.slug === "northeast-revitalization-interactive-news"
                              ? "text-right whitespace-nowrap text-[clamp(0.95rem,4vw,2.2rem)] md:text-[clamp(2.2rem,3.4vw,4.6rem)]"
                              : "whitespace-nowrap text-3xl md:text-5xl"
                          }`}
                        >
                          {project.title}
                        </h3>
                        <div className="mt-6 font-pixel text-[10px] uppercase tracking-[0.22em] text-white/52">
                          Click To Open Detail
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {!selectedProject && projects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-14 md:px-12 md:py-16"
              >
                <div className="font-display text-[2rem] md:text-[3rem] font-bold text-white tracking-tight">
                  这个分类还没有拆分好的项目。
                </div>
                <p className="mt-4 max-w-2xl text-white/65 leading-7">
                  目前我已经按 PDF 完成了 VR、Web 和 PC Game 三个分类的项目切分。Agent 和 Robot 这两个分类在这份作品集中没有稳定页段，继续放假数据只会误导。
                </p>
              </motion.div>
            )}

            {selectedProject && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 gap-8 items-start">
                  <div className="bg-transparent border-transparent p-0 md:p-0">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 text-[10px] uppercase tracking-widest text-white border border-white/20 rounded-full backdrop-blur-md bg-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {selectedProject.year && (
                        <div className="font-pixel text-[10px] uppercase tracking-[0.24em] text-white/50">
                          {selectedProject.year}
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-[2.4rem] md:text-[4rem] leading-[0.95] font-black tracking-tight text-white">
                      {selectedProject.title}
                    </h3>
                    <p className="mt-6 text-base md:text-lg leading-8 text-white/72">
                      {selectedProject.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => onProjectClose(selectedProject.category)}
                      className="mt-8 inline-flex items-center rounded-full border border-white/20 px-5 py-3 font-pixel text-[10px] uppercase tracking-[0.18em] text-white/80 transition-colors duration-300 hover:bg-white hover:text-black"
                    >
                      Back To Category
                    </button>
                  </div>
                </div>

                {selectedProject.detailImages.length > 0 ? (
                  <div className="space-y-6">
                    <div className="font-pixel text-[10px] uppercase tracking-[0.24em] text-white/45">
                      Detail Pages
                    </div>
                    {selectedProject.detailImages.map((image, index) => (
                      <motion.div
                          key={image}
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              src: getPreviewImageSrc(image),
                              alt: `${selectedProject.title} detail ${index + 1}`,
                            })
                          }
                          className="group relative block w-full overflow-hidden text-left"
                          aria-label={`放大查看 ${selectedProject.title} detail ${index + 1}`}
                        >
                          <img
                            src={image}
                            alt={`${selectedProject.title} detail ${index + 1}`}
                            className="block w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                          />
                          <DetailImageWatermark />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] px-6 py-7 text-white/55">
                    这个项目的作品图还没有接入，当前先展示项目时间、标题与介绍文案。
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/92 px-4 py-6 backdrop-blur-xl md:px-10 md:py-10"
                onClick={() => setPreviewImage(null)}
                role="dialog"
                aria-modal="true"
                aria-label={previewImage.alt}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPreviewImage(null);
                  }}
                  className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black md:right-8 md:top-8"
                  aria-label="关闭图片预览"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <motion.div
                  initial={{ scale: 0.96, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.98, y: 10 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative max-h-[88dvh] max-w-[96vw] overflow-hidden rounded-[1.25rem] border border-white/12 shadow-[0_30px_120px_rgba(0,0,0,0.75)] md:max-h-[90dvh] md:max-w-[92vw]"
                >
                  <img
                    src={previewImage.src}
                    alt={previewImage.alt}
                    className="block max-h-[88dvh] max-w-[96vw] object-contain md:max-h-[90dvh] md:max-w-[92vw]"
                  />
                  <DetailImageWatermark />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
