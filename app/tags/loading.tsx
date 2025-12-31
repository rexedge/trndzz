export default function TagsLoading() {
	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='mb-8 space-y-3'>
				<div className='h-10 w-64 bg-muted animate-pulse rounded' />
				<div className='h-4 w-96 bg-muted animate-pulse rounded' />
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
				{Array.from({ length: 12 }).map((_, i) => (
					<div
						key={i}
						className='border rounded-lg p-6 space-y-3 animate-pulse'
					>
						<div className='flex items-center justify-between'>
							<div className='h-6 bg-muted rounded w-32' />
							<div className='h-6 w-20 bg-muted rounded-full' />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
