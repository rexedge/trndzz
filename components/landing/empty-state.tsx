export function EmptyState() {
	return (
		<div className='flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-border'>
			<div className='text-center space-y-4 p-8'>
				<div className='mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center'>
					<svg
						className='h-8 w-8 text-muted-foreground'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
						/>
					</svg>
				</div>
				<div>
					<h3 className='text-lg font-semibold'>No stories yet</h3>
					<p className='text-muted-foreground mt-1'>
						Fresh content is on the way. Check back soon!
					</p>
				</div>
			</div>
		</div>
	);
}
