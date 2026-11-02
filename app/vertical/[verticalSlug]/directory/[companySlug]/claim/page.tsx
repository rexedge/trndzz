import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ClaimStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { getVerticalCompanyProfile } from '@/lib/services/company.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';
import { ClaimCompanyForm } from './_claim-form';

export default async function ClaimCompanyPage({
	params,
}: {
	params: Promise<{ verticalSlug: string; companySlug: string }>;
}) {
	const { verticalSlug, companySlug } = await params;
	const { vertical, user } = await resolveRequiredVertical(verticalSlug);

	const company = await getVerticalCompanyProfile(vertical.id, companySlug);
	if (!company) {
		notFound();
	}

	const claimPageUrl = buildVerticalUrl(
		vertical.slug,
		`/directory/${company.slug}/claim`
	);

	return (
		<div className='mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='space-y-2'>
				<Link
					href={`/directory/${company.slug}`}
					className='text-xs font-semibold text-vertical hover:underline'
				>
					← Back to {company.name} Profile
				</Link>
				<div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber pt-2'>
					<ShieldCheck className='h-4 w-4' />
					<span>Claim & Convert Supplier Onboarding</span>
				</div>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Claim {company.name}
				</h1>
				<p className='text-sm text-muted-foreground leading-relaxed'>
					Verify corporate ownership via CAC registration to manage
					your product catalog, display SONCAP trust badges, and
					respond directly to{' '}
					<strong className='font-tabular text-foreground'>
						{formatNumber(company._count.rfqMatches)}
					</strong>{' '}
					matched buyer RFQ(s).
				</p>
			</div>

			{company.claimStatus === ClaimStatus.CLAIMED ? (
				<div className='rounded-2xl border border-verified/40 bg-verified/10 p-6 space-y-3'>
					<div className='flex items-center gap-2 font-bold text-verified'>
						<CheckCircle2 className='h-5 w-5' />
						<span>Profile Already Claimed & Verified</span>
					</div>
					<p className='text-sm text-muted-foreground'>
						This supplier listing is actively managed by verified
						company representatives.
					</p>
					<Button asChild variant='outline' size='sm'>
						<Link href={`/directory/${company.slug}`}>
							Return to Supplier Profile
						</Link>
					</Button>
				</div>
			) : !user ? (
				<div className='rounded-2xl border border-border bg-card p-8 space-y-4'>
					<h2 className='text-lg font-bold'>
						Sign in or create a supplier account first
					</h2>
					<p className='text-sm text-muted-foreground'>
						Your ownership claim will bind{' '}
						<strong>{company.name}</strong> directly to your
						authenticated Trndzz Workspace account upon analyst
						verification.
					</p>
					<div className='flex flex-wrap gap-3 pt-2'>
						<Button asChild>
							<a
								href={buildMacroUrl(
									`/auth/register?claim=${company.slug}&next=${encodeURIComponent(claimPageUrl)}`
								)}
							>
								Create Supplier Account
							</a>
						</Button>
						<Button asChild variant='outline'>
							<a
								href={buildMacroUrl(
									`/auth/login?next=${encodeURIComponent(claimPageUrl)}`
								)}
							>
								Sign In to Existing Account
							</a>
						</Button>
					</div>
				</div>
			) : (
				<ClaimCompanyForm
					companyId={company.id}
					companyName={company.name}
					defaultEmail={user.email}
					defaultPhone={user.phone}
					defaultJobTitle={user.jobTitle}
					claimsDashboardUrl={buildMacroUrl('/dashboard/claims')}
				/>
			)}
		</div>
	);
}

