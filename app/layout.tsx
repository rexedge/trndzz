import type { Metadata } from 'next';
import {
	Inter,
	JetBrains_Mono,
	Plus_Jakarta_Sans,
} from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
	variable: '--font-plus-jakarta',
	subsets: ['latin'],
	weight: ['700', '800'],
	display: 'swap',
});

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	weight: ['500'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: {
		template: '%s | TRNDZZ',
		default:
			'TRNDZZ — Industrial B2B Trade Intelligence, Supplier Directory & RFQ Ecosystem',
	},
	description:
		'Multi-tenant B2B trade intelligence, SON/ISO-verified industrial supplier registries, commodity price trackers, and specification-driven RFQ procurement across West Africa.',
	applicationName: 'TRNDZZ',
	keywords: [
		'B2B procurement Nigeria',
		'aluminium suppliers Nigeria',
		'industrial RFQ West Africa',
		'aluminium coils price Lagos',
		'verified manufacturers directory',
		'trndzz',
	],
	authors: [{ name: 'TRNDZZ Trade Intelligence' }],
	creator: 'TRNDZZ',
	publisher: 'TRNDZZ',
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
	},
	manifest: '/manifest.webmanifest',
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
		<html
			lang='en'
			suppressHydrationWarning
		>
			<body
				className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
			>
				<ThemeProvider>
					<PostHogProvider>
						{children}
						<Toaster richColors />
					</PostHogProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
