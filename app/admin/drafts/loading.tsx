import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DraftsLoading() {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto max-w-4xl space-y-8'>
				{/* Header Skeleton */}
				<div className='flex items-center justify-between'>
					<div className='space-y-2'>
						<Skeleton className='h-8 w-32' />
						<Skeleton className='h-4 w-48' />
					</div>
					<Skeleton className='h-10 w-28' />
				</div>

				{/* Drafts List Skeleton */}
				<div className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader className='pb-3'>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex-1 space-y-2'>
										<Skeleton className='h-6 w-3/4' />
										<Skeleton className='h-4 w-1/2' />
									</div>
									<div className='flex gap-2'>
										<Skeleton className='h-5 w-16' />
										<Skeleton className='h-5 w-14' />
									</div>
								</div>
							</CardHeader>
							<CardContent className='pt-0'>
								<div className='flex gap-1'>
									<Skeleton className='h-5 w-16' />
									<Skeleton className='h-5 w-20' />
									<Skeleton className='h-5 w-14' />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</main>
	);
}
