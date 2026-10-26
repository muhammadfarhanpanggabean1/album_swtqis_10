/* Service worker Album SWTQIS-10: jaringan dulu, cadangan dari cache bila offline */
const V = 'album-swtqis-v1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('album-swtqis-') === 0 && k !== V; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function (e) {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // Apps Script & font tidak diurus di sini
  e.respondWith(
    fetch(r).then(function (res) {
      if (res.ok) { const c = res.clone(); caches.open(V).then(function (x) { x.put(r, c); }); }
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) { return m || caches.match('./'); });
    })
  );
});
