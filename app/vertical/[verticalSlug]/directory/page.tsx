import Link from 'next/link';
import {
	Award,
	Building2,
	CheckCircle2,
	MapPin,
	Search,
	ShieldAlert,
} from 'lucide-react';
import {
	BusinessRole,
	ClaimStatus,
	StreamPosition,
	VerificationTier,
} from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchVerticalCompanies } from '@/lib/services/company.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import {
	BUSINESS_ROLE_VALUES,
	STREAM_POSITION_VALUES,
} from '@/lib/validators/company.validator';

export default async function VerticalSupplierDirectoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{
		q?: string;
		role?: string;
		stream?: string;
		category?: string;
		state?: string;
		verified?: string;
	}>;
}) {
	const { verticalSlug } = await params;
	const { q, role, stream, category, state, verified } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const validRole = BUSINESS_ROLE_VALUES.find(
		(r) => r === (role as BusinessRole)
	);
	const validStream = STREAM_POSITION_VALUES.find(
		(s) => s === (stream as StreamPosition)
	);
	const verifiedOnly = verified === '1';

	const companies = await searchVerticalCompanies({
		verticalId: vertical.id,
		query: q,
		role: validRole,
		stream: validStream,
		categorySlug: category,
		state,
		verifiedOnly,
	});

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			{/* Header */}
			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-verified'>
						<Building2 className='h-4 w-4' />
						<span>Verified Industrial Registry</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						{vertical.name} B2B Supplier Directory
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Filter manufacturers, importers, processors, and EPC
						fabricators by value-chain stage, state coverage, and
						SON/CAC verification status.
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Button asChild variant='outline' size='sm'>
						<Link href='/products'>Product Catalog</Link>
					</Button>
					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90'
					>
						<Link href='/rfq/new'>Broadcast Multi-Vendor RFQ</Link>
					</Button>
				</div>
			</div>

			{/* Multi-Facet Search Form */}
			<form
				action='/directory'
				method='GET'
				className='grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-6'
			>
				<div className='relative sm:col-span-2'>
					<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						name='q'
						defaultValue={q ?? ''}
						placeholder='Search company, alloy, plant...'
						className='pl-9'
					/>
				</div>

				<select
					name='role'
					defaultValue={validRole ?? ''}
					className='flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value=''>All Business Roles</option>
					{BUSINESS_ROLE_VALUES.map((r) => (
						<option key={r} value={r}>
							{r.replace(/_/g, ' ')}
						</option>
					))}
				</select>

				<select
					name='stream'
					defaultValue={validStream ?? ''}
					className='flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value=''>All Value-Chain Stages</option>
					{STREAM_POSITION_VALUES.map((s) => (
						<option key={s} value={s}>
							{s.replace(/_/g, ' ')}
						</option>
					))}
				</select>

				<select
					name='category'
					defaultValue={category ?? ''}
					className='flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value=''>All Categories</option>
					{vertical.categories.map((cat) => (
						<option key={cat.id} value={cat.slug}>
							{cat.name}
						</option>
					))}
				</select>

				<Input
					name='state'
					defaultValue={state ?? ''}
					placeholder='State (e.g. Lagos, Ogun)'
				/>

				<div className='flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 sm:col-span-2 lg:col-span-6'>
					<label className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
						<input
							type='checkbox'
							name='verified'
							value='1'
							defaultChecked={verifiedOnly}
							className='rounded border-border'
						/>
						<span>
							Show CAC / SON Verified Suppliers Only (
							{companies.length} results)
						</span>
					</label>

					<div className='flex items-center gap-2'>
						{(q ||
							validRole ||
							validStream ||
							category ||
							state ||
							verifiedOnly) && (
							<Button asChild variant='ghost' size='sm'>
								<Link href='/directory'>Reset Filters</Link>
							</Button>
						)}
						<Button type='submit' size='sm' variant='secondary'>
							Apply Directory Filters
						</Button>
					</div>
				</div>
			</form>

			{/* Directory Results */}
			{companies.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center'>
					<p className='text-sm text-muted-foreground'>
						No {vertical.name.toLowerCase()} companies matched your
						filter parameters.
					</p>
					<Button
						asChild
						variant='outline'
						size='sm'
						className='mt-4'
					>
						<Link href='/directory'>View All Indexed Suppliers</Link>
					</Button>
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
								className='flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-vertical/60'
							>
								<div>
									<div className='flex flex-wrap items-center justify-between gap-2'>
										<div className='flex flex-wrap gap-1.5'>
											{company.businessRoles.map(
												(bRole) => (
													<Badge
														key={bRole}
														variant='secondary'
														className='text-[11px]'
													>
														{bRole.replace(
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
												UNCLAIMED
											</Badge>
										)}
									</div>

									<h2 className='mt-3 text-xl font-bold'>
										<Link
											href={`/directory/${company.slug}`}
											className='hover:text-vertical transition-colors'
										>
											{company.name}
										</Link>
									</h2>

									{company.tagline && (
										<p className='mt-1.5 text-sm text-muted-foreground line-clamp-2'>
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
												Capacity:{' '}
												{company.productionCapacity}
											</span>
										)}
										<span className='font-tabular'>
											{company._count.products} catalog
											SKU(s)
										</span>
									</div>

									{company.certifications.length > 0 && (
										<div className='mt-3 flex flex-wrap gap-1.5'>
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

								<div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4'>
									<span className='text-xs text-muted-foreground'>
										Covers:{' '}
										{company.coverageStates
											.slice(0, 4)
											.join(', ')}
										{company.coverageStates.length > 4
											? ` +${company.coverageStates.length - 4}`
											: ''}
									</span>

									<div className='flex items-center gap-2'>
										<Button
											asChild
											variant='outline'
											size='sm'
										>
											<Link
												href={`/directory/${company.slug}`}
											>
												View Profile
											</Link>
										</Button>
										{isClaimed ? (
											<Button
												asChild
												size='sm'
												className='bg-amber text-white hover:opacity-90'
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
												variant='secondary'
											>
												<Link
													href={`/directory/${company.slug}/claim`}
												>
													Claim Business →
												</Link>
											</Button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

