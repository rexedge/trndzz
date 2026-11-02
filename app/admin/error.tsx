'use client';

import { Button } from '@/components/ui/button';

export default function AdminError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='rounded-xl border border-border bg-card p-8 text-center'>
			<h2 className='text-lg font-bold'>Admin console error</h2>
			<p className='mt-2 text-sm text-muted-foreground'>
				{error.message || 'Unable to load admin command center.'}
			</p>
			<Button
				onClick={reset}
				className='mt-5'
			>
				Retry
			</Button>
		</div>
	);
}
