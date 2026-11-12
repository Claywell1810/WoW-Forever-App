/* GitHub-Pages-PWA: zuletzt online geladene App-Dateien auch offline anzeigen. */
const CACHE = "wow-forever-v6-20261112-ux";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./spellbook.js", "./ux.js", "./ux.css"];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // App beim Update frisch vom öffentlichen GitHub-Pages-Host cachen.
    await Promise.allSettled(FILES.map(async path => {
      const response = await fetch(path, { cache: "no-store" });
      if (response.ok && !response.redirected && new URL(response.url).origin === self.location.origin) {
        await cache.put(path, response);
      }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith("wow-forever-") && n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/cdn-cgi/")) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok && !response.redirected && new URL(response.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      const cache = await caches.open(CACHE);
      return (await cache.match(event.request)) || (event.request.mode === "navigate" ? await cache.match("./index.html") : null) || new Response("Offline – bitte einmal online die App öffnen.", {status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
    }
  })());
});
