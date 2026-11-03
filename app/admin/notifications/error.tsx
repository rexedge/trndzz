'use client';

import { Button } from '@/components/ui/button';

export default function AdminNotificationsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='rounded-2xl border border-destructive/40 bg-card p-8 text-center space-y-4'>
			<h2 className='text-lg font-bold'>
				Unable to load Transactional Alert Outbox
			</h2>
			<p className='text-xs text-muted-foreground'>
				{error.message || 'An unexpected database error occurred.'}
			</p>
			<Button onClick={reset} variant='outline' size='sm'>
				Retry
			</Button>
		</div>
	);
}

