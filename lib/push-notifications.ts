import { prisma } from '@/lib/prisma/client';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:hello@trndzz.com';

if (vapidPublicKey && vapidPrivateKey) {
	webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

interface NotificationPayload {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	url?: string;
	tag?: string;
}

/**
 * Send push notification to all subscribers
 */
export async function sendPushNotification(payload: NotificationPayload) {
	if (!vapidPublicKey || !vapidPrivateKey) {
		console.warn('VAPID keys not configured, skipping push notification');
		return { success: false, error: 'VAPID keys not configured' };
	}

	const subscriptions = await prisma.pushSubscription.findMany();

	if (subscriptions.length === 0) {
		return { success: true, sent: 0, message: 'No subscribers' };
	}

	const notificationPayload = JSON.stringify({
		...payload,
		icon: payload.icon || '/android-chrome-192x192.png',
		badge: payload.badge || '/favicon-32x32.png',
	});

	const results = await Promise.allSettled(
		subscriptions.map(async (sub) => {
			try {
				await webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.p256dh,
							auth: sub.auth,
						},
					},
					notificationPayload
				);
				return { success: true, endpoint: sub.endpoint };
			} catch (error: any) {
				// Remove invalid subscriptions (410 Gone, 404 Not Found)
				if (error.statusCode === 410 || error.statusCode === 404) {
					await prisma.pushSubscription.delete({
						where: { endpoint: sub.endpoint },
					});
				}
				return {
					success: false,
					endpoint: sub.endpoint,
					error: error.message,
				};
			}
		})
	);

	const successful = results.filter(
		(r) => r.status === 'fulfilled' && r.value.success
	).length;
	const failed = results.length - successful;

	return {
		success: true,
		sent: successful,
		failed,
		total: subscriptions.length,
	};
}

/**
 * Send notification for a new published post
 */
export async function notifyNewPost(post: {
	title: string;
	slug: string;
	excerpt?: string | null;
	featuredImageUrl?: string | null;
}) {
	const baseUrl =
		process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://www.trndzz.com';

	return sendPushNotification({
		title: '📰 New Story on Trend Pulse',
		body: post.excerpt || post.title,
		image: post.featuredImageUrl || undefined,
		url: `${baseUrl}/posts/${post.slug}`,
		tag: `post-${post.slug}`, // Prevents duplicate notifications
	});
}
