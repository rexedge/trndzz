import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootNotFound() {
	return (
		<div className='flex min-h-[75vh] items-center justify-center px-4'>
			<div className='w-full max-w-md rounded-xl border border-border bg-card p-8 text-center'>
				<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary'>
					<Compass className='h-6 w-6' />
				</div>
				<p className='font-tabular text-xs font-medium uppercase tracking-widest text-muted-foreground'>
					Error 404
				</p>
				<h1 className='mt-1 text-2xl font-bold'>
					Portal page or listing not found
				</h1>
				<p className='mt-2 text-sm text-muted-foreground'>
					The industry vertical, supplier profile, or RFQ reference
					you requested does not exist or may have moved.
				</p>
				<div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
					<Button asChild>
						<Link href='/'>Go to Portal Home</Link>
					</Button>
					<Button
						asChild
						variant='outline'
					>
						<Link href='/verticals'>Browse Industry Verticals</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
