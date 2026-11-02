import { Skeleton } from '@/components/ui/skeleton';

export default function MacroLoading() {
	return (
		<div className='mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8'>
			<Skeleton className='h-56 w-full rounded-2xl' />
			<div className='grid gap-6 md:grid-cols-3'>
				<Skeleton className='h-52 rounded-xl' />
				<Skeleton className='h-52 rounded-xl' />
				<Skeleton className='h-52 rounded-xl' />
			</div>
			<div className='grid gap-6 lg:grid-cols-3'>
				<Skeleton className='h-72 lg:col-span-2 rounded-xl' />
				<Skeleton className='h-72 rounded-xl' />
			</div>
		</div>
	);
}

