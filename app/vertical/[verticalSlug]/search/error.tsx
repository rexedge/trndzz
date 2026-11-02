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
			title='Unable to Execute Vertical Search'
			message={error.message}
			onReset={reset}
			backHref='/'
		/>
	);
}

