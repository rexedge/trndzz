import Link from 'next/link';
import { CheckCircle2, Package, Search } from 'lucide-react';
import { VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JsonLd, buildProductJsonLd } from '@/components/seo/json-ld';
import { listVerticalCatalogProducts } from '@/lib/services/company.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default async function VerticalProductCatalogPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{ category?: string; q?: string }>;
}) {
	const { verticalSlug } = await params;
	const { category, q } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const products = await listVerticalCatalogProducts({
		verticalId: vertical.id,
		categorySlug: category,
		query: q,
	});

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
						<span>Trndzz Biz · Specification Catalog</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						{vertical.name} Technical Product & Material Catalog
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Standardized industrial SKUs indexed by alloy, gauge,
						temper, MOQ, and ex-works Naira (`₦`) price bands.
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

			{/* Filter Bar */}
			<form
				action='/products'
				method='GET'
				className='flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4'
			>
				<div className='relative flex-1 min-w-60'>
					<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						name='q'
						defaultValue={q ?? ''}
						placeholder='Search alloy (AA3003, AA6063), gauge (0.55mm), extrusion...'
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

				<Button type='submit' variant='secondary' size='sm'>
					Filter Catalog
				</Button>
				{(category || q) && (
					<Button asChild variant='ghost' size='sm'>
						<Link href='/products'>Reset</Link>
					</Button>
				)}
			</form>

			{products.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No catalog items matched your query. You can broadcast exact
					specifications directly via an open RFQ.
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
									<Button
										asChild
										size='sm'
										variant='secondary'
										className='h-8 text-xs shrink-0'
									>
										<Link
											href={`/rfq/new?category=${prod.category.slug}`}
										>
											Source SKU →
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

