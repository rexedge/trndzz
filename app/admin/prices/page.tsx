import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { listIndicatorsWithHistory } from '@/lib/services/commodity.service';
import { formatCurrency, formatPercentDelta } from '@/lib/utils/format';
import {
	CommodityPriceUpdater,
	CreateIndicatorForm,
} from './_price-updater';

export default async function AdminPriceDeskPage() {
	await requirePlatformStaff();

	const [indicators, verticals] = await Promise.all([
		listIndicatorsWithHistory(),
		prisma.vertical.findMany({
			orderBy: { displayOrder: 'asc' },
			select: { id: true, name: true },
		}),
	]);

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Commodity & Regional Price Desk
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Maintain LME international metal benchmarks, NAFEM FX rates,
					and Nigerian Naira (`₦`) wholesale ex-factory indices.
				</p>
			</div>

			<div className='grid gap-8 lg:grid-cols-2'>
				{indicators.length > 0 && (
					<CommodityPriceUpdater
						indicators={indicators.map((i) => ({
							id: i.id,
							code: i.code,
							name: i.name,
							currency: i.currency,
							unit: i.unit,
						}))}
					/>
				)}
				<CreateIndicatorForm verticals={verticals} />
			</div>

			<section className='rounded-2xl border border-border bg-card p-6 space-y-4'>
				<h2 className='text-lg font-bold'>
					Active Benchmark Tickers ({indicators.length})
				</h2>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Code</TableHead>
							<TableHead>Indicator</TableHead>
							<TableHead>Scope</TableHead>
							<TableHead>Latest Price</TableHead>
							<TableHead>Delta</TableHead>
							<TableHead>Points</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{indicators.map((ind) => {
							const delta = formatPercentDelta(ind.changePercent);
							return (
								<TableRow key={ind.id}>
									<TableCell className='font-tabular font-bold'>
										{ind.code}
									</TableCell>
									<TableCell>{ind.name}</TableCell>
									<TableCell className='text-xs text-muted-foreground'>
										{ind.verticalName || 'Macro Hub'}
									</TableCell>
									<TableCell className='font-tabular font-bold'>
										{formatCurrency(
											ind.latestPrice,
											ind.currency
										)}{' '}
										/ {ind.unit}
									</TableCell>
									<TableCell className='font-tabular text-xs'>
										{delta.label}
									</TableCell>
									<TableCell className='font-tabular text-xs'>
										{ind.series.length}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</section>
		</div>
	);
}

