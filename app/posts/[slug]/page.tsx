import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Markdown } from '@/components/markdown';
import { SocialShare } from '@/components/social-share';
import { PostSlideshow } from '@/components/post-slideshow';
import { getTokenFromCookies, verifySessionToken } from '@/lib/auth/session';

/**
 * Article Page - Single Blog Post
 *
 * Design Principles:
 * - Calm, distraction-free reading
 * - Clear typography and spacing
 * - Comfortable reading width
 * - Featured image
 * - SEO-friendly headings
 * - JSON-LD structured data for search engines
 * - Related queries for improved discoverability
 */

interface Props {
	params: Promise<{ slug: string }>;
}

function formatDate(date: Date | null) {
	if (!date) return 'Recently';
	return date.toLocaleDateString('en-NG', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function estimateReadTime(content: string) {
	const words = content.split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / 220));
	return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

function getSummary(content: string, excerpt?: string | null) {
	if (excerpt && excerpt.trim().length > 0) return excerpt.trim();

	const plainText = content
		.replace(/#{1,6}\s+/g, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\n+/g, ' ')
		.trim();

	if (plainText.length <= 160) return plainText;
	return plainText.slice(0, 160) + '…';
}

const siteUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://trendpulse.ng';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	if (!slug) return { title: 'Story not found | Trend Pulse' };

	const post = await prisma.post.findFirst({
		where: { slug, status: 'published' },
		select: {
			title: true,
			excerpt: true,
			content: true,
			metaDescription: true,
			tags: true,
			relatedQueries: true,
			featuredImageUrl: true,
			featuredImageAlt: true,
			publishedAt: true,
			updatedAt: true,
		},
	});

	if (!post) {
		return {
			title: 'Story not found | Trend Pulse',
			description: 'The requested article could not be found.',
		};
	}

	// Use metaDescription first, then fallback to getSummary from content
	const description =
		post.metaDescription?.trim() || getSummary(post.content, null);
	const canonicalUrl = `${siteUrl}/posts/${slug}`;

	// Combine tags and related queries for keywords
	const keywords = [...post.tags, ...post.relatedQueries.slice(0, 10)].filter(
		(k, i, arr) => arr.indexOf(k) === i
	); // dedupe

	// Ensure absolute URLs for images
	const getAbsoluteUrl = (url: string | null) => {
		if (!url) return null;
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}
		return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
	};

	const imageUrl = getAbsoluteUrl(post.featuredImageUrl);

	return {
		title: `${post.title} | Trend Pulse`,
		description,
		keywords: keywords.join(', '),
		authors: [{ name: 'Trend Pulse' }],
		alternates: {
			canonical: canonicalUrl,
		},
		openGraph: {
			type: 'article',
			title: post.title,
			description,
			url: canonicalUrl,
			siteName: 'Trend Pulse',
			locale: 'en_NG',
			publishedTime: post.publishedAt?.toISOString(),
			modifiedTime: post.updatedAt?.toISOString(),
			tags: post.tags,
			images: imageUrl
				? [
						{
							url: imageUrl,
							alt: post.featuredImageAlt || post.title,
							width: 1200,
							height: 630,
							type: 'image/jpeg',
						},
				  ]
				: [],
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title,
			description,
			images: imageUrl ? [imageUrl] : [],
			creator: '@trendpulse',
			site: '@trendpulse',
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
	};
}

export default async function PostPage({ params }: Props) {
	const { slug } = await params;
	if (!slug) notFound();

	// Check if admin is logged in (for draft preview)
	const token = await getTokenFromCookies();
	const isAdmin = await verifySessionToken(token);

	// Admins can view drafts, public only sees published
	const post = await prisma.post.findFirst({
		where: isAdmin ? { slug } : { slug, status: 'published' },
		include: {
			images: {
				orderBy: { order: 'asc' },
			},
		},
	});

	if (!post) notFound();

	const isDraft = post.status !== 'published';
	const readTime = estimateReadTime(post.content);
	const formattedDate = formatDate(post.publishedAt);
	const canonicalUrl = `${siteUrl}/posts/${slug}`;

	// Fetch related posts
	const relatedPosts = await prisma.post.findMany({
		where: {
			status: 'published',
			id: { not: post.id },
			OR: [
				{ tags: { hasSome: post.tags } },
				{ generatedFromTrendId: post.generatedFromTrendId },
			],
		},
		take: 3,
		orderBy: { publishedAt: 'desc' },
	});

	// JSON-LD Structured Data for SEO
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: post.title,
		description: getSummary(post.content, post.excerpt),
		image: post.featuredImageUrl || undefined,
		datePublished: post.publishedAt?.toISOString(),
		dateModified: post.updatedAt?.toISOString(),
		author: {
			'@type': 'Organization',
			name: 'Trend Pulse',
			url: siteUrl,
		},
		publisher: {
			'@type': 'Organization',
			name: 'Trend Pulse',
			url: siteUrl,
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/logo.png`,
			},
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': canonicalUrl,
		},
		keywords: [...post.tags, ...post.relatedQueries.slice(0, 10)].join(
			', '
		),
	};

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<main className='min-h-screen bg-background'>
				{/* Draft Banner */}
				{isDraft && (
					<div className='bg-yellow-500 text-yellow-950 text-center py-2 px-4 text-sm font-medium'>
						⚠️ Draft Preview — This post is not published yet
					</div>
				)}
				{/* Navigation */}
				<nav className='border-b border-border'>
					<div className='mx-auto max-w-4xl px-4 py-4 sm:px-6'>
						<Button
							variant='ghost'
							size='sm'
							asChild
						>
							<Link href='/'>← Back to stories</Link>
						</Button>
					</div>
				</nav>

				{/* Article */}
				<article className='mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12'>
					{/* Header */}
					<header className='space-y-6'>
						{/* Tags */}
						{post.tags.length > 0 && (
							<div className='flex flex-wrap gap-2'>
								{post.tags.slice(0, 5).map((tag) => (
									<Badge
										key={tag}
										variant='secondary'
										className='text-xs font-normal'
									>
										{tag}
									</Badge>
								))}
							</div>
						)}

						{/* Title */}
						<h1 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
							{post.title}
						</h1>

						{/* Excerpt */}
						{post.excerpt && (
							<p className='text-lg text-muted-foreground sm:text-xl'>
								{post.excerpt}
							</p>
						)}

						{/* Meta */}
						<div className='flex items-center gap-3 text-sm text-muted-foreground'>
							<time dateTime={post.publishedAt?.toISOString()}>
								{formattedDate}
							</time>
							<span>·</span>
							<span>{readTime} read</span>
						</div>

						{/* Social Share */}
						<div className='space-y-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Share this story
							</p>
							<SocialShare
								url={canonicalUrl}
								title={post.title}
								description={
									post.excerpt ||
									getSummary(post.content, null)
								}
							/>
						</div>

						<Separator />
					</header>

					{/* Image Slideshow */}
					{(post.featuredImageUrl || post.images.length > 0) && (
						<PostSlideshow
							images={post.images}
							featuredImageUrl={post.featuredImageUrl}
							featuredImageAlt={post.featuredImageAlt}
							featuredImageCredit={post.featuredImageCredit}
							title={post.title}
						/>
					)}

					{/* Content */}
					<div className='prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-foreground/90 prose-a:text-foreground prose-a:underline prose-a:decoration-muted-foreground prose-a:underline-offset-4 hover:prose-a:decoration-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted'>
						<Markdown content={post.content} />
					</div>

					{/* Footer */}
					<footer className='mt-12 space-y-8'>
						<Separator />

						{/* Share Section */}
						<div className='space-y-3'>
							<h3 className='text-sm font-medium text-muted-foreground'>
								Share this story
							</h3>
							<SocialShare
								url={canonicalUrl}
								title={post.title}
								description={
									post.excerpt ||
									getSummary(post.content, null)
								}
							/>
						</div>

						{/* Related Queries - SEO Section */}
						{post.relatedQueries &&
							post.relatedQueries.length > 0 && (
								<div className='space-y-3'>
									<h3 className='text-sm font-medium text-muted-foreground'>
										People also search for
									</h3>
									<div className='flex flex-wrap gap-2'>
										{post.relatedQueries
											.slice(0, 12)
											.map((query) => (
												<Badge
													key={query}
													variant='outline'
													className='font-normal text-xs bg-muted/50 hover:bg-muted transition-colors cursor-default'
												>
													{query}
												</Badge>
											))}
									</div>
								</div>
							)}

						{/* Tags */}
						{post.tags.length > 0 && (
							<div className='space-y-3'>
								<h3 className='text-sm font-medium text-muted-foreground'>
									Topics
								</h3>
								<div className='flex flex-wrap gap-2'>
									{post.tags.map((tag) => (
										<Badge
											key={tag}
											variant='outline'
											className='font-normal'
										>
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Related Posts */}
						{relatedPosts.length > 0 && (
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>
									Related Stories
								</h3>
								<div className='grid gap-4 sm:grid-cols-3'>
									{relatedPosts.map((related) => (
										<Link
											key={related.id}
											href={`/posts/${related.slug}`}
											className='group space-y-2 rounded-lg border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50'
										>
											<h4 className='line-clamp-2 font-medium group-hover:text-foreground/80'>
												{related.title}
											</h4>
											<p className='text-xs text-muted-foreground'>
												{formatDate(
													related.publishedAt
												)}
											</p>
										</Link>
									))}
								</div>
							</div>
						)}

						{/* Back to home */}
						<div className='pt-4'>
							<Button
								variant='outline'
								asChild
							>
								<Link href='/'>← Back to all stories</Link>
							</Button>
						</div>
					</footer>
				</article>
			</main>
		</>
	);
}
