/* Offline-Speicher der Zeiterfassung. Bei einer neuen Version die Nummer erhöhen. */
const CACHE = 'zeiterfassung-v1.0';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Seite: erst aus dem Netz (neue Version), sonst offline aus dem Speicher
    e.respondWith(fetch(req).then(r => { const k = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', k)); return r; })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
