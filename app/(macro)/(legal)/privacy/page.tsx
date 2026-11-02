import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: 'Privacy and data protection policy for TRNDZZ B2B users.',
};

export default function PrivacyPage() {
	return (
		<div className='mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8'>
			<h1 className='text-3xl font-extrabold tracking-tight'>
				Privacy Policy
			</h1>
			<div className='space-y-4 text-sm text-muted-foreground leading-relaxed'>
				<p>
					TRNDZZ collects business contact information, corporate
					verification documents (such as CAC registration and SON/ISO
					certificates), and procurement RFQ specifications strictly
					to facilitate B2B trade discovery and supplier matching.
				</p>
				<p>
					Unclaimed directory profiles do not receive unmasked buyer
					contact details until corporate ownership verification has
					been reviewed and approved by TRNDZZ analysts.
				</p>
			</div>
		</div>
	);
}

