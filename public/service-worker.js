const APP_PREFIX = 'Budget-Tracker-';     
const VERSION = 'version_01';
const FILE_CACHE_NAME = APP_PREFIX + VERSION + '_FILES'
const FILES_TO_CACHE = [
  "./index.html",
  "./css/style.css",
  "./icons/icon-512x512.png",
  "./icons/icon-384x384.png",
  "./icons/icon-192x192.png",
  "./icons/icon-152x152.png",
  "./icons/icon-144x144.png",
  "./icons/icon-128x128.png",
  "./icons/icon-96x96.png",
  "./icons/icon-72x72.png",
  "./manifest.json",
  "./js/idb.js",
  "./js/index.js"
];

const DATA_CACHE_NAME = APP_PREFIX + VERSION + '_DATA'

// Cache resources
self.addEventListener('install', function (e) {
  //ensures the service worker doesnt move on until the installation is fully completed
  e.waitUntil(
    //open a specific cache by name
    caches.open(FILE_CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + FILE_CACHE_NAME)
      //add files from array to cache
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
  //make sure it doesnt move on until the last step is fully completed
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // `keyList` contains all cache names under your username.github.io
      // filter out ones that has this app prefix to create keeplist
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      })
      // add current cache name to keeplist
      cacheKeeplist.push(FILE_CACHE_NAME);

      //resolves when all old cache versions are deleted
      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeeplist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i]);
        }
      }));
    })
  );
});

// Respond with cached resources
self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/")) {
      e.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(e.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(e.request.url, response.clone());
                }
  
                return response;
              })
              .catch(() => {
                return cache.match(e.request);
              });
          })
          .catch((error) => console.log(error))
      );
  
      return;
    }
  
    e.respondWith(
      fetch(e.request).catch(function () {
        return caches.match(e.request).then(function (response) {
          if (response) {
            return response;
          } else if (e.request.headers.get("accept").includes("text/html")) {
            return caches.match("/");
          }
        });
      })
    );
  });