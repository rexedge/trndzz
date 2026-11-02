import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLoading() {
	return (
		<div className='w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-8'>
			<Skeleton className='h-7 w-48' />
			<Skeleton className='h-4 w-64' />
			<Skeleton className='h-10 w-full' />
			<Skeleton className='h-10 w-full' />
			<Skeleton className='h-10 w-full' />
		</div>
	);
}

