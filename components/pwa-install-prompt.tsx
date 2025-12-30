'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa-install-prompt-dismissed';
const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		// Check if prompt should be shown
		const checkPromptEligibility = () => {
			const lastDismissed = localStorage.getItem(STORAGE_KEY);
			if (!lastDismissed) return true;

			const timeSinceDismiss = Date.now() - parseInt(lastDismissed);
			return timeSinceDismiss > ONE_DAY;
		};

		// Check if already installed
		if (
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true
		) {
			return;
		}

		// Listen for the beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			const promptEvent = e as BeforeInstallPromptEvent;

			// Check if we should show the prompt
			if (checkPromptEligibility()) {
				setDeferredPrompt(promptEvent);
				// Delay showing the prompt slightly for better UX
				setTimeout(() => setShowPrompt(true), 3000);
			}
		};

		window.addEventListener(
			'beforeinstallprompt',
			handleBeforeInstallPrompt
		);

		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt
			);
		};
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;

		// Show the install prompt
		await deferredPrompt.prompt();

		// Wait for the user's response
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('User accepted the install prompt');
		}

		// Clear the deferredPrompt
		setDeferredPrompt(null);
		setShowPrompt(false);
	};

	const handleDismiss = () => {
		// Store the timestamp
		localStorage.setItem(STORAGE_KEY, Date.now().toString());
		setShowPrompt(false);
	};

	if (!showPrompt || !deferredPrompt) return null;

	return (
		<div className='fixed inset-x-0 bottom-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm animate-in slide-in-from-bottom-4 duration-500'>
			<Card className='relative overflow-hidden border-2 border-primary/20 bg-linear-to-br from-background via-background to-primary/5 shadow-2xl backdrop-blur-sm'>
				{/* Decorative gradient overlay */}
				<div className='absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-50' />

				<div className='relative p-5 space-y-4'>
					{/* Close button */}
					<Button
						variant='ghost'
						size='icon'
						className='absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-destructive/10'
						onClick={handleDismiss}
					>
						<X className='h-4 w-4' />
						<span className='sr-only'>Dismiss</span>
					</Button>

					{/* Icon */}
					<div className='flex items-center justify-center'>
						<div className='rounded-full bg-linear-to-br from-primary to-primary/60 p-3 shadow-lg'>
							<Smartphone className='h-6 w-6 text-primary-foreground' />
						</div>
					</div>

					{/* Content */}
					<div className='space-y-2 text-center'>
						<h3 className='text-lg font-bold tracking-tight'>
							Install Trend Pulse
						</h3>
						<p className='text-sm text-muted-foreground leading-relaxed'>
							Get instant access to trending stories. Install our
							app for a faster, better reading experience—even
							offline!
						</p>
					</div>

					{/* Actions */}
					<div className='flex flex-col gap-2'>
						<Button
							onClick={handleInstall}
							className='w-full gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg'
							size='lg'
						>
							<Download className='h-4 w-4' />
							Install App
						</Button>
						<Button
							variant='ghost'
							onClick={handleDismiss}
							className='w-full'
							size='sm'
						>
							Maybe later
						</Button>
					</div>

					{/* Benefits */}
					<div className='pt-2 border-t border-border/50'>
						<div className='grid grid-cols-3 gap-2 text-xs text-muted-foreground'>
							<div className='flex flex-col items-center gap-1'>
								<span className='font-semibold text-foreground'>
									⚡
								</span>
								<span className='text-center'>Fast</span>
							</div>
							<div className='flex flex-col items-center gap-1'>
								<span className='font-semibold text-foreground'>
									📱
								</span>
								<span className='text-center'>Native</span>
							</div>
							<div className='flex flex-col items-center gap-1'>
								<span className='font-semibold text-foreground'>
									🔒
								</span>
								<span className='text-center'>Secure</span>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
