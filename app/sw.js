// Examples of service worker implementations:
// https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker

var CACHE_NAME = "v8";
var urlsToCache = [
  '/wonderful.jpg',
  '/cat.jpg',
  '/my404.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Respond with is a method from the FetchEvent.
  // It prevents the browser's default fetch
  // handling. It allows me to fetch my custom stuff.
  event.respondWith(
    // Checks if a specific request is in any of the caches.
    caches.match(event.request)
      // The fullfill state deals with all request, even those
      // which are not cached. Therefore, we do not need
      // a reject (catch) for the promise.
      .then(function(response) {
        if (response) {
          return response;
        }

        // Requests which are not in the request are fetched
        return fetch(event.request)
          .then(function(response) {
            // If there response yields a 404 show user
            // custom 404 page
            if (response.status === 404) {
              return caches.match('/my404.html');
            }

            // If we haven't fetched this request yet,
            // store it in the cache
            return caches.open(CACHE_NAME)
              .then(function(cache) {
                return fetch(event.request)
                  .then(function(response) {
                    return cache.put(event.request, response.clone())
                      .then(function() {
                        return response;
                      });
                  });
              });
          })
          .catch(function() {
            return new Response('That totally failed');
          });
      })
  )
});


self.addEventListener('activate', function(event) {
  // The activation event fires whenever a new service
  // worker is installed. The new service worker
  // is first installed than activated. As long as
  // there are any pages still loading the worker is
  // in waiting status.
  // The activation event is a good place to
  // remove old unneeded service workers!

  // Remove old caches
  // The wait until event stops the activation process until some
  // work has been done. Here: The deletion of old caches. It
  // takes a promise as an argument.
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      // Returns a single promise after all promises
      // have been resolved.
      // Actually we do not need this call here because we do not
      // provide Promises.all with promises.
      return Promise.all(
        // Get all caches which are not the current cache
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('v') && cacheName != CACHE_NAME;
        // Remove all old caches
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
