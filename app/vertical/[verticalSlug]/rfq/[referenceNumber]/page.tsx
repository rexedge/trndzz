import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
	Calendar,
	FileSpreadsheet,
	MapPin,
	ShieldCheck,
	Sparkles,
} from 'lucide-react';
import { ClaimStatus, RfqVisibility } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma/client';
import { getVerticalRfqByReference } from '@/lib/services/rfq.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { SupplierQuoteForm } from './_quote-form';

export default async function VerticalRfqDetailPage({
	params,
}: {
	params: Promise<{ verticalSlug: string; referenceNumber: string }>;
}) {
	const { verticalSlug, referenceNumber } = await params;
	const { vertical, user } = await resolveRequiredVertical(verticalSlug);

	const rfq = await getVerticalRfqByReference(vertical.id, referenceNumber);
	if (!rfq) {
		notFound();
	}

	const userCompanies = user
		? await prisma.companyMember.findMany({
				where: {
					userId: user.userId,
					company: { claimStatus: ClaimStatus.CLAIMED },
				},
				include: {
					company: {
						select: {
							id: true,
							name: true,
							verificationTier: true,
						},
					},
				},
			})
		: [];

	const rfqPageUrl = buildVerticalUrl(
		vertical.slug,
		`/rfq/${rfq.referenceNumber}`
	);
	const isBuyerOwner = user?.userId === rfq.buyerId;

	return (
		<div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
			<div className='grid gap-8 lg:grid-cols-3'>
				{/* Left Column: Structured Tender Dossier */}
				<div className='space-y-6 lg:col-span-2'>
					<div className='rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5'>
						<div className='flex flex-wrap items-center justify-between gap-2'>
							<div className='flex flex-wrap items-center gap-2'>
								<Link
									href='/rfq'
									className='text-xs font-semibold text-vertical hover:underline mr-2'
								>
									← All RFQs
								</Link>
								<span className='font-tabular rounded bg-amber/15 px-2.5 py-1 text-xs font-bold text-amber'>
									{rfq.referenceNumber}
								</span>
								<Badge variant='secondary'>
									{rfq.category.name}
								</Badge>
								{rfq.visibility ===
									RfqVisibility.VERIFIED_VENDORS_ONLY && (
									<Badge className='bg-verified/15 text-verified border-verified/30'>
										<ShieldCheck className='mr-1 h-3 w-3' />
										Verified Suppliers Only
									</Badge>
								)}
							</div>
							<Badge variant='outline'>{rfq.status}</Badge>
						</div>

						<h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
							{rfq.title}
						</h1>

						<div className='grid gap-4 rounded-xl border border-border bg-background p-5 sm:grid-cols-3'>
							<div>
								<span className='text-xs text-muted-foreground'>
									Sourcing Volume
								</span>
								<p className='font-tabular mt-1 text-xl font-extrabold'>
									{formatNumber(rfq.quantity)} {rfq.unit}
								</p>
							</div>
							<div>
								<span className='text-xs text-muted-foreground'>
									Target Unit Benchmark
								</span>
								<p className='font-tabular mt-1 text-lg font-bold'>
									{rfq.targetUnitPrice
										? `${formatCurrency(rfq.targetUnitPrice, rfq.currency)} / ${rfq.unit}`
										: 'Open Competitive Bid'}
								</p>
							</div>
							<div>
								<span className='text-xs text-muted-foreground'>
									Delivery Location
								</span>
								<p className='mt-1 inline-flex items-center gap-1 text-sm font-semibold'>
									<MapPin className='h-4 w-4 text-muted-foreground' />
									{rfq.deliveryCity
										? `${rfq.deliveryCity}, ${rfq.deliveryState}`
										: rfq.deliveryState}
								</p>
							</div>
						</div>

						{/* Dynamic Spec Table */}
						{Object.keys(rfq.specifications).length > 0 && (
							<div className='space-y-3'>
								<h2 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
									Mandatory Technical Parameters
								</h2>
								<div className='grid gap-3 sm:grid-cols-2'>
									{Object.entries(rfq.specifications).map(
										([key, val]) => (
											<div
												key={key}
												className='flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs'
											>
												<span className='uppercase text-muted-foreground'>
													{key.replace(/_/g, ' ')}
												</span>
												<span className='font-tabular font-bold text-foreground'>
													{val}
												</span>
											</div>
										)
									)}
								</div>
							</div>
						)}

						{/* Commercial Terms & Notes */}
						<div className='space-y-3 border-t border-border pt-5 text-sm'>
							<div className='flex flex-wrap gap-6 text-xs text-muted-foreground'>
								<span>
									Buyer Organization:{' '}
									<strong className='text-foreground'>
										{rfq.buyerCompanyName ||
											'Verified Commercial Buyer'}
									</strong>
								</span>
								{rfq.requiredByDate && (
									<span className='inline-flex items-center gap-1'>
										<Calendar className='h-3.5 w-3.5' />
										Required by:{' '}
										<strong className='font-tabular text-foreground'>
											{new Date(
												rfq.requiredByDate
											).toLocaleDateString('en-NG')}
										</strong>
									</span>
								)}
								<span className='font-tabular'>
									{rfq.matchesCount} matched supplier(s) ·{' '}
									{rfq.quotesCount} quote(s) submitted
								</span>
							</div>

							{rfq.paymentTermsPreference && (
								<p className='text-xs text-muted-foreground'>
									<strong>Preferred Payment Terms:</strong>{' '}
									{rfq.paymentTermsPreference}
								</p>
							)}

							{rfq.additionalNotes && (
								<div className='rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground'>
									<strong className='block mb-1 text-foreground'>
										Inspection & Delivery Instructions:
									</strong>
									{rfq.additionalNotes}
								</div>
							)}

							{rfq.sourceArticle && (
								<div className='flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground'>
									<Sparkles className='h-3.5 w-3.5 text-amber' />
									<span>Originated from market brief:</span>
									<Link
										href={`/pulse/${rfq.sourceArticle.slug}`}
										className='font-semibold text-foreground underline'
									>
										{rfq.sourceArticle.title}
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column: Supplier Quoting Action */}
				<aside className='space-y-4'>
					{isBuyerOwner ? (
						<div className='rounded-2xl border border-primary/40 bg-primary/10 p-6 space-y-3'>
							<div className='flex items-center gap-2 font-bold'>
								<FileSpreadsheet className='h-5 w-5 text-primary' />
								<span>Your Active Buyer RFQ</span>
							</div>
							<p className='text-xs text-muted-foreground leading-relaxed'>
								Compare submitted supplier quotes side-by-side,
								shortlist vendors, and award this tender in your
								Buyer Workspace.
							</p>
							<Button asChild size='sm' className='w-full'>
								<a href={buildMacroUrl('/dashboard/rfqs')}>
									Open Quote Comparison Matrix →
								</a>
							</Button>
						</div>
					) : !user ? (
						<div className='rounded-2xl border border-border bg-card p-6 space-y-4'>
							<h2 className='text-lg font-bold'>
								Are you a qualified {vertical.name} supplier?
							</h2>
							<p className='text-xs text-muted-foreground leading-relaxed'>
								Sign in with a claimed supplier account to
								submit a standardized Naira (`₦`) commercial
								quote on <strong>{rfq.referenceNumber}</strong>.
							</p>
							<Button asChild className='w-full'>
								<a
									href={buildMacroUrl(
										`/auth/login?next=${encodeURIComponent(rfqPageUrl)}`
									)}
								>
									Sign In to Submit Quote
								</a>
							</Button>
							<Button
								asChild
								variant='outline'
								className='w-full'
							>
								<Link href='/directory'>
									Claim Pre-Seeded Listing
								</Link>
							</Button>
						</div>
					) : userCompanies.length === 0 ? (
						<div className='rounded-2xl border border-amber/40 bg-amber/10 p-6 space-y-3'>
							<h2 className='text-base font-bold'>
								Claim Your Supplier Profile First
							</h2>
							<p className='text-xs text-muted-foreground leading-relaxed'>
								Only verified representatives of claimed
								directory companies can submit binding quotes on
								buyer tenders.
							</p>
							<Button
								asChild
								size='sm'
								className='w-full bg-amber text-white hover:opacity-90'
							>
								<Link href='/directory'>
									Find & Claim Your Company →
								</Link>
							</Button>
						</div>
					) : (
						<SupplierQuoteForm
							rfqId={rfq.id}
							rfqQuantity={rfq.quantity}
							rfqUnit={rfq.unit}
							companies={userCompanies.map((m) => ({
								id: m.company.id,
								name: m.company.name,
								verificationTier: m.company.verificationTier,
							}))}
							quotesDashboardUrl={buildMacroUrl(
								'/dashboard/quotes'
							)}
						/>
					)}
				</aside>
			</div>
		</div>
	);
}

