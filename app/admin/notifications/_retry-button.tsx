'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { retryNotificationDispatchAction } from '@/app/actions/notification.actions';
import { Button } from '@/components/ui/button';

export function RetryNotificationButton({
	dispatchId,
	attemptCount,
	maxAttempts = 5,
}: {
	dispatchId: string;
	attemptCount: number;
	maxAttempts?: number;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const exhausted = attemptCount >= maxAttempts;

	const handleRetry = () => {
		startTransition(async () => {
			const res = await retryNotificationDispatchAction({ dispatchId });
			if (!res.success) {
				toast.error(res.message);
				router.refresh();
				return;
			}
			toast.success(res.message);
			router.refresh();
		});
	};

	return (
		<Button
			type='button'
			variant='outline'
			size='sm'
			disabled={isPending || exhausted}
			onClick={handleRetry}
			className='h-7 gap-1 px-2 text-[11px]'
		>
			<RotateCw
				className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`}
			/>
			<span>
				{exhausted
					? `Max (${attemptCount}/${maxAttempts})`
					: isPending
						? 'Retrying...'
						: `Retry (${attemptCount}/${maxAttempts})`}
			</span>
		</Button>
	);
}

