'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RfqQuoteStatus } from '@prisma/client';
import { toast } from 'sonner';
import { decideQuoteStatusAction } from '@/app/actions/rfq.actions';
import { Button } from '@/components/ui/button';

export function QuoteDecisionButtons({
	quoteId,
	currentStatus,
	rfqAwarded,
}: {
	quoteId: string;
	currentStatus: RfqQuoteStatus;
	rfqAwarded: boolean;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleDecision = (
		decision:
			| typeof RfqQuoteStatus.SHORTLISTED
			| typeof RfqQuoteStatus.ACCEPTED
			| typeof RfqQuoteStatus.REJECTED
	) => {
		startTransition(async () => {
			const res = await decideQuoteStatusAction({ quoteId, decision });
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.refresh();
		});
	};

	if (rfqAwarded || currentStatus === RfqQuoteStatus.ACCEPTED) {
		return null;
	}

	return (
		<div className='flex flex-wrap items-center gap-1.5'>
			{currentStatus !== RfqQuoteStatus.SHORTLISTED && (
				<Button
					size='sm'
					variant='outline'
					disabled={isPending}
					onClick={() => handleDecision(RfqQuoteStatus.SHORTLISTED)}
					className='h-7 text-xs'
				>
					Shortlist
				</Button>
			)}
			<Button
				size='sm'
				disabled={isPending}
				onClick={() => handleDecision(RfqQuoteStatus.ACCEPTED)}
				className='h-7 bg-verified text-white hover:opacity-90 text-xs'
			>
				Award RFQ
			</Button>
			{currentStatus !== RfqQuoteStatus.REJECTED && (
				<Button
					size='sm'
					variant='ghost'
					disabled={isPending}
					onClick={() => handleDecision(RfqQuoteStatus.REJECTED)}
					className='h-7 text-xs text-destructive'
				>
					Decline
				</Button>
			)}
		</div>
	);
}

