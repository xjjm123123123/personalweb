export function getCacheHeaders() {
  return {
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
    Vary: "Origin",
  };
}

function getStorageBucket() {
  return process.env.SUPABASE_ASSETS_BUCKET || "portfolio-assets";
}

function getSupabaseConfig(tableEnvName, defaultTable) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env[tableEnvName] || defaultTable;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL and one of SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    table,
  };
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
    embedUrls: toTextArray(row.embed_urls),
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
    embedUrls: toTextArray(row.embed_urls),
    tags: toTextArray(row.tags),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function normalizeExperience(row) {
  return {
    id: String(row.id ?? row.slug ?? row.company ?? ""),
    company: row.company ?? "",
    role: row.role ?? row.title ?? "",
    date: row.date ?? row.period ?? "",
    location: row.location ?? "",
    responsibilities: toTextArray(row.responsibilities),
    honors: toTextArray(row.honors),
    achievements: toTextArray(row.achievements),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

async function requestSupabaseProjectRows(category, select) {
  const { supabaseUrl, serviceRoleKey, table } = getSupabaseConfig(
    "SUPABASE_PROJECTS_TABLE",
    "projects",
  );
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

async function requestSupabaseExperienceRows(select) {
  const { supabaseUrl, serviceRoleKey, table } = getSupabaseConfig(
    "SUPABASE_EXPERIENCES_TABLE",
    "experiences",
  );
  const apiUrl = new URL(`/rest/v1/${table}`, supabaseUrl);
  apiUrl.searchParams.set("select", select);
  apiUrl.searchParams.set("order", "sort_order.asc,date.desc,company.asc");

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

async function requestProjectRowsWithFallback(category, selects) {
  let lastError = null;

  for (const select of selects) {
    try {
      return await requestSupabaseProjectRows(category, select);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Supabase request failed");
}

export async function fetchProjects(category) {
  const rows = await requestProjectRowsWithFallback(category, [
    "slug,id,category,title,description,image,embed_urls,tags,sort_order",
    "id,category,title,description,image,tags,sort_order",
  ]);

  return rows.map(normalizeLegacyProject);
}

export async function fetchProjectArchive(category) {
  const rows = await requestProjectRowsWithFallback(category, [
    "slug,id,category,year,title,description,image,detail_images,embed_urls,tags,sort_order",
    "id,category,title,description,image,tags,sort_order",
  ]);

  return rows.map(normalizeArchiveProject);
}

export async function fetchExperiences() {
  const rows = await requestSupabaseExperienceRows(
    "id,company,role,date,location,responsibilities,honors,achievements,sort_order",
  );

  return rows.map(normalizeExperience);
}
