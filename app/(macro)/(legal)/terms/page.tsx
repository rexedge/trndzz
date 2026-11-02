import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Terms of Trade & Service',
	description:
		'Terms governing directory listings, RFQ broadcasts, and market intelligence on TRNDZZ.',
};

export default function TermsPage() {
	return (
		<div className='mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8'>
			<h1 className='text-3xl font-extrabold tracking-tight'>
				Terms of Service
			</h1>
			<div className='space-y-4 text-sm text-muted-foreground leading-relaxed'>
				<p>
					Commodity prices and regional market benchmarks published on
					TRNDZZ Pulse are provided for B2B market intelligence and
					indicative benchmarking. Commercial buyers and suppliers are
					responsible for final Mill Test Certificate (MTC) inspection
					and contractual execution.
				</p>
				<p>
					Submitting false corporate representation or forged
					regulatory certifications during the Claim & Convert
					verification process results in immediate permanent account
					suspension.
				</p>
			</div>
		</div>
	);
}

