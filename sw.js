/* NINNA service worker: cache-first sull'app shell, cache versionata su
   APP_VERSION (ogni rilascio la rinnova). Nessuna risorsa esterna: font,
   icone e codice sono tutti serviti dall'origine dell'app. */
const CACHE = "ninna-v1.7.0";
const SHELL = [
  "./", "index.html", "styles.css", "manifest.webmanifest",
  "js/app.js", "js/i18n.js", "js/engine.js", "js/sounds.js", "js/content-store.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/brandmark.png",
  "fonts/fraunces-600.woff2", "fonts/albertsans-400.woff2", "fonts/albertsans-500.woff2",
  "fonts/albertsans-600.woff2", "fonts/albertsans-400-italic.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // nessuna risorsa esterna: niente da gestire

  // cache-first: l'app parte dalla cache, la rete si tocca solo per cio' che manca.
  // La cache e' versionata su APP_VERSION, quindi ogni rilascio la rinnova da solo.
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match("./"));
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow("./");
    })
  );
});
