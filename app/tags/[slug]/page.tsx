import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
} from '@/components/ui/empty';

interface TagPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: TagPageProps): Promise<Metadata> {
	const { slug } = await params;
	const tag = slug.replace(/-/g, ' ');

	return {
		title: `#${tag} - TrendPulse`,
		description: `Read the latest articles tagged with ${tag}. Discover trending content and insights.`,
	};
}

export default async function TagPage({ params }: TagPageProps) {
	const { slug } = await params;

	// Convert slug back to tag (e.g., "ai-technology" -> "AI Technology")
	const tagQuery = slug.replace(/-/g, ' ');

	// Find posts with this tag (case-insensitive)
	const posts = await prisma.post.findMany({
		where: {
			status: 'published',
			tags: {
				hasSome: [tagQuery],
			},
		},
		orderBy: {
			publishedAt: 'desc',
		},
		take: 50,
		include: {
			images: {
				orderBy: { order: 'asc' },
				take: 1,
			},
			category: true,
		},
	});

	// If no posts found, try case-insensitive search across all tags
	if (posts.length === 0) {
		const allPosts = await prisma.post.findMany({
			where: {
				status: 'published',
				tags: {
					isEmpty: false,
				},
			},
			select: {
				id: true,
				tags: true,
			},
		});

		// Find exact tag match
		const matchingPostIds = allPosts
			.filter((post) =>
				post.tags.some(
					(t) => t.toLowerCase() === tagQuery.toLowerCase()
				)
			)
			.map((p) => p.id);

		if (matchingPostIds.length > 0) {
			const matchedPosts = await prisma.post.findMany({
				where: {
					id: { in: matchingPostIds },
					status: 'published',
				},
				orderBy: {
					publishedAt: 'desc',
				},
				take: 50,
				include: {
					images: {
						orderBy: { order: 'asc' },
						take: 1,
					},
					category: true,
				},
			});

			// Get the actual tag name (with proper casing)
			const actualTag = allPosts
				.flatMap((p) => p.tags)
				.find((t) => t.toLowerCase() === tagQuery.toLowerCase());

			return renderTagPage(actualTag || tagQuery, matchedPosts);
		}
	}

	// Get actual tag name from posts
	const actualTag =
		posts.length > 0
			? posts[0].tags.find(
					(t) => t.toLowerCase() === tagQuery.toLowerCase()
			  ) || tagQuery
			: tagQuery;

	if (posts.length === 0) {
		notFound();
	}

	return renderTagPage(actualTag, posts);
}

function renderTagPage(
	tag: string,
	posts: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		tags: string[];
		featuredImageUrl: string | null;
		featuredImageAlt: string | null;
		images: Array<{ url: string; alt: string | null }>;
		category: { name: string; slug: string } | null;
	}>
) {
	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Header */}
			<div className='mb-8 border-b pb-6'>
				<Link
					href='/tags'
					className='text-sm text-muted-foreground hover:text-foreground mb-3 inline-block'
				>
					← All Tags
				</Link>
				<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-3'>
					#{tag}
				</h1>
				<div className='mt-4'>
					<Badge
						variant='secondary'
						className='text-xs'
					>
						{posts.length} article{posts.length !== 1 ? 's' : ''}
					</Badge>
				</div>
			</div>

			{/* Posts Grid */}
			{posts.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{posts.map((post) => (
						<Link
							key={post.id}
							href={`/posts/${post.slug}`}
							className='group block'
						>
							<article>
								{/* Featured Image */}
								{(post.featuredImageUrl ||
									post.images[0]?.url) && (
									<div className='relative aspect-[16/9] overflow-hidden bg-muted mb-3'>
										<Image
											src={
												post.featuredImageUrl ||
												post.images[0].url
											}
											alt={
												post.featuredImageAlt ||
												post.images[0]?.alt ||
												post.title
											}
											fill
											className='object-cover transition-transform duration-300 group-hover:scale-105'
											sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
										/>
									</div>
								)}

								<div className='space-y-2'>
									{post.category && (
										<Badge
											variant='secondary'
											className='text-xs uppercase tracking-wide font-semibold'
										>
											{post.category.name}
										</Badge>
									)}

									<h2 className='text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors'>
										{post.title}
									</h2>

									{post.excerpt && (
										<p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
											{post.excerpt}
										</p>
									)}

									{post.tags.filter((t) => t !== tag).length >
										0 && (
										<div className='flex flex-wrap gap-1.5 pt-2'>
											{post.tags
												.filter((t) => t !== tag)
												.slice(0, 2)
												.map((t) => (
													<Badge
														key={t}
														variant='outline'
														className='text-xs'
													>
														{t}
													</Badge>
												))}
										</div>
									)}
								</div>
							</article>
						</Link>
					))}
				</div>
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>No posts found</EmptyTitle>
						<EmptyDescription>
							No articles have been tagged with &quot;{tag}&quot;
							yet.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
