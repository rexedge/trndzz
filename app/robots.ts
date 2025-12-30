import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://www.trndzz.com';

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin/', '/api/'],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
