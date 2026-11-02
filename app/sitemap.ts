import type { MetadataRoute } from 'next';
import { ArticleStatus, VerticalStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const entries: MetadataRoute.Sitemap = [
		{
			url: buildMacroUrl('/'),
			lastModified: new Date(),
			changeFrequency: 'hourly',
			priority: 1.0,
		},
		{
			url: buildMacroUrl('/verticals'),
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: buildMacroUrl('/news'),
			lastModified: new Date(),
			changeFrequency: 'hourly',
			priority: 0.9,
		},
	];

	try {
		const [verticals, articles, companies] = await Promise.all([
			prisma.vertical.findMany({
				where: { status: VerticalStatus.ACTIVE },
				select: { slug: true, updatedAt: true },
			}),
			prisma.article.findMany({
				where: { status: ArticleStatus.PUBLISHED },
				select: {
					slug: true,
					updatedAt: true,
					vertical: { select: { slug: true } },
				},
				orderBy: { publishedAt: 'desc' },
				take: 500,
			}),
			prisma.company.findMany({
				where: { isPublished: true },
				select: {
					slug: true,
					updatedAt: true,
					verticals: {
						where: { isPrimary: true },
						take: 1,
						select: { vertical: { select: { slug: true } } },
					},
				},
				take: 1000,
			}),
		]);

		for (const v of verticals) {
			for (const subPath of [
				'/',
				'/pulse',
				'/prices',
				'/directory',
				'/products',
				'/rfq',
			]) {
				entries.push({
					url: buildVerticalUrl(v.slug, subPath),
					lastModified: v.updatedAt,
					changeFrequency: 'hourly',
					priority: subPath === '/' ? 0.95 : 0.85,
				});
			}
		}

		for (const a of articles) {
			const url = a.vertical?.slug
				? buildVerticalUrl(a.vertical.slug, `/pulse/${a.slug}`)
				: buildMacroUrl(`/news/${a.slug}`);
			entries.push({
				url,
				lastModified: a.updatedAt,
				changeFrequency: 'weekly',
				priority: 0.8,
			});
		}

		for (const c of companies) {
			const primarySlug = c.verticals[0]?.vertical.slug ?? 'aluminium';
			entries.push({
				url: buildVerticalUrl(primarySlug, `/directory/${c.slug}`),
				lastModified: c.updatedAt,
				changeFrequency: 'weekly',
				priority: 0.85,
			});
		}
	} catch {
		// Return base entries gracefully if DB is unreachable at build time
	}

	return entries;
}
