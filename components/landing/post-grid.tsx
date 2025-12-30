import { PostCard } from './post-card';

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

interface PostGridProps {
	posts: Post[];
	title: string;
	totalCount: number;
}

export function PostGrid({ posts, title, totalCount }: PostGridProps) {
	if (posts.length === 0) return null;

	return (
		<section>
			<div className='flex items-center justify-between mb-8'>
				<h2 className='text-xl font-semibold sm:text-2xl'>{title}</h2>
				<span className='text-sm text-muted-foreground'>
					{totalCount} total
				</span>
			</div>

			<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{posts.map((post) => (
					<PostCard
						key={post.id}
						post={post}
					/>
				))}
			</div>
		</section>
	);
}
