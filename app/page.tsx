import { prisma } from '@/lib/prisma/client';
import {
	FeaturedPost,
	PostGrid,
	EmptyState,
	Pagination,
	TopicsSection,
	TagsSection,
	Footer,
} from '@/components/landing';
import { Ad } from '@/components/ads';

const PAGE_SIZE = 9;

/**
 * Homepage - Modern Blog Landing
 *
 * Design Principles:
 * - Bold, modern hero section
 * - Visual hierarchy with featured post
 * - Smooth hover interactions
 * - Mobile-first responsive design
 */

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const resolvedSearchParams = await searchParams;
	const currentPage = Number.parseInt(resolvedSearchParams?.page ?? '1', 10);
	const page =
		Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
	const skip = (page - 1) * PAGE_SIZE;

	const [posts, total, categories, tagData] = await Promise.all([
		prisma.post.findMany({
			where: { status: 'published' },
			orderBy: { publishedAt: 'desc' },
			take: PAGE_SIZE,
			skip,
		}),
		prisma.post.count({ where: { status: 'published' } }),
		// Get active categories with post counts
		prisma.category.findMany({
			where: { isActive: true },
			include: {
				_count: {
					select: {
						posts: {
							where: { status: 'published' },
						},
					},
				},
			},
			orderBy: { order: 'asc' },
			take: 6,
		}),
		// Get tags from published posts
		prisma.post
			.findMany({
				where: {
					status: 'published',
					tags: { isEmpty: false },
				},
				select: { tags: true },
			})
			.then((posts) => {
				const tagCounts = new Map<string, number>();
				posts.forEach((post) => {
					post.tags.forEach((tag) => {
						tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
					});
				});
				return Array.from(tagCounts.entries())
					.map(([tag, count]) => ({ tag, count }))
					.sort((a, b) => b.count - a.count)
					.slice(0, 20);
			}),
	]);

	const totalPages = Math.ceil(total / PAGE_SIZE);
	const hasNext = skip + posts.length < total;
	const hasPrev = page > 1;

	// Separate featured (first) post from the rest on page 1
	const featuredPost = page === 1 && posts.length > 0 ? posts[0] : null;
	const gridPosts = page === 1 ? posts.slice(1) : posts;

	return (
		<main className='min-h-screen bg-background'>
			{/* Content */}
			<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				{posts.length === 0 ? (
					<EmptyState />
				) : (
					<div className='space-y-16'>
						{featuredPost && <FeaturedPost post={featuredPost} />}

						{/* Ad Slot - After Featured Post */}
						<Ad
							format='horizontal'
							className='my-8'
						/>

						{/* Topics Section - Only on first page */}
						{page === 1 && categories.length > 0 && (
							<TopicsSection categories={categories} />
						)}

						<PostGrid
							posts={gridPosts}
							title={
								page === 1 ? 'Latest Stories' : `Page ${page}`
							}
							totalCount={total}
						/>

						{/* Ad Slot - Between Posts and Tags */}
						<Ad
							format='in-article'
							className='my-8'
						/>

						{/* Tags Section - Only on first page */}
						{page === 1 && tagData.length > 0 && (
							<TagsSection tags={tagData} />
						)}

						<Pagination
							currentPage={page}
							totalPages={totalPages}
							hasNext={hasNext}
							hasPrev={hasPrev}
						/>
					</div>
				)}
			</div>

			<Footer />
		</main>
	);
}
