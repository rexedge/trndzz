'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PostsError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
			<div className='flex min-h-[50vh] flex-col items-center justify-center px-4 text-center'>
				<div className='rounded-full bg-destructive/10 p-4'>
					<svg
						className='h-8 w-8 text-destructive'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
				</div>
				<h1 className='mt-4 text-xl font-semibold'>
					Something went wrong
				</h1>
				<p className='mt-2 text-sm text-muted-foreground'>
					We couldn&apos;t load the published posts.
				</p>
				<div className='mt-6 flex gap-3'>
					<Button
						variant='outline'
						onClick={reset}
					>
						Try Again
					</Button>
					<Button asChild>
						<Link href='/admin'>Back to Admin</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
