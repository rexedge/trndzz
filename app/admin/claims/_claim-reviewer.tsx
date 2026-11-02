'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ClaimRequestStatus, VerificationTier } from '@prisma/client';
import { toast } from 'sonner';
import { reviewCompanyClaimAction } from '@/app/actions/claim.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ClaimReviewControls({
	claimRequestId,
}: {
	claimRequestId: string;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [tier, setTier] = useState<VerificationTier>(
		VerificationTier.VERIFIED
	);
	const [note, setNote] = useState('');

	const handleDecision = (
		decision:
			| typeof ClaimRequestStatus.APPROVED
			| typeof ClaimRequestStatus.REJECTED
	) => {
		startTransition(async () => {
			const res = await reviewCompanyClaimAction({
				claimRequestId,
				decision,
				verificationTier: tier,
				reviewNote: note,
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
		<div className='mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3'>
			<select
				value={tier}
				onChange={(e) => setTier(e.target.value as VerificationTier)}
				className='flex h-9 rounded-md border border-input bg-background px-2.5 text-xs'
			>
				<option value={VerificationTier.VERIFIED}>
					Grant VERIFIED Badge
				</option>
				<option value={VerificationTier.VERIFIED_PRO}>
					Grant VERIFIED_PRO Tier
				</option>
				<option value={VerificationTier.ENTERPRISE_SPONSOR}>
					Grant ENTERPRISE_SPONSOR
				</option>
			</select>

			<Input
				value={note}
				onChange={(e) => setNote(e.target.value)}
				placeholder='Analyst verification note (CAC / domain check)...'
				className='h-9 flex-1 min-w-52 text-xs'
			/>

			<Button
				size='sm'
				disabled={isPending}
				onClick={() => handleDecision(ClaimRequestStatus.APPROVED)}
				className='bg-verified text-white hover:opacity-90'
			>
				Approve & Convert
			</Button>
			<Button
				size='sm'
				variant='outline'
				disabled={isPending}
				onClick={() => handleDecision(ClaimRequestStatus.REJECTED)}
				className='text-destructive'
			>
				Reject
			</Button>
		</div>
	);
}

