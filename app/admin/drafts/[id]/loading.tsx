import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DraftEditLoading() {
	return (
		<main className='min-h-screen px-4 py-6 md:px-6 md:py-8'>
			<div className='mx-auto max-w-4xl space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
					<div className='space-y-2'>
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-8 w-48' />
					</div>
					<div className='flex gap-2'>
						<Skeleton className='h-10 w-20' />
						<Skeleton className='h-10 w-20' />
						<Skeleton className='h-10 w-24' />
					</div>
				</div>

				{/* Title Card */}
				<Card>
					<CardHeader>
						<Skeleton className='h-5 w-16' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-10 w-full' />
					</CardContent>
				</Card>

				{/* Content Card */}
				<Card>
					<CardHeader>
						<Skeleton className='h-5 w-20' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-80 w-full' />
					</CardContent>
				</Card>

				{/* Excerpt Card */}
				<Card>
					<CardHeader>
						<Skeleton className='h-5 w-20' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-20 w-full' />
					</CardContent>
				</Card>

				{/* Tags Card */}
				<Card>
					<CardHeader>
						<Skeleton className='h-5 w-12' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-10 w-full' />
					</CardContent>
				</Card>

				{/* Images Card */}
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<Skeleton className='h-5 w-24' />
							<Skeleton className='h-9 w-24' />
						</div>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
							<Skeleton className='aspect-video w-full' />
							<Skeleton className='aspect-video w-full' />
							<Skeleton className='aspect-video w-full' />
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
