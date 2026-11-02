'use client';

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface PricePointItem {
	id: string;
	price: number;
	recordedAt: string;
	note: string | null;
}

interface PriceHistoryChartProps {
	series: PricePointItem[];
	currency: string;
	unit: string;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: {
		payload: {
			dateLabel: string;
			price: number;
			note: string | null;
		};
	}[];
	currency: string;
	unit: string;
}

function ChartTooltip({ active, payload, currency, unit }: CustomTooltipProps) {
	if (!active || !payload || payload.length === 0) return null;
	const item = payload[0]?.payload;
	if (!item) return null;

	return (
		<div className='rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md'>
			<p className='font-tabular text-muted-foreground'>{item.dateLabel}</p>
			<p className='font-tabular mt-0.5 text-sm font-bold text-foreground'>
				{formatCurrency(item.price, currency)} / {unit}
			</p>
			{item.note && (
				<p className='mt-1 max-w-52 text-[11px] text-muted-foreground'>
					{item.note}
				</p>
			)}
		</div>
	);
}

export function PriceHistoryChart({
	series,
	currency,
	unit,
}: PriceHistoryChartProps) {
	if (series.length === 0) {
		return (
			<div className='flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground'>
				No historical benchmark points recorded yet.
			</div>
		);
	}

	const chartData = series.map((pt) => {
		const dt = new Date(pt.recordedAt);
		return {
			id: pt.id,
			price: pt.price,
			note: pt.note,
			dateLabel: dt.toLocaleDateString('en-NG', {
				month: 'short',
				day: 'numeric',
			}),
		};
	});

	return (
		<div className='h-52 w-full'>
			<ResponsiveContainer width='100%' height='100%'>
				<AreaChart
					data={chartData}
					margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
				>
					<CartesianGrid
						strokeDasharray='3 3'
						vertical={false}
						className='stroke-border'
					/>
					<XAxis
						dataKey='dateLabel'
						tickLine={false}
						axisLine={false}
						fontSize={11}
						className='fill-muted-foreground font-mono'
					/>
					<YAxis
						domain={['auto', 'auto']}
						tickLine={false}
						axisLine={false}
						width={68}
						fontSize={11}
						tickFormatter={(val: number) =>
							formatCurrency(val, currency, { compact: true })
						}
						className='fill-muted-foreground font-mono'
					/>
					<Tooltip
						content={<ChartTooltip currency={currency} unit={unit} />}
					/>
					<Area
						type='monotone'
						dataKey='price'
						stroke='var(--color-primary)'
						fill='var(--color-primary)'
						fillOpacity={0.14}
						strokeWidth={2}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

