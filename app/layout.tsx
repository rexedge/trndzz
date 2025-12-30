import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '@/components/ui/sonner';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PushNotificationPrompt } from '@/components/push-notification-prompt';
import { NotificationSoundListener } from '@/components/notification-sound-listener';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		template: '%s | Trend Pulse',
		default: 'Trend Pulse — Fresh, reader-first trend coverage',
	},
	description:
		'Trend Pulse is a minimalist, reader-first blog delivering fresh, well-researched stories from real-time trends.',
	applicationName: 'Trend Pulse',
	generator: 'Next.js',
	keywords: [
		'trends',
		'news',
		'blog',
		'trending',
		'stories',
		'trndzz',
		'nigeria',
	],
	authors: [{ name: 'Trend Pulse' }],
	creator: 'Trend Pulse',
	publisher: 'Trend Pulse',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
		other: [
			{
				rel: 'mask-icon',
				url: '/android-chrome-192x192.png',
			},
		],
	},
	manifest: '/manifest.webmanifest',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Trend Pulse',
	},
	other: {
		'google-adsense-account': 'ca-pub-2109983496009042',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<head>
				<Script
					async
					src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2109983496009042'
					crossOrigin='anonymous'
					strategy='afterInteractive'
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<PostHogProvider>
					{children}
					<PWAInstallPrompt />
					<PushNotificationPrompt />
					<NotificationSoundListener />
					<Toaster richColors />
				</PostHogProvider>
			</body>
		</html>
	);
}
