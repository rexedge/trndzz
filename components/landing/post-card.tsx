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

interface PostCardProps {
	post: Post;
}

export function PostCard({ post }: PostCardProps) {
	return (
		<Link
			href={`/posts/${post.slug}`}
			className='group'
		>
			<article className='h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-1'>
				{/* Image */}
				{post.featuredImageUrl ? (
					<div className='relative aspect-[16/10] overflow-hidden bg-muted'>
						<Image
							src={post.featuredImageUrl}
							alt={post.featuredImageAlt || post.title}
							fill
							className='object-cover transition-transform duration-500 group-hover:scale-105'
							sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
						/>
					</div>
				) : (
					<div className='relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center'>
						<div className='text-4xl font-bold text-muted-foreground/20'>
							TP
						</div>
					</div>
				)}

				{/* Content */}
				<div className='p-5'>
					{/* Tags */}
					{post.tags.length > 0 && (
						<div className='flex flex-wrap gap-1.5 mb-3'>
							{post.tags.slice(0, 2).map((tag) => (
								<Badge
									key={tag}
									variant='secondary'
									className='text-xs font-normal px-2 py-0'
								>
									{tag}
								</Badge>
							))}
						</div>
					)}

					{/* Title */}
					<h3 className='font-semibold text-lg leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors'>
						{post.title}
					</h3>

					{/* Excerpt */}
					<p className='mt-2 text-sm text-muted-foreground line-clamp-2'>
						{getExcerpt(post.content, post.excerpt, 100)}
					</p>

					{/* Meta */}
					<div className='mt-4 flex items-center gap-3 text-xs text-muted-foreground'>
						<time dateTime={post.publishedAt?.toISOString()}>
							{formatDate(post.publishedAt)}
						</time>
						<span className='h-1 w-1 rounded-full bg-muted-foreground/50' />
						<span>{estimateReadTime(post.content)}</span>
					</div>
				</div>
			</article>
		</Link>
	);
}
