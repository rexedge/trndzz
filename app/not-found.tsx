import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto flex max-w-2xl flex-col gap-4'>
				<div>
					<h1 className='text-2xl font-semibold'>Page not found</h1>
					<p className='text-muted-foreground'>
						The page you are looking for does not exist.
					</p>
				</div>
				<Button asChild>
					<Link href='/'>Back to home</Link>
				</Button>
			</div>
		</main>
	);
}
