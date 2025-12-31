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
		<section className='border-t border-b border-border py-8'>
			<Link
				href={`/posts/${post.slug}`}
				className='group block'
			>
				<article className='grid lg:grid-cols-2 gap-8'>
					{/* Image */}
					{post.featuredImageUrl ? (
						<div className='relative aspect-[16/9] lg:aspect-[4/3] overflow-hidden bg-muted'>
							<Image
								src={post.featuredImageUrl}
								alt={post.featuredImageAlt || post.title}
								fill
								className='object-cover transition-transform duration-300 group-hover:scale-105'
								sizes='(max-width: 1024px) 100vw, 50vw'
								priority
							/>
						</div>
					) : (
						<div className='relative aspect-[16/9] lg:aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center'>
							<div className='text-6xl font-bold text-muted-foreground/20'>
								TP
							</div>
						</div>
					)}

					{/* Content */}
					<div className='flex flex-col justify-center space-y-4'>
						{/* Tags */}
						{post.tags.length > 0 && (
							<div className='flex items-center gap-2'>
								<Badge
									variant='default'
									className='text-xs font-semibold uppercase tracking-wide'
								>
									{post.tags[0]}
								</Badge>
							</div>
						)}

						{/* Title */}
						<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors'>
							{post.title}
						</h2>

						{/* Excerpt */}
						<p className='text-lg text-muted-foreground leading-relaxed line-clamp-3'>
							{getExcerpt(post.content, post.excerpt, 200)}
						</p>

						{/* Meta */}
						<div className='flex items-center gap-3 text-sm text-muted-foreground'>
							<time dateTime={post.publishedAt?.toISOString()}>
								{formatDate(post.publishedAt)}
							</time>
							<span className='text-muted-foreground/50'>•</span>
							<span>{estimateReadTime(post.content)} read</span>
						</div>
					</div>
				</article>
			</Link>
		</section>
	);
}
