'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Sparkles } from 'lucide-react';
import { RfqVisibility } from '@prisma/client';
import { toast } from 'sonner';
import { createRfqAction } from '@/app/actions/rfq.actions';
import { trackB2BEvent } from '@/lib/posthog/events';
import { useRfqDraftStore } from '@/store/useRfqDraftStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

export interface SerializedSpecDefinition {
	id: string;
	key: string;
	label: string;
	unit: string | null;
	inputType: string;
	options: string[];
	isRequired: boolean;
}

interface ContextualRfqDrawerProps {
	verticalId: string;
	verticalSlug: string;
	categoryId: string;
	categoryName: string;
	defaultUnit: string;
	specDefinitions: SerializedSpecDefinition[];
	sourceArticleId?: string;
	sourceArticleTitle?: string;
	targetCompanyId?: string;
	targetCompanyName?: string;
	initialUser?: {
		name: string;
		email: string;
		phone?: string | null;
		companyName?: string | null;
	} | null;
	loginUrl: string;
	triggerLabel?: string;
	triggerVariant?: 'default' | 'secondary' | 'outline';
}

export function ContextualRfqDrawer({
	verticalId,
	verticalSlug,
	categoryId,
	categoryName,
	defaultUnit,
	specDefinitions,
	sourceArticleId,
	sourceArticleTitle,
	targetCompanyId,
	targetCompanyName,
	initialUser,
	loginUrl,
	triggerLabel = '1-Click Contextual RFQ',
	triggerVariant = 'default',
}: ContextualRfqDrawerProps) {
	const router = useRouter();
	const setPrefill = useRfqDraftStore((s) => s.setPrefill);
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	const [title, setTitle] = useState(
		targetCompanyName
			? `${categoryName} Quote Request — ${targetCompanyName}`
			: `Sourcing ${categoryName} (SON Compliant)`
	);
	const [buyerCompanyName, setBuyerCompanyName] = useState(
		initialUser?.companyName ?? ''
	);
	const [buyerContactName, setBuyerContactName] = useState(
		initialUser?.name ?? ''
	);
	const [buyerContactEmail, setBuyerContactEmail] = useState(
		initialUser?.email ?? ''
	);
	const [buyerContactPhone, setBuyerContactPhone] = useState(
		initialUser?.phone ?? ''
	);
	const [quantity, setQuantity] = useState('20');
	const [unit, setUnit] = useState(defaultUnit || 'MT');
	const [deliveryState, setDeliveryState] = useState('Lagos');
	const [allowPeerQuotes, setAllowPeerQuotes] = useState(true);
	const [additionalNotes, setAdditionalNotes] = useState('');
	const [specs, setSpecs] = useState<Record<string, string>>(() => {
		const defaults: Record<string, string> = {};
		for (const def of specDefinitions) {
			if (def.inputType === 'SELECT' && def.options[0]) {
				defaults[def.key] = def.options[0];
			} else {
				defaults[def.key] = '';
			}
		}
		return defaults;
	});

	const handleSpecChange = (key: string, value: string) => {
		setSpecs((prev) => ({ ...prev, [key]: value }));
	};

	const handleSaveDraftAndSignIn = () => {
		setPrefill({
			verticalSlug,
			categoryId,
			categoryName,
			sourceArticleId: sourceArticleId ?? null,
			sourceArticleTitle: sourceArticleTitle ?? null,
			targetCompanyId: targetCompanyId ?? null,
			targetCompanyName: targetCompanyName ?? null,
			specifications: specs,
		});
		window.location.href = loginUrl;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!initialUser) {
			handleSaveDraftAndSignIn();
			return;
		}

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
				currency: 'NGN',
				deliveryState,
				visibility: RfqVisibility.PUBLIC_BOARD,
				preferredRoles: [],
				specifications: specs,
				additionalNotes,
				sourceArticleId: sourceArticleId ?? '',
				targetCompanyId: targetCompanyId ?? '',
				allowPeerQuotes,
			});

			if (!res.success) {
				const firstFieldErr = res.errors
					? Object.values(res.errors)[0]?.[0]
					: undefined;
				toast.error(firstFieldErr || res.message);
				return;
			}

			toast.success(res.message);
			setOpen(false);
			if (res.data?.referenceNumber) {
				trackB2BEvent('rfq_broadcast_submitted', {
					verticalSlug,
					categoryId,
					referenceNumber: res.data.referenceNumber,
					fromArticle: Boolean(sourceArticleId),
					fromTargetCompany: Boolean(targetCompanyId),
				});
				router.push(`/rfq/${res.data.referenceNumber}`);
				router.refresh();
			}
		});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (nextOpen) {
			trackB2BEvent('pulse_contextual_rfq_opened', {
				verticalSlug,
				categoryId,
				sourceArticleId: sourceArticleId ?? null,
				targetCompanyId: targetCompanyId ?? null,
			});
		}
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<Button
					size='sm'
					variant={triggerVariant}
					className={
						triggerVariant === 'default'
							? 'bg-amber text-white hover:opacity-90 gap-1.5'
							: 'gap-1.5'
					}
				>
					<FileSpreadsheet className='h-4 w-4' />
					<span>{triggerLabel}</span>
				</Button>
			</SheetTrigger>

			<SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
				<SheetHeader className='border-b border-border pb-4'>
					<div className='flex items-center gap-1.5 text-xs font-semibold text-amber'>
						<Sparkles className='h-3.5 w-3.5' />
						<span>CONTEXTUAL TRADE ENGINE</span>
					</div>
					<SheetTitle className='text-left text-lg'>
						Broadcast {categoryName} RFQ
					</SheetTitle>
					<SheetDescription className='text-left text-xs'>
						{targetCompanyName
							? `Targeting ${targetCompanyName} with optional competitive peer matching.`
							: sourceArticleTitle
								? `Pre-linked from "${sourceArticleTitle}" to verified ${categoryName} suppliers.`
								: `Broadcast structured technical specifications to vetted ${categoryName} vendors.`}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className='space-y-4 px-4 py-5'>
					<div className='space-y-1.5'>
						<Label htmlFor='ctx-title'>Procurement Headline</Label>
						<Input
							id='ctx-title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					{specDefinitions.length > 0 && (
						<div className='space-y-3 rounded-xl border border-border bg-muted/30 p-3.5'>
							<p className='font-tabular text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
								Technical Specifications · {categoryName}
							</p>
							<div className='grid gap-3 sm:grid-cols-2'>
								{specDefinitions.map((def) => (
									<div key={def.id} className='space-y-1'>
										<Label
											htmlFor={`ctx-spec-${def.key}`}
											className='text-xs'
										>
											{def.label}
											{def.unit ? ` (${def.unit})` : ''}
											{def.isRequired ? ' *' : ''}
										</Label>
										{def.inputType === 'SELECT' &&
										def.options.length > 0 ? (
											<select
												id={`ctx-spec-${def.key}`}
												value={specs[def.key] ?? ''}
												onChange={(e) =>
													handleSpecChange(
														def.key,
														e.target.value
													)
												}
												className='flex h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-mono'
											>
												{!def.isRequired && (
													<option value=''>Any</option>
												)}
												{def.options.map((opt) => (
													<option key={opt} value={opt}>
														{opt}
													</option>
												))}
											</select>
										) : (
											<Input
												id={`ctx-spec-${def.key}`}
												type={
													def.inputType === 'NUMBER'
														? 'number'
														: 'text'
												}
												step='any'
												value={specs[def.key] ?? ''}
												onChange={(e) =>
													handleSpecChange(
														def.key,
														e.target.value
													)
												}
												placeholder={
													def.unit
														? `e.g. ${def.unit}`
														: 'Specify'
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

					<div className='grid grid-cols-3 gap-3'>
						<div className='space-y-1.5'>
							<Label htmlFor='ctx-qty'>Quantity</Label>
							<Input
								id='ctx-qty'
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
							<Label htmlFor='ctx-unit'>Unit</Label>
							<Input
								id='ctx-unit'
								value={unit}
								onChange={(e) => setUnit(e.target.value)}
								className='font-tabular'
								required
							/>
						</div>
						<div className='space-y-1.5'>
							<Label htmlFor='ctx-state'>Delivery State</Label>
							<Input
								id='ctx-state'
								value={deliveryState}
								onChange={(e) => setDeliveryState(e.target.value)}
								required
							/>
						</div>
					</div>

					{initialUser ? (
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='space-y-1.5'>
								<Label htmlFor='ctx-company'>
									Buyer Company
								</Label>
								<Input
									id='ctx-company'
									value={buyerCompanyName}
									onChange={(e) =>
										setBuyerCompanyName(e.target.value)
									}
									placeholder='e.g. Eko Atlantic EPC Ltd'
									required
								/>
							</div>
							<div className='space-y-1.5'>
								<Label htmlFor='ctx-phone'>
									Phone / WhatsApp
								</Label>
								<Input
									id='ctx-phone'
									value={buyerContactPhone}
									onChange={(e) =>
										setBuyerContactPhone(e.target.value)
									}
									placeholder='+234 803 000 0000'
									required
								/>
							</div>
							<div className='space-y-1.5'>
								<Label htmlFor='ctx-contact'>Contact Name</Label>
								<Input
									id='ctx-contact'
									value={buyerContactName}
									onChange={(e) =>
										setBuyerContactName(e.target.value)
									}
									required
								/>
							</div>
							<div className='space-y-1.5'>
								<Label htmlFor='ctx-email'>Work Email</Label>
								<Input
									id='ctx-email'
									type='email'
									value={buyerContactEmail}
									onChange={(e) =>
										setBuyerContactEmail(e.target.value)
									}
									required
								/>
							</div>
						</div>
					) : (
						<div className='rounded-lg border border-amber/40 bg-amber/10 p-3 text-xs text-muted-foreground'>
							Sign in with your B2B buyer account to broadcast this
							RFQ immediately. Your technical specs will be
							preserved.
						</div>
					)}

					{targetCompanyName && (
						<label className='flex items-center gap-2 text-xs text-muted-foreground'>
							<input
								type='checkbox'
								checked={allowPeerQuotes}
								onChange={(e) =>
									setAllowPeerQuotes(e.target.checked)
								}
								className='rounded border-border'
							/>
							<span>
								Also invite comparable quotes from other verified{' '}
								{categoryName} suppliers
							</span>
						</label>
					)}

					<div className='space-y-1.5'>
						<Label htmlFor='ctx-notes'>
							Delivery & Inspection Notes (Optional)
						</Label>
						<Textarea
							id='ctx-notes'
							rows={2}
							value={additionalNotes}
							onChange={(e) => setAdditionalNotes(e.target.value)}
							placeholder='Mill test certificate (MTC) required, delivery timeline, offloading terms...'
						/>
					</div>

					<Button
						type='submit'
						disabled={isPending}
						className='w-full bg-amber text-white hover:opacity-90'
					>
						{!initialUser
							? 'Save Specs & Sign In to Broadcast →'
							: isPending
								? 'Broadcasting to Verified Suppliers...'
								: 'Broadcast Structured RFQ (₦)'}
					</Button>
				</form>
			</SheetContent>
		</Sheet>
	);
}

