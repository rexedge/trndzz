import Link from 'next/link';
import {
	ArrowUpRight,
	Building2,
	CheckCircle2,
	FileSpreadsheet,
	Layers,
	Newspaper,
} from 'lucide-react';
import { VerticalStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommodityTickerBar } from '@/components/pulse/commodity-ticker-bar';
import { getPlatformStats } from '@/lib/services/stats.service';
import { getMacroHubOverview } from '@/lib/services/vertical.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';

export default async function MacroHomePage() {
	const [{ verticals, indicators, featuredArticles, recentRfqs }, stats] =
		await Promise.all([getMacroHubOverview(), getPlatformStats()]);

	return (
		<div>
			<CommodityTickerBar
				indicators={indicators}
				label='MACRO & COMMODITIES'
			/>

			<div className='mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<section className='rounded-2xl border border-border bg-card p-8 md:p-12'>
					<div className='max-w-3xl'>
						<Badge
							variant='secondary'
							className='mb-4 font-tabular text-xs uppercase tracking-wider'
						>
							Multi-Tenant B2B Trade Infrastructure · West Africa
						</Badge>
						<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl'>
							Organized Trade Intelligence, Verified Suppliers &
							Structured RFQs Across Industrial Supply Chains.
						</h1>
						<p className='mt-4 text-base text-muted-foreground sm:text-lg leading-relaxed'>
							Each <span className='font-tabular text-foreground'>*.trndzz.com</span>{' '}
							vertical connects sector-specific price trackers and
							value-chain journalism directly to SON/CAC-verified
							manufacturers and competitive multi-vendor RFQ
							broadcasting.
						</p>

						<div className='mt-7 flex flex-wrap items-center gap-3'>
							<Button
								asChild
								size='lg'
								className='gap-2'
							>
								<a href={buildVerticalUrl('aluminium', '/')}>
									<Layers className='h-4 w-4' />
									Enter Aluminium Portal
									<ArrowUpRight className='h-4 w-4' />
								</a>
							</Button>
							<Button
								asChild
								variant='outline'
								size='lg'
							>
								<Link href='/verticals'>
									Explore All Verticals
								</Link>
							</Button>
						</div>
					</div>

					{/* PlatformStats Social Proof Bar */}
					<div className='mt-10 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-5'>
						<div>
							<p className='font-tabular text-2xl font-extrabold text-foreground'>
								{formatNumber(stats.activeVerticals)}
							</p>
							<p className='text-xs text-muted-foreground'>
								Active Vertical Portals
							</p>
						</div>
						<div>
							<p className='font-tabular text-2xl font-extrabold text-foreground'>
								{formatNumber(stats.indexedCompanies)}
							</p>
							<p className='text-xs text-muted-foreground'>
								Indexed Industrial Suppliers
							</p>
						</div>
						<div>
							<p className='font-tabular text-2xl font-extrabold text-verified'>
								{formatNumber(stats.verifiedSuppliers)}
							</p>
							<p className='text-xs text-muted-foreground'>
								CAC / SON Verified Vendors
							</p>
						</div>
						<div>
							<p className='font-tabular text-2xl font-extrabold text-amber'>
								{formatNumber(stats.openRfqsCount)}
							</p>
							<p className='text-xs text-muted-foreground'>
								Live Open Buyer RFQs
							</p>
						</div>
						<div>
							<p className='font-tabular text-2xl font-extrabold text-foreground'>
								{formatNumber(stats.monthlyReaders)}+
							</p>
							<p className='text-xs text-muted-foreground'>
								Monthly B2B Trade Readers
							</p>
						</div>
					</div>
				</section>

				{/* Specialized Industry Verticals */}
				<section>
					<div className='mb-6 flex items-end justify-between gap-4'>
						<div>
							<h2 className='text-2xl font-bold tracking-tight'>
								Industrial Trade Verticals
							</h2>
							<p className='mt-1 text-sm text-muted-foreground'>
								Standalone sector ecosystems modeled across
								Upstream, Midstream, and Downstream value chains.
							</p>
						</div>
						<Link
							href='/verticals'
							className='text-sm font-medium text-primary hover:underline'
						>
							View roadmap →
						</Link>
					</div>

					{verticals.length === 0 ? (
						<div className='rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
							No verticals provisioned yet. Run database seed to
							initialize Flagship Aluminium vertical.
						</div>
					) : (
						<div className='grid gap-6 md:grid-cols-3'>
							{verticals.map((vertical) => {
								const isLive =
									vertical.status === VerticalStatus.ACTIVE;
								return (
									<div
										key={vertical.id}
										className='flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60'
									>
										<div>
											<div className='flex items-center justify-between gap-2'>
												<span className='font-tabular text-xs text-muted-foreground'>
													{vertical.slug}.trndzz.com
												</span>
												{isLive ? (
													<Badge className='bg-verified/15 text-verified border-verified/30 hover:bg-verified/20'>
														<CheckCircle2 className='mr-1 h-3 w-3' />
														LIVE
													</Badge>
												) : (
													<Badge variant='outline'>
														HORIZON 1 NEXT
													</Badge>
												)}
											</div>

											<h3 className='mt-3 text-xl font-bold'>
												{vertical.name}
											</h3>
											<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
												{vertical.tagline ||
													vertical.description}
											</p>
										</div>

										<div className='mt-6 border-t border-border pt-4'>
											<div className='mb-4 flex items-center justify-between text-xs text-muted-foreground'>
												<span>
													<strong className='font-tabular text-foreground'>
														{formatNumber(
															vertical._count
																.companies
														)}
													</strong>{' '}
													Suppliers
												</span>
												<span>
													<strong className='font-tabular text-foreground'>
														{formatNumber(
															vertical._count
																.articles
														)}
													</strong>{' '}
													Briefs
												</span>
												<span>
													<strong className='font-tabular text-foreground'>
														{formatNumber(
															vertical._count.rfqs
														)}
													</strong>{' '}
													RFQs
												</span>
											</div>

											{isLive ? (
												<Button
													asChild
													variant='secondary'
													className='w-full justify-between'
												>
													<a
														href={buildVerticalUrl(
															vertical.slug,
															'/'
														)}
													>
														<span>
															Open {vertical.name}{' '}
															Hub
														</span>
														<ArrowUpRight className='h-4 w-4' />
													</a>
												</Button>
											) : (
												<Button
													variant='outline'
													disabled
													className='w-full'
												>
													Onboarding Directory
												</Button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</section>

				{/* Cross-Sector Intelligence + Live Procurement Feed */}
				<section className='grid gap-8 lg:grid-cols-3'>
					{/* Trndzz Pulse Macro Feed */}
					<div className='lg:col-span-2 space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Newspaper className='h-5 w-5 text-primary' />
								<h2 className='text-2xl font-bold tracking-tight'>
									Cross-Sector Market Intelligence
								</h2>
							</div>
							<Link
								href='/news'
								className='text-xs font-semibold text-primary hover:underline'
							>
								All Macro Briefs →
							</Link>
						</div>

						{featuredArticles.length === 0 ? (
							<div className='rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
								No cross-sector intelligence briefs published
								yet.
							</div>
						) : (
							<div className='space-y-4'>
								{featuredArticles.map((article) => (
									<article
										key={article.id}
										className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50'
									>
										<div className='flex flex-wrap items-center gap-2 text-xs'>
											{article.vertical && (
												<Badge variant='secondary'>
													{article.vertical.name}
												</Badge>
											)}
											{article.valueChainStage && (
												<span className='font-tabular text-muted-foreground'>
													{
														article.valueChainStage
															.streamPosition
													}
												</span>
											)}
											<span className='text-muted-foreground'>
												·{' '}
												{article.type.replace(
													/_/g,
													' '
												)}
											</span>
										</div>

										<h3 className='mt-2.5 text-lg font-bold leading-snug'>
											<a
												href={
													article.vertical
														? buildVerticalUrl(
																article.vertical
																	.slug,
																`/pulse/${article.slug}`
															)
														: `/news/${article.slug}`
												}
												className='hover:text-primary transition-colors'
											>
												{article.title}
											</a>
										</h3>
										<p className='mt-2 text-sm text-muted-foreground line-clamp-2'>
											{article.excerpt}
										</p>
									</article>
								))}
							</div>
						)}
					</div>

					{/* Live RFQ Activity Column */}
					<div className='space-y-4'>
						<div className='flex items-center gap-2'>
							<FileSpreadsheet className='h-5 w-5 text-amber' />
							<h2 className='text-2xl font-bold tracking-tight'>
								Live Buyer RFQs
							</h2>
						</div>

						{recentRfqs.length === 0 ? (
							<div className='rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
								No active procurement tenders right now.
							</div>
						) : (
							<div className='space-y-3'>
								{recentRfqs.map((rfq) => (
									<div
										key={rfq.id}
										className='rounded-xl border border-border bg-card p-4'
									>
										<div className='flex items-center justify-between text-xs'>
											<span className='font-tabular font-medium text-amber'>
												{rfq.referenceNumber}
											</span>
											<Badge variant='outline'>
												{rfq.verticalName}
											</Badge>
										</div>
										<h3 className='mt-2 text-sm font-semibold leading-snug'>
											{rfq.title}
										</h3>
										<div className='mt-3 flex items-center justify-between text-xs text-muted-foreground'>
											<span className='font-tabular text-foreground font-medium'>
												{formatNumber(rfq.quantity)}{' '}
												{rfq.unit}
											</span>
											<span>
												Delivery: {rfq.deliveryState}
											</span>
										</div>
										<div className='mt-3 border-t border-border pt-2.5 flex items-center justify-between text-xs'>
											<span className='text-muted-foreground'>
												{rfq.matchesCount} matched
												vendors
											</span>
											<a
												href={buildVerticalUrl(
													rfq.verticalSlug,
													`/rfq/${rfq.referenceNumber}`
												)}
												className='font-medium text-primary hover:underline'
											>
												Quote on Portal →
											</a>
										</div>
									</div>
								))}
							</div>
						)}

						<div className='rounded-xl border border-border bg-muted/40 p-5'>
							<div className='flex items-center gap-2 text-sm font-semibold'>
								<Building2 className='h-4 w-4 text-verified' />
								Are you a verified manufacturer?
							</div>
							<p className='mt-1.5 text-xs text-muted-foreground leading-relaxed'>
								Claim your company directory listing to receive
								instant buyer RFQ broadcasts matched to your
								plant capacity and SON certifications.
							</p>
							<Button
								asChild
								size='sm'
								variant='outline'
								className='mt-3 w-full'
							>
								<Link href='/auth/register'>
									Claim Supplier Account
								</Link>
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

