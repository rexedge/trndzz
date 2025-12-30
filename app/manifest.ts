import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Trend Pulse',
		short_name: 'Trndzz',
		description:
			'Trend Pulse is a minimalist, reader-first blog delivering fresh, well-researched stories from real-time trends.',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#000000',
		orientation: 'portrait-primary',
		icons: [
			{
				src: '/favicon.ico',
				sizes: 'any',
				type: 'image/x-icon',
			},
			{
				src: '/favicon-16x16.png',
				sizes: '16x16',
				type: 'image/png',
			},
			{
				src: '/favicon-32x32.png',
				sizes: '32x32',
				type: 'image/png',
			},
			{
				src: '/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'maskable',
			},
			{
				src: '/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
		categories: ['news', 'lifestyle', 'entertainment'],
		lang: 'en-NG',
		dir: 'ltr',
	};
}
