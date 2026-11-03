import posthog from 'posthog-js';

let isInitialized = false;

export function initPostHog() {
	if (typeof window !== 'undefined' && !isInitialized) {
		const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
		const host =
			process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
			'https://us.i.posthog.com';

		if (key) {
			posthog.init(key, {
				api_host: host,
				person_profiles: 'identified_only',
				cross_subdomain_cookie: true,
				capture_pageview: false,
				capture_pageleave: true,
				loaded: (ph) => {
					if (process.env.NEXT_PUBLIC_POSTHOG_DEBUG === 'true') {
						ph.debug();
					}
				},
			});
			isInitialized = true;
		}
	}

	return posthog;
}

export { posthog };
