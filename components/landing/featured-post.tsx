import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDate, estimateReadTime, getExcerpt } from '@/lib/utils/post';

interface Post {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	tags: string[];
	featuredImageUrl: string | null;
	featuredImageAlt: string | null;
	publishedAt: Date | null;
}

interface FeaturedPostProps {
	post: Post;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
	return (
		<section>
			<div className='flex items-center gap-2 mb-6'>
				<span className='h-px flex-1 bg-border' />
				<Badge
					variant='outline'
					className='font-medium'
				>
					Featured
				</Badge>
				<span className='h-px flex-1 bg-border' />
			</div>

			<Link
				href={`/posts/${post.slug}`}
				className='group block'
			>
				<article className='relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5'>
					<div className='grid md:grid-cols-2'>
						{/* Image */}
						{post.featuredImageUrl ? (
							<div className='relative aspect-[4/3] md:aspect-auto overflow-hidden bg-muted'>
								<Image
									src={post.featuredImageUrl}
									alt={post.featuredImageAlt || post.title}
									fill
									className='object-cover transition-transform duration-500 group-hover:scale-105'
									sizes='(max-width: 768px) 100vw, 50vw'
									priority
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r' />
							</div>
						) : (
							<div className='relative aspect-[4/3] md:aspect-auto overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center'>
								<div className='text-6xl font-bold text-muted-foreground/20'>
									TP
								</div>
							</div>
						)}

						{/* Content */}
						<div className='p-6 sm:p-8 md:p-10 flex flex-col justify-center'>
							{/* Tags */}
							{post.tags.length > 0 && (
								<div className='flex flex-wrap gap-2 mb-4'>
									{post.tags.slice(0, 3).map((tag) => (
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
							<h2 className='text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl group-hover:text-foreground/80 transition-colors'>
								{post.title}
							</h2>

							{/* Excerpt */}
							<p className='mt-4 text-muted-foreground line-clamp-3 text-base sm:text-lg'>
								{getExcerpt(post.content, post.excerpt, 200)}
							</p>

							{/* Meta */}
							<div className='mt-6 flex items-center gap-4 text-sm text-muted-foreground'>
								<time
									dateTime={post.publishedAt?.toISOString()}
								>
									{formatDate(post.publishedAt)}
								</time>
								<span className='h-1 w-1 rounded-full bg-muted-foreground' />
								<span>
									{estimateReadTime(post.content)} read
								</span>
							</div>

							{/* CTA */}
							<div className='mt-6'>
								<span className='inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all'>
									Read article
									<svg
										className='h-4 w-4'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M17 8l4 4m0 0l-4 4m4-4H3'
										/>
									</svg>
								</span>
							</div>
						</div>
					</div>
				</article>
			</Link>
		</section>
	);
}
