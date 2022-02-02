self.addEventListener('push', function (event) {
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	const title = 'Push Codelab';
	const options = {
		body: 'Yay it works.',
		icon: 'snowflakes.network.svg',
		badge: 'snowflakes.network.svg'
	};

	event.waitUntil(self.registration.showNotification(title, options));
});
