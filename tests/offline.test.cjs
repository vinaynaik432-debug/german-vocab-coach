const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

function harness() {
  const origin = 'https://coach.example', base = `${origin}/vocab/`;
  const events = {}, stores = new Map(), fetched = [], deleted = [], lifecycle = { skipped: 0, claimed: 0 };
  let fail = null, htmlOverride = null, assets = [];
  const urlOf = request => typeof request === 'string' ? new URL(request, base).href : request.url;
  const entryHtml = () => `<html><head>${assets.filter(asset => /\.(js|css)(\?|$)/.test(asset)).map(asset => asset.includes('.css') ? `<link rel="stylesheet" href="${asset}">` : `<script src="${asset}"></script>`).join('')}</head></html>`;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const map = stores.get(name);
      return { async match(request) { return map.get(urlOf(request))?.clone(); },
        async put(request, response) { map.set(urlOf(request), response.clone()); } };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { deleted.push(name); return stores.delete(name); },
  };
  const self = { location: { href: `${base}service-worker.js`, origin },
    addEventListener(name, handler) { events[name] = handler; },
    skipWaiting() { lifecycle.skipped++; }, clients: { claim() { lifecycle.claimed++; } } };
  const context = vm.createContext({ self, caches, URL, Request, Response, fetch: async request => {
    fetched.push(request);
    if (fail?.(request)) throw new Error('Offline or missing dependency');
    const pathname = new URL(request.url).pathname;
    if (pathname.endsWith('/') || pathname.endsWith('/index.html')) {
      return new Response(htmlOverride || entryHtml());
    }
    return new Response(`current:${request.url}`);
  } });
  vm.runInContext(code, context);
  assets = Array.from(vm.runInContext('APP_ASSETS', context));
  const cacheName = vm.runInContext('CACHE_NAME', context);
  async function fire(name) { let pending; events[name]({ waitUntil(promise) { pending = promise; } }); await pending; }
  function request(url, { method = 'GET', mode = 'cors' } = {}) {
    let response;
    events.fetch({ request: { url: new URL(url, base).href, method, mode }, respondWith(promise) { response = promise; } });
    return response;
  }
  function asset(name) {
    const matches = assets.filter(item => new URL(item, base).pathname === new URL(name, base).pathname);
    assert.equal(matches.length, 1, `Expected one versioned release asset for ${name}`);
    return matches[0];
  }
  function otherVersion(name, label) {
    const url = new URL(asset(name), base);
    assert.ok(url.searchParams.has('v'), `Missing release version: ${name}`);
    url.searchParams.set('v', `${url.searchParams.get('v')}-${label}`);
    return url.href;
  }
  return { origin, base, assets, cacheName, events, stores, fetched, deleted, lifecycle, fire, request, asset, otherVersion, entryHtml,
    fail(fn) { fail = fn; }, html(text) { htmlOverride = text; } };
}

