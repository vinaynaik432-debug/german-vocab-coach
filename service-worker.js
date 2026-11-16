/* One release owns one complete shell. Bump this version and all entry query
 * versions together when releasing changed assets. No telemetry or runtime cache. */
const CACHE_NAME = 'german-vocab-coach-pwa-v43-continuous4';
const APP_ASSETS = [
  './',
  './index.html',
  './coach.css?v=20261116-continuous4',
  './curriculum-data.js?v=20261116-continuous4',
  './frequency-data.js?v=20261116-continuous4',
  './learning-priorities.js?v=20261116-continuous4',
  './recall-evidence.js?v=20261116-continuous4',
  './backup-data.js?v=20261116-continuous4',
  './persistence.js?v=20261116-continuous4',
  './practice-engine.js?v=20261116-continuous4',
  './practice-session.js?v=20261116-continuous4',
  './review-scheduler.js?v=20261116-continuous4',
  './practice-data.js?v=20261116-continuous4',
  './coach-content.js?v=20261116-continuous4',
  './coach-migration.js?v=20261116-continuous4',
  './coach-learning.js?v=20261116-continuous4',
  './coach-store.js?v=20261116-continuous4',
  './coach-csv.js?v=20261116-continuous4',
  './marketing-scenarios.js?v=20261116-continuous4',
  './coach-activities.js?v=20261116-continuous4',
  './coach-app.js?v=20261116-continuous4',
  './vocabulary-sources.html',
  './manifest.webmanifest',
  './icons/logo.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
const BASE = new URL('./', self.location.href);
const ASSET_URLS = new Set(APP_ASSETS.map(path => new URL(path, BASE).href));
const ASSET_PATHS = new Set([...ASSET_URLS].map(url => new URL(url).pathname));
let repair = null;

async function installShell() {
  const requests = APP_ASSETS.map(path => new Request(new URL(path, BASE), { cache: 'reload', credentials: 'same-origin' }));
  const responses = await Promise.all(requests.map(async request => {
    const response = await fetch(request);
    if (!response.ok || (response.url && new URL(response.url).origin !== BASE.origin)) throw new Error('An offline app file could not be fetched.');
    return response;
  }));
  const index = APP_ASSETS.indexOf('./index.html');
  const html = await responses[index].clone().text();
  const entryAssets = [...html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^\"]+)?)"/g)]
    .map(match => new URL(match[1], BASE).href);
  const expected = [...ASSET_URLS].filter(url => /\.(?:js|css)(?:\?|$)/.test(url));
  if (!entryAssets.length || entryAssets.some(url => !ASSET_URLS.has(url)) || expected.some(url => !entryAssets.includes(url))) {
    throw new Error('The page and offline files belong to different releases.');
  }
  // Validate/fetch the whole bundle before writing anything. A failed new
  // worker installation never activates, so the previous complete cache stays.
  const cache = await caches.open(CACHE_NAME);
  for (let i = 0; i < requests.length; i++) if (i !== index && APP_ASSETS[i] !== './') await cache.put(requests[i], responses[i]);
  await cache.put(requests[index], responses[index].clone());
  await cache.put(new URL('./', BASE).href, responses[index]);
}

self.addEventListener('install', event => {
  event.waitUntil(installShell());
  // Do not skipWaiting: an open old page must retain its old worker and assets.
});

self.addEventListener('activate', event => {
  // Normal lifecycle activation waits until the previous worker's tabs close.
  // Do not claim an already-loaded page from another shell generation.
  event.waitUntil(caches.keys().then(names => Promise.all(names
    .filter(name => name.startsWith('german-vocab-coach-pwa-') && name !== CACHE_NAME)
    .map(name => caches.delete(name)))));
});

async function cachedAsset(url) {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(url);
  if (!response) {
    // Recover eviction as a whole matching release, never one arbitrary newer
    // dependency. A server index from another release cannot enter this cache.
    if (!repair) repair = installShell().finally(() => { repair = null; });
    try { await repair; response = await cache.match(url); } catch { /* Explain below; keep earlier cached files. */ }
  }
  return response || new Response('Offline app files are unavailable. Reconnect, close all app tabs, and reopen the app.', {
    status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  if (event.request.mode === 'navigate') {
    if (url.pathname === BASE.pathname || url.pathname === new URL('./index.html', BASE).pathname) {
      event.respondWith(cachedAsset(new URL('./index.html', BASE).href));
    } else if (url.pathname === new URL('./vocabulary-sources.html', BASE).pathname) {
      event.respondWith(cachedAsset(new URL('./vocabulary-sources.html', BASE).href));
    }
    return;
  }
  if (ASSET_URLS.has(url.href)) event.respondWith(cachedAsset(url.href));
  else if (ASSET_PATHS.has(url.pathname) && /\.(?:js|css)$/.test(url.pathname)) {
    event.respondWith(Promise.resolve(new Response('This app tab belongs to a different release. Close and reopen it to update.', {
      status: 409, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })));
  }
  // Cross-origin resources, private backup files and unrelated same-origin
  // requests are neither intercepted nor retained in an application cache.
});
