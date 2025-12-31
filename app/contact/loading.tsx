import { Skeleton } from '@/components/ui/skeleton';

export default function ContactLoading() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<Skeleton className='h-12 md:h-16 w-64 mx-auto mb-6' />
					<Skeleton className='h-6 w-full max-w-3xl mx-auto' />
					<Skeleton className='h-6 w-2/3 max-w-3xl mx-auto mt-2' />
				</div>

				<div className='grid lg:grid-cols-3 gap-12'>
					{/* Contact Info */}
					<div className='lg:col-span-1'>
						<Skeleton className='h-8 w-40 mb-6' />
						<div className='space-y-6'>
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className='flex items-start gap-4'
								>
									<Skeleton className='flex-shrink-0 w-12 h-12 rounded-lg' />
									<div className='flex-1'>
										<Skeleton className='h-5 w-24 mb-1' />
										<Skeleton className='h-4 w-36' />
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Contact Form */}
					<div className='lg:col-span-2'>
						<Skeleton className='h-[400px] rounded-2xl' />
					</div>
				</div>
			</div>
		</main>
	);
}
