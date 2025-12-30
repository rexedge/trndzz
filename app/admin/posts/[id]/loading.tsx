import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostEditLoading() {
	return (
		<main className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
			{/* Header */}
			<div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur'>
				<div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6'>
					<div className='flex items-center gap-3'>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-5 w-20' />
					</div>
					<div className='flex items-center gap-2'>
						<Skeleton className='h-8 w-20' />
						<Skeleton className='h-8 w-20' />
					</div>
				</div>
			</div>

			{/* Content */}
			<div className='mx-auto max-w-5xl px-4 py-8 md:px-6'>
				<div className='mb-8'>
					<Skeleton className='h-8 w-2/3' />
					<Skeleton className='mt-2 h-4 w-40' />
				</div>

				<div className='grid gap-8 lg:grid-cols-3'>
					{/* Main Editor */}
					<div className='lg:col-span-2 space-y-6'>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-12' />
							<Skeleton className='h-12 w-full' />
						</div>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-16' />
							<Skeleton className='h-96 w-full' />
						</div>
					</div>

					{/* Sidebar */}
					<div className='space-y-6'>
						<Card>
							<CardHeader className='py-4'>
								<Skeleton className='h-5 w-24' />
							</CardHeader>
							<CardContent className='p-4'>
								<div className='grid grid-cols-2 gap-2'>
									<Skeleton className='aspect-video w-full rounded-lg' />
									<Skeleton className='aspect-video w-full rounded-lg' />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='py-4'>
								<Skeleton className='h-5 w-16' />
							</CardHeader>
							<CardContent className='p-4 space-y-4'>
								<Skeleton className='h-8 w-full' />
								<Skeleton className='h-20 w-full' />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
