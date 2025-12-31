import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TagNotFound() {
	return (
		<div className='container mx-auto px-4 py-16 max-w-2xl'>
			<Card>
				<CardContent className='py-12 text-center space-y-4'>
					<h1 className='text-3xl font-bold'>Tag Not Found</h1>
					<p className='text-muted-foreground'>
						No articles have been tagged with this keyword yet.
					</p>
					<div className='flex justify-center gap-3 pt-4'>
						<Button asChild>
							<Link href='/tags'>Browse All Tags</Link>
						</Button>
						<Button
							asChild
							variant='outline'
						>
							<Link href='/'>Go Home</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
