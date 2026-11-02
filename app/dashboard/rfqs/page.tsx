import { CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { RfqStatus, VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { requireServerUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { QuoteDecisionButtons } from './_quote-decision-buttons';

export default async function BuyerRfqsMatrixPage() {
	const user = await requireServerUser('/dashboard/rfqs');

	const rfqs = await prisma.rfq.findMany({
		where: { buyerId: user.userId },
		orderBy: { createdAt: 'desc' },
		include: {
			vertical: { select: { name: true, slug: true } },
			category: { select: { name: true } },
			_count: { select: { matches: true } },
			quotes: {
				orderBy: { unitPrice: 'asc' },
				include: {
					company: {
						select: {
							name: true,
							slug: true,
							verificationTier: true,
							headquartersState: true,
						},
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
						Buyer RFQs & Side-by-Side Quote Matrix
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Compare standardized Naira (`₦`) supplier quotes by unit
						rate, lead time, MOQ, and compliance terms.
					</p>
				</div>
				<Button
					asChild
					className='bg-amber text-white hover:opacity-90 gap-1.5'
				>
					<a href={buildVerticalUrl('aluminium', '/rfq/new')}>
						<FileSpreadsheet className='h-4 w-4' />
						New Buyer RFQ
					</a>
				</Button>
			</div>

			{rfqs.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center'>
					<p className='text-sm text-muted-foreground'>
						You have not broadcast any sourcing RFQs yet.
					</p>
					<Button
						asChild
						size='sm'
						className='mt-4 bg-amber text-white hover:opacity-90'
					>
						<a href={buildVerticalUrl('aluminium', '/rfq/new')}>
							Broadcast Your First RFQ →
						</a>
					</Button>
				</div>
			) : (
				<div className='space-y-8'>
					{rfqs.map((rfq) => {
						const specs =
							(rfq.specifications as Record<string, string>) ??
							{};
						const isAwarded = rfq.status === RfqStatus.AWARDED;

						return (
							<section
								key={rfq.id}
								className='rounded-2xl border border-border bg-card p-6 space-y-5'
							>
								<div className='flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4'>
									<div className='space-y-1.5'>
										<div className='flex flex-wrap items-center gap-2 text-xs'>
											<a
												href={buildVerticalUrl(
													rfq.vertical.slug,
													`/rfq/${rfq.referenceNumber}`
												)}
												className='font-tabular font-bold text-amber hover:underline'
											>
												{rfq.referenceNumber}
											</a>
											<Badge variant='secondary'>
												{rfq.vertical.name} ·{' '}
												{rfq.category.name}
											</Badge>
											<Badge
												variant={
													isAwarded
														? 'default'
														: 'outline'
												}
											>
												{rfq.status}
											</Badge>
										</div>
										<h2 className='text-lg font-bold'>
											{rfq.title}
										</h2>
										<div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
											<span className='font-tabular font-semibold text-foreground'>
												{formatNumber(
													Number(rfq.quantity)
												)}{' '}
												{rfq.unit}
											</span>
											<span>
												· Delivery: {rfq.deliveryState}
											</span>
											<span className='font-tabular'>
												· {rfq._count.matches} matched
												vendors
											</span>
										</div>
									</div>

									{Object.keys(specs).length > 0 && (
										<div className='flex flex-wrap gap-1.5'>
											{Object.entries(specs).map(
												([k, v]) => (
													<span
														key={k}
														className='font-tabular rounded border border-border bg-background px-2 py-0.5 text-[11px]'
													>
														{k.replace(/_/g, ' ')}:{' '}
														<strong>{v}</strong>
													</span>
												)
											)}
										</div>
									)}
								</div>

								{/* Standardized Comparison Matrix */}
								{rfq.quotes.length === 0 ? (
									<div className='rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground'>
										Broadcast delivered to{' '}
										<strong>{rfq._count.matches}</strong>{' '}
										matched supplier(s). Quotes will appear
										in this comparison matrix as vendors
										respond.
									</div>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Supplier</TableHead>
												<TableHead>
													Unit Price
												</TableHead>
												<TableHead>
													Total Value
												</TableHead>
												<TableHead>Lead Time</TableHead>
												<TableHead>
													Payment & Compliance
												</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Decision</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{rfq.quotes.map((quote) => (
												<TableRow key={quote.id}>
													<TableCell>
														<a
															href={buildVerticalUrl(
																rfq.vertical
																	.slug,
																`/directory/${quote.company.slug}`
															)}
															className='inline-flex items-center gap-1 font-semibold hover:underline'
														>
															{quote.company
																.verificationTier !==
																VerificationTier.UNVERIFIED && (
																<CheckCircle2 className='h-3.5 w-3.5 text-verified' />
															)}
															<span>
																{
																	quote
																		.company
																		.name
																}
															</span>
														</a>
														<span className='block text-xs text-muted-foreground'>
															{
																quote.company
																	.headquartersState
															}
														</span>
													</TableCell>
													<TableCell className='font-tabular font-bold'>
														{formatCurrency(
															Number(
																quote.unitPrice
															),
															quote.currency
														)}
														<span className='text-xs font-normal text-muted-foreground'>
															{' '}
															/ {rfq.unit}
														</span>
													</TableCell>
													<TableCell className='font-tabular font-semibold'>
														{formatCurrency(
															Number(
																quote.totalPrice
															),
															quote.currency
														)}
													</TableCell>
													<TableCell className='font-tabular text-xs'>
														{quote.leadTimeDays}{' '}
														days
														{quote.minimumOrderQty && (
															<span className='block text-muted-foreground'>
																MOQ:{' '}
																{Number(
																	quote.minimumOrderQty
																)}{' '}
																{rfq.unit}
															</span>
														)}
													</TableCell>
													<TableCell className='max-w-xs text-xs'>
														<p className='font-medium'>
															{quote.paymentTerms}
														</p>
														{quote.complianceNotes && (
															<p className='mt-0.5 text-muted-foreground line-clamp-2'>
																{
																	quote.complianceNotes
																}
															</p>
														)}
													</TableCell>
													<TableCell>
														<Badge variant='outline'>
															{quote.status}
														</Badge>
													</TableCell>
													<TableCell>
														<QuoteDecisionButtons
															quoteId={quote.id}
															currentStatus={
																quote.status
															}
															rfqAwarded={
																isAwarded
															}
														/>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</section>
						);
					})}
				</div>
			)}
		</div>
	);
}

