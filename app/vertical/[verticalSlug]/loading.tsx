import { Skeleton } from '@/components/ui/skeleton';

export default function VerticalLoading() {
	return (
		<div className='mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8'>
			<Skeleton className='h-48 w-full rounded-2xl' />
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
			</div>
			<div className='grid gap-8 lg:grid-cols-3'>
				<Skeleton className='h-80 lg:col-span-2 rounded-xl' />
				<Skeleton className='h-80 rounded-xl' />
			</div>
		</div>
	);
}

