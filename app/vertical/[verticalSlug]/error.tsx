'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerticalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center'>
			<AlertTriangle className='h-10 w-10 text-destructive' />
			<h2 className='mt-4 text-xl font-bold'>
				Vertical portal failed to load
			</h2>
			<p className='mt-2 text-sm text-muted-foreground'>
				{error.message ||
					'Could not load sector intelligence and supplier listings.'}
			</p>
			<Button
				onClick={reset}
				className='mt-6 gap-2'
			>
				<RotateCcw className='h-4 w-4' />
				Reload Portal
			</Button>
		</div>
	);
}

