/* SKILL-ISSUE cache isolation for the personal site's root Service Worker. */
(() => {
  function skillIssueCacheIsolation(rawUrl) {
    const url = new URL(rawUrl, self.location.origin);
    return url.origin === self.location.origin &&
      (url.pathname === '/skill-issue' || url.pathname.startsWith('/skill-issue/'));
  }

  // Register first: do not let Chirpy's cache-first fetch handler run for this
  // independent project, even when a stale response already exists in CacheStorage.
  self.addEventListener('fetch', (event) => {
    if (skillIssueCacheIsolation(event.request.url)) {
      event.stopImmediatePropagation();
    }
  });

  // Activate this update without requiring the visitor to accept a Chirpy toast.
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      for (const name of await caches.keys()) {
        if (!name.startsWith('chirpy-')) continue;
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          if (skillIssueCacheIsolation(request.url)) await cache.delete(request);
        }
      }
      await self.clients.claim();
    })());
  });
})();
