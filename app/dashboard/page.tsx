import Link from 'next/link';
import {
	ArrowUpRight,
	Building2,
	FileSpreadsheet,
	ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireServerUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';

export default async function DashboardOverviewPage({
	searchParams,
}: {
	searchParams: Promise<{ claim?: string }>;
}) {
	const user = await requireServerUser('/dashboard');
	const { claim } = await searchParams;

	const [buyerRfqCount, memberships, pendingClaims, claimTarget] =
		await Promise.all([
			prisma.rfq.count({ where: { buyerId: user.userId } }),
			prisma.companyMember.findMany({
				where: { userId: user.userId },
				include: {
					company: {
						select: {
							id: true,
							name: true,
							slug: true,
							verificationTier: true,
							_count: {
								select: { rfqMatches: true, rfqQuotes: true },
							},
						},
					},
				},
			}),
			prisma.companyClaimRequest.count({
				where: { requesterId: user.userId },
			}),
			claim
				? prisma.company.findUnique({
						where: { slug: claim },
						select: {
							name: true,
							slug: true,
							verticals: {
								take: 1,
								include: {
									vertical: { select: { slug: true } },
								},
							},
						},
					})
				: Promise.resolve(null),
		]);

	const claimVerticalSlug =
		claimTarget?.verticals[0]?.vertical.slug ?? 'aluminium';

	return (
		<div className='space-y-8'>
			<div>
				<div className='flex flex-wrap items-center gap-2'>
					<h1 className='text-2xl font-bold tracking-tight'>
						Welcome, {user.name}
					</h1>
					<Badge variant='secondary'>{user.role}</Badge>
				</div>
				<p className='mt-1 text-sm text-muted-foreground'>
					{user.companyName || 'B2B Account'} · Manage buyer RFQs,
					standardized supplier quotes, and verified company profiles.
				</p>
			</div>

			{claimTarget && (
				<div className='flex flex-col justify-between gap-4 rounded-xl border border-amber/40 bg-amber/10 p-5 sm:flex-row sm:items-center'>
					<div>
						<div className='flex items-center gap-2 font-semibold'>
							<ShieldCheck className='h-5 w-5 text-amber' />
							<span>
								Complete Ownership Claim for {claimTarget.name}
							</span>
						</div>
						<p className='mt-1 text-xs text-muted-foreground'>
							Submit CAC registration credentials to unlock matched
							buyer RFQs and manage your catalog.
						</p>
					</div>
					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90 shrink-0'
					>
						<a
							href={buildVerticalUrl(
								claimVerticalSlug,
								`/directory/${claimTarget.slug}/claim`
							)}
						>
							Proceed to Verification Form →
						</a>
					</Button>
				</div>
			)}

			<div className='grid gap-6 md:grid-cols-3'>
				<Link
					href='/dashboard/rfqs'
					className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60'
				>
					<div className='flex items-center justify-between'>
						<span className='text-sm text-muted-foreground'>
							Submitted Buyer RFQs
						</span>
						<FileSpreadsheet className='h-4 w-4 text-amber' />
					</div>
					<p className='font-tabular mt-3 text-3xl font-bold'>
						{formatNumber(buyerRfqCount)}
					</p>
					<p className='mt-2 text-xs font-medium text-primary'>
						Open Comparison Matrix →
					</p>
				</Link>

				<Link
					href='/dashboard/company'
					className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60'
				>
					<div className='flex items-center justify-between'>
						<span className='text-sm text-muted-foreground'>
							Managed Supplier Profiles
						</span>
						<Building2 className='h-4 w-4 text-verified' />
					</div>
					<p className='font-tabular mt-3 text-3xl font-bold'>
						{formatNumber(memberships.length)}
					</p>
					<p className='mt-2 text-xs font-medium text-primary'>
						Manage Storefront & SKUs →
					</p>
				</Link>

				<Link
					href='/dashboard/claims'
					className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60'
				>
					<div className='flex items-center justify-between'>
						<span className='text-sm text-muted-foreground'>
							Verification Claim Requests
						</span>
						<ShieldCheck className='h-4 w-4 text-primary' />
					</div>
					<p className='font-tabular mt-3 text-3xl font-bold'>
						{formatNumber(pendingClaims)}
					</p>
					<p className='mt-2 text-xs font-medium text-primary'>
						Track Claim Status →
					</p>
				</Link>
			</div>

			<div className='rounded-xl border border-border bg-card p-6'>
				<h2 className='text-lg font-bold'>Portal Shortcuts</h2>
				<p className='mt-1 text-sm text-muted-foreground'>
					Broadcast new sourcing tenders, inspect LME & local Naira
					(`₦`) coil benchmarks, or respond to open buyer RFQs.
				</p>
				<div className='mt-4 flex flex-wrap gap-3'>
					<Button asChild className='gap-1.5'>
						<a href={buildVerticalUrl('aluminium', '/rfq/new')}>
							Broadcast Aluminium RFQ
							<ArrowUpRight className='h-4 w-4' />
						</a>
					</Button>
					<Button asChild variant='outline'>
						<Link href='/dashboard/quotes'>
							View Matched Supplier RFQs
						</Link>
					</Button>
					<Button asChild variant='ghost'>
						<a href={buildVerticalUrl('aluminium', '/directory')}>
							Browse Aluminium Directory
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
