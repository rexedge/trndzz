import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface TagsSectionProps {
	tags: Array<{ tag: string; count: number }>;
}

export function TagsSection({ tags }: TagsSectionProps) {
	if (tags.length === 0) return null;

	const displayTags = tags.slice(0, 20);

	return (
		<section className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold'>Popular Tags</h2>
					<p className='text-sm text-muted-foreground mt-1'>
						Discover trending topics and keywords
					</p>
				</div>
				<Link
					href='/tags'
					className='text-sm font-medium text-primary hover:underline inline-flex items-center gap-1'
				>
					View all
					<ArrowRight className='h-4 w-4' />
				</Link>
			</div>

			<div className='flex flex-wrap gap-2'>
				{displayTags.map(({ tag, count }) => (
					<Link
						key={tag}
						href={`/tags/${encodeURIComponent(
							tag.toLowerCase().replace(/\s+/g, '-')
						)}`}
					>
						<Badge
							variant='outline'
							className='hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer py-2 px-3 text-sm'
						>
							#{tag}
							<span className='ml-2 text-xs opacity-70'>
								{count}
							</span>
						</Badge>
					</Link>
				))}
			</div>
		</section>
	);
}
