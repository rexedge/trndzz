import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
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
				<Card>
					<CardHeader>
						<div className='flex items-center gap-3'>
							<FileQuestion className='h-6 w-6 text-muted-foreground' />
							<CardTitle>Story not found</CardTitle>
						</div>
						<CardDescription>
							The article you're looking for doesn't exist or has
							been removed.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href='/'>Browse all stories</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
