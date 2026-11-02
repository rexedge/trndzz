import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireServerUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { buildVerticalUrl } from '@/lib/tenancy/host';

export default async function ClaimsTrackerPage() {
	const user = await requireServerUser('/dashboard/claims');

	const claims = await prisma.companyClaimRequest.findMany({
		where: { requesterId: user.userId },
		orderBy: { createdAt: 'desc' },
		include: {
			company: {
				select: {
					name: true,
					slug: true,
					verificationTier: true,
					verticals: {
						take: 1,
						include: { vertical: { select: { slug: true } } },
					},
				},
			},
		},
	});

	return (
		<div className='space-y-8'>
			<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Company Ownership & CAC Verification Claims
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Track verification review status for pre-seeded supplier
						directory profiles you have claimed.
					</p>
				</div>
				<Button asChild variant='outline' size='sm'>
					<a href={buildVerticalUrl('aluminium', '/directory')}>
						Browse Unclaimed Listings
					</a>
				</Button>
			</div>

			{claims.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center'>
					<ShieldCheck className='mx-auto h-8 w-8 text-muted-foreground' />
					<p className='mt-3 text-sm text-muted-foreground'>
						You have not submitted any company ownership claims yet.
					</p>
				</div>
			) : (
				<div className='space-y-4'>
					{claims.map((claim) => {
						const vSlug =
							claim.company.verticals[0]?.vertical.slug ??
							'aluminium';
						return (
							<div
								key={claim.id}
								className='rounded-xl border border-border bg-card p-6 space-y-3'
							>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<div>
										<h2 className='text-lg font-bold'>
											{claim.company.name}
										</h2>
										<p className='font-tabular text-xs text-muted-foreground'>
											CAC: {claim.rcNumber || 'Submitted'}{' '}
											· Role: {claim.jobTitle} ·{' '}
											{claim.workEmail}
										</p>
									</div>
									<Badge
										variant={
											claim.status === 'APPROVED'
												? 'default'
												: claim.status === 'REJECTED'
													? 'destructive'
													: 'secondary'
										}
									>
										{claim.status}
									</Badge>
								</div>

								{claim.message && (
									<p className='text-xs text-muted-foreground'>
										{claim.message}
									</p>
								)}

								{claim.reviewNote && (
									<div className='rounded-lg bg-muted/60 p-3 text-xs'>
										<strong>Analyst Review Note:</strong>{' '}
										{claim.reviewNote}
									</div>
								)}

								<div className='flex items-center gap-3 pt-1'>
									<Button
										asChild
										size='sm'
										variant='outline'
									>
										<a
											href={buildVerticalUrl(
												vSlug,
												`/directory/${claim.company.slug}`
											)}
										>
											View Directory Listing
										</a>
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

