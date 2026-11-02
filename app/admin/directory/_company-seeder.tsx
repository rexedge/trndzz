'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
	BusinessRole,
	StreamPosition,
	VerificationTier,
} from '@prisma/client';
import { toast } from 'sonner';
import { seedDirectoryCompanyAction } from '@/app/actions/company.actions';
import {
	BUSINESS_ROLE_VALUES,
	STREAM_POSITION_VALUES,
} from '@/lib/validators/company.validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VerticalSeederOption {
	id: string;
	name: string;
	categories: { id: string; name: string }[];
}

export function DirectoryCompanySeeder({
	verticals,
}: {
	verticals: VerticalSeederOption[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [verticalId, setVerticalId] = useState(verticals[0]?.id ?? '');
	const activeVertical = verticals.find((v) => v.id === verticalId);

	const [categoryIds, setCategoryIds] = useState<string[]>(
		activeVertical?.categories[0] ? [activeVertical.categories[0].id] : []
	);
	const [streamPositions, setStreamPositions] = useState<StreamPosition[]>([
		StreamPosition.DOWNSTREAM,
	]);
	const [businessRoles, setBusinessRoles] = useState<BusinessRole[]>([
		BusinessRole.MANUFACTURER,
	]);
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [tagline, setTagline] = useState('');
	const [description, setDescription] = useState('');
	const [headquartersState, setHeadquartersState] = useState('Lagos');
	const [city, setCity] = useState('');
	const [coverageStatesCsv, setCoverageStatesCsv] = useState(
		'Lagos, Ogun, Abuja, Rivers'
	);
	const [productionCapacity, setProductionCapacity] = useState('');
	const [minimumOrderSummary, setMinimumOrderSummary] = useState('');
	const [publicEmail, setPublicEmail] = useState('');
	const [publicPhone, setPublicPhone] = useState('');
	const [websiteUrl, setWebsiteUrl] = useState('');
	const [rcNumber, setRcNumber] = useState('');
	const [verificationTier, setVerificationTier] = useState<VerificationTier>(
		VerificationTier.UNVERIFIED
	);

	const toggleItem = <T extends string>(
		list: T[],
		setList: (v: T[]) => void,
		val: T
	) => {
		setList(
			list.includes(val) ? list.filter((x) => x !== val) : [...list, val]
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await seedDirectoryCompanyAction({
				name,
				slug,
				verticalId,
				categoryIds,
				streamPositions,
				businessRoles,
				tagline,
				description,
				headquartersState,
				city,
				coverageStatesCsv,
				productionCapacity,
				minimumOrderSummary,
				publicEmail,
				publicPhone,
				websiteUrl,
				rcNumber,
				verificationTier,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}

			toast.success(res.message);
			setName('');
			setSlug('');
			setTagline('');
			setDescription('');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-5 rounded-2xl border border-border bg-card p-6'
		>
			<div>
				<h2 className='text-lg font-bold'>
					Pre-Seed Supplier Directory Profile (Claim & Convert Engine)
				</h2>
				<p className='text-xs text-muted-foreground'>
					Seeded companies enter the directory as `UNCLAIMED` and
					automatically accumulate matched buyer RFQ leads to drive
					vendor claim conversion.
				</p>
			</div>

			<div className='grid gap-4 sm:grid-cols-3'>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-name'>Company Legal / Trade Name *</Label>
					<Input
						id='sd-name'
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							if (!slug) {
								setSlug(
									e.target.value
										.toLowerCase()
										.replace(/[^a-z0-9]+/g, '-')
										.replace(/^-|-$/g, '')
								);
							}
						}}
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-slug'>Profile Slug *</Label>
					<Input
						id='sd-slug'
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-vert'>Primary Vertical *</Label>
					<select
						id='sd-vert'
						value={verticalId}
						onChange={(e) => {
							setVerticalId(e.target.value);
							const found = verticals.find(
								(v) => v.id === e.target.value
							);
							setCategoryIds(
								found?.categories[0]
									? [found.categories[0].id]
									: []
							);
						}}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						{verticals.map((v) => (
							<option key={v.id} value={v.id}>
								{v.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Categories, Streams, Roles */}
			<div className='space-y-3 rounded-xl border border-border bg-muted/30 p-4'>
				<div className='space-y-1.5'>
					<Label className='text-xs'>Material Categories *</Label>
					<div className='flex flex-wrap gap-2'>
						{activeVertical?.categories.map((c) => (
							<button
								key={c.id}
								type='button'
								onClick={() =>
									toggleItem(
										categoryIds,
										setCategoryIds,
										c.id
									)
								}
								className={`rounded-full border px-3 py-1 text-xs font-medium ${
									categoryIds.includes(c.id)
										? 'border-primary bg-primary/15 text-primary'
										: 'border-border bg-background text-muted-foreground'
								}`}
							>
								{c.name}
							</button>
						))}
					</div>
				</div>

				<div className='space-y-1.5'>
					<Label className='text-xs'>Value-Chain Stages *</Label>
					<div className='flex flex-wrap gap-2'>
						{STREAM_POSITION_VALUES.map((s) => (
							<button
								key={s}
								type='button'
								onClick={() =>
									toggleItem(
										streamPositions,
										setStreamPositions,
										s
									)
								}
								className={`rounded-full border px-3 py-1 text-xs font-medium ${
									streamPositions.includes(s)
										? 'border-primary bg-primary/15 text-primary'
										: 'border-border bg-background text-muted-foreground'
								}`}
							>
								{s.replace(/_/g, ' ')}
							</button>
						))}
					</div>
				</div>

				<div className='space-y-1.5'>
					<Label className='text-xs'>Business Roles *</Label>
					<div className='flex flex-wrap gap-2'>
						{BUSINESS_ROLE_VALUES.map((r) => (
							<button
								key={r}
								type='button'
								onClick={() =>
									toggleItem(
										businessRoles,
										setBusinessRoles,
										r
									)
								}
								className={`rounded-full border px-3 py-1 text-xs font-medium ${
									businessRoles.includes(r)
										? 'border-verified bg-verified/15 text-verified'
										: 'border-border bg-background text-muted-foreground'
								}`}
							>
								{r.replace(/_/g, ' ')}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className='grid gap-3 sm:grid-cols-3'>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-state'>HQ State *</Label>
					<Input
						id='sd-state'
						value={headquartersState}
						onChange={(e) => setHeadquartersState(e.target.value)}
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-city'>City</Label>
					<Input
						id='sd-city'
						value={city}
						onChange={(e) => setCity(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-cov'>Covered States (CSV) *</Label>
					<Input
						id='sd-cov'
						value={coverageStatesCsv}
						onChange={(e) => setCoverageStatesCsv(e.target.value)}
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-cap'>Production Capacity</Label>
					<Input
						id='sd-cap'
						value={productionCapacity}
						onChange={(e) => setProductionCapacity(e.target.value)}
						placeholder='e.g. 1,800 MT / Month'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-moq'>MOQ Summary</Label>
					<Input
						id='sd-moq'
						value={minimumOrderSummary}
						onChange={(e) => setMinimumOrderSummary(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-tier'>Initial Verification Tier</Label>
					<select
						id='sd-tier'
						value={verificationTier}
						onChange={(e) =>
							setVerificationTier(
								e.target.value as VerificationTier
							)
						}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						{Object.values(VerificationTier).map((vt) => (
							<option key={vt} value={vt}>
								{vt.replace(/_/g, ' ')}
							</option>
						))}
					</select>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-email'>Public Email</Label>
					<Input
						id='sd-email'
						type='email'
						value={publicEmail}
						onChange={(e) => setPublicEmail(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-phone'>Public Phone</Label>
					<Input
						id='sd-phone'
						value={publicPhone}
						onChange={(e) => setPublicPhone(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-rc'>CAC RC Number</Label>
					<Input
						id='sd-rc'
						value={rcNumber}
						onChange={(e) => setRcNumber(e.target.value)}
					/>
				</div>
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-tag'>Tagline</Label>
					<Input
						id='sd-tag'
						value={tagline}
						onChange={(e) => setTagline(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='sd-web'>Website URL</Label>
					<Input
						id='sd-web'
						type='url'
						value={websiteUrl}
						onChange={(e) => setWebsiteUrl(e.target.value)}
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='sd-desc'>Profile Description</Label>
				<Textarea
					id='sd-desc'
					rows={2}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>

			<Button type='submit' disabled={isPending}>
				{isPending ? 'Indexing...' : 'Seed Supplier into Directory'}
			</Button>
		</form>
	);
}

