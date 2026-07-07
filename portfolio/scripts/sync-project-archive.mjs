import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { projectArchiveSeedByCategory } from "../src/data/projectArchiveSeed.js";

const ENV_PATH = resolve(process.cwd(), ".env");
const PUBLIC_DIR = resolve(process.cwd(), "public");

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

function flattenSeed() {
  return Object.values(projectArchiveSeedByCategory)
    .flat()
    .map((project) => project);
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isLocalPublicAssetPath(value) {
  return typeof value === "string" && value.startsWith("/");
}

function getLocalAssetPath(assetPath) {
  return resolve(PUBLIC_DIR, assetPath.replace(/^\/+/, ""));
}

function getContentType(assetPath) {
  if (assetPath.endsWith(".png")) return "image/png";
  if (assetPath.endsWith(".jpg") || assetPath.endsWith(".jpeg")) return "image/jpeg";
  if (assetPath.endsWith(".svg")) return "image/svg+xml";
  if (assetPath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function getDetailObjectPath(project, assetPath) {
  return `projects/${project.slug}/details/${basename(assetPath)}`;
}

function getCoverObjectPath(project, assetPath) {
  if ((project.detailImages ?? []).includes(assetPath)) {
    return getDetailObjectPath(project, assetPath);
  }

  return `projects/${project.slug}/cover/${basename(assetPath)}`;
}

function buildStoragePlan() {
  const uploads = new Map();

  for (const project of Object.values(projectArchiveSeedByCategory).flat()) {
    if (project.coverImage && isLocalPublicAssetPath(project.coverImage)) {
      uploads.set(getCoverObjectPath(project, project.coverImage), project.coverImage);
    }

    for (const imagePath of project.detailImages ?? []) {
      if (!isLocalPublicAssetPath(imagePath)) continue;

      const objectPath = getDetailObjectPath(project, imagePath);
      uploads.set(objectPath, imagePath);

      if (/\.jpg$/i.test(imagePath)) {
        const retinaPath = imagePath.replace(/\.jpg$/i, "@2x.jpg");
        if (existsSync(getLocalAssetPath(retinaPath))) {
          uploads.set(getDetailObjectPath(project, retinaPath), retinaPath);
        }
      }
    }
  }

  return uploads;
}

function toStoredAssetRef(project, assetPath, kind) {
  if (!assetPath) return "";
  if (isExternalUrl(assetPath)) return assetPath;
  if (!isLocalPublicAssetPath(assetPath)) return assetPath;

  return kind === "cover"
    ? getCoverObjectPath(project, assetPath)
    : getDetailObjectPath(project, assetPath);
}

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL and one of SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function ensurePublicBucket(supabase) {
  const storageBucket = getStorageBucket();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  const existingBucket = buckets.find((bucket) => bucket.name === storageBucket);
  if (!existingBucket) {
    const { error: createError } = await supabase.storage.createBucket(storageBucket, {
      public: true,
      fileSizeLimit: "50MB",
    });

    if (createError) {
      throw new Error(`Failed to create storage bucket: ${createError.message}`);
    }
    return;
  }

  if (!existingBucket.public) {
    const { error: updateError } = await supabase.storage.updateBucket(storageBucket, {
      public: true,
      fileSizeLimit: existingBucket.file_size_limit ?? "50MB",
      allowedMimeTypes: existingBucket.allowed_mime_types ?? null,
    });

    if (updateError) {
      throw new Error(`Failed to update storage bucket: ${updateError.message}`);
    }
  }
}

async function uploadReferencedAssets(supabase) {
  const storageBucket = getStorageBucket();
  const storagePlan = buildStoragePlan();

  for (const [objectPath, assetPath] of storagePlan.entries()) {
    const localAssetPath = getLocalAssetPath(assetPath);
    if (!existsSync(localAssetPath)) {
      throw new Error(`Missing local asset for storage sync: ${assetPath}`);
    }

    const fileBuffer = readFileSync(localAssetPath);
    const { error } = await supabase.storage.from(storageBucket).upload(objectPath, fileBuffer, {
      upsert: true,
      contentType: getContentType(assetPath),
      cacheControl: "3600",
    });

    if (error) {
      throw new Error(`Failed to upload asset ${assetPath}: ${error.message}`);
    }
  }
}

async function listObjectPaths(supabase, prefix = "") {
  const storageBucket = getStorageBucket();
  const { data, error } = await supabase.storage.from(storageBucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    throw new Error(`Failed to list storage objects for prefix "${prefix}": ${error.message}`);
  }

  const objectPaths = [];
  for (const item of data) {
    const nextPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.metadata) {
      objectPaths.push(nextPath);
      continue;
    }

    objectPaths.push(...(await listObjectPaths(supabase, nextPath)));
  }

  return objectPaths;
}

async function removeObjectPaths(supabase, objectPaths) {
  if (objectPaths.length === 0) return;

  const storageBucket = getStorageBucket();
  for (let index = 0; index < objectPaths.length; index += 100) {
    const chunk = objectPaths.slice(index, index + 100);
    const { error } = await supabase.storage.from(storageBucket).remove(chunk);
    if (error) {
      throw new Error(`Failed to remove stale storage objects: ${error.message}`);
    }
  }
}

async function request(path, init = {}) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL and one of SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  const response = await fetch(new URL(path, supabaseUrl), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

async function syncProjectArchive() {
  const supabase = createSupabaseAdminClient();
  const storageBucket = getStorageBucket();
  await ensurePublicBucket(supabase);
  await uploadReferencedAssets(supabase);

  const payload = flattenSeed().map((project) => ({
    slug: project.slug,
    category: project.category,
    year: project.year ?? null,
    title: project.title,
    description: project.summary,
    image: toStoredAssetRef(project, project.coverImage ?? "", "cover"),
    detail_images: Array.isArray(project.detailImages)
      ? project.detailImages.map((imagePath) => toStoredAssetRef(project, imagePath, "detail"))
      : [],
    tags: project.tags,
    sort_order: project.sortOrder ?? 0,
  }));
  const desiredSlugs = new Set(payload.map((project) => project.slug));
  const desiredObjectPaths = new Set(buildStoragePlan().keys());

  const existingRows = await request("/rest/v1/projects?select=slug");
  const staleSlugs = (existingRows ?? [])
    .map((row) => row.slug)
    .filter((slug) => slug && !desiredSlugs.has(String(slug)));

  await request("/rest/v1/projects?on_conflict=slug", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (staleSlugs.length > 0) {
    for (const slug of staleSlugs) {
      await request(`/rest/v1/projects?slug=eq.${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: {
          Prefer: "return=minimal",
        },
      });
    }
  }

  const managedObjectPaths = await listObjectPaths(supabase, "projects");
  const staleManagedObjectPaths = managedObjectPaths.filter(
    (objectPath) => !desiredObjectPaths.has(objectPath),
  );
  const legacyObjectPaths = [
    ...(await listObjectPaths(supabase, "image")),
    ...(await listObjectPaths(supabase, "project-archive")),
  ];
  await removeObjectPaths(supabase, [...new Set([...staleManagedObjectPaths, ...legacyObjectPaths])]);

  console.log(
    `Synced ${payload.length} archive projects to Supabase and uploaded referenced assets to storage bucket "${storageBucket}".${staleSlugs.length ? ` Removed ${staleSlugs.length} stale rows.` : ""}`,
  );
}

loadLocalEnv();
syncProjectArchive().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
