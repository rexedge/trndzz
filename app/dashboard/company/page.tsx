import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireServerUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency } from '@/lib/utils/format';
import {
	VendorProductPublisher,
	VendorProfileEditor,
} from './_vendor-forms';

export default async function CompanyCatalogWorkspacePage() {
	const user = await requireServerUser('/dashboard/company');

	const memberships = await prisma.companyMember.findMany({
		where: { userId: user.userId },
		include: {
			company: {
				include: {
					verticals: {
						include: {
							vertical: {
								include: {
									categories: {
										orderBy: { displayOrder: 'asc' },
									},
									specDefinitions: {
										orderBy: { displayOrder: 'asc' },
									},
								},
							},
						},
					},
					products: {
						orderBy: { createdAt: 'desc' },
						include: { category: { select: { name: true } } },
					},
				},
			},
		},
	});

	const activeMembership = memberships[0];

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Supplier Storefront & Technical Product Catalog
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Manage your verified directory profile, plant capacity, and
					structured specification SKUs.
				</p>
			</div>

			{!activeMembership ? (
				<div className='rounded-xl border border-amber/40 bg-amber/10 p-8 space-y-3'>
					<h2 className='text-lg font-bold'>
						No Claimed Company Profile Assigned
					</h2>
					<p className='text-sm text-muted-foreground'>
						Claim your pre-seeded company listing in the supplier
						directory to unlock storefront editing and SKU
						publishing.
					</p>
					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90'
					>
						<a href={buildVerticalUrl('aluminium', '/directory')}>
							Claim Pre-Seeded Listing →
						</a>
					</Button>
				</div>
			) : (
				(() => {
					const company = activeMembership.company;
					const primaryVertical = company.verticals[0]?.vertical;

					return (
						<div className='space-y-8'>
							<div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5'>
								<div className='flex items-center gap-2'>
									<CheckCircle2 className='h-5 w-5 text-verified' />
									<span className='font-bold'>
										{company.name}
									</span>
									<Badge variant='secondary'>
										{activeMembership.role}
									</Badge>
									<Badge className='bg-verified/15 text-verified border-verified/30'>
										{company.verificationTier}
									</Badge>
								</div>
								{primaryVertical && (
									<Button
										asChild
										variant='outline'
										size='sm'
									>
										<a
											href={buildVerticalUrl(
												primaryVertical.slug,
												`/directory/${company.slug}`
											)}
										>
											View Public Storefront →
										</a>
									</Button>
								)}
							</div>

							<div className='grid gap-8 lg:grid-cols-2'>
								<VendorProfileEditor company={company} />

								{primaryVertical && (
									<VendorProductPublisher
										companyId={company.id}
										verticalId={primaryVertical.id}
										categories={primaryVertical.categories.map(
											(c) => ({
												id: c.id,
												name: c.name,
												defaultUnit:
													c.defaultUnit ?? 'MT',
											})
										)}
										specDefinitions={primaryVertical.specDefinitions.map(
											(d) => ({
												id: d.id,
												categoryId: d.categoryId,
												key: d.key,
												label: d.label,
												unit: d.unit,
												inputType: d.inputType,
												options: d.options,
											})
										)}
									/>
								)}
							</div>

							{company.products.length > 0 && (
								<section className='space-y-3'>
									<h2 className='text-lg font-bold'>
										Published Storefront SKUs (
										{company.products.length})
									</h2>
									<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
										{company.products.map((prod) => (
											<div
												key={prod.id}
												className='rounded-xl border border-border bg-card p-4 space-y-1.5'
											>
												<Badge
													variant='outline'
													className='text-xs'
												>
													{prod.category.name}
												</Badge>
												<h3 className='font-bold text-sm'>
													{prod.name}
												</h3>
												<p className='font-tabular text-xs text-muted-foreground'>
													{prod.indicativeMin
														? `${formatCurrency(Number(prod.indicativeMin), prod.currency)} / ${prod.unit}`
														: `Unit: ${prod.unit}`}
												</p>
											</div>
										))}
									</div>
								</section>
							)}
						</div>
					);
				})()
			)}
		</div>
	);
}

