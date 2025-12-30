'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: Props) {
	useEffect(() => {
		console.error('Article page error:', error);
	}, [error]);

	return (
		<main className='min-h-screen bg-background'>
			<nav className='border-b border-border'>
				<div className='mx-auto max-w-4xl px-4 py-4 sm:px-6'>
					<Button
						variant='ghost'
						size='sm'
						asChild
					>
						<Link href='/'>← Back to stories</Link>
					</Button>
				</div>
			</nav>

			<div className='mx-auto max-w-4xl px-4 py-12 sm:px-6'>
				<Card className='border-destructive/50'>
					<CardHeader>
						<div className='flex items-center gap-3'>
							<AlertCircle className='h-6 w-6 text-destructive' />
							<CardTitle>Something went wrong</CardTitle>
						</div>
						<CardDescription>
							We encountered an error while loading this article.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						{process.env.NODE_ENV === 'development' && (
							<div className='rounded-lg bg-muted p-4'>
								<p className='text-sm font-mono text-muted-foreground'>
									{error.message}
								</p>
							</div>
						)}
						<div className='flex gap-3'>
							<Button
								onClick={reset}
								variant='default'
							>
								Try again
							</Button>
							<Button
								variant='outline'
								asChild
							>
								<Link href='/'>Go to homepage</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
