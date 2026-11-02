import axios from 'axios';

/**
 * Centralized HTTP client for external service calls (PostHog, market feeds, webhooks).
 * Per TRNDZZ engineering rules, never invoke raw `fetch` directly in application services.
 */
export const httpClient = axios.create({
	timeout: 15_000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

