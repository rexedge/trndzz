'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PROMPT_STORAGE_KEY = 'push-notification-prompt-last-shown';
const PROMPT_COOLDOWN_HOURS = 24;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray.buffer as ArrayBuffer;
}

export function PushNotificationPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSupported, setIsSupported] = useState(true);

	const checkAndShowPrompt = useCallback(async () => {
		// Check if push notifications are supported
		if (
			typeof window === 'undefined' ||
			!('serviceWorker' in navigator) ||
			!('PushManager' in window) ||
			!('Notification' in window)
		) {
			setIsSupported(false);
			return;
		}

		// Check if already subscribed
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription =
				await registration.pushManager.getSubscription();

			if (subscription) {
				// Already subscribed, don't show prompt
				return;
			}

			// Check if notification permission is denied
			if (Notification.permission === 'denied') {
				return;
			}

			// Check cooldown
			const lastShown = localStorage.getItem(PROMPT_STORAGE_KEY);
			if (lastShown) {
				const lastShownDate = new Date(lastShown);
				const hoursSinceLastShown =
					(Date.now() - lastShownDate.getTime()) / (1000 * 60 * 60);
				if (hoursSinceLastShown < PROMPT_COOLDOWN_HOURS) {
					return;
				}
			}

			// Show prompt after a short delay
			setTimeout(() => {
				setShowPrompt(true);
				localStorage.setItem(
					PROMPT_STORAGE_KEY,
					new Date().toISOString()
				);
			}, 2000);
		} catch (error) {
			console.error('Error checking push subscription:', error);
		}
	}, []);

	useEffect(() => {
		checkAndShowPrompt();
	}, [checkAndShowPrompt]);

	const handleSubscribe = async () => {
		setIsLoading(true);

		try {
			// Request notification permission
			const permission = await Notification.requestPermission();

			if (permission !== 'granted') {
				toast.error('Notification permission denied', {
					description:
						'Please enable notifications in your browser settings.',
				});
				setIsLoading(false);
				return;
			}

			// Get service worker registration
			const registration = await navigator.serviceWorker.ready;

			// Get VAPID public key
			const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

			if (!vapidPublicKey) {
				throw new Error('VAPID public key not configured');
			}

			// Subscribe to push notifications
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
			});

			// Send subscription to server
			const response = await fetch('/api/push/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscription.toJSON()),
			});

			if (!response.ok) {
				throw new Error('Failed to save subscription');
			}

			toast.success('🎉 Notifications enabled!', {
				description:
					"You'll be notified when new trending topics are published.",
			});

			// Play a success sound
			try {
				const audio = new Audio('/audio/notification_trend_pulse.mp3');
				audio.volume = 0.5;
				await audio.play();
			} catch {
				// Ignore audio errors
			}

			// Close the prompt
			setShowPrompt(false);
		} catch (error) {
			console.error('Error subscribing to push notifications:', error);
			toast.error('Failed to enable notifications', {
				description: 'Please try again later.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDismiss = () => {
		setShowPrompt(false);
	};

	if (!isSupported) {
		return null;
	}

	return (
		<AnimatePresence>
			{showPrompt && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm'
						onClick={handleDismiss}
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{
							type: 'spring',
							damping: 25,
							stiffness: 300,
						}}
						className='fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2'
					>
						<div className='relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 shadow-2xl'>
							{/* Decorative elements */}
							<div className='absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl' />
							<div className='absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl' />

							{/* Close button */}
							<button
								title='dismiss'
								onClick={handleDismiss}
								className='absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white'
							>
								<X className='h-5 w-5' />
							</button>

							{/* Content */}
							<div className='relative z-10 flex flex-col items-center text-center'>
								{/* Animated bell icon */}
								<motion.div
									animate={{
										rotate: [0, -10, 10, -10, 10, 0],
									}}
									transition={{
										duration: 0.5,
										repeat: Infinity,
										repeatDelay: 2,
									}}
									className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur'
								>
									<BellRing className='h-8 w-8 text-white' />
								</motion.div>

								{/* Sparkles decoration */}
								<motion.div
									animate={{ opacity: [0.5, 1, 0.5] }}
									transition={{
										duration: 2,
										repeat: Infinity,
									}}
									className='absolute right-8 top-12'
								>
									<Sparkles className='h-5 w-5 text-yellow-300' />
								</motion.div>

								<h3 className='mb-2 text-xl font-bold text-white'>
									Stay in the Loop! 🔥
								</h3>

								<p className='mb-6 text-sm text-white/80'>
									Get instant notifications when new trending
									topics drop. Never miss what&apos;s buzzing!
								</p>

								{/* Action buttons */}
								<div className='flex w-full flex-col gap-2'>
									<Button
										onClick={handleSubscribe}
										disabled={isLoading}
										className='w-full bg-white text-purple-600 shadow-lg hover:bg-white/90'
									>
										{isLoading ? (
											<>
												<motion.div
													animate={{ rotate: 360 }}
													transition={{
														duration: 1,
														repeat: Infinity,
														ease: 'linear',
													}}
													className='mr-2 h-4 w-4 rounded-full border-2 border-purple-600 border-t-transparent'
												/>
												Enabling...
											</>
										) : (
											<>
												<Bell className='mr-2 h-4 w-4' />
												Enable Notifications
											</>
										)}
									</Button>

									<Button
										onClick={handleDismiss}
										variant='ghost'
										className='w-full text-white/70 hover:bg-white/10 hover:text-white'
									>
										Maybe Later
									</Button>
								</div>

								<p className='mt-4 text-xs text-white/50'>
									You can change this anytime in settings
								</p>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
