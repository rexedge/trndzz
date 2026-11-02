import Link from 'next/link';
import {
	CheckCircle2,
	FileText,
	Package,
	Search,
	SlidersHorizontal,
} from 'lucide-react';
import { VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddToRfqCartButton } from '@/components/biz/rfq-cart-drawer';
import { JsonLd, buildProductJsonLd } from '@/components/seo/json-ld';
import { prisma } from '@/lib/prisma/client';
import { listVerticalCatalogProducts } from '@/lib/services/company.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default async function VerticalProductCatalogPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{
		category?: string;
		q?: string;
		specKey?: string;
		specValue?: string;
	}>;
}) {
	const { verticalSlug } = await params;
	const { category, q, specKey, specValue } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const selectedCategory = vertical.categories.find(
		(c) => c.slug === category
	);

	const [products, specDefinitions] = await Promise.all([
		listVerticalCatalogProducts({
			verticalId: vertical.id,
			categorySlug: category,
			query: q,
			specKey,
			specValue,
		}),
		prisma.specAttributeDefinition.findMany({
			where: {
				verticalId: vertical.id,
				isFilterable: true,
				...(selectedCategory
					? {
							OR: [
								{ categoryId: selectedCategory.id },
								{ categoryId: null },
							],
						}
					: {}),
			},
			orderBy: { displayOrder: 'asc' },
		}),
	]);

	const activeSpecDef = specDefinitions.find((d) => d.key === specKey);

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			{products.length > 0 && (
				<JsonLd
					data={products.slice(0, 10).map((p) =>
						buildProductJsonLd({
							name: p.name,
							description: p.description,
							url: buildVerticalUrl(
								vertical.slug,
								`/directory/${p.company.slug}`
							),
							categoryName: p.category.name,
							supplierName: p.company.name,
							currency: p.currency,
							lowPrice: p.indicativeMin,
							highPrice: p.indicativeMax,
						})
					)}
				/>
			)}

			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vertical'>
						<Package className='h-4 w-4' />
						<span>Trndzz Biz · Multi-Vendor Specification Storefronts</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						{vertical.name} Technical Product & Material Catalog
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Filter standardized industrial SKUs by technical
						attributes, inspect mill datasheets, and bundle multiple
						lots into a single structured RFQ.
					</p>
				</div>
				<Button
					asChild
					size='sm'
					className='bg-amber text-white hover:opacity-90'
				>
					<Link href='/rfq/new'>Submit Custom Spec RFQ</Link>
				</Button>
			</div>

			{/* Multi-Facet Specification Filter Bar */}
			<form
				action='/products'
				method='GET'
				className='space-y-3 rounded-xl border border-border bg-card p-4'
			>
				<div className='flex flex-wrap items-center gap-3'>
					<div className='relative min-w-60 flex-1'>
						<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							name='q'
							defaultValue={q ?? ''}
							placeholder={`Search ${vertical.name} grade, standard, dimension, or supplier...`}
							className='pl-9'
						/>
					</div>

					<select
						name='category'
						defaultValue={category ?? ''}
						className='flex h-9 rounded-md border border-input bg-background px-3 text-xs'
					>
						<option value=''>All Material Categories</option>
						{vertical.categories.map((cat) => (
							<option key={cat.id} value={cat.slug}>
								{cat.name}
							</option>
						))}
					</select>

					{specDefinitions.length > 0 && (
						<>
							<select
								name='specKey'
								defaultValue={specKey ?? ''}
								className='flex h-9 rounded-md border border-input bg-background px-3 text-xs font-mono'
							>
								<option value=''>Spec Parameter...</option>
								{specDefinitions.map((def) => (
									<option key={def.id} value={def.key}>
										{def.label}
										{def.unit ? ` (${def.unit})` : ''}
									</option>
								))}
							</select>

							{activeSpecDef && activeSpecDef.options.length > 0 ? (
								<select
									name='specValue'
									defaultValue={specValue ?? ''}
									className='flex h-9 rounded-md border border-input bg-background px-3 text-xs font-mono'
								>
									<option value=''>Any Value</option>
									{activeSpecDef.options.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
							) : (
								<Input
									name='specValue'
									defaultValue={specValue ?? ''}
									placeholder='Spec value (e.g. 0.55, B500B, 580Wp)'
									className='h-9 w-52 text-xs font-mono'
								/>
							)}
						</>
					)}

					<Button type='submit' variant='secondary' size='sm'>
						<SlidersHorizontal className='mr-1.5 h-3.5 w-3.5' />
						Filter SKUs
					</Button>
					{(category || q || specKey || specValue) && (
						<Button asChild variant='ghost' size='sm'>
							<Link href='/products'>Reset</Link>
						</Button>
					)}
				</div>

				{/* Quick One-Click Spec Facet Chips */}
				{specDefinitions.length > 0 && (
					<div className='flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-xs'>
						<span className='font-tabular text-[11px] uppercase tracking-wider text-muted-foreground mr-1'>
							Quick Spec Facets:
						</span>
						{specDefinitions.slice(0, 3).flatMap((def) =>
							def.options.slice(0, 3).map((opt) => {
								const active =
									specKey === def.key && specValue === opt;
								const qs = new URLSearchParams();
								if (category) qs.set('category', category);
								qs.set('specKey', def.key);
								qs.set('specValue', opt);
								return (
									<Link
										key={`${def.key}-${opt}`}
										href={`/products?${qs.toString()}`}
										className={`font-tabular rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
											active
												? 'border-vertical bg-vertical/15 font-semibold text-foreground'
												: 'border-border bg-background text-muted-foreground hover:text-foreground'
										}`}
									>
										{def.label}: {opt}
									</Link>
								);
							})
						)}
					</div>
				)}
			</form>

			{products.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No catalog SKUs matched those exact parameters. Broadcast
					your exact specifications directly via a custom RFQ.
				</div>
			) : (
				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{products.map((prod) => (
						<div
							key={prod.id}
							className='flex flex-col justify-between rounded-xl border border-border bg-card p-6'
						>
							<div>
								<div className='flex items-center justify-between gap-2'>
									<Badge variant='outline' className='text-xs'>
										{prod.category.name}
									</Badge>
									{prod.minOrderQty && (
										<span className='font-tabular text-xs text-muted-foreground'>
											MOQ: {formatNumber(prod.minOrderQty)}{' '}
											{prod.unit}
										</span>
									)}
								</div>

								<h2 className='mt-3 text-lg font-bold leading-snug'>
									{prod.name}
								</h2>
								{prod.description && (
									<p className='mt-1.5 text-xs text-muted-foreground line-clamp-2'>
										{prod.description}
									</p>
								)}

								{Object.keys(prod.specifications).length >
									0 && (
									<div className='mt-4 flex flex-wrap gap-1.5'>
										{Object.entries(
											prod.specifications
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

								{prod.datasheetUrl && (
									<div className='mt-3'>
										<a
											href={prod.datasheetUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='inline-flex items-center gap-1.5 text-xs font-semibold text-vertical hover:underline'
										>
											<FileText className='h-3.5 w-3.5' />
											<span>
												Technical Datasheet / MTC (PDF)
											</span>
										</a>
									</div>
								)}
							</div>

							<div className='mt-5 space-y-3 border-t border-border pt-4'>
								<div className='flex items-center justify-between text-xs'>
									<span className='text-muted-foreground'>
										Indicative Price:
									</span>
									{prod.indicativeMin ? (
										<span className='font-tabular font-bold text-foreground'>
											{formatCurrency(
												prod.indicativeMin,
												prod.currency
											)}
											{prod.indicativeMax
												? ` – ${formatCurrency(prod.indicativeMax, prod.currency)}`
												: ''}{' '}
											/ {prod.unit}
										</span>
									) : (
										<span className='font-semibold'>
											On Request
										</span>
									)}
								</div>

								<div className='flex items-center justify-between gap-2'>
									<Link
										href={`/directory/${prod.company.slug}`}
										className='inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground truncate'
									>
										{prod.company.verificationTier !==
											VerificationTier.UNVERIFIED && (
											<CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-verified' />
										)}
										<span className='truncate'>
											{prod.company.name}
										</span>
									</Link>
								</div>

								<div className='flex items-center justify-between gap-2 pt-1'>
									<AddToRfqCartButton
										item={{
											productId: prod.id,
											productName: prod.name,
											verticalId: vertical.id,
											verticalSlug: vertical.slug,
											categoryId: prod.category.id,
											categorySlug: prod.category.slug,
											categoryName: prod.category.name,
											companyId: prod.company.id,
											companyName: prod.company.name,
											unit: prod.unit,
											quantity: prod.minOrderQty ?? 10,
											indicativeMin: prod.indicativeMin,
											currency: prod.currency,
											specifications: prod.specifications,
										}}
									/>
									<Button
										asChild
										size='sm'
										variant='secondary'
										className='h-8 text-xs shrink-0'
									>
										<Link
											href={`/rfq/new?category=${prod.category.slug}`}
										>
											Source Now →
										</Link>
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
