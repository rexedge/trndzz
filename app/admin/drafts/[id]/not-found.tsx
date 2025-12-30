import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DraftNotFound() {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto max-w-4xl'>
				<Card>
					<CardContent className='py-12 text-center space-y-4'>
						<h2 className='text-xl font-semibold'>
							Draft not found
						</h2>
						<p className='text-muted-foreground'>
							The draft you&apos;re looking for doesn&apos;t exist
							or has been deleted.
						</p>
						<Button asChild>
							<Link href='/admin/drafts'>Back to Drafts</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
