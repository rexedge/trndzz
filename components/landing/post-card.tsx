import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDate, getExcerpt } from '@/lib/utils/post';

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
			className='group block'
		>
			<article className='h-full'>
				{/* Image */}
				{post.featuredImageUrl ? (
					<div className='relative aspect-[16/9] overflow-hidden bg-muted mb-3'>
						<Image
							src={post.featuredImageUrl}
							alt={post.featuredImageAlt || post.title}
							fill
							className='object-cover transition-transform duration-300 group-hover:scale-105'
							sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
						/>
					</div>
				) : (
					<div className='relative aspect-[16/9] overflow-hidden bg-muted mb-3 flex items-center justify-center'>
						<div className='text-2xl font-bold text-muted-foreground/20'>
							TP
						</div>
					</div>
				)}

				{/* Content */}
				<div className='space-y-2'>
					{/* Tags */}
					{post.tags.length > 0 && (
						<div className='flex items-center gap-2'>
							<Badge
								variant='secondary'
								className='text-xs font-semibold uppercase tracking-wide'
							>
								{post.tags[0]}
							</Badge>
						</div>
					)}

					{/* Title */}
					<h3 className='font-bold text-xl leading-tight line-clamp-3 group-hover:text-primary transition-colors'>
						{post.title}
					</h3>

					{/* Excerpt */}
					<p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
						{getExcerpt(post.content, post.excerpt, 120)}
					</p>

					{/* Meta */}
					<div className='flex items-center gap-2 text-xs text-muted-foreground pt-1'>
						<time dateTime={post.publishedAt?.toISOString()}>
							{formatDate(post.publishedAt)}
						</time>
					</div>
				</div>
			</article>
		</Link>
	);
}
