import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SeoLoading() {
	return (
		<div className='min-h-screen bg-gray-50 p-4 md:p-6'>
			<div className='mx-auto max-w-7xl space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div>
						<Skeleton className='h-8 w-48' />
						<Skeleton className='mt-2 h-4 w-64' />
					</div>
					<Skeleton className='h-10 w-32' />
				</div>

				{/* Stats Grid */}
				<div className='grid gap-4 md:grid-cols-4'>
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader className='pb-2'>
								<Skeleton className='h-4 w-24' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-8 w-16' />
							</CardContent>
						</Card>
					))}
				</div>

				{/* Main Content */}
				<div className='grid gap-6 lg:grid-cols-3'>
					<div className='space-y-4 lg:col-span-2'>
						<Card>
							<CardHeader>
								<Skeleton className='h-6 w-32' />
							</CardHeader>
							<CardContent className='space-y-4'>
								{[...Array(5)].map((_, i) => (
									<Skeleton
										key={i}
										className='h-16 w-full'
									/>
								))}
							</CardContent>
						</Card>
					</div>
					<div className='space-y-4'>
						<Card>
							<CardHeader>
								<Skeleton className='h-6 w-28' />
							</CardHeader>
							<CardContent className='space-y-3'>
								{[...Array(4)].map((_, i) => (
									<Skeleton
										key={i}
										className='h-12 w-full'
									/>
								))}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
