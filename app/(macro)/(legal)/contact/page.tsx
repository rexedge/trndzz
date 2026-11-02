import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Contact Trade Desk',
	description:
		'Reach the TRNDZZ editorial, supplier verification, and assisted procurement desk.',
};

export default function ContactPage() {
	return (
		<div className='mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8'>
			<h1 className='text-3xl font-extrabold tracking-tight'>
				Contact the TRNDZZ Trade Desk
			</h1>
			<p className='text-muted-foreground leading-relaxed'>
				For supplier verification inquiries, market survey submissions,
				or enterprise partnerships across West Africa:
			</p>
			<div className='rounded-xl border border-border bg-card p-6 space-y-3 text-sm'>
				<p>
					<strong>Editorial & Market Intelligence:</strong>{' '}
					<span className='font-tabular text-muted-foreground'>
						editorial@trndzz.com
					</span>
				</p>
				<p>
					<strong>Supplier Verification & Claims:</strong>{' '}
					<span className='font-tabular text-muted-foreground'>
						verify@trndzz.com
					</span>
				</p>
				<p>
					<strong>Enterprise Sponsorships:</strong>{' '}
					<span className='font-tabular text-muted-foreground'>
						partnerships@trndzz.com
					</span>
				</p>
			</div>
		</div>
	);
}

