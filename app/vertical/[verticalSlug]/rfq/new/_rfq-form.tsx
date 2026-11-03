'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessRole, RfqVisibility } from '@prisma/client';
import { toast } from 'sonner';
import { createRfqAction } from '@/app/actions/rfq.actions';
import { trackB2BEvent } from '@/lib/posthog/events';
import { BUSINESS_ROLE_VALUES } from '@/lib/validators/company.validator';
import { useRfqDraftStore } from '@/store/useRfqDraftStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CategoryItem {
	id: string;
	name: string;
	slug: string;
	defaultUnit: string;
}

interface SpecDefItem {
	id: string;
	categoryId: string | null;
	key: string;
	label: string;
	unit: string | null;
	inputType: string;
	options: string[];
	isRequired: boolean;
}

interface RfqBroadcastFormProps {
	verticalId: string;
	verticalName: string;
	categories: CategoryItem[];
	specDefinitions: SpecDefItem[];
	initialCategorySlug?: string;
	user: {
		name: string;
		email: string;
		phone?: string | null;
		companyName?: string | null;
	};
}

export function RfqBroadcastForm({
	verticalId,
	verticalName,
	categories,
	specDefinitions,
	initialCategorySlug,
	user,
}: RfqBroadcastFormProps) {
	const router = useRouter();
	const { draft, resetDraft } = useRfqDraftStore();
	const [isPending, startTransition] = useTransition();

	const initialCat =
		categories.find((c) => c.slug === initialCategorySlug) ??
		categories.find((c) => c.id === draft.categoryId) ??
		categories[0];

	const [categoryId, setCategoryId] = useState(initialCat?.id ?? '');
	const [title, setTitle] = useState(draft.title ?? '');
	const [buyerCompanyName, setBuyerCompanyName] = useState(
		user.companyName ?? ''
	);
	const [buyerContactName, setBuyerContactName] = useState(user.name);
	const [buyerContactEmail, setBuyerContactEmail] = useState(user.email);
	const [buyerContactPhone, setBuyerContactPhone] = useState(
		user.phone ?? ''
	);
	const [quantity, setQuantity] = useState(draft.quantity ?? '25');
	const [unit, setUnit] = useState(
		draft.unit ?? initialCat?.defaultUnit ?? 'MT'
	);
	const [targetUnitPrice, setTargetUnitPrice] = useState('');
	const [deliveryState, setDeliveryState] = useState('Lagos');
	const [deliveryCity, setDeliveryCity] = useState('');
	const [requiredByDate, setRequiredByDate] = useState('');
	const [paymentTermsPreference, setPaymentTermsPreference] = useState(
		'50% Advance against Proforma Invoice, 50% prior to dispatch'
	);
	const [visibility, setVisibility] = useState<RfqVisibility>(
		RfqVisibility.PUBLIC_BOARD
	);
	const [preferredRoles, setPreferredRoles] = useState<BusinessRole[]>([
		BusinessRole.MANUFACTURER,
		BusinessRole.IMPORTER,
	]);
	const [additionalNotes, setAdditionalNotes] = useState(
		draft.additionalNotes ?? ''
	);
	const [specs, setSpecs] = useState<Record<string, string>>(
		draft.specifications
	);

	const activeSpecs = specDefinitions.filter(
		(d) => d.categoryId === categoryId || d.categoryId === null
	);

	const handleCategoryChange = (nextCatId: string) => {
		setCategoryId(nextCatId);
		const found = categories.find((c) => c.id === nextCatId);
		if (found) setUnit(found.defaultUnit);
	};

	const toggleRole = (role: BusinessRole) => {
		setPreferredRoles((prev) =>
			prev.includes(role)
				? prev.filter((r) => r !== role)
				: [...prev, role]
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await createRfqAction({
				verticalId,
				categoryId,
				title,
				buyerCompanyName,
				buyerContactName,
				buyerContactEmail,
				buyerContactPhone,
				quantity: Number(quantity),
				unit,
				targetUnitPrice: targetUnitPrice
					? Number(targetUnitPrice)
					: undefined,
				currency: 'NGN',
				deliveryState,
				deliveryCity,
				requiredByDate,
				paymentTermsPreference,
				additionalNotes,
				visibility,
				preferredRoles,
				specifications: specs,
				sourceArticleId: draft.sourceArticleId ?? '',
				targetCompanyId: draft.targetCompanyId ?? '',
				allowPeerQuotes: true,
			});

			if (!res.success) {
				const firstFieldErr = res.errors
					? Object.values(res.errors)[0]?.[0]
					: undefined;
				toast.error(firstFieldErr || res.message);
				return;
			}

			const hadArticle = Boolean(draft.sourceArticleId);
			const hadTarget = Boolean(draft.targetCompanyId);
			resetDraft();
			toast.success(res.message);
			if (res.data?.referenceNumber) {
				trackB2BEvent('rfq_broadcast_submitted', {
					categoryId,
					referenceNumber: res.data.referenceNumber,
					fromArticle: hadArticle,
					fromTargetCompany: hadTarget,
				});
				router.push(`/rfq/${res.data.referenceNumber}`);
				router.refresh();
			}
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8'
		>
			{/* Section 1: Category & Headline */}
			<div className='space-y-4'>
				<h2 className='text-lg font-bold'>
					1. Material Category & Sourcing Scope
				</h2>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-cat'>
							{verticalName} Material Category *
						</Label>
						<select
							id='rfq-cat'
							value={categoryId}
							onChange={(e) =>
								handleCategoryChange(e.target.value)
							}
							className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
							required
						>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					</div>

					<div className='space-y-1.5'>
						<Label htmlFor='rfq-vis'>Broadcast Visibility</Label>
						<select
							id='rfq-vis'
							value={visibility}
							onChange={(e) =>
								setVisibility(e.target.value as RfqVisibility)
							}
							className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
						>
							<option value={RfqVisibility.PUBLIC_BOARD}>
								Public Tender Board + Automated Matching
							</option>
							<option value={RfqVisibility.VERIFIED_VENDORS_ONLY}>
								SON / CAC Verified Vendors Only
							</option>
						</select>
					</div>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='rfq-title'>
						Specification Headline * (min 10 chars)
					</Label>
					<Input
						id='rfq-title'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder='e.g. 40 MT AA3003 H14 Stucco-Embossed Aluminium Roofing Coils (0.55mm Gauge)'
						required
					/>
				</div>
			</div>

			{/* Section 2: Dynamic SpecAttributeDefinition Schema */}
			{activeSpecs.length > 0 && (
				<div className='space-y-4 rounded-xl border border-border bg-muted/30 p-5'>
					<div>
						<h2 className='text-base font-bold'>
							2. Strict Technical Parameters
						</h2>
						<p className='text-xs text-muted-foreground'>
							Suppliers quote against these exact industrial
							parameters for apples-to-apples comparison.
						</p>
					</div>

					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{activeSpecs.map((def) => (
							<div key={def.id} className='space-y-1.5'>
								<Label
									htmlFor={`rfq-spec-${def.key}`}
									className='text-xs'
								>
									{def.label}
									{def.unit ? ` (${def.unit})` : ''}
									{def.isRequired ? ' *' : ''}
								</Label>
								{def.inputType === 'SELECT' &&
								def.options.length > 0 ? (
									<select
										id={`rfq-spec-${def.key}`}
										value={specs[def.key] ?? ''}
										onChange={(e) =>
											setSpecs((prev) => ({
												...prev,
												[def.key]: e.target.value,
											}))
										}
										required={def.isRequired}
										className='flex h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-mono'
									>
										<option value=''>
											{def.isRequired
												? 'Select option...'
												: 'Any / Flexible'}
										</option>
										{def.options.map((opt) => (
											<option key={opt} value={opt}>
												{opt}
											</option>
										))}
									</select>
								) : (
									<Input
										id={`rfq-spec-${def.key}`}
										type={
											def.inputType === 'NUMBER'
												? 'number'
												: 'text'
										}
										step='any'
										value={specs[def.key] ?? ''}
										onChange={(e) =>
											setSpecs((prev) => ({
												...prev,
												[def.key]: e.target.value,
											}))
										}
										required={def.isRequired}
										className='h-9 text-xs font-mono'
									/>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Section 3: Commercial Volume, Delivery & Roles */}
			<div className='space-y-4'>
				<h2 className='text-lg font-bold'>
					3. Volume, Target Pricing (₦) & Logistics
				</h2>
				<div className='grid gap-4 sm:grid-cols-3'>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-qty'>Required Quantity *</Label>
						<Input
							id='rfq-qty'
							type='number'
							step='any'
							min='0.01'
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							className='font-tabular'
							required
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-unit'>Unit *</Label>
						<Input
							id='rfq-unit'
							value={unit}
							onChange={(e) => setUnit(e.target.value)}
							className='font-tabular'
							required
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-target'>
							Target Unit Price (₦, Optional)
						</Label>
						<Input
							id='rfq-target'
							type='number'
							step='any'
							value={targetUnitPrice}
							onChange={(e) => setTargetUnitPrice(e.target.value)}
							placeholder='e.g. 4750000'
							className='font-tabular'
						/>
					</div>
				</div>

				<div className='grid gap-4 sm:grid-cols-3'>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-state'>Delivery State *</Label>
						<Input
							id='rfq-state'
							value={deliveryState}
							onChange={(e) => setDeliveryState(e.target.value)}
							placeholder='Lagos'
							required
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-city'>
							Site / Industrial Estate
						</Label>
						<Input
							id='rfq-city'
							value={deliveryCity}
							onChange={(e) => setDeliveryCity(e.target.value)}
							placeholder='e.g. Agbara / Lekki Free Zone'
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-date'>Required Delivery Date</Label>
						<Input
							id='rfq-date'
							type='date'
							value={requiredByDate}
							onChange={(e) => setRequiredByDate(e.target.value)}
						/>
					</div>
				</div>

				<div className='space-y-2'>
					<Label>Preferred Supplier Business Roles</Label>
					<div className='flex flex-wrap gap-2'>
						{BUSINESS_ROLE_VALUES.map((role) => {
							const active = preferredRoles.includes(role);
							return (
								<button
									key={role}
									type='button'
									onClick={() => toggleRole(role)}
									className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
										active
											? 'border-amber bg-amber/15 text-amber'
											: 'border-border bg-background text-muted-foreground hover:text-foreground'
									}`}
								>
									{role.replace(/_/g, ' ')}
								</button>
							);
						})}
					</div>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='rfq-terms'>
						Preferred Commercial Payment Terms
					</Label>
					<Input
						id='rfq-terms'
						value={paymentTermsPreference}
						onChange={(e) =>
							setPaymentTermsPreference(e.target.value)
						}
					/>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='rfq-notes'>
						Quality Inspection, Packaging & Offloading Notes
					</Label>
					<Textarea
						id='rfq-notes'
						rows={3}
						value={additionalNotes}
						onChange={(e) => setAdditionalNotes(e.target.value)}
						placeholder='SONCAP / Mill Test Certificate (MTC) requirements, coil ID/OD limits, crane offloading...'
					/>
				</div>
			</div>

			{/* Section 4: Buyer Contact Credentials */}
			<div className='space-y-4 border-t border-border pt-6'>
				<h2 className='text-lg font-bold'>
					4. Buyer Organization & Procurement Contact
				</h2>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-buyer-co'>
							Buyer Company Name *
						</Label>
						<Input
							id='rfq-buyer-co'
							value={buyerCompanyName}
							onChange={(e) =>
								setBuyerCompanyName(e.target.value)
							}
							placeholder='e.g. PrimeCrest EPC Contractors Ltd'
							required
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-buyer-name'>
							Procurement Officer Name *
						</Label>
						<Input
							id='rfq-buyer-name'
							value={buyerContactName}
							onChange={(e) =>
								setBuyerContactName(e.target.value)
							}
							required
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-buyer-email'>
							Corporate Email *
						</Label>
						<Input
							id='rfq-buyer-email'
							type='email'
							value={buyerContactEmail}
							onChange={(e) =>
								setBuyerContactEmail(e.target.value)
							}
							required
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='rfq-buyer-phone'>
							Direct Phone / WhatsApp *
						</Label>
						<Input
							id='rfq-buyer-phone'
							value={buyerContactPhone}
							onChange={(e) =>
								setBuyerContactPhone(e.target.value)
							}
							placeholder='+234 803 000 0000'
							required
						/>
					</div>
				</div>
			</div>

			<Button
				type='submit'
				size='lg'
				disabled={isPending}
				className='w-full bg-amber text-white hover:opacity-90'
			>
				{isPending
					? 'Matching & Broadcasting RFQ...'
					: `Broadcast Structured ${verticalName} RFQ`}
			</Button>
		</form>
	);
}

