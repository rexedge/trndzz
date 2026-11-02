'use server';

import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { guardPlatformRole } from '@/lib/auth/guards';
import { upsertArticleWithMentions } from '@/lib/services/article.service';
import {
	createOrUpdateArticleSchema,
	type CreateOrUpdateArticleInput,
} from '@/lib/validators/pulse.validator';
import type { ActionResponse } from '@/types/actions';

function toFieldErrors(
	issues: { path: PropertyKey[]; message: string }[]
): Record<string, string[]> {
	const out: Record<string, string[]> = {};
	for (const issue of issues) {
		const key = String(issue.path[0] ?? 'form');
		if (!out[key]) out[key] = [];
		out[key].push(issue.message);
	}
	return out;
}

export async function saveArticleAction(
	rawInput: CreateOrUpdateArticleInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
	try {
		const guard = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.EDITOR,
		]);
		if (!guard.ok) return guard.response;

		const parsed = createOrUpdateArticleSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Please correct the highlighted article fields.',
				errors: toFieldErrors(parsed.error.issues),
			};
		}

		const article = await upsertArticleWithMentions(
			guard.user.userId,
			parsed.data
		);

		revalidatePath('/');
		revalidatePath('/news');
		revalidatePath('/admin/pulse');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `Article "${article.title}" saved successfully.`,
			data: { id: article.id, slug: article.slug },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Unable to save article right now.',
		};
	}
}

