import { verifySessionToken, getTokenFromCookies } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { SeoClient } from './_client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SeoPage() {
	const token = await getTokenFromCookies();
	const isAuthed = await verifySessionToken(token);

	if (!isAuthed) {
		redirect('/admin');
	}

	// Fetch initial data
	const [categories, keywords, contentPlans, recentPosts] = await Promise.all(
		[
			prisma.category.findMany({
				orderBy: { order: 'asc' },
				include: {
					_count: {
						select: {
							posts: true,
							keywords: true,
							contentPlans: true,
						},
					},
				},
			}),
			prisma.keyword.findMany({
				orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
				take: 50,
				include: { category: true },
			}),
			prisma.contentPlan.findMany({
				orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
				include: { category: true },
			}),
			prisma.post.findMany({
				orderBy: { createdAt: 'desc' },
				take: 20,
				select: {
					id: true,
					title: true,
					slug: true,
					status: true,
					categoryId: true,
					focusKeyword: true,
					metaDescription: true,
					publishedAt: true,
					category: true,
				},
			}),
		]
	);

	// Calculate stats
	const totalPosts = await prisma.post.count();
	const postsWithCategory = await prisma.post.count({
		where: { categoryId: { not: null } },
	});
	const postsWithFocusKeyword = await prisma.post.count({
		where: { focusKeyword: { not: null } },
	});
	const postsWithMetaDescription = await prisma.post.count({
		where: { metaDescription: { not: null } },
	});

	const stats = {
		totalPosts,
		postsWithCategory,
		postsWithFocusKeyword,
		postsWithMetaDescription,
		totalCategories: categories.length,
		totalKeywords: keywords.length,
		contentPlansIdea: contentPlans.filter((p) => p.status === 'idea')
			.length,
		contentPlansPlanned: contentPlans.filter((p) => p.status === 'planned')
			.length,
		contentPlansWriting: contentPlans.filter((p) => p.status === 'writing')
			.length,
	};

	return (
		<SeoClient
			initialCategories={categories}
			initialKeywords={keywords}
			initialContentPlans={contentPlans}
			initialPosts={recentPosts}
			stats={stats}
		/>
	);
}
