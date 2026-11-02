'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='rounded-xl border border-border bg-card p-8 text-center'>
			<h2 className='text-lg font-bold'>Workspace failed to load</h2>
			<p className='mt-2 text-sm text-muted-foreground'>
				{error.message || 'Could not load your B2B workspace data.'}
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

