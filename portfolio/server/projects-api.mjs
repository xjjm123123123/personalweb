import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, normalize, resolve } from "node:path";
import {
  fetchExperiences,
  fetchProjectArchive,
  fetchProjects,
  getCacheHeaders,
} from "./supabase-api.mjs";

const PORT = Number(process.env.PORT || process.env.PROJECTS_API_PORT || 8787);
const ENV_PATH = resolve(process.cwd(), ".env");
const DIST_DIR = resolve(process.cwd(), "dist");
const API_RESPONSE_TTL_MS = 1000 * 60 * 5;
const apiResponseCache = new Map();
const staticMimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

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

function writeJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function writeStaticFile(req, res, requestPath) {
  if (!existsSync(DIST_DIR)) {
    writeJson(res, 404, { error: "Static build not found. Run npm run build first." });
    return;
  }

  const decodedPath = decodeURIComponent(requestPath.split("?")[0] || "/");
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedFile = normalizedPath === "/" ? "/index.html" : normalizedPath;
  const filePath = resolve(DIST_DIR, `.${requestedFile}`);
  const fallbackPath = resolve(DIST_DIR, "index.html");
  const targetPath = filePath.startsWith(DIST_DIR) && existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : fallbackPath;

  if (!targetPath.startsWith(DIST_DIR) || !existsSync(targetPath)) {
    writeJson(res, 404, { error: "Not found" });
    return;
  }

  const extension = extname(targetPath);
  const contentType = staticMimeTypes[extension] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": targetPath === fallbackPath
      ? "no-cache"
      : "public, max-age=31536000, immutable",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(targetPath).pipe(res);
}

function getCachedProjects(cacheKey) {
  const cached = apiResponseCache.get(cacheKey);
  if (!cached) return null;

  if (Date.now() - cached.updatedAt > API_RESPONSE_TTL_MS) {
    apiResponseCache.delete(cacheKey);
    return null;
  }

  return cached.projects;
}

function setCachedProjects(cacheKey, projects) {
  apiResponseCache.set(cacheKey, {
    projects,
    updatedAt: Date.now(),
  });
}

function getCachedPayload(cacheKey) {
  const cached = apiResponseCache.get(cacheKey);
  if (!cached) return null;

  if (Date.now() - cached.updatedAt > API_RESPONSE_TTL_MS) {
    apiResponseCache.delete(cacheKey);
    return null;
  }

  return cached.payload;
}

function setCachedPayload(cacheKey, payload) {
  apiResponseCache.set(cacheKey, {
    payload,
    updatedAt: Date.now(),
  });
}

loadLocalEnv();

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    writeJson(res, 200, { ok: true });
    return;
  }

  const requestUrl = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method !== "GET" && req.method !== "HEAD") {
    writeJson(res, 404, { error: "Not found" });
    return;
  }

  const isLegacyProjectsApi = requestUrl.pathname === "/api/projects";
  const isArchiveProjectsApi = requestUrl.pathname === "/api/project-archive";
  const isExperiencesApi = requestUrl.pathname === "/api/experiences";

  if (!isLegacyProjectsApi && !isArchiveProjectsApi && !isExperiencesApi) {
    writeStaticFile(req, res, requestUrl.pathname);
    return;
  }

  if (isExperiencesApi) {
    try {
      const cacheKey = requestUrl.pathname;
      const cachedPayload = getCachedPayload(cacheKey);

      if (cachedPayload) {
        writeJson(res, 200, cachedPayload, getCacheHeaders());
        return;
      }

      const experiences = await fetchExperiences();
      const payload = { experiences };
      setCachedPayload(cacheKey, payload);
      writeJson(res, 200, payload, getCacheHeaders());
    } catch (error) {
      writeJson(res, 500, {
        error: error instanceof Error ? error.message : "Unknown server error",
      });
    }
    return;
  }

  const category = requestUrl.searchParams.get("category");
  if (!category) {
    writeJson(res, 400, { error: "Missing category query parameter" });
    return;
  }

  try {
      const cacheKey = `${requestUrl.pathname}:${category}`;
      const cachedProjects = getCachedProjects(cacheKey);

      if (cachedProjects) {
        writeJson(res, 200, { projects: cachedProjects }, getCacheHeaders());
        return;
      }

      const projects = isArchiveProjectsApi
        ? await fetchProjectArchive(category)
        : await fetchProjects(category);

      setCachedProjects(cacheKey, projects);
      writeJson(res, 200, { projects }, getCacheHeaders());
  } catch (error) {
    writeJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Projects API listening on http://localhost:${PORT}`);
});
