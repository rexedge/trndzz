'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	createCompanyProductAction,
	updateVendorProfileAction,
} from '@/app/actions/company.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CompanyProfileEditorProps {
	company: {
		id: string;
		name: string;
		tagline: string | null;
		description: string | null;
		city: string | null;
		address: string | null;
		coverageStates: string[];
		productionCapacity: string | null;
		minimumOrderSummary: string | null;
		publicEmail: string | null;
		publicPhone: string | null;
		whatsappNumber: string | null;
		websiteUrl: string | null;
	};
}

export function VendorProfileEditor({ company }: CompanyProfileEditorProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [tagline, setTagline] = useState(company.tagline ?? '');
	const [description, setDescription] = useState(company.description ?? '');
	const [city, setCity] = useState(company.city ?? '');
	const [address, setAddress] = useState(company.address ?? '');
	const [coverageStatesCsv, setCoverageStatesCsv] = useState(
		company.coverageStates.join(', ')
	);
	const [productionCapacity, setProductionCapacity] = useState(
		company.productionCapacity ?? ''
	);
	const [minimumOrderSummary, setMinimumOrderSummary] = useState(
		company.minimumOrderSummary ?? ''
	);
	const [publicEmail, setPublicEmail] = useState(company.publicEmail ?? '');
	const [publicPhone, setPublicPhone] = useState(company.publicPhone ?? '');
	const [whatsappNumber, setWhatsappNumber] = useState(
		company.whatsappNumber ?? ''
	);
	const [websiteUrl, setWebsiteUrl] = useState(company.websiteUrl ?? '');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await updateVendorProfileAction({
				companyId: company.id,
				tagline,
				description,
				city,
				address,
				coverageStatesCsv,
				productionCapacity,
				minimumOrderSummary,
				publicEmail,
				publicPhone,
				whatsappNumber,
				websiteUrl,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Edit Verified Storefront · {company.name}
			</h2>
			<div className='space-y-1.5'>
				<Label htmlFor='vp-tagline'>Commercial Tagline</Label>
				<Input
					id='vp-tagline'
					value={tagline}
					onChange={(e) => setTagline(e.target.value)}
				/>
			</div>
			<div className='space-y-1.5'>
				<Label htmlFor='vp-desc'>Plant & Capability Overview</Label>
				<Textarea
					id='vp-desc'
					rows={3}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>
			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-cap'>Installed Production Capacity</Label>
					<Input
						id='vp-cap'
						value={productionCapacity}
						onChange={(e) => setProductionCapacity(e.target.value)}
						placeholder='e.g. 2,500 MT / Month'
						className='font-tabular'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-moq'>Minimum Order Summary</Label>
					<Input
						id='vp-moq'
						value={minimumOrderSummary}
						onChange={(e) => setMinimumOrderSummary(e.target.value)}
						placeholder='e.g. 5 MT Coils'
						className='font-tabular'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-city'>Plant / Warehouse City</Label>
					<Input
						id='vp-city'
						value={city}
						onChange={(e) => setCity(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-states'>
						Covered Delivery States (comma-separated) *
					</Label>
					<Input
						id='vp-states'
						value={coverageStatesCsv}
						onChange={(e) => setCoverageStatesCsv(e.target.value)}
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-email'>Sales Desk Email</Label>
					<Input
						id='vp-email'
						type='email'
						value={publicEmail}
						onChange={(e) => setPublicEmail(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-phone'>Sales Phone</Label>
					<Input
						id='vp-phone'
						value={publicPhone}
						onChange={(e) => setPublicPhone(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-wa'>WhatsApp Trade Line</Label>
					<Input
						id='vp-wa'
						value={whatsappNumber}
						onChange={(e) => setWhatsappNumber(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='vp-web'>Corporate Website URL</Label>
					<Input
						id='vp-web'
						type='url'
						value={websiteUrl}
						onChange={(e) => setWebsiteUrl(e.target.value)}
					/>
				</div>
			</div>
			<div className='space-y-1.5'>
				<Label htmlFor='vp-addr'>Industrial Address</Label>
				<Input
					id='vp-addr'
					value={address}
					onChange={(e) => setAddress(e.target.value)}
				/>
			</div>
			<Button type='submit' disabled={isPending}>
				{isPending ? 'Saving Storefront...' : 'Save Company Profile'}
			</Button>
		</form>
	);
}

interface ProductPublisherProps {
	companyId: string;
	verticalId: string;
	categories: { id: string; name: string; defaultUnit: string }[];
	specDefinitions: {
		id: string;
		categoryId: string | null;
		key: string;
		label: string;
		unit: string | null;
		inputType: string;
		options: string[];
	}[];
}

export function VendorProductPublisher({
	companyId,
	verticalId,
	categories,
	specDefinitions,
}: ProductPublisherProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [unit, setUnit] = useState(categories[0]?.defaultUnit ?? 'MT');
	const [minOrderQty, setMinOrderQty] = useState('');
	const [indicativeMin, setIndicativeMin] = useState('');
	const [indicativeMax, setIndicativeMax] = useState('');
	const [specs, setSpecs] = useState<Record<string, string>>({});

	const activeSpecs = specDefinitions.filter(
		(d) => d.categoryId === categoryId || d.categoryId === null
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await createCompanyProductAction({
				companyId,
				verticalId,
				categoryId,
				name,
				description,
				unit,
				minOrderQty: minOrderQty ? Number(minOrderQty) : undefined,
				indicativeMin: indicativeMin
					? Number(indicativeMin)
					: undefined,
				indicativeMax: indicativeMax
					? Number(indicativeMax)
					: undefined,
				currency: 'NGN',
				specifications: specs,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			setName('');
			setDescription('');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Publish Technical Catalog Product (SKU)
			</h2>
			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='sku-cat'>Category *</Label>
					<select
						id='sku-cat'
						value={categoryId}
						onChange={(e) => {
							setCategoryId(e.target.value);
							const found = categories.find(
								(c) => c.id === e.target.value
							);
							if (found) setUnit(found.defaultUnit);
						}}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
						required
					>
						{categories.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sku-name'>SKU Title *</Label>
					<Input
						id='sku-name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder='e.g. AA3003 H14 Stucco Roofing Coil (0.55mm)'
						required
					/>
				</div>
			</div>

			{activeSpecs.length > 0 && (
				<div className='grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2'>
					{activeSpecs.map((def) => (
						<div key={def.id} className='space-y-1'>
							<Label
								htmlFor={`sku-spec-${def.key}`}
								className='text-xs'
							>
								{def.label}
								{def.unit ? ` (${def.unit})` : ''}
							</Label>
							{def.inputType === 'SELECT' &&
							def.options.length > 0 ? (
								<select
									id={`sku-spec-${def.key}`}
									value={specs[def.key] ?? ''}
									onChange={(e) =>
										setSpecs((p) => ({
											...p,
											[def.key]: e.target.value,
										}))
									}
									className='flex h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-mono'
								>
									<option value=''>Select...</option>
									{def.options.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
							) : (
								<Input
									id={`sku-spec-${def.key}`}
									value={specs[def.key] ?? ''}
									onChange={(e) =>
										setSpecs((p) => ({
											...p,
											[def.key]: e.target.value,
										}))
									}
									className='h-9 text-xs font-mono'
								/>
							)}
						</div>
					))}
				</div>
			)}

			<div className='grid gap-3 sm:grid-cols-4'>
				<div className='space-y-1.5'>
					<Label htmlFor='sku-unit'>Unit *</Label>
					<Input
						id='sku-unit'
						value={unit}
						onChange={(e) => setUnit(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sku-moq'>MOQ</Label>
					<Input
						id='sku-moq'
						type='number'
						step='any'
						value={minOrderQty}
						onChange={(e) => setMinOrderQty(e.target.value)}
						className='font-tabular'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sku-min'>Min Price (₦)</Label>
					<Input
						id='sku-min'
						type='number'
						step='any'
						value={indicativeMin}
						onChange={(e) => setIndicativeMin(e.target.value)}
						className='font-tabular'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sku-max'>Max Price (₦)</Label>
					<Input
						id='sku-max'
						type='number'
						step='any'
						value={indicativeMax}
						onChange={(e) => setIndicativeMax(e.target.value)}
						className='font-tabular'
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='sku-desc'>Technical Description</Label>
				<Textarea
					id='sku-desc'
					rows={2}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>

			<Button
				type='submit'
				disabled={isPending}
				className='bg-amber text-white hover:opacity-90'
			>
				{isPending ? 'Publishing SKU...' : 'Publish Catalog SKU'}
			</Button>
		</form>
	);
}