test('modern offline entry lists every actual script, style, manifest and icon with no legacy live dependency', () => {
  const h = harness(), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^\"]+)?)"/g)].map(match => match[1]);
  for (const ref of refs) assert.ok(h.assets.includes(`./${ref}`), `Missing offline entry: ${ref}`);
  for (const asset of h.assets.filter(asset => /\.(js|css)(\?|$)/.test(asset))) assert.ok(refs.includes(asset.slice(2)), `Offline shell expects an entry dependency absent from index: ${asset}`);
  for (const asset of h.assets) assert.ok(fs.existsSync(path.join(root, asset.split('?')[0])), `Missing required offline file: ${asset}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  for (const icon of manifest.icons) assert.ok(h.assets.includes(`./${icon.src}`), `Missing manifest icon: ${icon.src}`);
  assert.equal(manifest.start_url, './index.html'); assert.equal(manifest.scope, './');
  assert.ok(!h.assets.some(asset => /^\.\/(app\.js|styles\.css)(\?|$)/.test(asset)));
  assert.ok(!refs.some(asset => /^https?:/.test(asset)));
  assert.ok(h.assets.every(asset => new URL(asset, h.base).origin === h.origin));
});

test('installation fetches the complete same-origin release with HTTP-cache bypass and does not take over open pages', async () => {
  const h = harness(); await h.fire('install');
  assert.equal(h.fetched.length, h.assets.length);
  assert.ok(h.fetched.every(request => request.cache === 'reload' && request.credentials === 'same-origin'));
  const cache = h.stores.get(h.cacheName);
  assert.equal(cache.size, h.assets.length);
  assert.equal(h.lifecycle.skipped, 0); assert.equal(h.lifecycle.claimed, 0);
  const index = await (await h.request('index.html', { mode: 'navigate' })).text();
  assert.ok(index.includes(h.asset('coach-app.js')));
});

test('the existing installed app identity remains its original start URL on GitHub Pages', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  const manifestURL = 'https://vinaynaik432-debug.github.io/german-vocab-coach/manifest.webmanifest';
  const originalIdentity = new URL('./index.html', manifestURL).href;
  // c787737 had no explicit id. An added relative id resolves against the origin,
  // not the project directory, and must not turn an update into a different app.
  assert.equal(Object.hasOwn(manifest, 'id'), false);
  assert.equal(new URL(manifest.start_url, manifestURL).href, originalIdentity);
});

test('failed dependency or mismatched entry prevents installation without altering an earlier release', async () => {
  const h = harness(); const oldName = 'german-vocab-coach-pwa-previous';
  const old = new Map([[`${h.base}index.html`, new Response('old page')]]); h.stores.set(oldName, old);
  h.fail(request => request.url.includes('coach-store.js'));
  await assert.rejects(h.fire('install'), /Offline/);
  assert.equal(h.stores.has(h.cacheName), false); assert.equal(h.stores.get(oldName), old);
  h.fail(null); h.html(h.entryHtml().replace(h.asset('coach-app.js'), h.otherVersion('coach-app.js', 'future')));
  await assert.rejects(h.fire('install'), /different releases/);
  assert.equal(h.stores.has(h.cacheName), false); assert.equal(h.lifecycle.skipped, 0);
});

test('activation removes only older app caches and never claims an already-loaded page', async () => {
  const h = harness(); await h.fire('install');
  h.stores.set('german-vocab-coach-pwa-old', new Map()); h.stores.set('another-app-private-cache', new Map());
  await h.fire('activate');
  assert.deepEqual(h.deleted, ['german-vocab-coach-pwa-old']);
  assert.ok(h.stores.has(h.cacheName)); assert.ok(h.stores.has('another-app-private-cache'));
  assert.equal(h.lifecycle.claimed, 0);
});

test('offline navigation and dependencies come only from the active release, never a cached old shell', async () => {
  const h = harness(); await h.fire('install');
  h.stores.set('german-vocab-coach-pwa-older', new Map([[`${h.base}index.html`, new Response('stale shell')]]));
  const before = h.fetched.length; h.fail(() => true);
  assert.match(await (await h.request('./?return=1', { mode: 'navigate' })).text(), /coach-app/);
  assert.match(await (await h.request(h.asset('coach-store.js'))).text(), /current:/);
  assert.match(await (await h.request('vocabulary-sources.html?from=settings', { mode: 'navigate' })).text(), /current:/);
  assert.equal(h.fetched.length, before);
  assert.equal((await h.request(h.otherVersion('coach-store.js', 'old'))).status, 409);
});

test('cross-origin, non-GET, out-of-scope and private/unlisted requests are not intercepted or cached', async () => {
  const h = harness(); await h.fire('install'); const before = h.fetched.length;
  for (const [url, options] of [
    ['https://analytics.example/track', {}], ['https://coach.example/other/app.js', {}],
    ['private-backup.json', {}], ['api/user-data', {}], [h.asset('coach-app.js'), { method: 'POST' }],
    ['unrelated.html', { mode: 'navigate' }],
  ]) assert.equal(h.request(url, options), undefined);
  assert.equal(h.fetched.length, before);
});

test('an evicted dependency recovers only a complete matching bundle; newer server entries are rejected', async () => {
  const h = harness(); await h.fire('install');
  const target = new URL(h.asset('coach-store.js'), h.base).href, cache = h.stores.get(h.cacheName);
  const originalIndex = await (await h.request('index.html', { mode: 'navigate' })).text();
  cache.delete(target); const before = h.fetched.length;
  assert.equal((await h.request(target)).status, 200);
  assert.equal(h.fetched.length - before, h.assets.length);
  cache.delete(target); h.html(h.entryHtml().replace(h.asset('coach-app.js'), h.otherVersion('coach-app.js', 'next')));
  assert.equal((await h.request(target)).status, 503); assert.equal(cache.has(target), false);
  assert.equal(await (await h.request('index.html', { mode: 'navigate' })).text(), originalIndex);
});
