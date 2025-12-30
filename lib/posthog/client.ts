import posthog from 'posthog-js';

export function initPostHog() {
	if (typeof window !== 'undefined') {
		const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
		const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

		if (key && host) {
			posthog.init(key, {
				api_host: host,
				person_profiles: 'identified_only',
				capture_pageview: false, // We'll manually capture pageviews
				capture_pageleave: true,
				loaded: (posthog) => {
					if (process.env.NODE_ENV === 'development') {
						posthog.debug();
					}
				},
			});
		}
	}

	return posthog;
}

export { posthog };
