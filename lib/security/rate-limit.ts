import 'server-only';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { computeNextRateWindow } from '@/lib/security/bot-check';

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	retryAfterSeconds: number;
}

export async function getRequestClientIp(): Promise<string> {
	try {
		const hdrs = await headers();
		const forwarded = hdrs.get('x-forwarded-for');
		if (forwarded) {
			const first = forwarded.split(',')[0]?.trim();
			if (first) return first;
		}
		const realIp = hdrs.get('x-real-ip')?.trim();
		if (realIp) return realIp;
	} catch {
		// Fallback when invoked outside Next request context
	}
	return '127.0.0.1';
}

/**
 * Serverless-safe, database-backed fixed-window rate limiter.
 * Gracefully degrades to `allowed: true` if the table is not yet migrated.
 */
export async function consumeRateLimit(params: {
	key: string;
	limit: number;
	windowSeconds: number;
}): Promise<RateLimitResult> {
	if (!prisma.rateLimitBucket) {
		return {
			allowed: true,
			remaining: params.limit,
			retryAfterSeconds: 0,
		};
	}

	const nowMs = Date.now();
	try {
		const existing = await prisma.rateLimitBucket.findUnique({
			where: { key: params.key },
		});

		const evaluated = computeNextRateWindow({
			existingCount: existing?.count ?? 0,
			existingExpiresAtMs: existing
				? existing.expiresAt.getTime()
				: null,
			nowMs,
			limit: params.limit,
			windowSeconds: params.windowSeconds,
		});

		if (!existing) {
			await prisma.rateLimitBucket.create({
				data: {
					key: params.key,
					count: 1,
					windowStart: new Date(nowMs),
					expiresAt: new Date(evaluated.nextExpiresAtMs),
				},
			});
		} else if (evaluated.resetWindow) {
			await prisma.rateLimitBucket.update({
				where: { key: params.key },
				data: {
					count: 1,
					windowStart: new Date(nowMs),
					expiresAt: new Date(evaluated.nextExpiresAtMs),
				},
			});
		} else if (evaluated.allowed) {
			await prisma.rateLimitBucket.update({
				where: { key: params.key },
				data: { count: evaluated.nextCount },
			});
		}

		return {
			allowed: evaluated.allowed,
			remaining: Math.max(0, params.limit - evaluated.nextCount),
			retryAfterSeconds: evaluated.retryAfterSeconds,
		};
	} catch {
		return {
			allowed: true,
			remaining: params.limit,
			retryAfterSeconds: 0,
		};
	}
}

