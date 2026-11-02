import Link from 'next/link';
import {
	Award,
	Building2,
	CheckCircle2,
	FileSpreadsheet,
	MapPin,
	Newspaper,
	ShieldAlert,
} from 'lucide-react';
import { ClaimStatus, VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getVerticalHomeOverview } from '@/lib/services/vertical.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { formatNumber } from '@/lib/utils/format';

export default async function VerticalPortalHomePage({
	params,
}: {
	params: Promise<{ verticalSlug: string }>;
}) {
	const { verticalSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const { articles, companies, openRfqs } = await getVerticalHomeOverview(
		vertical.id
	);

	return (
		<div className='mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 lg:px-8'>
			{/* Vertical Masthead Hero */}
			<section className='rounded-2xl border border-border bg-card p-8 md:p-10'>
				<div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-end'>
					<div className='max-w-3xl'>
						<div className='flex flex-wrap items-center gap-2'>
							<span className='font-tabular rounded bg-vertical/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-vertical'>
								{vertical.slug}.trndzz.com
							</span>
							<Badge variant='outline'>
								Upstream · Midstream · Downstream
							</Badge>
						</div>
						<h1 className='mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl'>
							{vertical.tagline ||
								`${vertical.name} Trade Intelligence & Procurement Hub`}
						</h1>
						<p className='mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed'>
							{vertical.description}
						</p>
					</div>

					<div className='flex shrink-0 flex-wrap items-center gap-3'>
						<Button
							asChild
							size='lg'
							className='bg-amber text-white hover:opacity-90 gap-2'
						>
							<Link href='/rfq/new'>
								<FileSpreadsheet className='h-4 w-4' />
								Submit Structured RFQ
							</Link>
						</Button>
						<Button asChild variant='outline' size='lg'>
							<Link href='/directory'>
								Browse Verified Suppliers
							</Link>
						</Button>
					</div>
				</div>

				{/* Value-Chain Stage Matrix */}
				{vertical.valueChainStages.length > 0 && (
					<div className='mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4'>
						{vertical.valueChainStages.map((stage) => (
							<Link
								key={stage.id}
								href={`/pulse/stage/${stage.slug}`}
								className='rounded-xl border border-border bg-background p-4 transition-colors hover:border-vertical/60'
							>
								<span className='font-tabular text-[11px] font-semibold uppercase tracking-wider text-vertical'>
									{stage.streamPosition.replace('_', ' ')}
								</span>
								<h2 className='mt-1 text-sm font-bold leading-snug'>
									{stage.name}
								</h2>
								{stage.description && (
									<p className='mt-1.5 text-xs text-muted-foreground line-clamp-2'>
										{stage.description}
									</p>
								)}
							</Link>
						))}
					</div>
				)}
			</section>

			{/* Pillar 1 & Pillar 5: Trndzz Pulse + Contextual Cross-Linking */}
			<section id='pulse' className='grid gap-8 lg:grid-cols-3'>
				<div className='lg:col-span-2 space-y-5'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Newspaper className='h-5 w-5 text-vertical' />
							<h2 className='text-2xl font-bold tracking-tight'>
								Trndzz Pulse · {vertical.name} Briefs
							</h2>
						</div>
						<Link
							href='/pulse'
							className='text-xs font-semibold text-vertical hover:underline'
						>
							All Briefs →
						</Link>
					</div>

					{articles.length === 0 ? (
						<div className='rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
							No {vertical.name} market briefs published yet.
						</div>
					) : (
						<div className='space-y-4'>
							{articles.map((article) => (
								<article
									key={article.id}
									className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-vertical/50'
								>
									<div className='flex flex-wrap items-center gap-2 text-xs'>
										{article.isVerticalPinned && (
											<Badge className='bg-vertical text-white'>
												LEAD INTELLIGENCE
											</Badge>
										)}
										{article.valueChainStage && (
											<Link
												href={`/pulse/stage/${article.valueChainStage.slug}`}
											>
												<Badge variant='secondary'>
													{article.valueChainStage.streamPosition.replace(
														'_',
														' '
													)}
												</Badge>
											</Link>
										)}
										{article.category && (
											<span className='font-tabular text-muted-foreground'>
												· {article.category.name}
											</span>
										)}
									</div>

									<h3 className='mt-3 text-xl font-bold leading-snug'>
										<Link
											href={`/pulse/${article.slug}`}
											className='hover:text-vertical transition-colors'
										>
											{article.title}
										</Link>
									</h3>
									<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
										{article.excerpt}
									</p>

									{/* Pillar 5 Contextual Supplier Cross-Link Preview */}
									{article.companyMentions.length > 0 && (
										<div className='mt-4 rounded-lg border border-border bg-background p-3.5'>
											<div className='flex flex-wrap items-center justify-between gap-2'>
												<div className='flex flex-wrap items-center gap-2 text-xs'>
													<span className='font-semibold text-muted-foreground'>
														Indexed Suppliers in
														Story:
													</span>
													{article.companyMentions.map(
														(mention) => (
															<Link
																key={
																	mention
																		.company
																		.id
																}
																href={`/directory/${mention.company.slug}`}
																className='inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 font-medium hover:border-vertical transition-colors'
															>
																{mention.company
																	.verificationTier !==
																	VerificationTier.UNVERIFIED && (
																	<CheckCircle2 className='h-3 w-3 text-verified' />
																)}
																<span>
																	{
																		mention
																			.company
																			.name
																	}
																</span>
															</Link>
														)
													)}
												</div>

												<Link
													href={`/pulse/${article.slug}`}
													className='text-xs font-semibold text-amber hover:underline'
												>
													1-Click RFQ:{' '}
													{article.category?.name ||
														'Source Material'}{' '}
													→
												</Link>
											</div>
										</div>
									)}
								</article>
							))}
						</div>
					)}
				</div>

				{/* Pillar 3: Live Specification-Driven RFQ Board */}
				<div id='rfq-board' className='space-y-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<FileSpreadsheet className='h-5 w-5 text-amber' />
							<h2 className='text-2xl font-bold tracking-tight'>
								Live {vertical.name} RFQs
							</h2>
						</div>
						<Link
							href='/rfq'
							className='text-xs font-semibold text-amber hover:underline'
						>
							All RFQs →
						</Link>
					</div>

					{openRfqs.length === 0 ? (
						<div className='rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
							No open {vertical.name} tenders at the moment.
						</div>
					) : (
						<div className='space-y-4'>
							{openRfqs.map((rfq) => (
								<div
									key={rfq.id}
									className='rounded-xl border border-border bg-card p-5'
								>
									<div className='flex items-center justify-between text-xs'>
										<Link
											href={`/rfq/${rfq.referenceNumber}`}
											className='font-tabular font-semibold text-amber hover:underline'
										>
											{rfq.referenceNumber}
										</Link>
										<span className='text-muted-foreground'>
											{rfq.categoryName}
										</span>
									</div>

									<h3 className='mt-2 text-base font-bold leading-snug'>
										<Link
											href={`/rfq/${rfq.referenceNumber}`}
											className='hover:text-amber transition-colors'
										>
											{rfq.title}
										</Link>
									</h3>

									{Object.keys(rfq.specifications).length >
										0 && (
										<div className='mt-3 flex flex-wrap gap-1.5'>
											{Object.entries(
												rfq.specifications
											).map(([k, val]) => (
												<span
													key={k}
													className='font-tabular rounded border border-border bg-background px-2 py-0.5 text-[11px] text-foreground'
												>
													{k.replace(/_/g, ' ')}:{' '}
													<strong>{val}</strong>
												</span>
											))}
										</div>
									)}

									<div className='mt-4 flex items-center justify-between border-t border-border pt-3 text-xs'>
										<div>
											<span className='font-tabular font-semibold text-foreground'>
												{formatNumber(rfq.quantity)}{' '}
												{rfq.unit}
											</span>
											<span className='text-muted-foreground'>
												{' '}
												· {rfq.deliveryState}
											</span>
										</div>
										<Link
											href={`/rfq/${rfq.referenceNumber}`}
											className='font-semibold text-vertical hover:underline'
										>
											Submit Quote →
										</Link>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Pillar 2: Verified Supplier Directory + Claim & Convert Loop */}
			<section id='directory'>
				<div className='mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end'>
					<div>
						<div className='flex items-center gap-2'>
							<Building2 className='h-5 w-5 text-verified' />
							<h2 className='text-2xl font-bold tracking-tight'>
								{vertical.name} Supplier Directory
							</h2>
						</div>
						<p className='mt-1 text-sm text-muted-foreground'>
							Mapped by industrial role, production capacity,
							geographic coverage, and SON/ISO verification status.
						</p>
					</div>
					<Link
						href='/directory'
						className='text-sm font-semibold text-vertical hover:underline'
					>
						Filter Full Directory →
					</Link>
				</div>

				{companies.length === 0 ? (
					<div className='rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
						No companies indexed in this vertical yet.
					</div>
				) : (
					<div className='grid gap-6 md:grid-cols-2'>
						{companies.map((company) => {
							const isClaimed =
								company.claimStatus === ClaimStatus.CLAIMED;
							const isVerified =
								company.verificationTier !==
								VerificationTier.UNVERIFIED;

							return (
								<div
									key={company.id}
									className='flex flex-col justify-between rounded-xl border border-border bg-card p-6'
								>
									<div>
										<div className='flex flex-wrap items-center justify-between gap-2'>
											<div className='flex flex-wrap items-center gap-1.5'>
												{company.businessRoles.map(
													(role) => (
														<Badge
															key={role}
															variant='secondary'
															className='text-[11px]'
														>
															{role.replace(
																/_/g,
																' '
															)}
														</Badge>
													)
												)}
											</div>

											{isVerified ? (
												<Badge className='bg-verified/15 text-verified border-verified/30'>
													<CheckCircle2 className='mr-1 h-3 w-3' />
													{company.verificationTier.replace(
														/_/g,
														' '
													)}
												</Badge>
											) : (
												<Badge
													variant='outline'
													className='border-amber/40 text-amber'
												>
													<ShieldAlert className='mr-1 h-3 w-3' />
													UNCLAIMED LISTING
												</Badge>
											)}
										</div>

										<h3 className='mt-3 text-lg font-bold'>
											<Link
												href={`/directory/${company.slug}`}
												className='hover:text-vertical transition-colors'
											>
												{company.name}
											</Link>
										</h3>
										{company.tagline && (
											<p className='mt-1.5 text-sm text-muted-foreground'>
												{company.tagline}
											</p>
										)}

										<div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground'>
											<span className='inline-flex items-center gap-1'>
												<MapPin className='h-3.5 w-3.5' />
												{company.city
													? `${company.city}, ${company.headquartersState}`
													: company.headquartersState}
											</span>
											{company.productionCapacity && (
												<span className='font-tabular text-foreground'>
													Cap:{' '}
													{company.productionCapacity}
												</span>
											)}
										</div>

										{company.certifications.length > 0 && (
											<div className='mt-3 flex flex-wrap gap-2'>
												{company.certifications.map(
													(cert) => (
														<span
															key={cert.id}
															className='inline-flex items-center gap-1 rounded bg-verified/10 px-2 py-0.5 text-[11px] font-medium text-verified'
														>
															<Award className='h-3 w-3' />
															{cert.name}
														</span>
													)
												)}
											</div>
										)}
									</div>

									<div className='mt-6 flex items-center justify-between gap-3 border-t border-border pt-4'>
										<span className='text-xs text-muted-foreground'>
											Covers:{' '}
											{company.coverageStates
												.slice(0, 4)
												.join(', ')}
											{company.coverageStates.length > 4
												? ` +${company.coverageStates.length - 4}`
												: ''}
										</span>

										{isClaimed ? (
											<Button
												asChild
												size='sm'
												variant='secondary'
											>
												<Link
													href={`/directory/${company.slug}`}
												>
													Request Quote
												</Link>
											</Button>
										) : (
											<Button
												asChild
												size='sm'
												variant='outline'
												className='border-amber/50 text-amber hover:bg-amber/10'
											>
												<Link
													href={`/directory/${company.slug}/claim`}
												>
													Claim This Business →
												</Link>
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}
