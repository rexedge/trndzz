'use server';

import { revalidatePath } from 'next/cache';
import { NotificationStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { guardPlatformRole } from '@/lib/auth/guards';
import { retryNotificationDispatchById } from '@/lib/services/notification.service';
import type { ActionResponse } from '@/types/actions';

const retrySchema = z.object({
	dispatchId: z.string().trim().min(1, 'Dispatch ID is required'),
});

export async function retryNotificationDispatchAction(rawInput: {
	dispatchId: string;
}): Promise<
	ActionResponse<{
		id: string;
		status: NotificationStatus;
		attemptCount: number;
	}>
> {
	try {
		const guard = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.EDITOR,
			UserRole.ANALYST,
		]);
		if (!guard.ok) return guard.response;

		const parsed = retrySchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Invalid notification dispatch ID.',
			};
		}

		const outcome = await retryNotificationDispatchById(
			parsed.data.dispatchId
		);

		revalidatePath('/admin/notifications');
		revalidatePath('/admin');

		if (outcome.status === NotificationStatus.FAILED) {
			return {
				success: false,
				message:
					outcome.errorMessage ||
					`Retry attempt #${outcome.attemptCount} failed.`,
			};
		}

		return {
			success: true,
			message:
				outcome.status === NotificationStatus.SENT
					? `Delivered alert on attempt #${outcome.attemptCount}.`
					: `Re-logged in dry-run outbox (attempt #${outcome.attemptCount}).`,
			data: {
				id: outcome.id,
				status: outcome.status,
				attemptCount: outcome.attemptCount,
			},
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Could not retry notification dispatch.',
		};
	}
}

