import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/guards';
import { RegisterForm } from './_register-form';

export const metadata: Metadata = {
	title: 'Register B2B Account',
	description:
		'Register as an industrial buyer or claim your supplier directory profile on TRNDZZ.',
};

export default async function RegisterPage({
	searchParams,
}: {
	searchParams: Promise<{ claim?: string }>;
}) {
	const user = await getCurrentUser();
	const { claim } = await searchParams;

	if (user) {
		redirect(
			claim
				? `/dashboard?claim=${encodeURIComponent(claim)}`
				: '/dashboard'
		);
	}

	return (
		<div className='w-full max-w-md rounded-xl border border-border bg-card p-8'>
			{claim && (
				<div className='mb-5 flex items-start gap-2.5 rounded-lg border border-amber/40 bg-amber/10 p-3.5 text-xs'>
					<ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-amber' />
					<div>
						<p className='font-semibold text-foreground'>
							Claiming directory profile:
						</p>
						<p className='font-tabular text-muted-foreground'>
							{claim}
						</p>
					</div>
				</div>
			)}

			<div className='mb-6'>
				<h1 className='text-2xl font-bold tracking-tight'>
					Create B2B Workspace
				</h1>
				<p className='mt-1.5 text-sm text-muted-foreground'>
					Broadcast specification-driven RFQs or verify your company
					listing to quote on commercial tenders.
				</p>
			</div>

			<RegisterForm claimSlug={claim} />
		</div>
	);
}

