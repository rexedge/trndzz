import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Loading() {
	return (
		<main className='min-h-screen bg-background'>
			<nav className='border-b border-border'>
				<div className='mx-auto max-w-4xl px-4 py-4 sm:px-6'>
					<Button
						variant='ghost'
						size='sm'
						disabled
					>
						← Back to stories
					</Button>
				</div>
			</nav>

			<article className='mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12'>
				<header className='space-y-6'>
					<div className='flex gap-2'>
						<Skeleton className='h-5 w-16' />
						<Skeleton className='h-5 w-20' />
					</div>
					<div className='space-y-3'>
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-10 w-3/4' />
					</div>
					<div className='space-y-2'>
						<Skeleton className='h-6 w-full' />
						<Skeleton className='h-6 w-5/6' />
					</div>
					<div className='flex gap-3'>
						<Skeleton className='h-4 w-32' />
						<Skeleton className='h-4 w-20' />
					</div>
					<Separator />
				</header>
				<div className='my-8'>
					<Skeleton className='aspect-video w-full rounded-lg' />
				</div>
				<div className='space-y-4'>
					{Array.from({ length: 12 }).map((_, idx) => (
						<Skeleton
							key={idx}
							className='h-4 w-full'
						/>
					))}
				</div>
			</article>
		</main>
	);
}
