import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const cards = Array.from({ length: 4 });

export default function Loading() {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto max-w-4xl space-y-8'>
				<div className='space-y-2'>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='h-4 w-72' />
				</div>

				<div className='grid gap-4'>
					{cards.map((_, idx) => (
						<Card key={idx}>
							<CardHeader className='space-y-3'>
								<Skeleton className='h-5 w-5/6' />
								<div className='flex flex-wrap gap-2'>
									<Skeleton className='h-5 w-16 rounded-full' />
									<Skeleton className='h-5 w-12 rounded-full' />
									<Skeleton className='h-5 w-14 rounded-full' />
								</div>
							</CardHeader>
							<CardContent className='space-y-3'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-11/12' />
								<Skeleton className='h-4 w-2/3' />
							</CardContent>
							<CardFooter className='flex items-center justify-between'>
								<Skeleton className='h-4 w-20' />
								<Skeleton className='h-8 w-16 rounded-full' />
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</main>
	);
}
