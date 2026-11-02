import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
	Award,
	Building2,
	CheckCircle2,
	FileText,
	Globe,
	MapPin,
	Package,
	ShieldAlert,
	ShieldCheck,
} from 'lucide-react';
import { ClaimStatus, VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToRfqCartButton } from '@/components/biz/rfq-cart-drawer';
import { ContextualRfqDrawer } from '@/components/cross-link/contextual-rfq-drawer';
import {
	JsonLd,
	buildBreadcrumbJsonLd,
	buildOrganizationJsonLd,
} from '@/components/seo/json-ld';
import { prisma } from '@/lib/prisma/client';
import { getVerticalCompanyProfile } from '@/lib/services/company.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ verticalSlug: string; companySlug: string }>;
}): Promise<Metadata> {
	const { verticalSlug, companySlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);
	const company = await getVerticalCompanyProfile(vertical.id, companySlug);
	if (!company) return { title: 'Supplier Not Found' };

	return {
		title: `${company.name} — ${vertical.name} Supplier Profile | Trndzz`,
		description:
			company.tagline ||
			company.description ||
			`Verified B2B supplier profile, capacity, and technical product catalog for ${company.name}.`,
	};
}

export default async function VerticalCompanyProfilePage({
	params,
}: {
	params: Promise<{ verticalSlug: string; companySlug: string }>;
}) {
	const { verticalSlug, companySlug } = await params;
	const { vertical, user } = await resolveRequiredVertical(verticalSlug);

	const company = await getVerticalCompanyProfile(vertical.id, companySlug);
	if (!company) {
		notFound();
	}

	const primaryCategory =
		company.categories[0]?.category ?? vertical.categories[0];

	const specDefinitions = primaryCategory
		? await prisma.specAttributeDefinition.findMany({
				where: {
					verticalId: vertical.id,
					OR: [
						{ categoryId: primaryCategory.id },
						{ categoryId: null },
					],
				},
				orderBy: { displayOrder: 'asc' },
			})
		: [];

	const isClaimed = company.claimStatus === ClaimStatus.CLAIMED;
	const isVerified =
		company.verificationTier !== VerificationTier.UNVERIFIED;
	const canonicalUrl = buildVerticalUrl(
		vertical.slug,
		`/directory/${company.slug}`
	);
	const loginUrl = buildMacroUrl(
		`/auth/login?next=${encodeURIComponent(canonicalUrl)}`
	);

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<JsonLd
				data={[
					buildBreadcrumbJsonLd([
						{
							name: `Trndzz ${vertical.name}`,
							url: buildVerticalUrl(vertical.slug, '/'),
						},
						{
							name: 'Supplier Directory',
							url: buildVerticalUrl(vertical.slug, '/directory'),
						},
						{ name: company.name, url: canonicalUrl },
					]),
					buildOrganizationJsonLd({
						name: company.name,
						description: company.description || company.tagline,
						url: canonicalUrl,
						state: company.headquartersState,
						city: company.city,
						email: company.publicEmail,
						telephone: company.publicPhone,
					}),
				]}
			/>

			{/* Claim & Convert Banner for Pre-Seeded UNCLAIMED Profiles */}
			{!isClaimed && (
				<section className='flex flex-col justify-between gap-4 rounded-2xl border border-amber/50 bg-amber/10 p-6 md:flex-row md:items-center'>
					<div className='space-y-1'>
						<div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber'>
							<ShieldCheck className='h-4 w-4' />
							<span>
								{company.claimStatus ===
								ClaimStatus.CLAIM_PENDING
									? 'Claim Verification Under Review'
									: 'Unclaimed Industrial Directory Profile'}
							</span>
						</div>
						<h2 className='text-lg font-bold'>
							Are you an authorized executive at {company.name}?
						</h2>
						<p className='text-sm text-muted-foreground'>
							Claim and CAC-verify this listing to edit technical
							catalogs, display SONCAP trust badges, and unlock{' '}
							<strong className='font-tabular text-foreground'>
								{formatNumber(company._count.rfqMatches)}
							</strong>{' '}
							matched buyer RFQ broadcast(s).
						</p>
					</div>

					{company.claimStatus === ClaimStatus.UNCLAIMED && (
						<Button
							asChild
							className='shrink-0 bg-amber text-white hover:opacity-90'
						>
							<Link href={`/directory/${company.slug}/claim`}>
								Claim & Verify Business →
							</Link>
						</Button>
					)}
				</section>
			)}

			{/* Company Header Card */}
			<section className='rounded-2xl border border-border bg-card p-8'>
				<div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-start'>
					<div className='space-y-3 max-w-3xl'>
						<div className='flex flex-wrap items-center gap-2'>
							<Link
								href='/directory'
								className='text-xs font-semibold text-vertical hover:underline mr-2'
							>
								← Directory
							</Link>
							{company.businessRoles.map((role) => (
								<Badge key={role} variant='secondary'>
									{role.replace(/_/g, ' ')}
								</Badge>
							))}
							{isVerified ? (
								<Badge className='bg-verified/15 text-verified border-verified/30'>
									<CheckCircle2 className='mr-1 h-3.5 w-3.5' />
									{company.verificationTier.replace(/_/g, ' ')}
								</Badge>
							) : (
								<Badge
									variant='outline'
									className='border-amber/40 text-amber'
								>
									<ShieldAlert className='mr-1 h-3.5 w-3.5' />
									UNCLAIMED LISTING
								</Badge>
							)}
						</div>

						<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
							{company.name}
						</h1>
						{company.tagline && (
							<p className='text-base font-medium text-muted-foreground'>
								{company.tagline}
							</p>
						)}
						{company.description && (
							<p className='text-sm text-muted-foreground leading-relaxed'>
								{company.description}
							</p>
						)}

						<div className='flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground'>
							<span className='inline-flex items-center gap-1'>
								<MapPin className='h-3.5 w-3.5' />
								HQ:{' '}
								{company.city
									? `${company.city}, ${company.headquartersState}`
									: company.headquartersState}
							</span>
							{company.yearEstablished && (
								<span className='font-tabular'>
									Est. {company.yearEstablished}
								</span>
							)}
							{company.rcNumber && isVerified && (
								<span className='font-tabular text-verified font-medium'>
									CAC: {company.rcNumber}
								</span>
							)}
							{company.websiteUrl && (
								<a
									href={company.websiteUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-1 text-foreground underline'
								>
									<Globe className='h-3.5 w-3.5' />
									Corporate Website
								</a>
							)}
						</div>
					</div>

					<div className='flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-background p-5 lg:w-80'>
						<div>
							<span className='text-xs text-muted-foreground'>
								Installed Capacity
							</span>
							<p className='font-tabular mt-0.5 text-sm font-bold'>
								{company.productionCapacity ||
									'Contact for plant schedule'}
							</p>
						</div>
						<div>
							<span className='text-xs text-muted-foreground'>
								Minimum Order (MOQ)
							</span>
							<p className='font-tabular mt-0.5 text-sm font-bold'>
								{company.minimumOrderSummary ||
									'Project-dependent'}
							</p>
						</div>
						<div>
							<span className='text-xs text-muted-foreground'>
								Delivery Coverage
							</span>
							<p className='mt-0.5 text-xs text-foreground'>
								{company.coverageStates.join(', ') ||
									company.headquartersState}
							</p>
						</div>

						{primaryCategory && (
							<div className='pt-2'>
								<ContextualRfqDrawer
									verticalId={vertical.id}
									verticalSlug={vertical.slug}
									categoryId={primaryCategory.id}
									categoryName={primaryCategory.name}
									defaultUnit='MT'
									specDefinitions={specDefinitions.map(
										(d) => ({
											id: d.id,
											key: d.key,
											label: d.label,
											unit: d.unit,
											inputType: d.inputType,
											options: d.options,
											isRequired: d.isRequired,
										})
									)}
									targetCompanyId={company.id}
									targetCompanyName={company.name}
									initialUser={user}
									loginUrl={loginUrl}
									triggerLabel={
										isClaimed
											? `Request Quote from ${company.name.split(' ')[0]}`
											: 'Broadcast Category RFQ'
									}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Certifications Strip */}
				{company.certifications.length > 0 && (
					<div className='mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5'>
						<span className='font-tabular text-xs uppercase tracking-wider text-muted-foreground'>
							Verified Quality & Compliance:
						</span>
						{company.certifications.map((cert) => (
							<div
								key={cert.id}
								className='inline-flex items-center gap-2 rounded-lg border border-verified/30 bg-verified/10 px-3 py-1.5 text-xs'
							>
								<Award className='h-3.5 w-3.5 text-verified' />
								<span className='font-semibold text-foreground'>
									{cert.name}
								</span>
								<span className='text-muted-foreground'>
									({cert.issuer})
								</span>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Structured Product Catalog */}
			<section className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Package className='h-5 w-5 text-vertical' />
						<h2 className='text-2xl font-bold tracking-tight'>
							Technical Product & Material Catalog (
							{company.products.length})
						</h2>
					</div>
				</div>

				{company.products.length === 0 ? (
					<div className='rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
						No structured product SKUs published yet on this
						supplier storefront.
					</div>
				) : (
					<div className='grid gap-6 md:grid-cols-2'>
						{company.products.map((prod) => (
							<div
								key={prod.id}
								className='flex flex-col justify-between rounded-xl border border-border bg-card p-6'
							>
								<div>
									<Badge variant='outline' className='text-xs'>
										{prod.category.name}
									</Badge>
									<h3 className='mt-2.5 text-lg font-bold'>
										{prod.name}
									</h3>
									{prod.description && (
										<p className='mt-1.5 text-sm text-muted-foreground'>
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
													className='font-tabular rounded border border-border bg-background px-2.5 py-1 text-xs'
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
													Download Technical Datasheet (PDF)
												</span>
											</a>
										</div>
									)}
								</div>

								<div className='mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs'>
									<div>
										<span className='text-muted-foreground'>
											Indicative Ex-Works:{' '}
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
											<span className='font-medium'>
												Quote on RFQ
											</span>
										)}
										{prod.minOrderQty && (
											<span className='font-tabular ml-2 text-muted-foreground'>
												(MOQ:{' '}
												{formatNumber(prod.minOrderQty)}{' '}
												{prod.unit})
											</span>
										)}
									</div>

									<AddToRfqCartButton
										item={{
											productId: prod.id,
											productName: prod.name,
											verticalId: vertical.id,
											verticalSlug: vertical.slug,
											categoryId: prod.category.id,
											categorySlug: prod.category.slug,
											categoryName: prod.category.name,
											companyId: company.id,
											companyName: company.name,
											unit: prod.unit,
											quantity: prod.minOrderQty ?? 10,
											indicativeMin: prod.indicativeMin,
											currency: prod.currency,
											specifications: prod.specifications,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Mentioned in Trndzz Pulse */}
			{company.articleMentions.length > 0 && (
				<section className='space-y-3'>
					<h2 className='text-xl font-bold tracking-tight'>
						Featured in Trndzz Pulse Briefs
					</h2>
					<div className='grid gap-4 md:grid-cols-2'>
						{company.articleMentions.map((m) => (
							<Link
								key={m.article.id}
								href={`/pulse/${m.article.slug}`}
								className='rounded-xl border border-border bg-card p-5 transition-colors hover:border-vertical/60'
							>
								<div className='flex items-center gap-2 text-xs text-muted-foreground'>
									<Building2 className='h-3.5 w-3.5 text-vertical' />
									<span>Indexed Industry Coverage</span>
								</div>
								<h3 className='mt-2 font-bold'>
									{m.article.title}
								</h3>
							</Link>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

