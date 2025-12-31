import { Skeleton } from '@/components/ui/skeleton';

export default function AdvertiseLoading() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<Skeleton className='h-12 md:h-16 w-80 mx-auto mb-6' />
					<Skeleton className='h-6 w-full max-w-3xl mx-auto' />
					<Skeleton className='h-6 w-2/3 max-w-3xl mx-auto mt-2' />
				</div>

				{/* Stats Section */}
				<section className='mb-20'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-28 rounded-xl'
							/>
						))}
					</div>
				</section>

				{/* Ad Formats */}
				<section className='mb-20'>
					<Skeleton className='h-10 w-56 mx-auto mb-12' />
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-80 rounded-xl'
							/>
						))}
					</div>
				</section>

				{/* Why Advertise */}
				<section className='mb-20'>
					<Skeleton className='h-10 w-64 mx-auto mb-12' />
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className='text-center p-6'
							>
								<Skeleton className='h-14 w-14 rounded-full mx-auto mb-4' />
								<Skeleton className='h-5 w-32 mx-auto mb-2' />
								<Skeleton className='h-4 w-full' />
							</div>
						))}
					</div>
				</section>

				{/* CTA Section */}
				<Skeleton className='h-48 rounded-2xl' />
			</div>
		</main>
	);
}
