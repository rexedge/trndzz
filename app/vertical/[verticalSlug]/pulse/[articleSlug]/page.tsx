import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
	ArrowUpRight,
	Building2,
	CheckCircle2,
	Eye,
	MapPin,
	Sparkles,
} from 'lucide-react';
import { ClaimStatus, VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/markdown';
import { ContextualRfqDrawer } from '@/components/cross-link/contextual-rfq-drawer';
import {
	JsonLd,
	buildBreadcrumbJsonLd,
	buildNewsArticleJsonLd,
} from '@/components/seo/json-ld';
import { getVerticalArticleWithContext } from '@/lib/services/article.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ verticalSlug: string; articleSlug: string }>;
}): Promise<Metadata> {
	const { verticalSlug, articleSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);
	const payload = await getVerticalArticleWithContext(
		vertical.id,
		articleSlug
	);
	if (!payload) {
		return { title: 'Brief Not Found' };
	}
	return {
		title:
			payload.article.metaTitle ||
			`${payload.article.title} | Trndzz ${vertical.name}`,
		description: payload.article.metaDescription || payload.article.excerpt,
	};
}

export default async function VerticalArticleDetailPage({
	params,
}: {
	params: Promise<{ verticalSlug: string; articleSlug: string }>;
}) {
	const { verticalSlug, articleSlug } = await params;
	const { vertical, user } = await resolveRequiredVertical(verticalSlug);

	const payload = await getVerticalArticleWithContext(
		vertical.id,
		articleSlug
	);
	if (!payload) {
		notFound();
	}

	const { article, specDefinitions, categorySuppliers, relatedArticles } =
		payload;
	const canonicalUrl = buildVerticalUrl(
		vertical.slug,
		`/pulse/${article.slug}`
	);
	const fallbackCategory = vertical.categories[0];
	const activeCategory = article.category ?? fallbackCategory;

	const serializedSpecs = specDefinitions.map((d) => ({
		id: d.id,
		key: d.key,
		label: d.label,
		unit: d.unit,
		inputType: d.inputType,
		options: d.options,
		isRequired: d.isRequired,
	}));

	const loginUrl = buildMacroUrl(
		`/auth/login?next=${encodeURIComponent(canonicalUrl)}`
	);

	return (
		<div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
			<JsonLd
				data={[
					buildBreadcrumbJsonLd([
						{
							name: `Trndzz ${vertical.name}`,
							url: buildVerticalUrl(vertical.slug, '/'),
						},
						{
							name: 'Trndzz Pulse',
							url: buildVerticalUrl(vertical.slug, '/pulse'),
						},
						{ name: article.title, url: canonicalUrl },
					]),
					buildNewsArticleJsonLd({
						headline: article.title,
						description: article.excerpt,
						url: canonicalUrl,
						datePublished: article.publishedAt,
						dateModified: article.updatedAt,
						authorName: article.author?.name,
						verticalName: vertical.name,
					}),
				]}
			/>

			<div className='grid gap-10 lg:grid-cols-3'>
				{/* Main Editorial Column */}
				<article className='space-y-6 lg:col-span-2'>
					<div className='space-y-3 border-b border-border pb-6'>
						<div className='flex flex-wrap items-center gap-2 text-xs'>
							<Link
								href='/pulse'
								className='font-semibold text-vertical hover:underline'
							>
								← Trndzz Pulse
							</Link>
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
							<Badge variant='outline'>
								{article.type.replace(/_/g, ' ')}
							</Badge>
							{article.category && (
								<span className='font-tabular text-muted-foreground'>
									· {article.category.name}
								</span>
							)}
						</div>

						<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight'>
							{article.title}
						</h1>

						<p className='text-base text-muted-foreground leading-relaxed'>
							{article.excerpt}
						</p>

						<div className='flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground'>
							<div>
								<span className='font-semibold text-foreground'>
									{article.author?.name ||
										`Trndzz ${vertical.name} Desk`}
								</span>
								{article.author?.jobTitle && (
									<span> · {article.author.jobTitle}</span>
								)}
								{article.publishedAt && (
									<span>
										{' '}
										·{' '}
										{new Date(
											article.publishedAt
										).toLocaleDateString('en-NG', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</span>
								)}
							</div>
							<span className='font-tabular inline-flex items-center gap-1'>
								<Eye className='h-3.5 w-3.5' />
								{formatNumber(article.viewCount)} trade views
							</span>
						</div>
					</div>

					{/* Pillar 5 Inline Contextual Procurement Banner */}
					{activeCategory && (
						<div className='flex flex-col justify-between gap-4 rounded-xl border border-amber/40 bg-amber/10 p-5 sm:flex-row sm:items-center'>
							<div>
								<div className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber'>
									<Sparkles className='h-3.5 w-3.5' />
									<span>
										Editorial-to-Commerce Cross-Link
									</span>
								</div>
								<p className='mt-1 text-sm font-semibold text-foreground'>
									Sourcing {activeCategory.name} referenced in
									this market brief?
								</p>
								<p className='text-xs text-muted-foreground'>
									Broadcast technical parameters directly to
									SON-verified {vertical.name.toLowerCase()}{' '}
									plants & importers.
								</p>
							</div>
							<ContextualRfqDrawer
								verticalId={vertical.id}
								verticalSlug={vertical.slug}
								categoryId={activeCategory.id}
								categoryName={activeCategory.name}
								defaultUnit={activeCategory.defaultUnit ?? 'MT'}
								specDefinitions={serializedSpecs}
								sourceArticleId={article.id}
								sourceArticleTitle={article.title}
								initialUser={user}
								loginUrl={loginUrl}
								triggerLabel={`Source ${activeCategory.name}`}
							/>
						</div>
					)}

					{/* Rich Markdown Body */}
					<div className='rounded-2xl border border-border bg-card p-6 sm:p-8'>
						<Markdown content={article.body} />

						{article.sourceUrl && (
							<div className='mt-8 border-t border-border pt-4 text-xs text-muted-foreground'>
								Primary Reference:{' '}
								<a
									href={article.sourceUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-1 font-medium text-foreground underline'
								>
									{article.sourceName || article.sourceUrl}
									<ArrowUpRight className='h-3 w-3' />
								</a>
							</div>
						)}
					</div>

					{/* Related Vertical Briefs */}
					{relatedArticles.length > 0 && (
						<section className='space-y-3 pt-4'>
							<h2 className='text-lg font-bold tracking-tight'>
								More {vertical.name} Value-Chain Briefs
							</h2>
							<div className='grid gap-4 sm:grid-cols-3'>
								{relatedArticles.map((rel) => (
									<Link
										key={rel.id}
										href={`/pulse/${rel.slug}`}
										className='rounded-xl border border-border bg-card p-4 transition-colors hover:border-vertical/60'
									>
										<span className='font-tabular text-[11px] text-muted-foreground'>
											{rel.valueChainStage?.streamPosition.replace(
												'_',
												' '
											) || rel.type.replace(/_/g, ' ')}
										</span>
										<h3 className='mt-1.5 text-sm font-bold leading-snug line-clamp-3'>
											{rel.title}
										</h3>
									</Link>
								))}
							</div>
						</section>
					)}
				</article>

				{/* Sidebar: Pillar 5 Indexed Suppliers & Direct RFQ */}
				<aside className='space-y-6'>
					{article.companyMentions.length > 0 && (
						<div className='rounded-xl border border-border bg-card p-5 space-y-4'>
							<div className='flex items-center gap-2'>
								<Building2 className='h-4 w-4 text-verified' />
								<h2 className='text-base font-bold'>
									Companies Mentioned in Story
								</h2>
							</div>
							<div className='space-y-3'>
								{article.companyMentions.map(({ company }) => {
									const isVerified =
										company.verificationTier !==
										VerificationTier.UNVERIFIED;
									const isClaimed =
										company.claimStatus ===
										ClaimStatus.CLAIMED;

									return (
										<div
											key={company.id}
											className='rounded-lg border border-border bg-background p-4 space-y-2.5'
										>
											<div className='flex items-start justify-between gap-2'>
												<Link
													href={`/directory/${company.slug}`}
													className='font-bold text-sm hover:text-vertical'
												>
													{company.name}
												</Link>
												{isVerified && (
													<CheckCircle2 className='h-4 w-4 shrink-0 text-verified' />
												)}
											</div>
											{company.tagline && (
												<p className='text-xs text-muted-foreground line-clamp-2'>
													{company.tagline}
												</p>
											)}
											<div className='flex items-center justify-between text-[11px] text-muted-foreground'>
												<span className='inline-flex items-center gap-1'>
													<MapPin className='h-3 w-3' />
													{company.headquartersState}
												</span>
												{company.productionCapacity && (
													<span className='font-tabular text-foreground'>
														{
															company.productionCapacity
														}
													</span>
												)}
											</div>
											<div className='flex items-center gap-2 pt-1'>
												<Button
													asChild
													variant='outline'
													size='sm'
													className='w-full text-xs'
												>
													<Link
														href={`/directory/${company.slug}`}
													>
														{isClaimed
															? 'View Profile & RFQ'
															: 'View / Claim Listing'}
													</Link>
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{categorySuppliers.length > 0 && (
						<div className='rounded-xl border border-border bg-card p-5 space-y-4'>
							<h2 className='text-base font-bold'>
								Verified {article.category?.name} Suppliers
							</h2>
							<div className='space-y-3'>
								{categorySuppliers.map((supplier) => (
									<Link
										key={supplier.id}
										href={`/directory/${supplier.slug}`}
										className='block rounded-lg border border-border bg-background p-3.5 transition-colors hover:border-vertical/60'
									>
										<div className='flex items-center justify-between gap-2'>
											<span className='text-sm font-semibold'>
												{supplier.name}
											</span>
											<CheckCircle2 className='h-3.5 w-3.5 text-verified' />
										</div>
										<p className='mt-1 text-xs text-muted-foreground'>
											{supplier.headquartersState}
											{supplier.productionCapacity
												? ` · ${supplier.productionCapacity}`
												: ''}
										</p>
									</Link>
								))}
							</div>
							<Button
								asChild
								variant='secondary'
								size='sm'
								className='w-full'
							>
								<Link
									href={
										article.category
											? `/directory?category=${article.category.slug}`
											: '/directory'
									}
								>
									Browse All Category Suppliers →
								</Link>
							</Button>
						</div>
					)}
				</aside>
			</div>
		</div>
	);
}

