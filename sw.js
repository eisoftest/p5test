const CACHE_STAT = "stat-v7";
const CACHE_DYNA = "dyna-v7";

let root = "";
const swUrl = self.serviceWorker.scriptURL;
if (swUrl.includes("localhost") === false) {
    const rootStart = swUrl.indexOf('/', 9);
    const rootEnd = swUrl.lastIndexOf('/');
    if (rootStart > -1 && rootEnd > -1 && rootStart < rootEnd) {
        root = swUrl.slice(rootStart, rootEnd);
    }
}

const APPSHELL = [
              root + "/app.js",
              root + "/style.css",
              root + "/favicon.ico",
              root + "/favicon.png",
              root + "/index.html",
              root + "/offline.html",
              root + "/page2.html",
              root + "/img/no_image.png",
              root + "/img/yellow.png",
              root + "/look/icon-192x192.png",
              root + "/look/icon-512x512.png"
];

if (root.length < 1) APPSHELL.unshift('/');



self.addEventListener('install', e => {
    const pStat =  caches.open(CACHE_STAT)
        .then(cache => {
            return cache.addAll(APPSHELL);
        });

    const pDyna =  caches.open(CACHE_DYNA)
        .then(cache => {
            return cache.addAll([root + "/manifest.webmanifest"]);
        });

    e.waitUntil(Promise.all([pStat, pDyna]));
});


self.addEventListener('fetch', e => {
    const response = caches.match(e.request)
    .then(res => {
        if (res) return res;
        return fetch(e.request)
        .then(newResp => {
               caches.open(CACHE_DYNA)
               .then(cache => {
                     cache.put(e.request, newResp);
               });
               return newResp.clone();
        })
        .catch(err => {
              if (e.request.headers.get('accept').includes('text/html')) {
                  return caches.match(root + '/offline.html');
              } else if (e.request.headers.get('accept').includes('image/')) {
                  return caches.match(root + '/img/no_image.png');
              }
         });
    });

    e.respondWith(response);
});


// clearing old caches
self.addEventListener('activate', e => {
    const response = caches.keys()
    .then(keys => {
        keys.forEach(key => {
            if (key !== CACHE_STAT && key.includes('stat-v')) {
                 return caches.delete(key);
            }
            if (key !== CACHE_DYNA && key.includes('dyna-v')) {
                 return caches.delete(key);
            }
        });
    });

    e.waitUntil(response);
});
