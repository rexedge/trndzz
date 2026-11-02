'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='flex min-h-[75vh] items-center justify-center px-4'>
			<div className='w-full max-w-md rounded-xl border border-border bg-card p-8 text-center'>
				<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
					<AlertTriangle className='h-6 w-6' />
				</div>
				<h1 className='text-xl font-bold'>
					Unable to load trade portal view
				</h1>
				<p className='mt-2 text-sm text-muted-foreground'>
					{error.message ||
						'A temporary connection issue interrupted this request. Please retry.'}
				</p>
				<div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
					<Button
						onClick={reset}
						className='gap-2'
					>
						<RotateCcw className='h-4 w-4' />
						Retry Request
					</Button>
					<Button
						asChild
						variant='outline'
					>
						<Link href='/'>Return Home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
