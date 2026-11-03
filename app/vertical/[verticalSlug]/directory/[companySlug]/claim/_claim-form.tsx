'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitCompanyClaimAction } from '@/app/actions/claim.actions';
import { trackB2BEvent } from '@/lib/posthog/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ClaimFormProps {
	companyId: string;
	companyName: string;
	defaultEmail: string;
	defaultPhone?: string | null;
	defaultJobTitle?: string | null;
	claimsDashboardUrl: string;
}

export function ClaimCompanyForm({
	companyId,
	companyName,
	defaultEmail,
	defaultPhone,
	defaultJobTitle,
	claimsDashboardUrl,
}: ClaimFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [workEmail, setWorkEmail] = useState(defaultEmail);
	const [phone, setPhone] = useState(defaultPhone ?? '');
	const [jobTitle, setJobTitle] = useState(defaultJobTitle ?? '');
	const [rcNumber, setRcNumber] = useState('');
	const [proofDocumentUrl, setProofDocumentUrl] = useState('');
	const [message, setMessage] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await submitCompanyClaimAction({
				companyId,
				workEmail,
				phone,
				jobTitle,
				rcNumber,
				proofDocumentUrl,
				message,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}

			trackB2BEvent('company_claim_submitted', {
				companyId,
				companyName,
			});
			toast.success(res.message);
			window.location.href = claimsDashboardUrl;
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8'
		>
			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='claim-email'>Official Work Email *</Label>
					<Input
						id='claim-email'
						type='email'
						value={workEmail}
						onChange={(e) => setWorkEmail(e.target.value)}
						placeholder='sales@company.ng'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='claim-phone'>
						Direct Phone / WhatsApp *
					</Label>
					<Input
						id='claim-phone'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder='+234 803 000 0000'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='claim-role'>
						Executive / Commercial Title *
					</Label>
					<Input
						id='claim-role'
						value={jobTitle}
						onChange={(e) => setJobTitle(e.target.value)}
						placeholder='e.g. Head of Commercial Sales'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='claim-rc'>
						CAC Registration Number (RC / BN) *
					</Label>
					<Input
						id='claim-rc'
						value={rcNumber}
						onChange={(e) => setRcNumber(e.target.value)}
						placeholder='e.g. RC-451092'
						className='font-tabular'
						required
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='claim-proof'>
					CAC Certificate / SONCAP Proof Link (Optional)
				</Label>
				<Input
					id='claim-proof'
					type='url'
					value={proofDocumentUrl}
					onChange={(e) => setProofDocumentUrl(e.target.value)}
					placeholder='https://drive.google.com/...'
				/>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='claim-msg'>Authorization & Plant Summary *</Label>
				<Textarea
					id='claim-msg'
					rows={4}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder={`Confirm your authorization to manage ${companyName}'s verified B2B profile and receive buyer RFQ notifications...`}
					required
				/>
			</div>

			<Button
				type='submit'
				disabled={isPending}
				className='w-full bg-amber text-white hover:opacity-90'
			>
				{isPending
					? 'Submitting Verification Dossier...'
					: `Submit Official Claim for ${companyName}`}
			</Button>
		</form>
	);
}

