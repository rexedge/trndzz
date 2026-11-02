import Link from 'next/link';
import { AlertTriangle, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function RouteSkeleton({
	variant = 'feed',
}: {
	variant?: 'feed' | 'detail' | 'grid' | 'form' | 'table';
}) {
	return (
		<div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
			<div className='space-y-2.5'>
				<Skeleton className='h-4 w-36' />
				<Skeleton className='h-9 w-80 max-w-full' />
				<Skeleton className='h-4 w-96 max-w-full' />
			</div>

			{variant === 'grid' && (
				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 6 }).map((_, idx) => (
						<Skeleton key={idx} className='h-56 w-full rounded-xl' />
					))}
				</div>
			)}

			{variant === 'detail' && (
				<div className='grid gap-8 lg:grid-cols-3'>
					<div className='space-y-4 lg:col-span-2'>
						<Skeleton className='h-72 w-full rounded-xl' />
						<Skeleton className='h-48 w-full rounded-xl' />
					</div>
					<div className='space-y-4'>
						<Skeleton className='h-64 w-full rounded-xl' />
						<Skeleton className='h-44 w-full rounded-xl' />
					</div>
				</div>
			)}

			{variant === 'form' && (
				<div className='max-w-3xl space-y-4 rounded-xl border border-border p-6'>
					<Skeleton className='h-10 w-full' />
					<Skeleton className='h-10 w-full' />
					<Skeleton className='h-32 w-full' />
					<Skeleton className='h-11 w-48' />
				</div>
			)}

			{variant === 'table' && (
				<div className='space-y-3 rounded-xl border border-border p-6'>
					<Skeleton className='h-10 w-full' />
					<Skeleton className='h-14 w-full' />
					<Skeleton className='h-14 w-full' />
					<Skeleton className='h-14 w-full' />
				</div>
			)}

			{variant === 'feed' && (
				<div className='space-y-4'>
					{Array.from({ length: 4 }).map((_, idx) => (
						<Skeleton key={idx} className='h-40 w-full rounded-xl' />
					))}
				</div>
			)}
		</div>
	);
}

export function RouteNotFound({
	title = 'Requested Trade Resource Not Found',
	description = 'The requested article, supplier profile, or procurement tender may have moved or been archived.',
	backHref = '/',
	backLabel = 'Return to Portal Overview',
}: {
	title?: string;
	description?: string;
	backHref?: string;
	backLabel?: string;
}) {
	return (
		<div className='mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center'>
			<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
				<Compass className='h-6 w-6' />
			</div>
			<h1 className='mt-4 text-2xl font-bold tracking-tight'>{title}</h1>
			<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
				{description}
			</p>
			<Button asChild className='mt-6'>
				<Link href={backHref}>{backLabel}</Link>
			</Button>
		</div>
	);
}

export function RouteErrorCard({
	title = 'Unable to Load Trade Data',
	message,
	onReset,
	backHref = '/',
}: {
	title?: string;
	message?: string;
	onReset: () => void;
	backHref?: string;
}) {
	return (
		<div className='mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center'>
			<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive'>
				<AlertTriangle className='h-6 w-6' />
			</div>
			<h2 className='mt-4 text-xl font-bold tracking-tight'>{title}</h2>
			<p className='mt-2 text-sm text-muted-foreground'>
				{message ||
					'A temporary connection issue interrupted data retrieval. Please retry.'}
			</p>
			<div className='mt-6 flex items-center gap-3'>
				<Button onClick={onReset}>Retry Request</Button>
				<Button asChild variant='outline'>
					<Link href={backHref}>Back</Link>
				</Button>
			</div>
		</div>
	);
}

