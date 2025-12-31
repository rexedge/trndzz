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

interface TopicPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: TopicPageProps): Promise<Metadata> {
	const { slug } = await params;

	const category = await prisma.category.findUnique({
		where: { slug, isActive: true },
	});

	if (!category) {
		return {
			title: 'Topic Not Found',
		};
	}

	return {
		title: category.hubTitle || `${category.name} - TrendPulse`,
		description:
			category.hubMetaDescription ||
			category.hubDescription ||
			category.description ||
			`Read the latest articles about ${category.name}`,
	};
}

export default async function TopicPage({ params }: TopicPageProps) {
	const { slug } = await params;

	const category = await prisma.category.findUnique({
		where: { slug, isActive: true },
		include: {
			posts: {
				where: {
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
				},
			},
		},
	});

	if (!category) {
		notFound();
	}

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Header */}
			<div className='mb-8 border-b pb-6'>
				<Link
					href='/topics'
					className='text-sm text-muted-foreground hover:text-foreground mb-3 inline-block'
				>
					← All Topics
				</Link>
				<div className='flex items-center gap-3 mb-3'>
					{category.icon && (
						<span className='text-4xl'>{category.icon}</span>
					)}
					<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold'>
						{category.name}
					</h1>
				</div>
				{category.hubDescription && (
					<p className='text-muted-foreground text-base md:text-lg max-w-3xl'>
						{category.hubDescription}
					</p>
				)}
				<div className='mt-4'>
					<Badge
						variant='secondary'
						className='text-xs'
					>
						{category.posts.length} article
						{category.posts.length !== 1 ? 's' : ''}
					</Badge>
				</div>
			</div>

			{/* Posts Grid */}
			{category.posts.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{category.posts.map((post) => (
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
									<h2 className='text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors'>
										{post.title}
									</h2>

									{post.excerpt && (
										<p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
											{post.excerpt}
										</p>
									)}

									{post.tags.length > 0 && (
										<div className='flex flex-wrap gap-1.5 pt-2'>
											{post.tags
												.slice(0, 2)
												.map((tag) => (
													<Badge
														key={tag}
														variant='secondary'
														className='text-xs'
													>
														{tag}
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
						<EmptyTitle>No posts yet</EmptyTitle>
						<EmptyDescription>
							No articles have been published in {category.name}{' '}
							yet.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
