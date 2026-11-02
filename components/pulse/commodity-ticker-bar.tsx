import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { SerializedIndicator } from '@/lib/services/vertical.service';
import { formatCurrency, formatPercentDelta } from '@/lib/utils/format';

interface CommodityTickerBarProps {
	indicators: SerializedIndicator[];
	label?: string;
}

export function CommodityTickerBar({
	indicators,
	label = 'LIVE BENCHMARKS',
}: CommodityTickerBarProps) {
	if (indicators.length === 0) {
		return null;
	}

	return (
		<div className='border-b border-border bg-card/90 backdrop-blur'>
			<div className='mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 scrollbar-hide'>
				<span className='font-tabular shrink-0 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-primary'>
					{label}
				</span>

				<div className='flex items-center divide-x divide-border'>
					{indicators.map((item) => {
						const delta = formatPercentDelta(item.changePercent);
						return (
							<div
								key={item.id}
								className='flex shrink-0 items-center gap-2 px-3 first:pl-0 text-xs'
							>
								<span className='font-medium text-muted-foreground'>
									{item.name}
								</span>
								<span className='font-tabular font-semibold text-foreground'>
									{formatCurrency(
										item.latestPrice,
										item.currency
									)}
									<span className='text-muted-foreground font-normal'>
										/{item.unit}
									</span>
								</span>
								<span
									className={`font-tabular inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${
										delta.direction === 'up'
											? 'bg-verified/15 text-verified'
											: delta.direction === 'down'
												? 'bg-destructive/15 text-destructive'
												: 'bg-muted text-muted-foreground'
									}`}
								>
									{delta.direction === 'up' && (
										<ArrowUpRight className='h-3 w-3' />
									)}
									{delta.direction === 'down' && (
										<ArrowDownRight className='h-3 w-3' />
									)}
									{delta.direction === 'flat' && (
										<Minus className='h-3 w-3' />
									)}
									{delta.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

