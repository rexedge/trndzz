'use client';

import { useEffect } from 'react';

export function NotificationSoundListener() {
	useEffect(() => {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			return;
		}

		const handleMessage = async (event: MessageEvent) => {
			if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
				try {
					const audio = new Audio(event.data.soundUrl);
					audio.volume = 0.7;
					await audio.play();
				} catch (error) {
					console.error('Error playing notification sound:', error);
				}
			}
		};

		navigator.serviceWorker.addEventListener('message', handleMessage);

		return () => {
			navigator.serviceWorker.removeEventListener(
				'message',
				handleMessage
			);
		};
	}, []);

	return null;
}
