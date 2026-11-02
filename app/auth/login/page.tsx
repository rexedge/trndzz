import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { LoginForm } from './_login-form';

export const metadata: Metadata = {
	title: 'Sign In',
	description:
		'Sign in to your TRNDZZ B2B Buyer & Supplier Workspace across all industry verticals.',
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string }>;
}) {
	const user = await getCurrentUser();
	const { next } = await searchParams;

	if (user) {
		redirect(next || '/dashboard');
	}

	return (
		<div className='w-full max-w-md rounded-xl border border-border bg-card p-8'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold tracking-tight'>
					Sign In to TRNDZZ
				</h1>
				<p className='mt-1.5 text-sm text-muted-foreground'>
					Single sign-on across all{' '}
					<span className='font-tabular text-foreground'>
						*.trndzz.com
					</span>{' '}
					procurement portals.
				</p>
			</div>

			<LoginForm nextPath={next} />
		</div>
	);
}

