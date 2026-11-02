import Link from 'next/link';
import {
	ArrowDownRight,
	ArrowUpRight,
	FileSpreadsheet,
	LineChart,
	Minus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceHistoryChart } from '@/components/pulse/price-history-chart';
import { listIndicatorsWithHistory } from '@/lib/services/commodity.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { formatCurrency, formatPercentDelta } from '@/lib/utils/format';

export default async function VerticalPriceTrackersPage({
	params,
}: {
	params: Promise<{ verticalSlug: string }>;
}) {
	const { verticalSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const indicators = await listIndicatorsWithHistory(vertical.id);

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vertical'>
						<LineChart className='h-4 w-4' />
						<span>Commodity & Regional Price Desk</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						{vertical.name} Benchmark & Wholesale Price Trackers
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Historical international metal benchmarks, FX reference
						rates, and local ex-factory Naira (`₦`) wholesale price
						indices.
					</p>
				</div>
				<Button
					asChild
					className='bg-amber text-white hover:opacity-90 gap-1.5'
				>
					<Link href='/rfq/new'>
						<FileSpreadsheet className='h-4 w-4' />
						Lock Mill Quote via RFQ
					</Link>
				</Button>
			</div>

			{indicators.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No active benchmark indicators configured for{' '}
					{vertical.name} yet.
				</div>
			) : (
				<div className='grid gap-6 lg:grid-cols-2'>
					{indicators.map((ind) => {
						const delta = formatPercentDelta(ind.changePercent);
						return (
							<div
								key={ind.id}
								className='rounded-2xl border border-border bg-card p-6 space-y-5'
							>
								<div className='flex flex-wrap items-start justify-between gap-3'>
									<div>
										<div className='flex items-center gap-2'>
											<span className='font-tabular rounded bg-muted px-2 py-0.5 text-xs font-semibold'>
												{ind.code}
											</span>
											<Badge variant='outline'>
												{ind.verticalName ||
													'Macro FX / Benchmark'}
											</Badge>
										</div>
										<h2 className='mt-2 text-lg font-bold'>
											{ind.name}
										</h2>
										{ind.sourceLabel && (
											<p className='text-xs text-muted-foreground'>
												Source: {ind.sourceLabel}
											</p>
										)}
									</div>

									<div className='text-right'>
										<p className='font-tabular text-2xl font-extrabold'>
											{formatCurrency(
												ind.latestPrice,
												ind.currency
											)}
											<span className='text-xs font-normal text-muted-foreground'>
												{' '}
												/ {ind.unit}
											</span>
										</p>
										<div className='mt-1 inline-flex items-center gap-1 font-tabular text-xs font-semibold'>
											{delta.direction === 'up' && (
												<span className='inline-flex items-center text-verified'>
													<ArrowUpRight className='h-3.5 w-3.5' />
													{delta.label}
												</span>
											)}
											{delta.direction === 'down' && (
												<span className='inline-flex items-center text-destructive'>
													<ArrowDownRight className='h-3.5 w-3.5' />
													{delta.label}
												</span>
											)}
											{delta.direction === 'flat' && (
												<span className='inline-flex items-center text-muted-foreground'>
													<Minus className='h-3.5 w-3.5' />
													{delta.label}
												</span>
											)}
										</div>
									</div>
								</div>

								<PriceHistoryChart
									series={ind.series}
									currency={ind.currency}
									unit={ind.unit}
								/>

								<div className='flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground'>
									<span>
										Updated{' '}
										{new Date(
											ind.updatedAt
										).toLocaleDateString('en-NG', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</span>
									<Link
										href='/rfq/new'
										className='font-semibold text-amber hover:underline'
									>
										Request Supplier Quotes →
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

