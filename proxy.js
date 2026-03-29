#!/usr/bin/env node
/**
 * Frame.io → Notion — local dev server + CORS proxy
 *
 * Routes:
 *   GET  /                        → serves frameio-to-notion.html
 *   GET  /frameio-to-notion.html  → serves frameio-to-notion.html
 *   *    /https://...             → proxies request to that URL with CORS headers
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { URL } = require('url');

const PORT     = 8080;
const HTML     = path.join(__dirname, 'frameio-to-notion.html');
const CORS     = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Notion-Version',
};

http.createServer((req, res) => {

  // ── Preflight ────────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const reqPath = req.url.split('?')[0];

  // ── Serve HTML ───────────────────────────────────────────────────────────
  if (reqPath === '/' || reqPath === '/frameio-to-notion.html') {
    fs.readFile(HTML, (err, data) => {
      if (err) { res.writeHead(500); res.end('Could not read HTML file'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // ── Proxy ────────────────────────────────────────────────────────────────
  // Incoming path: /https://api.notion.com/v1/...
  const targetStr = req.url.slice(1); // strip leading /

  let targetUrl;
  try {
    targetUrl = new URL(targetStr);
  } catch {
    res.writeHead(400, CORS);
    res.end('Bad proxy target — path must be /https://...');
    return;
  }

  const lib  = targetUrl.protocol === 'https:' ? https : http;
  const opts = {
    hostname: targetUrl.hostname,
    port:     targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path:     targetUrl.pathname + targetUrl.search,
    method:   req.method,
    headers:  { ...req.headers, host: targetUrl.hostname },
  };
  // Strip headers that would confuse the upstream server
  delete opts.headers['origin'];
  delete opts.headers['referer'];

  const proxyReq = lib.request(opts, proxyRes => {
    res.writeHead(proxyRes.statusCode, { ...proxyRes.headers, ...CORS });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    res.writeHead(502, CORS);
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxyReq);

}).listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}/`;
  console.log('');
  console.log('  Frame.io → Notion');
  console.log('  ──────────────────────────────────');
  console.log(`  App  →  ${url}`);
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('');
});
