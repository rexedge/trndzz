'use client';

import { useRouter } from 'next/navigation';
import { Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import {
	type RfqCartItem,
	useRfqCartStore,
} from '@/store/useRfqCartStore';
import { useRfqDraftStore } from '@/store/useRfqDraftStore';

export function AddToRfqCartButton({
	item,
	label = 'Add to RFQ Basket',
}: {
	item: RfqCartItem;
	label?: string;
}) {
	const addItem = useRfqCartStore((s) => s.addItem);

	return (
		<Button
			type='button'
			size='sm'
			variant='outline'
			className='h-8 gap-1 text-xs'
			onClick={() => {
				addItem(item);
				toast.success(`Added "${item.productName}" to RFQ Basket`);
			}}
		>
			<Plus className='h-3.5 w-3.5' />
			<span>{label}</span>
		</Button>
	);
}

export function RfqCartDrawer({
	verticalSlug,
	verticalName,
}: {
	verticalSlug: string;
	verticalName: string;
}) {
	const router = useRouter();
	const {
		items,
		isOpen,
		setOpen,
		removeItem,
		updateQuantity,
		clearVerticalItems,
	} = useRfqCartStore();
	const setPrefill = useRfqDraftStore((s) => s.setPrefill);

	const verticalItems = items.filter((i) => i.verticalSlug === verticalSlug);

	const indicativeTotal = verticalItems.reduce((acc, item) => {
		if (item.indicativeMin && item.currency === 'NGN') {
			return acc + item.indicativeMin * item.quantity;
		}
		return acc;
	}, 0);

	const handleBroadcastBundle = () => {
		if (verticalItems.length === 0) return;
		const primary = verticalItems[0];
		const totalQty = verticalItems.reduce((sum, i) => sum + i.quantity, 0);

		const scheduleLines = verticalItems.map((item, idx) => {
			const specSummary = Object.entries(item.specifications)
				.map(([k, v]) => `${k}: ${v}`)
				.join(', ');
			return `${idx + 1}. ${item.productName} — Qty: ${item.quantity} ${item.unit} (Ref Supplier: ${item.companyName}${specSummary ? ` | Specs: ${specSummary}` : ''})`;
		});

		const headline =
			verticalItems.length === 1
				? `${primary.quantity} ${primary.unit} — ${primary.productName}`
				: `Multi-Item ${verticalName} Schedule (${verticalItems.length} Technical SKUs · ${primary.categoryName})`;

		setPrefill({
			verticalSlug,
			categoryId: primary.categoryId,
			categoryName: primary.categoryName,
			targetCompanyId:
				verticalItems.length === 1 ? primary.companyId : null,
			targetCompanyName:
				verticalItems.length === 1 ? primary.companyName : null,
			title: headline.slice(0, 175),
			quantity: String(totalQty),
			unit: primary.unit,
			specifications: primary.specifications,
			additionalNotes: `Consolidated Multi-SKU Material Schedule:\n${scheduleLines.join('\n')}`,
		});

		setOpen(false);
		router.push(`/rfq/new?category=${primary.categorySlug}`);
	};

	return (
		<Sheet open={isOpen} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className='relative gap-1.5'
				>
					<ShoppingBag className='h-4 w-4' />
					<span className='hidden sm:inline'>RFQ Basket</span>
					{verticalItems.length > 0 && (
						<span className='font-tabular inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-white'>
							{verticalItems.length}
						</span>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent className='flex w-full flex-col justify-between sm:max-w-lg'>
				<div className='space-y-5 overflow-y-auto pr-1'>
					<SheetHeader>
						<SheetTitle>
							Multi-Item {verticalName} RFQ Basket (
							{verticalItems.length})
						</SheetTitle>
						<SheetDescription>
							Queue standardized SKUs across supplier storefronts,
							adjust lot quantities, and broadcast a consolidated
							tender schedule.
						</SheetDescription>
					</SheetHeader>

					{verticalItems.length === 0 ? (
						<div className='rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground'>
							Your {verticalName} sourcing basket is empty. Add
							technical SKUs from the{' '}
							<strong>Products Catalog</strong> or any supplier
							storefront.
						</div>
					) : (
						<div className='space-y-3'>
							{verticalItems.map((item) => (
								<div
									key={item.productId}
									className='space-y-2.5 rounded-xl border border-border bg-card p-4'
								>
									<div className='flex items-start justify-between gap-2'>
										<div>
											<p className='text-xs font-semibold text-muted-foreground'>
												{item.categoryName} ·{' '}
												{item.companyName}
											</p>
											<h4 className='text-sm font-bold leading-snug'>
												{item.productName}
											</h4>
										</div>
										<button
											type='button'
											onClick={() =>
												removeItem(item.productId)
											}
											className='text-muted-foreground hover:text-destructive'
											aria-label='Remove SKU'
										>
											<Trash2 className='h-4 w-4' />
										</button>
									</div>

									{Object.keys(item.specifications).length >
										0 && (
										<div className='flex flex-wrap gap-1'>
											{Object.entries(
												item.specifications
											).map(([k, v]) => (
												<span
													key={k}
													className='font-tabular rounded border border-border bg-background px-1.5 py-0.5 text-[10px]'
												>
													{k.replace(/_/g, ' ')}: {v}
												</span>
											))}
										</div>
									)}

									<div className='flex items-center justify-between gap-3 pt-1'>
										<div className='flex items-center gap-2'>
											<span className='text-xs text-muted-foreground'>
												Qty:
											</span>
											<Input
												type='number'
												min='0.1'
												step='any'
												value={item.quantity}
												onChange={(e) =>
													updateQuantity(
														item.productId,
														Number(
															e.target.value
														) || 1
													)
												}
												className='font-tabular h-8 w-24 text-xs'
											/>
											<span className='font-tabular text-xs font-medium'>
												{item.unit}
											</span>
										</div>

										{item.indicativeMin && (
											<span className='font-tabular text-xs font-semibold'>
												~
												{formatCurrency(
													item.indicativeMin *
														item.quantity,
													item.currency
												)}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{verticalItems.length > 0 && (
					<div className='space-y-3 border-t border-border pt-4'>
						{indicativeTotal > 0 && (
							<div className='flex items-center justify-between text-xs'>
								<span className='text-muted-foreground'>
									Est. Ex-Works Lot Benchmark (
									{formatNumber(verticalItems.length)} SKUs):
								</span>
								<span className='font-tabular text-sm font-extrabold'>
									{formatCurrency(indicativeTotal, 'NGN')}
								</span>
							</div>
						)}

						<div className='flex gap-2'>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={() => clearVerticalItems(verticalSlug)}
							>
								Clear
							</Button>
							<Button
								type='button'
								className='flex-1 bg-amber text-white hover:opacity-90'
								onClick={handleBroadcastBundle}
							>
								Consolidate & Broadcast RFQ →
							</Button>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}

