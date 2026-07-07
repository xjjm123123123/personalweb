import { projectArchiveSeedByCategory } from "./projectArchiveSeed.js";

export type ArchiveProject = {
  id: string;
  slug: string;
  category: "Agent" | "VR" | "PC Game" | "Robot" | "Web";
  year?: string;
  title: string;
  summary: string;
  coverImage?: string;
  detailImages: string[];
  tags: string[];
  sortOrder?: number;
};

export const projectArchiveByCategory =
  projectArchiveSeedByCategory as Record<ArchiveProject["category"], ArchiveProject[]>;

export const projectArchiveProjects = Object.values(projectArchiveByCategory).flat();

export function getArchiveProjectBySlug(slug: string) {
  return projectArchiveProjects.find((project) => project.slug === slug) ?? null;
}
