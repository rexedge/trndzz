'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: Props) {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto flex max-w-2xl flex-col gap-4'>
				<div>
					<p className='text-sm font-medium text-destructive'>
						Something went wrong
					</p>
					<p className='text-muted-foreground'>
						{error?.message ?? 'Please try again.'}
					</p>
				</div>
				<div className='flex flex-wrap gap-3'>
					<Button onClick={reset}>Retry</Button>
					<Button asChild variant='ghost'>
						<Link href='/'>Back to home</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
