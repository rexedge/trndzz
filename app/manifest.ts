import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'TRNDZZ — B2B Industrial Trade & Procurement Ecosystem',
		short_name: 'TRNDZZ',
		description:
			'Multi-tenant B2B trade intelligence, verified supplier directories, and specification-driven RFQ procurement.',
		start_url: '/',
		display: 'standalone',
		background_color: '#0b0f19',
		theme_color: '#1d4ed8',
		icons: [
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
	};
}
