import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNotificationsLoading() {
	return (
		<div className='space-y-8'>
			<div className='space-y-2'>
				<Skeleton className='h-8 w-80' />
				<Skeleton className='h-4 w-96' />
			</div>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className='h-28 w-full rounded-xl' />
				))}
			</div>
			<Skeleton className='h-96 w-full rounded-2xl' />
		</div>
	);
}

