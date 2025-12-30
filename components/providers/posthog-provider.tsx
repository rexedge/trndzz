'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from '@/lib/posthog/client';

function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Track pageviews on route change
		if (pathname) {
			let url = window.origin + pathname;
			if (searchParams && searchParams.toString()) {
				url = url + `?${searchParams.toString()}`;
			}
			posthog.capture('$pageview', {
				$current_url: url,
			});
		}
	}, [pathname, searchParams]);

	return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// Initialize PostHog
		initPostHog();
	}, []);

	return (
		<>
			<Suspense fallback={null}>
				<PostHogPageView />
			</Suspense>
			{children}
		</>
	);
}
