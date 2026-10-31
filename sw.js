/* Service worker Album SWTQIS-10: gambar cache-dulu (tampil seketika, diperbarui diam-diam), halaman jaringan-dulu */
const V = 'album-swtqis-v2';
const GAMBAR = /\.(?:webp|jpe?g|png|gif|avif|svg|ico)$/i;
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('album-swtqis-') === 0 && k !== V; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});
function simpan(r, res) {
  if (res && res.ok && res.status === 200) { const c = res.clone(); caches.open(V).then(function (x) { x.put(r, c); }).catch(function () {}); }
  return res;
}
self.addEventListener('fetch', function (e) {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // Apps Script & font tidak diurus di sini
  if (GAMBAR.test(u.pathname)) {
    e.respondWith(caches.match(r).then(function (m) {
      const net = fetch(r).then(function (res) { return simpan(r, res); }).catch(function () { return m; });
      if (m) { e.waitUntil(net); return m; }
      return net;
    }));
    return;
  }
  e.respondWith(
    fetch(r).then(function (res) { return simpan(r, res); }).catch(function () {
      return caches.match(r).then(function (m) { return m || caches.match('./'); });
    })
  );
});
