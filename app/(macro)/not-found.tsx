import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MacroNotFound() {
	return (
		<div className='mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center'>
			<p className='font-tabular text-xs uppercase tracking-widest text-muted-foreground'>
				404 · Macro Hub
			</p>
			<h1 className='mt-2 text-2xl font-bold'>Page not found</h1>
			<p className='mt-2 text-sm text-muted-foreground'>
				The cross-sector page you requested is unavailable.
			</p>
			<Button
				asChild
				className='mt-6'
			>
				<Link href='/'>Back to TRNDZZ Home</Link>
			</Button>
		</div>
	);
}

