import { Layers } from 'lucide-react';
import { buildMacroUrl } from '@/lib/tenancy/host';

interface VerticalFooterProps {
	verticalName: string;
	verticalSlug: string;
	tagline: string | null;
}

export function VerticalFooter({
	verticalName,
	verticalSlug,
	tagline,
}: VerticalFooterProps) {
	return (
		<footer className='border-t border-border bg-card'>
			<div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
				<div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
					<div>
						<div className='flex items-center gap-2'>
							<Layers className='h-5 w-5 text-vertical' />
							<span className='text-base font-extrabold uppercase tracking-tight'>
								TRNDZZ {verticalName}
							</span>
							<span className='font-tabular rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground'>
								{verticalSlug}.trndzz.com
							</span>
						</div>
						{tagline && (
							<p className='mt-2 max-w-xl text-sm text-muted-foreground'>
								{tagline}
							</p>
						)}
					</div>

					<div className='flex flex-wrap items-center gap-5 text-sm text-muted-foreground'>
						<a
							href={buildMacroUrl('/')}
							className='hover:text-foreground transition-colors'
						>
							Macro Hub
						</a>
						<a
							href={buildMacroUrl('/verticals')}
							className='hover:text-foreground transition-colors'
						>
							All Verticals
						</a>
						<a
							href={buildMacroUrl('/advertise')}
							className='hover:text-foreground transition-colors'
						>
							Sponsor {verticalName}
						</a>
						<a
							href={buildMacroUrl('/privacy')}
							className='hover:text-foreground transition-colors'
						>
							Privacy
						</a>
						<a
							href={buildMacroUrl('/terms')}
							className='hover:text-foreground transition-colors'
						>
							Terms
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

