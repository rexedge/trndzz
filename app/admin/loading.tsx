import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
	return (
		<div className='space-y-6'>
			<Skeleton className='h-9 w-64' />
			<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
			</div>
		</div>
	);
}
