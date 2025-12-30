import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma/client';

const baseUrl =
	process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://www.trndzz.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Fetch all published posts
	const posts = await prisma.post.findMany({
		where: { status: 'published' },
		select: {
			slug: true,
			updatedAt: true,
			publishedAt: true,
		},
		orderBy: { publishedAt: 'desc' },
	});

	// Map posts to sitemap entries
	const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${baseUrl}/posts/${post.slug}`,
		lastModified: post.updatedAt,
		changeFrequency: 'weekly',
		priority: 0.8,
	}));

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1.0,
		},
		{
			url: `${baseUrl}/posts`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9,
		},
	];

	return [...staticPages, ...postEntries];
}
