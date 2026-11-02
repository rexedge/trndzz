import { buildMacroUrl } from '@/lib/tenancy/host';
import { Button } from '@/components/ui/button';

export default function VerticalNotFound() {
	return (
		<div className='mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center'>
			<p className='font-tabular text-xs uppercase tracking-widest text-muted-foreground'>
				404 · Unprovisioned Vertical
			</p>
			<h1 className='mt-2 text-2xl font-bold'>
				Industry vertical not active
			</h1>
			<p className='mt-2 text-sm text-muted-foreground'>
				This industrial portal subdomain has not launched publicly yet
				or the requested sector resource was not found.
			</p>
			<Button
				asChild
				className='mt-6'
			>
				<a href={buildMacroUrl('/verticals')}>
					View Active TRNDZZ Verticals
				</a>
			</Button>
		</div>
	);
}

