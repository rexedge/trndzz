'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DraftsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto max-w-4xl'>
				<Card>
					<CardContent className='py-12 text-center space-y-4'>
						<h2 className='text-xl font-semibold'>
							Something went wrong
						</h2>
						<p className='text-muted-foreground'>
							{error.message || 'Failed to load drafts.'}
						</p>
						<div className='flex justify-center gap-2'>
							<Button onClick={reset}>Try again</Button>
							<Button
								variant='outline'
								asChild
							>
								<Link href='/admin'>Back to Dashboard</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
