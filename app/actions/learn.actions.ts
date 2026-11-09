'use server';

import { UserRole } from '@prisma/client';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, guardPlatformRole } from '@/lib/auth/guards';
import { evaluateBotSubmission } from '@/lib/security/bot-check';
import {
	consumeRateLimit,
	getRequestClientIp,
} from '@/lib/security/rate-limit';
import {
	captureLeadAndUnlockResource,
	createKnowledgeResource,
} from '@/lib/services/learn.service';
import {
	createKnowledgeResourceSchema,
	unlockResourceLeadSchema,
} from '@/lib/validators/learn.validator';
import type { ActionResponse } from '@/types/actions';

const UNLOCKED_COOKIE_NAME = 'trndzz_unlocked_learn';

export async function unlockKnowledgeResourceAction(
	rawInput: unknown
): Promise<
	ActionResponse<{
		fullContentMarkdown: string;
		fileUrl: string | null;
	}>
> {
	try {
		const parsed = unlockResourceLeadSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Please complete all required corporate fields.',
				errors: parsed.error.flatten().fieldErrors,
			};
		}

		const botCheck = evaluateBotSubmission({
			honeypot: parsed.data.honeypot,
			formRenderedAt: parsed.data.formRenderedAt,
		});
		if (!botCheck.ok) {
			return {
				success: false,
				message: botCheck.reason ?? 'Submission blocked by spam filter.',
			};
		}

		const user = await getCurrentUser();
		const clientIp = await getRequestClientIp();
		const rateKey = user?.userId
			? `learn_unlock:user:${user.userId}`
			: `learn_unlock:ip:${clientIp}`;
		const rate = await consumeRateLimit({
			key: rateKey,
			limit: 10,
			windowSeconds: 3600,
		});
		if (!rate.allowed) {
			return {
				success: false,
				message: `Too many dossier unlock requests. Please wait ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s) and try again.`,
			};
		}

		const unlocked = await captureLeadAndUnlockResource(
			parsed.data,
			user?.userId
		);

		const cookieStore = await cookies();
		const existingRaw = cookieStore.get(UNLOCKED_COOKIE_NAME)?.value ?? '';
		const unlockedIds = new Set(
			existingRaw
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		);
		unlockedIds.add(unlocked.resourceId);

		cookieStore.set(
			UNLOCKED_COOKIE_NAME,
			Array.from(unlockedIds).slice(-30).join(','),
			{
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 90, // 90 days
			}
		);

		revalidatePath('/learn');
		revalidatePath('/admin/learn');

		return {
			success: true,
			message: 'Dossier unlocked. Full report access granted.',
			data: {
				fullContentMarkdown: unlocked.fullContentMarkdown,
				fileUrl: unlocked.fileUrl,
			},
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Unable to unlock resource right now.',
		};
	}
}

export async function createKnowledgeResourceAction(
	rawInput: unknown
): Promise<ActionResponse<{ id: string; slug: string }>> {
	try {
		const authCheck = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.EDITOR,
			UserRole.ANALYST,
		]);
		if (!authCheck.ok) return authCheck.response;

		const parsed = createKnowledgeResourceSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Check resource fields and try again.',
				errors: parsed.error.flatten().fieldErrors,
			};
		}

		const created = await createKnowledgeResource(parsed.data);

		revalidatePath('/learn');
		revalidatePath('/admin/learn');
		revalidatePath('/vertical/[verticalSlug]/learn', 'page');

		return {
			success: true,
			message: `Published "${created.title}" to Trndzz Learn.`,
			data: { id: created.id, slug: created.slug },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to publish Knowledge Hub resource.',
		};
	}
}

