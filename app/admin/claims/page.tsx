import { ClaimRequestStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { listAdminClaimRequests } from '@/lib/services/claim.service';
import { ClaimReviewControls } from './_claim-reviewer';

export default async function AdminClaimsQueuePage() {
	await requirePlatformStaff();
	const claims = await listAdminClaimRequests();

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					CAC & SONCAP Claim Verification Queue
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Approve ownership claims to transition `UNCLAIMED` listings
					into active `CLAIMED` supplier accounts and unlock queued
					buyer RFQ leads.
				</p>
			</div>

			{claims.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No supplier claim requests in the verification queue yet.
				</div>
			) : (
				<div className='space-y-4'>
					{claims.map((claim) => (
						<div
							key={claim.id}
							className='rounded-xl border border-border bg-card p-6 space-y-2'
						>
							<div className='flex flex-wrap items-center justify-between gap-2'>
								<div>
									<h2 className='text-lg font-bold'>
										{claim.company.name}
									</h2>
									<p className='text-xs text-muted-foreground'>
										Requester:{' '}
										<strong>{claim.requester.name}</strong>{' '}
										({claim.workEmail}) · Title:{' '}
										{claim.jobTitle} · Phone: {claim.phone}
									</p>
								</div>
								<div className='flex items-center gap-2'>
									<span className='font-tabular text-xs text-amber font-semibold'>
										{claim.company._count.rfqMatches}{' '}
										matched RFQ(s)
									</span>
									<Badge variant='outline'>
										{claim.status}
									</Badge>
								</div>
							</div>

							<div className='flex flex-wrap gap-4 text-xs text-muted-foreground font-tabular'>
								<span>CAC Number: {claim.rcNumber}</span>
								{claim.proofDocumentUrl && (
									<a
										href={claim.proofDocumentUrl}
										target='_blank'
										rel='noopener noreferrer'
										className='text-primary underline'
									>
										Inspect Proof Document
									</a>
								)}
							</div>

							{claim.message && (
								<p className='rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground'>
									{claim.message}
								</p>
							)}

							{claim.status === ClaimRequestStatus.PENDING ? (
								<ClaimReviewControls
									claimRequestId={claim.id}
								/>
							) : (
								<p className='text-xs text-muted-foreground pt-2'>
									Reviewed by {claim.reviewedBy?.name || 'Staff'}
									{claim.reviewNote
										? ` — "${claim.reviewNote}"`
										: ''}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

