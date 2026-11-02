import Link from 'next/link';
import {
	ArrowUpRight,
	BookOpen,
	Building2,
	CheckCircle2,
	FileSpreadsheet,
	FileText,
	Newspaper,
	Package,
	Sparkles,
} from 'lucide-react';
import { VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import type { searchEcosystem } from '@/lib/services/search.service';

type SearchResultPayload = Awaited<ReturnType<typeof searchEcosystem>>;

export function EcosystemSearchResults({
	data,
	currentVerticalSlug,
}: {
	data: SearchResultPayload;
	currentVerticalSlug?: string;
}) {
	if (!data.query) {
		return (
			<div className='rounded-2xl border border-dashed border-border p-12 text-center space-y-2'>
				<p className='text-sm font-medium'>
					Enter a technical specification, company name, standard, or
					commodity keyword above.
				</p>
				<p className='text-xs text-muted-foreground font-tabular'>
					Examples: &quot;0.55mm AA3003 stucco coil&quot; ·
					&quot;BS4449 16mm TMT rebar&quot; · &quot;580Wp TOPCon
					bifacial&quot; · &quot;215kWh LFP BESS&quot;
				</p>
			</div>
		);
	}

	const resolveVerticalHref = (
		verticalSlug: string | undefined | null,
		subPath: string
	) => {
		const slug = verticalSlug ?? currentVerticalSlug ?? 'aluminium';
		if (currentVerticalSlug && slug === currentVerticalSlug) {
			return subPath;
		}
		return buildVerticalUrl(slug, subPath);
	};

	return (
		<div className='space-y-8'>
			{/* AI / Spec Parser Summary Bar */}
			{(data.intent.expandedKeywords.length > 0 ||
				Object.keys(data.intent.detectedSpecs).length > 0 ||
				data.intent.intentSummary) && (
				<div className='rounded-xl border border-border bg-muted/40 p-4 space-y-2.5'>
					<div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
						<span className='inline-flex items-center gap-1.5 font-semibold text-primary'>
							<Sparkles className='h-3.5 w-3.5' />
							<span>
								{data.intent.aiAssisted
									? 'AI Specification & Synonym Expansion'
									: 'Technical Specification Parser'}
							</span>
						</span>
						<span className='font-tabular text-muted-foreground'>
							{formatNumber(data.totalResults)} ecosystem match(es)
						</span>
					</div>

					{data.intent.intentSummary && (
						<p className='text-xs text-muted-foreground'>
							{data.intent.intentSummary}
						</p>
					)}

					<div className='flex flex-wrap items-center gap-1.5'>
						{Object.entries(data.intent.detectedSpecs).map(
							([k, v]) => (
								<span
									key={k}
									className='font-tabular rounded border border-amber/40 bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber'
								>
									{k.replace(/_/g, ' ')}: {v}
								</span>
							)
						)}
						{data.intent.expandedKeywords.map((kw) => (
							<Badge
								key={kw}
								variant='outline'
								className='font-tabular text-[11px]'
							>
								+{kw}
							</Badge>
						))}
					</div>
				</div>
			)}

			{data.totalResults === 0 && (
				<div className='rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No exact matches found for &quot;{data.query}&quot;. Try
					broadening your alloy/grade filter or broadcast a structured
					RFQ so verified suppliers can quote directly.
				</div>
			)}

			{/* 1. Verified & Indexed Suppliers */}
			{data.companies.length > 0 && (
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Building2 className='h-4 w-4 text-primary' />
						<h2 className='text-lg font-bold'>
							Suppliers & Manufacturers ({data.companies.length})
						</h2>
					</div>
					<div className='grid gap-4 md:grid-cols-2'>
						{data.companies.map((c) => {
							const vSlug =
								c.verticals[0]?.vertical.slug ??
								currentVerticalSlug ??
								'aluminium';
							const href = resolveVerticalHref(
								vSlug,
								`/directory/${c.slug}`
							);
							const isExternal = href.startsWith('http');

							return (
								<a
									key={c.id}
									href={href}
									className='rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 space-y-2 block'
								>
									<div className='flex items-center justify-between gap-2'>
										<div className='flex items-center gap-1.5'>
											{c.verificationTier !==
												VerificationTier.UNVERIFIED && (
												<CheckCircle2 className='h-4 w-4 text-verified shrink-0' />
											)}
											<h3 className='font-bold'>{c.name}</h3>
										</div>
										<Badge
											variant='outline'
											className='text-[10px]'
										>
											{c.headquartersState}
										</Badge>
									</div>
									{c.tagline && (
										<p className='text-xs text-muted-foreground line-clamp-2'>
											{c.tagline}
										</p>
									)}
									<div className='flex items-center justify-between pt-1 text-[11px] text-muted-foreground font-tabular'>
										<span>
											{c.businessRoles
												.slice(0, 2)
												.map((r) => r.replace(/_/g, ' '))
												.join(' · ')}
										</span>
										{isExternal && (
											<ArrowUpRight className='h-3.5 w-3.5' />
										)}
									</div>
								</a>
							);
						})}
					</div>
				</section>
			)}

			{/* 2. Technical Catalog SKUs */}
			{data.products.length > 0 && (
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Package className='h-4 w-4 text-amber' />
						<h2 className='text-lg font-bold'>
							Specification Catalog SKUs ({data.products.length})
						</h2>
					</div>
					<div className='grid gap-4 md:grid-cols-2'>
						{data.products.map((p) => {
							const href = resolveVerticalHref(
								p.vertical.slug,
								`/directory/${p.company.slug}`
							);
							return (
								<div
									key={p.id}
									className='rounded-xl border border-border bg-card p-5 space-y-3'
								>
									<div className='flex items-center justify-between gap-2'>
										<Badge variant='secondary'>
											{p.vertical.name} · {p.category.name}
										</Badge>
										{p.indicativeMin && (
											<span className='font-tabular text-xs font-bold'>
												{formatCurrency(
													p.indicativeMin,
													p.currency
												)}{' '}
												/ {p.unit}
											</span>
										)}
									</div>
									<h3 className='font-bold leading-snug'>
										{p.name}
									</h3>
									{Object.keys(p.specifications).length > 0 && (
										<div className='flex flex-wrap gap-1.5'>
											{Object.entries(
												p.specifications
											).map(([k, v]) => (
												<span
													key={k}
													className='font-tabular rounded border border-border bg-background px-2 py-0.5 text-[11px]'
												>
													{k.replace(/_/g, ' ')}:{' '}
													<strong>{v}</strong>
												</span>
											))}
										</div>
									)}
									<div className='flex items-center justify-between border-t border-border pt-3 text-xs'>
										<a
											href={href}
											className='font-medium hover:underline'
										>
											{p.company.name}
										</a>
										{p.datasheetUrl && (
											<a
												href={p.datasheetUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center gap-1 text-primary hover:underline'
											>
												<FileText className='h-3.5 w-3.5' />
												Datasheet
											</a>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{/* 3. Live Public RFQs */}
			{data.rfqs.length > 0 && (
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<FileSpreadsheet className='h-4 w-4 text-amber' />
						<h2 className='text-lg font-bold'>
							Live Public Tender Board ({data.rfqs.length})
						</h2>
					</div>
					<div className='grid gap-3'>
						{data.rfqs.map((r) => {
							const href = resolveVerticalHref(
								r.vertical.slug,
								`/rfq/${r.referenceNumber}`
							);
							return (
								<a
									key={r.id}
									href={href}
									className='flex flex-col justify-between gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-amber/60 sm:flex-row sm:items-center'
								>
									<div>
										<div className='flex items-center gap-2 text-xs text-muted-foreground font-tabular'>
											<span className='font-bold text-amber'>
												{r.referenceNumber}
											</span>
											<span>·</span>
											<span>{r.vertical.name}</span>
											<span>·</span>
											<span>{r.deliveryState}</span>
										</div>
										<h3 className='mt-1 font-bold'>
											{r.title}
										</h3>
									</div>
									<div className='font-tabular shrink-0 text-right text-xs'>
										<span className='font-bold'>
											{formatNumber(r.quantity)} {r.unit}
										</span>
										<span className='block text-muted-foreground'>
											{r.quotesCount} quote(s)
										</span>
									</div>
								</a>
							);
						})}
					</div>
				</section>
			)}

			{/* 4. Trndzz Pulse Briefs */}
			{data.articles.length > 0 && (
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Newspaper className='h-4 w-4 text-primary' />
						<h2 className='text-lg font-bold'>
							Trndzz Pulse Market Briefs ({data.articles.length})
						</h2>
					</div>
					<div className='grid gap-4 md:grid-cols-2'>
						{data.articles.map((a) => {
							const href = a.vertical?.slug
								? resolveVerticalHref(
										a.vertical.slug,
										`/pulse/${a.slug}`
									)
								: buildMacroUrl(`/news/${a.slug}`);
							return (
								<a
									key={a.id}
									href={href}
									className='rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 space-y-2 block'
								>
									<div className='flex items-center gap-2 text-xs text-muted-foreground'>
										<Badge variant='outline'>
											{a.vertical?.name ?? 'Macro'}
										</Badge>
										{a.valueChainStage && (
											<span className='truncate'>
												{a.valueChainStage.name}
											</span>
										)}
									</div>
									<h3 className='font-bold leading-snug'>
										{a.title}
									</h3>
									<p className='text-xs text-muted-foreground line-clamp-2'>
										{a.excerpt}
									</p>
								</a>
							);
						})}
					</div>
				</section>
			)}

			{/* 5. Trndzz Learn Whitepapers */}
			{data.resources.length > 0 && (
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<BookOpen className='h-4 w-4 text-primary' />
						<h2 className='text-lg font-bold'>
							Trndzz Learn Whitepapers & Guides (
							{data.resources.length})
						</h2>
					</div>
					<div className='grid gap-4 md:grid-cols-2'>
						{data.resources.map((res) => {
							const href = res.vertical?.slug
								? resolveVerticalHref(
										res.vertical.slug,
										`/learn/${res.slug}`
									)
								: `/learn`;
							return (
								<Link
									key={res.id}
									href={href}
									className='rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 space-y-2 block'
								>
									<Badge variant='secondary'>
										{res.type.replace(/_/g, ' ')}
									</Badge>
									<h3 className='font-bold leading-snug'>
										{res.title}
									</h3>
									<p className='text-xs text-muted-foreground line-clamp-2'>
										{res.summary}
									</p>
								</Link>
							);
						})}
					</div>
				</section>
			)}
		</div>
	);
}

