import type { MetadataRoute } from 'next';
import { buildMacroUrl } from '@/lib/tenancy/host';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin/', '/dashboard/', '/api/'],
			},
		],
		sitemap: buildMacroUrl('/sitemap.xml'),
	};
}
