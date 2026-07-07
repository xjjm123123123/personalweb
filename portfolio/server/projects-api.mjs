import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PORT = Number(process.env.PORT || process.env.PROJECTS_API_PORT || 8787);
const ENV_PATH = resolve(process.cwd(), ".env");

function getStorageBucket() {
  return process.env.SUPABASE_ASSETS_BUCKET || "portfolio-assets";
}

function loadLocalEnv() {
  if (!existsSync(ENV_PATH)) return;

  const envFile = readFileSync(ENV_PATH, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function toTextArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPublicAssetUrl(value) {
  if (!value) return "";

  const stringValue = String(value);
  if (/^https?:\/\//i.test(stringValue) || stringValue.startsWith("/")) {
    return stringValue;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return stringValue;
  }

  return new URL(
    `/storage/v1/object/public/${getStorageBucket()}/${stringValue}`,
    supabaseUrl,
  ).toString();
}

function normalizeLegacyProject(row) {
  return {
    id: String(row.id ?? row.slug ?? ""),
    slug: String(row.slug ?? row.id),
    title: row.title ?? "",
    description: row.description ?? "",
    image: toPublicAssetUrl(row.image ?? ""),
    tags: toTextArray(row.tags),
  };
}

function normalizeArchiveProject(row) {
  const image = toPublicAssetUrl(row.image ?? "");

  return {
    id: String(row.id ?? row.slug ?? ""),
    slug: String(row.slug ?? row.id),
    category: row.category ?? "",
    year: row.year ? String(row.year) : undefined,
    title: row.title ?? "",
    summary: row.summary ?? row.description ?? "",
    coverImage: image || undefined,
    detailImages: Array.isArray(row.detail_images)
      ? row.detail_images.map((item) => toPublicAssetUrl(item)).filter(Boolean)
      : image
        ? [image]
        : [],
    tags: toTextArray(row.tags),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

async function requestSupabaseRows(category, select) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_PROJECTS_TABLE || "projects";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL and one of SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  const apiUrl = new URL(`/rest/v1/${table}`, supabaseUrl);
  apiUrl.searchParams.set("select", select);
  apiUrl.searchParams.set("category", `eq.${category}`);
  apiUrl.searchParams.set("order", "sort_order.asc,title.asc");

  const response = await fetch(apiUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  return response.json();
}

async function requestWithFallback(category, selects) {
  let lastError = null;

  for (const select of selects) {
    try {
      return await requestSupabaseRows(category, select);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Supabase request failed");
}

async function fetchProjects(category) {
  const rows = await requestWithFallback(category, [
    "slug,id,category,title,description,image,tags,sort_order",
    "id,category,title,description,image,tags,sort_order",
  ]);

  return rows.map(normalizeLegacyProject);
}

async function fetchProjectArchive(category) {
  const rows = await requestWithFallback(category, [
    "slug,id,category,year,title,description,image,detail_images,tags,sort_order",
    "id,category,title,description,image,tags,sort_order",
  ]);

  return rows.map(normalizeArchiveProject);
}

loadLocalEnv();

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    writeJson(res, 200, { ok: true });
    return;
  }

  const requestUrl = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method !== "GET") {
    writeJson(res, 404, { error: "Not found" });
    return;
  }

  const isLegacyProjectsApi = requestUrl.pathname === "/api/projects";
  const isArchiveProjectsApi = requestUrl.pathname === "/api/project-archive";

  if (!isLegacyProjectsApi && !isArchiveProjectsApi) {
    writeJson(res, 404, { error: "Not found" });
    return;
  }

  const category = requestUrl.searchParams.get("category");
  if (!category) {
    writeJson(res, 400, { error: "Missing category query parameter" });
    return;
  }

  try {
    const projects = isArchiveProjectsApi
      ? await fetchProjectArchive(category)
      : await fetchProjects(category);
    writeJson(res, 200, { projects });
  } catch (error) {
    writeJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Projects API listening on http://localhost:${PORT}`);
});
