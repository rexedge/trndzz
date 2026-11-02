import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireServerUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default async function SupplierQuotesWorkspacePage() {
	const user = await requireServerUser('/dashboard/quotes');

	const memberships = await prisma.companyMember.findMany({
		where: { userId: user.userId },
		select: { companyId: true },
	});
	const companyIds = memberships.map((m) => m.companyId);

	const [matches, quotes] =
		companyIds.length > 0
			? await Promise.all([
					prisma.rfqVendorMatch.findMany({
						where: { companyId: { in: companyIds } },
						orderBy: { createdAt: 'desc' },
						include: {
							company: { select: { name: true } },
							rfq: {
								include: {
									vertical: {
										select: { name: true, slug: true },
									},
									category: { select: { name: true } },
								},
							},
						},
					}),
					prisma.rfqQuote.findMany({
						where: { companyId: { in: companyIds } },
						orderBy: { createdAt: 'desc' },
						include: {
							company: { select: { name: true } },
							rfq: {
								include: {
									vertical: {
										select: { name: true, slug: true },
									},
								},
							},
						},
					}),
				])
			: [[], []];

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Supplier RFQ Matches & Submitted Quotes
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Respond to incoming buyer RFQ broadcasts matched to your
					plant capacity and track buyer award decisions.
				</p>
			</div>

			{companyIds.length === 0 ? (
				<div className='rounded-xl border border-amber/40 bg-amber/10 p-8 space-y-3'>
					<h2 className='text-lg font-bold'>
						No Claimed Supplier Profile Linked Yet
					</h2>
					<p className='text-sm text-muted-foreground'>
						Claim your company directory listing on a vertical
						portal to receive automated RFQ broadcasts and submit
						standardized quotes.
					</p>
					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90'
					>
						<a href={buildVerticalUrl('aluminium', '/directory')}>
							Find & Claim Company in Directory →
						</a>
					</Button>
				</div>
			) : (
				<div className='grid gap-8 lg:grid-cols-2'>
					{/* Matched RFQs */}
					<section className='space-y-4'>
						<h2 className='text-lg font-bold'>
							Incoming Matched Buyer RFQs ({matches.length})
						</h2>
						{matches.length === 0 ? (
							<div className='rounded-xl border border-dashed border-border p-8 text-xs text-muted-foreground'>
								No buyer RFQs matched yet. Browse open tenders
								on the vertical RFQ board anytime.
							</div>
						) : (
							<div className='space-y-3'>
								{matches.map((m) => (
									<div
										key={m.id}
										className='rounded-xl border border-border bg-card p-5 space-y-2.5'
									>
										<div className='flex items-center justify-between text-xs'>
											<span className='font-tabular font-bold text-amber'>
												{m.rfq.referenceNumber}
											</span>
											<Badge variant='secondary'>
												{m.status} · Score{' '}
												{m.matchScore}%
											</Badge>
										</div>
										<h3 className='font-bold text-sm'>
											{m.rfq.title}
										</h3>
										<p className='text-xs text-muted-foreground'>
											Matched to:{' '}
											<strong>{m.company.name}</strong> ·{' '}
											{formatNumber(
												Number(m.rfq.quantity)
											)}{' '}
											{m.rfq.unit} ·{' '}
											{m.rfq.deliveryState}
										</p>
										{m.matchReason && (
											<p className='text-[11px] text-muted-foreground'>
												{m.matchReason}
											</p>
										)}
										<div className='pt-1'>
											<Button
												asChild
												size='sm'
												variant='outline'
												className='gap-1 text-xs'
											>
												<a
													href={buildVerticalUrl(
														m.rfq.vertical.slug,
														`/rfq/${m.rfq.referenceNumber}`
													)}
												>
													Inspect & Quote
													<ArrowUpRight className='h-3.5 w-3.5' />
												</a>
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</section>

					{/* Submitted Quotes */}
					<section className='space-y-4'>
						<h2 className='text-lg font-bold'>
							Submitted Commercial Quotes ({quotes.length})
						</h2>
						{quotes.length === 0 ? (
							<div className='rounded-xl border border-dashed border-border p-8 text-xs text-muted-foreground'>
								You have not submitted any quotes yet.
							</div>
						) : (
							<div className='space-y-3'>
								{quotes.map((q) => (
									<div
										key={q.id}
										className='rounded-xl border border-border bg-card p-5 space-y-2'
									>
										<div className='flex items-center justify-between text-xs'>
											<span className='font-tabular font-semibold text-muted-foreground'>
												{q.rfq.referenceNumber}
											</span>
											<Badge
												variant={
													q.status === 'ACCEPTED'
														? 'default'
														: 'outline'
												}
											>
												{q.status}
											</Badge>
										</div>
										<h3 className='text-sm font-bold'>
											{q.rfq.title}
										</h3>
										<div className='flex flex-wrap items-center justify-between text-xs pt-1'>
											<span className='font-tabular font-bold'>
												Unit:{' '}
												{formatCurrency(
													Number(q.unitPrice),
													q.currency
												)}{' '}
												· Total:{' '}
												{formatCurrency(
													Number(q.totalPrice),
													q.currency
												)}
											</span>
											<span className='font-tabular text-muted-foreground'>
												Lead: {q.leadTimeDays}d
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			)}
		</div>
	);
}

