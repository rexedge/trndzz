import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Ad } from '@/components/ads';

export const metadata: Metadata = {
	title: 'Tags - TrendPulse',
	description:
		'Explore all tags. Discover trending content by popular keywords and topics.',
};

export default async function TagsPage() {
	// Get all tags from published posts with counts
	const posts = await prisma.post.findMany({
		where: {
			status: 'published',
			tags: {
				isEmpty: false,
			},
		},
		select: {
			tags: true,
		},
	});

	// Count tag occurrences
	const tagCounts = new Map<string, number>();
	posts.forEach((post) => {
		post.tags.forEach((tag) => {
			tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
		});
	});

	// Convert to array and sort by count
	const sortedTags = Array.from(tagCounts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Header */}
			<div className='mb-8 border-b pb-6'>
				<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-3'>
					Browse Tags
				</h1>
				<p className='text-muted-foreground text-base md:text-lg'>
					Discover trending content by popular keywords
				</p>
			</div>

			{/* Ad Slot - Top */}
			<Ad
				format='horizontal'
				className='mb-8'
			/>

			{/* Tags Grid */}
			{sortedTags.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					{sortedTags.map(({ tag, count }) => (
						<Link
							key={tag}
							href={`/tags/${encodeURIComponent(
								tag.toLowerCase().replace(/\s+/g, '-')
							)}`}
							className='group block'
						>
							<div className='p-5 rounded-lg border border-border hover:border-foreground/20 transition-colors'>
								<div className='flex items-center justify-between'>
									<h3 className='text-lg font-bold group-hover:text-primary transition-colors'>
										#{tag}
									</h3>
									<Badge
										variant='secondary'
										className='text-xs'
									>
										{count}
									</Badge>
								</div>
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className='py-12 text-center'>
					<p className='text-muted-foreground'>
						No tags available yet.
					</p>
				</div>
			)}
		</div>
	);
}
