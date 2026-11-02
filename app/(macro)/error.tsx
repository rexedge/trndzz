'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MacroError({
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
				Could not load Macro Intelligence Hub
			</h2>
			<p className='mt-2 text-sm text-muted-foreground'>
				{error.message ||
					'An unexpected error occurred while loading cross-sector intelligence.'}
			</p>
			<Button
				onClick={reset}
				className='mt-6 gap-2'
			>
				<RotateCcw className='h-4 w-4' />
				Try Again
			</Button>
		</div>
	);
}

