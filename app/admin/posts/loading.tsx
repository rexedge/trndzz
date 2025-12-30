import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostsLoading() {
	return (
		<main className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
			{/* Header */}
			<div className='border-b bg-background/95 backdrop-blur'>
				<div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6'>
					<div>
						<Skeleton className='h-8 w-48' />
						<Skeleton className='mt-2 h-4 w-64' />
					</div>
					<Skeleton className='h-9 w-20' />
				</div>
			</div>

			{/* Content */}
			<div className='mx-auto max-w-6xl px-4 py-8 md:px-6'>
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Card
							key={i}
							className='overflow-hidden'
						>
							<Skeleton className='aspect-video w-full' />
							<CardHeader className='space-y-2 p-4 pb-2'>
								<Skeleton className='h-5 w-3/4' />
								<Skeleton className='h-4 w-full' />
							</CardHeader>
							<CardContent className='p-4 pt-0'>
								<div className='flex gap-2'>
									<Skeleton className='h-5 w-16' />
									<Skeleton className='h-5 w-16' />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</main>
	);
}
