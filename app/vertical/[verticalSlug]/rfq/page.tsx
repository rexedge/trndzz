import Link from 'next/link';
import { FileSpreadsheet, MapPin, ShieldCheck, Users } from 'lucide-react';
import { RfqVisibility } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listPublicVerticalRfqs } from '@/lib/services/rfq.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default async function VerticalRfqBoardPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{ category?: string; state?: string }>;
}) {
	const { verticalSlug } = await params;
	const { category, state } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const rfqs = await listPublicVerticalRfqs({
		verticalId: vertical.id,
		categorySlug: category,
		state,
	});

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber'>
						<FileSpreadsheet className='h-4 w-4' />
						<span>Trndzz Biz · Live Procurement Board</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						Live {vertical.name} Buyer RFQs & Tenders
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Specification-driven sourcing requests broadcast by EPC
						contractors, developers, and industrial fabricators.
					</p>
				</div>
				<Button
					asChild
					className='bg-amber text-white hover:opacity-90 gap-1.5'
				>
					<Link href='/rfq/new'>
						<FileSpreadsheet className='h-4 w-4' />
						Broadcast New Buyer RFQ
					</Link>
				</Button>
			</div>

			{/* Filter Bar */}
			<form
				action='/rfq'
				method='GET'
				className='flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4'
			>
				<select
					name='category'
					defaultValue={category ?? ''}
					className='flex h-9 rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value=''>All {vertical.name} Categories</option>
					{vertical.categories.map((cat) => (
						<option key={cat.id} value={cat.slug}>
							{cat.name}
						</option>
					))}
				</select>

				<Input
					name='state'
					defaultValue={state ?? ''}
					placeholder='Delivery State (e.g. Lagos, Abuja)'
					className='max-w-xs'
				/>

				<Button type='submit' variant='secondary' size='sm'>
					Filter Tenders
				</Button>
				{(category || state) && (
					<Button asChild variant='ghost' size='sm'>
						<Link href='/rfq'>Reset</Link>
					</Button>
				)}
			</form>

			{rfqs.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center'>
					<p className='text-sm text-muted-foreground'>
						No active tenders matched your filter selection.
					</p>
					<Button
						asChild
						className='mt-4 bg-amber text-white hover:opacity-90'
						size='sm'
					>
						<Link href='/rfq/new'>Post First RFQ in Filter</Link>
					</Button>
				</div>
			) : (
				<div className='space-y-4'>
					{rfqs.map((rfq) => (
						<div
							key={rfq.id}
							className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-amber/60'
						>
							<div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
								<div className='flex flex-wrap items-center gap-2'>
									<span className='font-tabular rounded bg-amber/15 px-2.5 py-0.5 font-bold text-amber'>
										{rfq.referenceNumber}
									</span>
									<Badge variant='secondary'>
										{rfq.category.name}
									</Badge>
									{rfq.visibility ===
										RfqVisibility.VERIFIED_VENDORS_ONLY && (
										<Badge className='bg-verified/15 text-verified border-verified/30'>
											<ShieldCheck className='mr-1 h-3 w-3' />
											SON/CAC Verified Vendors Only
										</Badge>
									)}
								</div>
								<span className='font-tabular text-muted-foreground'>
									Status: <strong>{rfq.status}</strong>
								</span>
							</div>

							<div className='mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-center'>
								<div className='space-y-2.5 max-w-3xl'>
									<h2 className='text-xl font-bold leading-snug'>
										<Link
											href={`/rfq/${rfq.referenceNumber}`}
											className='hover:text-amber transition-colors'
										>
											{rfq.title}
										</Link>
									</h2>

									{Object.keys(rfq.specifications).length >
										0 && (
										<div className='flex flex-wrap gap-1.5'>
											{Object.entries(
												rfq.specifications
											).map(([k, v]) => (
												<span
													key={k}
													className='font-tabular rounded border border-border bg-background px-2.5 py-0.5 text-xs'
												>
													{k.replace(/_/g, ' ')}:{' '}
													<strong>{v}</strong>
												</span>
											))}
										</div>
									)}
								</div>

								<div className='flex shrink-0 flex-col items-start gap-2 rounded-xl border border-border bg-background p-4 lg:items-end lg:min-w-60'>
									<p className='font-tabular text-lg font-extrabold'>
										{formatNumber(rfq.quantity)} {rfq.unit}
									</p>
									{rfq.targetUnitPrice && (
										<p className='font-tabular text-xs text-muted-foreground'>
											Target:{' '}
											{formatCurrency(
												rfq.targetUnitPrice,
												rfq.currency
											)}{' '}
											/ {rfq.unit}
										</p>
									)}
									<div className='flex items-center gap-3 text-xs text-muted-foreground'>
										<span className='inline-flex items-center gap-1'>
											<MapPin className='h-3.5 w-3.5' />
											{rfq.deliveryCity
												? `${rfq.deliveryCity}, ${rfq.deliveryState}`
												: rfq.deliveryState}
										</span>
										<span className='font-tabular inline-flex items-center gap-1'>
											<Users className='h-3.5 w-3.5' />
											{rfq.quotesCount} quote(s)
										</span>
									</div>
									<Button
										asChild
										size='sm'
										variant='secondary'
										className='mt-1 w-full lg:w-auto'
									>
										<Link
											href={`/rfq/${rfq.referenceNumber}`}
										>
											Inspect & Submit Quote →
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

