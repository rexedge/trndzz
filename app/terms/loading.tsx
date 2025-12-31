import { Skeleton } from '@/components/ui/skeleton';

export default function TermsLoading() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
				<Skeleton className='h-12 md:h-14 w-56 mb-8' />
				<Skeleton className='h-4 w-48 mb-8' />

				{/* Content sections */}
				{Array.from({ length: 8 }).map((_, i) => (
					<section
						key={i}
						className='mb-12'
					>
						<Skeleton className='h-8 w-48 mb-4' />
						<Skeleton className='h-4 w-full mb-2' />
						<Skeleton className='h-4 w-full mb-2' />
						<Skeleton className='h-4 w-3/4' />
					</section>
				))}
			</div>
		</main>
	);
}
