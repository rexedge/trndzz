// Service Worker for Push Notifications
// This file should be placed in the public folder

const CACHE_NAME = 'trndzz-v1';

// Install event
self.addEventListener('install', (event) => {
	self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
	event.waitUntil(clients.claim());
});

// Play notification sound in active clients
async function playNotificationSound() {
	try {
		const clientList = await clients.matchAll({
			type: 'window',
			includeUncontrolled: true,
		});

		// Send message to all clients to play sound
		for (const client of clientList) {
			client.postMessage({
				type: 'PLAY_NOTIFICATION_SOUND',
				soundUrl: '/audio/notification_trend_pulse.mp3',
			});
		}
	} catch (error) {
		console.error('Error playing notification sound:', error);
	}
}

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
	if (!event.data) return;

	try {
		const data = event.data.json();

		const options = {
			body: data.body || 'New content available!',
			icon: data.icon || '/android-chrome-192x192.png',
			badge: data.badge || '/favicon-32x32.png',
			image: data.image,
			tag: data.tag || 'default',
			renotify: true,
			requireInteraction: false,
			vibrate: [200, 100, 200],
			silent: false,
			data: {
				url: data.url || '/',
				dateOfArrival: Date.now(),
			},
			actions: [
				{
					action: 'open',
					title: 'Read Now',
				},
				{
					action: 'close',
					title: 'Dismiss',
				},
			],
		};

		event.waitUntil(
			Promise.all([
				self.registration.showNotification(data.title, options),
				playNotificationSound(),
			])
		);
	} catch (error) {
		console.error('Error showing notification:', error);
	}
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'close') return;

	const url = event.notification.data?.url || '/';

	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
				// Check if there's already a window/tab open
				for (const client of clientList) {
					if (client.url === url && 'focus' in client) {
						return client.focus();
					}
				}
				// Open new window if none found
				if (clients.openWindow) {
					return clients.openWindow(url);
				}
			})
	);
});

// Notification close event (for analytics)
self.addEventListener('notificationclose', (event) => {
	// Can be used for analytics
	console.log('Notification closed:', event.notification.tag);
});
