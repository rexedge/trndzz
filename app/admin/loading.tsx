import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto max-w-4xl space-y-6'>
				<Skeleton className='h-8 w-28' />

				<Card>
					<CardHeader className='space-y-2'>
						<CardTitle>Sign in</CardTitle>
						<Skeleton className='h-10 w-full' />
					</CardHeader>
					<CardContent className='space-y-4'>
						<Skeleton className='h-10 w-24' />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='space-y-3'>
						<CardTitle>Trends</CardTitle>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-5/6' />
							<Skeleton className='h-4 w-3/4' />
						</div>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className='space-y-3'>
						<CardTitle>Drafts</CardTitle>
						<div className='space-y-2'>
							<Skeleton className='h-5 w-2/3' />
							<Skeleton className='h-5 w-3/4' />
						</div>
					</CardHeader>
				</Card>
			</div>
		</main>
	);
}
