import { prisma } from '@/lib/prisma/client';
import {
	HeroSection,
	FeaturedPost,
	PostGrid,
	EmptyState,
	Pagination,
	Footer,
} from '@/components/landing';

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

	const [posts, total] = await Promise.all([
		prisma.post.findMany({
			where: { status: 'published' },
			orderBy: { publishedAt: 'desc' },
			take: PAGE_SIZE,
			skip,
		}),
		prisma.post.count({ where: { status: 'published' } }),
	]);

	const totalPages = Math.ceil(total / PAGE_SIZE);
	const hasNext = skip + posts.length < total;
	const hasPrev = page > 1;

	// Separate featured (first) post from the rest on page 1
	const featuredPost = page === 1 && posts.length > 0 ? posts[0] : null;
	const gridPosts = page === 1 ? posts.slice(1) : posts;

	return (
		<main className='min-h-screen bg-background'>
			<HeroSection totalStories={total} />

			{/* Content */}
			<div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
				{posts.length === 0 ? (
					<EmptyState />
				) : (
					<div className='space-y-16'>
						{featuredPost && <FeaturedPost post={featuredPost} />}

						<PostGrid
							posts={gridPosts}
							title={
								page === 1 ? 'Latest Stories' : `Page ${page}`
							}
							totalCount={total}
						/>

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
