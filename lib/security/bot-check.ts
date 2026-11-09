export interface BotDefensePayload {
	honeypot?: string | null;
	formRenderedAt?: number | string | null;
}

export interface BotCheckResult {
	ok: boolean;
	reason?: string;
}

const DEFAULT_MIN_FILL_MS = 1800;

/**
 * Pure bot-defense evaluator:
 * 1. Rejects non-empty honeypot fields (invisible to human users).
 * 2. When `formRenderedAt` (epoch ms) is provided, rejects submissions
 *    completed faster than `minFillMs` (default 1.8s).
 */
export function evaluateBotSubmission(
	payload: BotDefensePayload,
	nowMs: number = Date.now(),
	minFillMs: number = DEFAULT_MIN_FILL_MS
): BotCheckResult {
	if (payload.honeypot && String(payload.honeypot).trim().length > 0) {
		return {
			ok: false,
			reason: 'Automated submission detected.',
		};
	}

	if (
		payload.formRenderedAt !== undefined &&
		payload.formRenderedAt !== null &&
		payload.formRenderedAt !== ''
	) {
		const renderedMs = Number(payload.formRenderedAt);
		if (!Number.isFinite(renderedMs) || renderedMs <= 0) {
			return {
				ok: false,
				reason: 'Invalid form session timestamp.',
			};
		}
		const elapsed = nowMs - renderedMs;
		if (elapsed >= 0 && elapsed < minFillMs) {
			return {
				ok: false,
				reason: 'Please take a moment to review the form fields before submitting.',
			};
		}
	}

	return { ok: true };
}

/**
 * Pure rate-limit window evaluator used by both the Prisma store and unit tests.
 */
export function computeNextRateWindow(params: {
	existingCount: number;
	existingExpiresAtMs: number | null;
	nowMs: number;
	limit: number;
	windowSeconds: number;
}): {
	allowed: boolean;
	nextCount: number;
	nextExpiresAtMs: number;
	retryAfterSeconds: number;
	resetWindow: boolean;
} {
	const windowMs = params.windowSeconds * 1000;
	const existingExpiresAtMs = params.existingExpiresAtMs;
	const expired =
		existingExpiresAtMs === null || params.nowMs >= existingExpiresAtMs;

	if (expired) {
		return {
			allowed: params.limit >= 1,
			nextCount: 1,
			nextExpiresAtMs: params.nowMs + windowMs,
			retryAfterSeconds: 0,
			resetWindow: true,
		};
	}

	const nextCount = params.existingCount + 1;
	const allowed = nextCount <= params.limit;
	const retryAfterSeconds = allowed
		? 0
		: Math.max(1, Math.ceil((existingExpiresAtMs - params.nowMs) / 1000));

	return {
		allowed,
		nextCount,
		nextExpiresAtMs: existingExpiresAtMs,
		retryAfterSeconds,
		resetWindow: false,
	};
}

