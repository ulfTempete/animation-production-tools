/*
 * notion-proxy.js — Cloudflare Worker
 * Proxies POST requests from the client feedback form to the Notion API,
 * adding authentication and CORS headers server-side.
 *
 * ══════════════════════════════════════════════════════════════════════
 *  DEPLOYMENT INSTRUCTIONS
 * ══════════════════════════════════════════════════════════════════════
 *
 *  1. CREATE A FREE CLOUDFLARE ACCOUNT (if you don't have one)
 *     https://workers.cloudflare.com — no credit card needed.
 *
 *  2. CREATE A NEW WORKER
 *     Dashboard → Workers & Pages → Create application → Create Worker
 *     Give it a name, e.g. "notion-proxy", then click "Deploy".
 *
 *  3. REPLACE THE CODE
 *     Click "Edit code", select all, delete it, and paste this entire file.
 *     Click "Save and deploy".
 *
 *  4. ADD YOUR NOTION API KEY AS A SECRET
 *     Worker page → Settings → Variables → Secrets → "Add secret"
 *       Name:   NOTION_API_KEY
 *       Value:  ntn_... (your Notion integration token)
 *     Click "Add secret" to save.
 *
 *  5. (Optional) RESTRICT ALLOWED ORIGINS
 *     If you want to lock the worker to your specific GitHub Pages domain:
 *     Worker → Settings → Variables → Environment Variables → "Add variable"
 *       Name:   ALLOWED_ORIGIN
 *       Value:  https://yourusername.github.io
 *     If omitted, the DEFAULT_ORIGINS list below is used.
 *
 *  6. COPY YOUR WORKER URL
 *     It appears at the top of the editor, e.g.:
 *       https://notion-proxy.YOUR-SUBDOMAIN.workers.dev
 *
 *  7. UPDATE client-feedback.html
 *     Near the top of the file, set:
 *       const WORKER_URL = 'https://notion-proxy.YOUR-SUBDOMAIN.workers.dev';
 *
 *  8. COMMIT & PUSH TO GITHUB
 *     GitHub Pages will then be able to submit feedback directly
 *     to Notion via this worker with no CORS issues.
 *
 * ══════════════════════════════════════════════════════════════════════
 *  REQUEST FORMAT (POST body, JSON)
 * ══════════════════════════════════════════════════════════════════════
 *
 *  {
 *    "notionEndpoint": "pages",          // Notion API path after /v1/
 *    "payload": { ...notionPageBody }    // forwarded as the request body
 *  }
 *
 * ══════════════════════════════════════════════════════════════════════
 */

// Origins permitted to call this worker.
// Override the first entry via the ALLOWED_ORIGIN environment variable.
const DEFAULT_ORIGINS = [
  'https://ulftempete.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'null', // file:// during local dev
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    const allowed = env.ALLOWED_ORIGIN
      ? [env.ALLOWED_ORIGIN, 'http://localhost:8080', 'http://127.0.0.1:8080', 'null']
      : DEFAULT_ORIGINS;

    // Reflect origin if allowed; otherwise use the primary allowed origin
    const corsOrigin = allowed.includes(origin) ? origin : allowed[0];

    const cors = {
      'Access-Control-Allow-Origin':  corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    // ── CORS preflight ──────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return respond({ error: 'Only POST requests are accepted.' }, 405, cors);
    }

    // ── Guard: secret must be set ───────────────────────────────────────
    if (!env.NOTION_API_KEY) {
      return respond(
        { error: 'NOTION_API_KEY secret is not configured on this worker.' },
        500, cors
      );
    }

    // ── Parse request body ──────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return respond({ error: 'Request body must be valid JSON.' }, 400, cors);
    }

    const { notionEndpoint, payload } = body;

    if (!notionEndpoint || typeof notionEndpoint !== 'string') {
      return respond({ error: 'Missing or invalid notionEndpoint.' }, 400, cors);
    }
    if (!payload || typeof payload !== 'object') {
      return respond({ error: 'Missing or invalid payload.' }, 400, cors);
    }

    // ── Forward to Notion API ───────────────────────────────────────────
    let notionRes;
    try {
      notionRes = await fetch(`https://api.notion.com/v1/${notionEndpoint}`, {
        method:  'POST',
        headers: {
          'Authorization':  `Bearer ${env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type':   'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      return respond({ error: `Failed to reach Notion API: ${err.message}` }, 502, cors);
    }

    const data = await notionRes.json().catch(() => ({}));
    return respond(data, notionRes.status, cors);
  },
};

function respond(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
