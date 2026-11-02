'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	createCommodityIndicatorAction,
	updateCommodityPriceAction,
} from '@/app/actions/commodity.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CommodityPriceUpdater({
	indicators,
}: {
	indicators: { id: string; code: string; name: string; currency: string; unit: string }[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [indicatorId, setIndicatorId] = useState(indicators[0]?.id ?? '');
	const [newPrice, setNewPrice] = useState('');
	const [note, setNote] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await updateCommodityPriceAction({
				indicatorId,
				newPrice: Number(newPrice),
				note,
			});
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			setNewPrice('');
			setNote('');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Record Benchmark / Ex-Factory Price Point
			</h2>
			<div className='space-y-1.5'>
				<Label htmlFor='pr-ind'>Select Ticker *</Label>
				<select
					id='pr-ind'
					value={indicatorId}
					onChange={(e) => setIndicatorId(e.target.value)}
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					required
				>
					{indicators.map((ind) => (
						<option key={ind.id} value={ind.id}>
							{ind.code} — {ind.name} ({ind.currency}/{ind.unit})
						</option>
					))}
				</select>
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='pr-val'>New Benchmark Price *</Label>
					<Input
						id='pr-val'
						type='number'
						step='any'
						min='0.01'
						value={newPrice}
						onChange={(e) => setNewPrice(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='pr-note'>Analyst Note</Label>
					<Input
						id='pr-note'
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder='e.g. Lagos coil rolling mill survey'
					/>
				</div>
			</div>

			<Button type='submit' disabled={isPending}>
				{isPending ? 'Recording...' : 'Record New Price & Append Chart'}
			</Button>
		</form>
	);
}

export function CreateIndicatorForm({
	verticals,
}: {
	verticals: { id: string; name: string }[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [verticalId, setVerticalId] = useState('');
	const [code, setCode] = useState('');
	const [name, setName] = useState('');
	const [unit, setUnit] = useState('MT');
	const [currency, setCurrency] = useState('NGN');
	const [latestPrice, setLatestPrice] = useState('');
	const [sourceLabel, setSourceLabel] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await createCommodityIndicatorAction({
				verticalId,
				code,
				name,
				unit,
				currency,
				latestPrice: Number(latestPrice),
				sourceLabel,
			});
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			setCode('');
			setName('');
			setLatestPrice('');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>Create New Benchmark Ticker</h2>
			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='ni-code'>Ticker Code (A-Z_0-9) *</Label>
					<Input
						id='ni-code'
						value={code}
						onChange={(e) => setCode(e.target.value.toUpperCase())}
						placeholder='HRC_STEEL_LAGOS'
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='ni-vert'>Vertical Scope</Label>
					<select
						id='ni-vert'
						value={verticalId}
						onChange={(e) => setVerticalId(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>Global Macro / FX</option>
						{verticals.map((v) => (
							<option key={v.id} value={v.id}>
								{v.name}
							</option>
						))}
					</select>
				</div>
				<div className='space-y-1.5 sm:col-span-2'>
					<Label htmlFor='ni-name'>Display Name *</Label>
					<Input
						id='ni-name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder='Hot-Rolled Steel Coil (Lagos Wholesale)'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='ni-curr'>Currency *</Label>
					<Input
						id='ni-curr'
						value={currency}
						onChange={(e) => setCurrency(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='ni-unit'>Unit *</Label>
					<Input
						id='ni-unit'
						value={unit}
						onChange={(e) => setUnit(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='ni-price'>Initial Price *</Label>
					<Input
						id='ni-price'
						type='number'
						step='any'
						value={latestPrice}
						onChange={(e) => setLatestPrice(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='ni-src'>Source Attribution</Label>
					<Input
						id='ni-src'
						value={sourceLabel}
						onChange={(e) => setSourceLabel(e.target.value)}
						placeholder='Trndzz Lagos Market Survey'
					/>
				</div>
			</div>

			<Button type='submit' variant='secondary' disabled={isPending}>
				{isPending ? 'Creating...' : 'Create Ticker'}
			</Button>
		</form>
	);
}

