import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string | null;
	_count: {
		posts: number;
	};
}

interface TopicsSectionProps {
	categories: Category[];
}

export function TopicsSection({ categories }: TopicsSectionProps) {
	if (categories.length === 0) return null;

	const displayCategories = categories.slice(0, 6);

	return (
		<section className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold'>Browse by Topic</h2>
					<p className='text-sm text-muted-foreground mt-1'>
						Explore content organized by categories
					</p>
				</div>
				<Link
					href='/topics'
					className='text-sm font-medium text-primary hover:underline inline-flex items-center gap-1'
				>
					View all
					<ArrowRight className='h-4 w-4' />
				</Link>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{displayCategories.map((category) => (
					<Link
						key={category.id}
						href={`/topics/${category.slug}`}
					>
						<Card className='h-full hover:shadow-md transition-shadow cursor-pointer'>
							<CardHeader>
								<div className='flex items-center justify-between mb-2'>
									{category.icon && (
										<span className='text-xl'>
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
								<CardTitle className='text-lg'>
									{category.name}
								</CardTitle>
							</CardHeader>
							{category.description && (
								<CardContent>
									<p className='text-sm text-muted-foreground line-clamp-2'>
										{category.description}
									</p>
								</CardContent>
							)}
						</Card>
					</Link>
				))}
			</div>
		</section>
	);
}
