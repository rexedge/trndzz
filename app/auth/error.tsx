'use client';

import { Button } from '@/components/ui/button';

export default function AuthError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='w-full max-w-md rounded-xl border border-border bg-card p-8 text-center'>
			<h2 className='text-lg font-bold'>Authentication page error</h2>
			<p className='mt-2 text-sm text-muted-foreground'>
				{error.message || 'Unable to render authentication form.'}
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

