const CACHE_NAME = 'mylibaas-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

const DYNAMIC_CACHE = 'mylibaas-dynamic-v1';

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Listen for requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the dynamic content
            if (event.request.method === 'GET') {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Return offline fallback for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Activate the Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle offline data sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Background sync for messages
async function syncMessages() {
  try {
    const messagesDb = await openDB('messages');
    const unsentMessages = await messagesDb.getAll('outbox');
    
    for (const message of unsentMessages) {
      await fetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });
      await messagesDb.delete('outbox', message.id);
    }
  } catch (error) {
    console.error('Error syncing messages:', error);
  }
}

// Background sync for bookings
async function syncBookings() {
  try {
    const bookingsDb = await openDB('bookings');
    const pendingBookings = await bookingsDb.getAll('pending');
    
    for (const booking of pendingBookings) {
      await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(booking)
      });
      await bookingsDb.delete('pending', booking.id);
    }
  } catch (error) {
    console.error('Error syncing bookings:', error);
  }
}
