/* eslint-disable no-undef, no-restricted-globals */

// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.

// IMPORTANT - The cache version should be increased any time a new version is deployed to OFS.
const cacheName = 'v1';
let appName = 'NameNotAvailYet';
let hostName = 'hostname-not-avail-yet';
let onLine = null;
let postSuccessMockPayload = null;
let client = null;

/**
 * Method to create console.log messages in a structured format.  Member of VUE methods object.
 *
 * @param val (string) The text to log.
 * @return (void)
 */
let log = function (val) {
	if (typeof val === 'object') {
		let header = new Date().toISOString().slice(0, 19).replace("T", " ") + ' ' + hostName + ' ' + appName + '/service-worker.js: ';
		console.log( header + "\n" + JSON.stringify(val, null, 4) );
	} else {
		// eslint-disable-next-line
		console.log(new Date().toISOString().slice(0, 19).replace("T", " ") + ' ' + hostName + ' ' + appName + '/service-worker.js: ' + val);
	}
}

// INSTALL EVENT - This is the first event sent to the Service Worker.
self.addEventListener('install', (e) => {
	log('install() - BEGIN');
	log('install() - Service Worker Installed');
	return self.skipWaiting();
});

// ACTIVATE EVENT - The primary use of onactivate is for cleanup of resources used in previous versions of a Service worker script.
self.addEventListener('activate', (e) => {
	log('activate() - BEGIN');
	// clear old caches
	e.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cache => {
					if (cache !== cacheName) {
						log('activate() - Current cache version is ' + cacheName  + ', clearing ' + cache + ' cache.');
						return caches.delete(cache);
					}
				})
			)
		})
		.then(function() {
			log('activate() - Service Worker Activated');
			return self.clients.claim();
		})
	);
});

// FETCH EVENT - Implement ANY custom functionality for the fetch API
self.addEventListener('fetch', (e) => {
	log('fetch() - BEGIN');
	if (e.request.method === 'GET') {
		// Exclude some URLs that are used as a result of the VUE dev environment and tools.  Cache everything else.
		if (e.request.url.includes('sockjs') === false && e.request.url.includes('hot-update') === false) {
			e.respondWith(
				fetch(e.request)
					.then(res => {
						const resClone = res.clone();
						caches.open(cacheName).then(cache => {
							if (!/^https?:$/i.test(new URL(e.request.url).protocol)) return;
							log('fetch() - GET, fetch succeeded from network: ' + e.request.url);
							cache.put(e.request, resClone);
						});
						return res;
					})
					.catch(err => caches.match(e.request).then(res => {
						log('fetch() - GET, fetch failed, use cached asset: ' + e.request.url);
						return res;
					}))
			);
		}
	}
	else if (e.request.method === 'POST')
	{
		if (onLine === true)
		{
			log('fetch() - POST, we are online, nothing for the service worker to do.')
		}
		else if (onLine === false)
		{
			log('fetch() - POST, we are offline, send back a mock response.')
			// OFFLINE - Build a mock response payload to satisfy the client.
			// NOTE: The success response from the Part Order Create POST is not very informative (no status, etc).
			// So we only need to mock up the same basic structure.
			var response = {
				body: postSuccessMockPayload,
				init: {
					status: 200,
					statusText: 'OK',
					headers: {
						'Content-Type': 'application/json',
						'X-Mock-Response': 'yes'
					}
				}
			};
			var mockResponse = new Response(JSON.stringify(response.body), response.init);
			console.log('MOCK RESPONSE:');
			console.log(mockResponse);
			e.respondWith(mockResponse);
			// OFFLINE - Pass the POST payload back to the client so it can be cached.
			log('fetch() - POST, we are offline, pass payload back to the client via postMessage().');
			e.request.json( (json) => {
				return json;
			})
			.then( (decoded) => {
				client.postMessage(decoded);
			})
			.catch( (err) => {
				log('Unable to decode JSON from original fetch request!');
			});
		}
		else
		{
			log('fetch() - POST, unknown online state!');
		}
	}
});
// Handle any postMessage() events sent to the Service Worker.
self.addEventListener('message', (evt) => {
    log('TD: Service Worker on Message event: ' + evt)
	if (typeof evt.data.postMsgEvent !== 'undefined') {
		if (evt.data.postMsgEvent === 'init') {
			log('Initializing Service Worker with init data');
			console.log(evt.data);
			// Set some instance properties (used for logging and the post success payload structure)
			appName = evt.data.appName;
			hostName = evt.data.host;
			postSuccessMockPayload = evt.data.postSuccessMockPayload;
			// Remember the window "client" that sent this init message.  We use this to fire messages back
			// to the correct client (window context).
			client = evt.source;
		} else if (evt.data.postMsgEvent === 'online-offline-toggle') {
			log('Online status changed to ' + evt.data.status);
			onLine = evt.data.status;
		}
	}
});