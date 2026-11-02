'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitRfqQuoteAction } from '@/app/actions/rfq.actions';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SupplierCompanyOption {
	id: string;
	name: string;
	verificationTier: string;
}

interface SupplierQuoteFormProps {
	rfqId: string;
	rfqQuantity: number;
	rfqUnit: string;
	companies: SupplierCompanyOption[];
	quotesDashboardUrl: string;
}

export function SupplierQuoteForm({
	rfqId,
	rfqQuantity,
	rfqUnit,
	companies,
	quotesDashboardUrl,
}: SupplierQuoteFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [companyId, setCompanyId] = useState(companies[0]?.id ?? '');
	const [unitPrice, setUnitPrice] = useState('');
	const [minimumOrderQty, setMinimumOrderQty] = useState('');
	const [leadTimeDays, setLeadTimeDays] = useState('7');
	const [validUntilDays, setValidUntilDays] = useState('14');
	const [paymentTerms, setPaymentTerms] = useState(
		'50% Advance against Proforma Invoice, 50% balance before dispatch'
	);
	const [complianceNotes, setComplianceNotes] = useState('');

	const computedTotal =
		unitPrice && Number(unitPrice) > 0
			? Number(unitPrice) * rfqQuantity
			: 0;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await submitRfqQuoteAction({
				rfqId,
				companyId,
				unitPrice: Number(unitPrice),
				currency: 'NGN',
				minimumOrderQty: minimumOrderQty
					? Number(minimumOrderQty)
					: undefined,
				leadTimeDays: Number(leadTimeDays),
				validUntilDays: Number(validUntilDays),
				paymentTerms,
				complianceNotes,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}

			toast.success(res.message);
			window.location.href = quotesDashboardUrl;
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Submit Commercial Supplier Quote
			</h2>

			<div className='space-y-1.5'>
				<Label htmlFor='quote-co'>Quoting Supplier Entity *</Label>
				<select
					id='quote-co'
					value={companyId}
					onChange={(e) => setCompanyId(e.target.value)}
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					required
				>
					{companies.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name} ({c.verificationTier.replace(/_/g, ' ')})
						</option>
					))}
				</select>
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='quote-price'>
						Unit Price (₦ per {rfqUnit}) *
					</Label>
					<Input
						id='quote-price'
						type='number'
						step='any'
						min='1'
						value={unitPrice}
						onChange={(e) => setUnitPrice(e.target.value)}
						placeholder='e.g. 4820000'
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='quote-moq'>
						Supplier MOQ ({rfqUnit}, Optional)
					</Label>
					<Input
						id='quote-moq'
						type='number'
						step='any'
						value={minimumOrderQty}
						onChange={(e) => setMinimumOrderQty(e.target.value)}
						className='font-tabular'
					/>
				</div>
			</div>

			{computedTotal > 0 && (
				<div className='rounded-lg border border-verified/30 bg-verified/10 px-3.5 py-2.5 text-xs'>
					<span className='text-muted-foreground'>
						Calculated Total Contract Value ({rfqQuantity} {rfqUnit}
						):{' '}
					</span>
					<strong className='font-tabular text-sm text-verified'>
						{formatCurrency(computedTotal, 'NGN')}
					</strong>
				</div>
			)}

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='quote-lead'>
						Delivery Lead Time (Days) *
					</Label>
					<Input
						id='quote-lead'
						type='number'
						min='1'
						max='365'
						value={leadTimeDays}
						onChange={(e) => setLeadTimeDays(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='quote-valid'>
						Quote Validity (Days) *
					</Label>
					<Input
						id='quote-valid'
						type='number'
						min='1'
						max='180'
						value={validUntilDays}
						onChange={(e) => setValidUntilDays(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='quote-terms'>Payment Terms *</Label>
				<Input
					id='quote-terms'
					value={paymentTerms}
					onChange={(e) => setPaymentTerms(e.target.value)}
					required
				/>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='quote-compliance'>
					Mill Test Certificate (MTC) & Specification Compliance Notes
				</Label>
				<Textarea
					id='quote-compliance'
					rows={3}
					value={complianceNotes}
					onChange={(e) => setComplianceNotes(e.target.value)}
					placeholder='Confirm alloy temper compliance, SONCAP certificate ref, ex-factory or delivered terms...'
				/>
			</div>

			<Button
				type='submit'
				disabled={isPending}
				className='w-full bg-amber text-white hover:opacity-90'
			>
				{isPending
					? 'Submitting Formal Quote...'
					: 'Submit Binding Quote (₦)'}
			</Button>
		</form>
	);
}

