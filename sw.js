const CACHE = 'ronrutina-v9';
const ARCHIVOS = ['./', './index.html', './fb.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
/* Avisos de Ron (notificaciones push) */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { cuerpo: e.data ? e.data.text() : '' }; }
  const op = { body: d.cuerpo || '¡Miau! Tienes algo pendiente 🐾', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: d.url || '#hoy' } };
  if (d.tag) { op.tag = d.tag; op.renotify = true; }
  e.waitUntil(self.registration.showNotification(d.titulo || '🐾 Ron', op));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = new URL((e.notification.data && e.notification.data.url) || '#hoy', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) { if ('focus' in c) { if ('navigate' in c) c.navigate(destino).catch(() => { }); return c.focus(); } }
    return self.clients.openWindow(destino);
  }));
});
