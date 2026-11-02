import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'About TRNDZZ',
	description:
		'Learn how TRNDZZ organizes fragmented African industrial supply chains into verified B2B trade intelligence and procurement portals.',
};

export default function AboutPage() {
	return (
		<div className='mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8'>
			<div>
				<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
					About TRNDZZ
				</h1>
				<p className='mt-3 text-lg text-muted-foreground leading-relaxed'>
					TRNDZZ (`trndzz.com`) is a multi-tenant B2B trade
					intelligence, verified vendor directory, and procurement
					ecosystem organizing fragmented industrial supply chains
					into deep vertical portals.
				</p>
			</div>

			<div className='grid gap-6 sm:grid-cols-2'>
				<div className='rounded-xl border border-border bg-card p-6'>
					<h2 className='text-lg font-bold'>Value-Chain Depth</h2>
					<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
						Unlike generic directories, every TRNDZZ portal maps
						Upstream raw material importers, Midstream processors &
						rolling mills, and Downstream fabricators & EPCs with
						exact technical specifications.
					</p>
				</div>
				<div className='rounded-xl border border-border bg-card p-6'>
					<h2 className='text-lg font-bold'>
						Intelligence-to-Procurement
					</h2>
					<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
						Commodity price trackers and regulatory updates connect
						directly to SON/CAC-verified suppliers and multi-vendor
						RFQ broadcasting.
					</p>
				</div>
			</div>
		</div>
	);
}

