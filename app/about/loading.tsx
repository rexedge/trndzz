import { Skeleton } from '@/components/ui/skeleton';

export default function AboutLoading() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<Skeleton className='h-12 md:h-16 w-72 mx-auto mb-6' />
					<Skeleton className='h-6 w-full max-w-3xl mx-auto' />
					<Skeleton className='h-6 w-2/3 max-w-3xl mx-auto mt-2' />
				</div>

				{/* Mission Section */}
				<section className='mb-20'>
					<div className='grid md:grid-cols-2 gap-12 items-center'>
						<div>
							<Skeleton className='h-10 w-48 mb-6' />
							<Skeleton className='h-4 w-full mb-2' />
							<Skeleton className='h-4 w-full mb-2' />
							<Skeleton className='h-4 w-3/4 mb-4' />
							<Skeleton className='h-4 w-full mb-2' />
							<Skeleton className='h-4 w-5/6' />
						</div>
						<Skeleton className='h-64 rounded-2xl' />
					</div>
				</section>

				{/* Values Section */}
				<section className='mb-20'>
					<Skeleton className='h-10 w-48 mx-auto mb-12' />
					<div className='grid md:grid-cols-3 gap-8'>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className='text-center p-6'
							>
								<Skeleton className='h-16 w-16 rounded-full mx-auto mb-4' />
								<Skeleton className='h-6 w-32 mx-auto mb-3' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-5/6 mx-auto mt-2' />
							</div>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
