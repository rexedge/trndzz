import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
	return (
		<div className='min-h-screen bg-background'>
			<div className='border-b border-border bg-card px-4 py-2.5'>
				<div className='mx-auto flex max-w-7xl items-center gap-6'>
					<Skeleton className='h-4 w-44' />
					<Skeleton className='h-4 w-36 hidden sm:block' />
					<Skeleton className='h-4 w-40 hidden md:block' />
				</div>
			</div>
			<div className='border-b border-border bg-background px-4 py-4'>
				<div className='mx-auto flex max-w-7xl items-center justify-between'>
					<Skeleton className='h-8 w-40' />
					<div className='flex items-center gap-3'>
						<Skeleton className='h-9 w-24' />
						<Skeleton className='h-9 w-28' />
					</div>
				</div>
			</div>
			<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
				<Skeleton className='h-52 w-full rounded-xl' />
				<div className='grid gap-6 md:grid-cols-3'>
					<Skeleton className='h-48 rounded-xl' />
					<Skeleton className='h-48 rounded-xl' />
					<Skeleton className='h-48 rounded-xl' />
				</div>
			</div>
		</div>
	);
}
