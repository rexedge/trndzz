export default function TagLoading() {
	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='mb-8 space-y-3'>
				<div className='h-4 w-24 bg-muted animate-pulse rounded' />
				<div className='h-10 w-64 bg-muted animate-pulse rounded' />
				<div className='h-6 w-32 bg-muted animate-pulse rounded-full' />
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className='border rounded-lg overflow-hidden animate-pulse'
					>
						<div className='aspect-video bg-muted' />
						<div className='p-6 space-y-3'>
							<div className='h-6 bg-muted rounded' />
							<div className='h-4 bg-muted rounded w-3/4' />
							<div className='h-4 bg-muted rounded w-1/2' />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
