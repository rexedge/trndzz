'use client';

import { RouteErrorCard } from '@/components/shared/route-states';

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<RouteErrorCard
			title='Unable to Load RFQ Broadcast Builder'
			message={error.message}
			onReset={reset}
			backHref='/rfq'
		/>
	);
}

