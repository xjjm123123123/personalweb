import { content } from "./content";

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  date: string;
  location: string;
  responsibilities: string[];
  honors: string[];
  achievements: string[];
  sortOrder?: number;
};

export const fallbackExperience = content.experience as ExperienceItem[];

function toTextArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExperience(row: Record<string, unknown>): ExperienceItem {
  return {
    id: String(row.id ?? row.slug ?? row.company ?? ""),
    company: String(row.company ?? ""),
    role: String(row.role ?? row.title ?? ""),
    date: String(row.date ?? row.period ?? ""),
    location: String(row.location ?? ""),
    responsibilities: toTextArray(row.responsibilities),
    honors: toTextArray(row.honors),
    achievements: toTextArray(row.achievements),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export async function fetchExperiences(signal?: AbortSignal) {
  const response = await fetch("/api/experiences", { signal });

  if (!response.ok) {
    throw new Error(`Experiences API failed with ${response.status}`);
  }

  const payload = (await response.json()) as { experiences?: Record<string, unknown>[] };
  const rows = Array.isArray(payload?.experiences) ? payload.experiences : [];

  return rows.map((row) => normalizeExperience(row));
}
