import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Ad } from '@/components/ads';

export const metadata: Metadata = {
	title: 'Topics - TrendPulse',
	description:
		'Explore all topics and categories. Find trending content organized by your interests.',
};

export default async function TopicsPage() {
	const categories = await prisma.category.findMany({
		where: { isActive: true },
		include: {
			_count: {
				select: {
					posts: {
						where: {
							status: 'published',
						},
					},
				},
			},
		},
		orderBy: { order: 'asc' },
	});

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Header */}
			<div className='mb-8 border-b pb-6'>
				<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-3'>
					Browse Topics
				</h1>
				<p className='text-muted-foreground text-base md:text-lg'>
					Discover trending content organized by categories
				</p>
			</div>

			{/* Ad Slot - Top */}
			<Ad
				format='horizontal'
				className='mb-8'
			/>

			{/* Categories Grid */}
			{categories.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{categories.map((category) => (
						<Link
							key={category.id}
							href={`/topics/${category.slug}`}
							className='group block'
						>
							<div className='h-full p-6 rounded-lg border border-border hover:border-foreground/20 transition-colors'>
								<div className='flex items-start justify-between mb-4'>
									{category.icon && (
										<span className='text-3xl'>
											{category.icon}
										</span>
									)}
									<Badge
										variant='secondary'
										className='text-xs'
									>
										{category._count.posts}
									</Badge>
								</div>
								<h3 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors'>
									{category.name}
								</h3>
								{category.description && (
									<p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
										{category.description}
									</p>
								)}
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className='py-12 text-center'>
					<p className='text-muted-foreground'>
						No topics available yet.
					</p>
				</div>
			)}
		</div>
	);
}
