// Self-destroying service worker served at the site root (/sw.js).
//
// Earlier versions of Found Words registered a service worker at '/' (scope '/').
// The app now lives at /app/ with its own worker (/app/sw.js), so this root worker
// exists only to release anyone whose browser still has the old '/' worker cached:
// it unregisters itself, clears old caches, and reloads open pages so returning
// visitors get the new homepage instead of a stale cached app shell.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch (e) { /* ignore */ }
    try { await self.registration.unregister() } catch (e) { /* ignore */ }
    try {
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        if (client.url && new URL(client.url).pathname === '/') client.navigate(client.url)
      }
    } catch (e) { /* ignore */ }
  })())
})
