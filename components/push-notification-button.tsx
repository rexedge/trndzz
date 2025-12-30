'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

type SubscriptionState =
	| 'loading'
	| 'subscribed'
	| 'unsubscribed'
	| 'unsupported';

export function PushNotificationButton() {
	const [state, setState] = useState<SubscriptionState>('loading');
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		checkSubscriptionStatus();
	}, []);

	const checkSubscriptionStatus = async () => {
		// Check if push notifications are supported
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			setState('unsupported');
			return;
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription =
				await registration.pushManager.getSubscription();
			setState(subscription ? 'subscribed' : 'unsubscribed');
		} catch (error) {
			console.error('Error checking subscription:', error);
			setState('unsubscribed');
		}
	};

	const subscribe = async () => {
		setIsProcessing(true);

		try {
			// Register service worker if not already registered
			const registration = await navigator.serviceWorker.register(
				'/sw.js'
			);
			await navigator.serviceWorker.ready;

			// Request notification permission
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				toast.error('Notification permission denied');
				setIsProcessing(false);
				return;
			}

			// Get VAPID public key
			const response = await fetch('/api/push/subscribe');
			const { publicKey } = await response.json();

			if (!publicKey) {
				toast.error('Push notifications not configured');
				setIsProcessing(false);
				return;
			}

			// Subscribe to push notifications
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(publicKey),
			});

			// Send subscription to server
			const saveResponse = await fetch('/api/push/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscription.toJSON()),
			});

			if (!saveResponse.ok) {
				throw new Error('Failed to save subscription');
			}

			setState('subscribed');
			toast.success(
				"🔔 Notifications enabled! You'll be notified of new posts."
			);
		} catch (error) {
			console.error('Subscription error:', error);
			toast.error('Failed to enable notifications');
		} finally {
			setIsProcessing(false);
		}
	};

	const unsubscribe = async () => {
		setIsProcessing(true);

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription =
				await registration.pushManager.getSubscription();

			if (subscription) {
				// Unsubscribe from push
				await subscription.unsubscribe();

				// Remove from server
				await fetch('/api/push/subscribe', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ endpoint: subscription.endpoint }),
				});
			}

			setState('unsubscribed');
			toast.success('Notifications disabled');
		} catch (error) {
			console.error('Unsubscribe error:', error);
			toast.error('Failed to disable notifications');
		} finally {
			setIsProcessing(false);
		}
	};

	// Convert VAPID key to Uint8Array
	const urlBase64ToUint8Array = (base64String: string) => {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, '+')
			.replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	};

	if (state === 'unsupported' || state === 'loading') {
		return null;
	}

	const isSubscribed = state === 'subscribed';

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={isSubscribed ? 'default' : 'outline'}
						size='icon'
						onClick={isSubscribed ? unsubscribe : subscribe}
						disabled={isProcessing}
						className='relative'
					>
						{isProcessing ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : isSubscribed ? (
							<BellRing className='h-4 w-4' />
						) : (
							<Bell className='h-4 w-4' />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>
						{isSubscribed
							? 'Notifications on - Click to disable'
							: 'Get notified of new posts'}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
