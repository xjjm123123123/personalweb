import { fetchExperiences, getCacheHeaders } from "../server/supabase-api.mjs";

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET, HEAD" });
    return;
  }

  try {
    const payload = { experiences: await fetchExperiences() };
    if (req.method === "HEAD") {
      res.writeHead(200, getCacheHeaders());
      res.end();
      return;
    }

    sendJson(res, 200, payload, getCacheHeaders());
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
}
