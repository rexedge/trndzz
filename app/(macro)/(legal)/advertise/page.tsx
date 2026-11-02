import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Verified Pro & Enterprise Sponsorships',
	description:
		'Verify your manufacturing facility, unlock instant RFQ broadcasts, and sponsor category hubs on TRNDZZ.',
};

export default function AdvertisePage() {
	return (
		<div className='mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8'>
			<div className='max-w-2xl'>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Supplier Verification & Category Sponsorships
				</h1>
				<p className='mt-2 text-muted-foreground leading-relaxed'>
					Position your rolling mill, extrusion plant, bonded
					warehouse, or EPC firm directly in front of commercial
					procurement managers.
				</p>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				<div className='rounded-xl border border-border bg-card p-6'>
					<h2 className='text-lg font-bold'>Verified Supplier</h2>
					<p className='mt-1 text-xs text-muted-foreground'>
						CAC & SON/ISO Document Vetting
					</p>
					<ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
						<li className='flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-verified' />
							Emerald Verified Trust Badge
						</li>
						<li className='flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-verified' />
							Quote on Verified-Only RFQs
						</li>
					</ul>
				</div>

				<div className='rounded-xl border border-primary bg-card p-6'>
					<h2 className='text-lg font-bold'>Verified Pro</h2>
					<p className='mt-1 text-xs text-muted-foreground'>
						Priority Directory & Instant Lead Routing
					</p>
					<ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
						<li className='flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-primary' />
							Priority Placement in Category
						</li>
						<li className='flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-primary' />
							Real-Time RFQ Alerts & Full Catalog
						</li>
					</ul>
				</div>

				<div className='rounded-xl border border-amber/60 bg-card p-6'>
					<h2 className='text-lg font-bold'>Enterprise Sponsor</h2>
					<p className='mt-1 text-xs text-muted-foreground'>
						Flagship Vertical Authority
					</p>
					<ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
						<li className='flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-amber' />
							Vertical Masthead & Pulse Exclusivity
						</li>
						<li className='flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-amber' />
							Co-Branded Sector Outlook Reports
						</li>
					</ul>
				</div>
			</div>

			<Button asChild>
				<Link href='/auth/register'>Claim Your Company Listing</Link>
			</Button>
		</div>
	);
}

