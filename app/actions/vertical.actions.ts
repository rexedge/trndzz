'use server';

import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { guardPlatformRole } from '@/lib/auth/guards';
import {
	createVerticalWithDefaultStages,
	setVerticalStatus,
} from '@/lib/services/vertical.service';
import {
	createVerticalSchema,
	updateVerticalStatusSchema,
	type CreateVerticalInput,
	type UpdateVerticalStatusInput,
} from '@/lib/validators/vertical.validator';
import type { ActionResponse } from '@/types/actions';

export async function updateVerticalStatusAction(
	rawInput: UpdateVerticalStatusInput
): Promise<ActionResponse<{ id: string }>> {
	try {
		const guard = await guardPlatformRole([UserRole.SUPER_ADMIN]);
		if (!guard.ok) return guard.response;

		const parsed = updateVerticalStatusSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Invalid vertical status request.',
			};
		}

		const updated = await setVerticalStatus(
			parsed.data.verticalId,
			parsed.data.status
		);

		revalidatePath('/');
		revalidatePath('/verticals');
		revalidatePath('/admin/verticals');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `${updated.name} (${updated.slug}.trndzz.com) is now ${updated.status}.`,
			data: { id: updated.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Unable to update vertical status.',
		};
	}
}

export async function createVerticalAction(
	rawInput: CreateVerticalInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
	try {
		const guard = await guardPlatformRole([UserRole.SUPER_ADMIN]);
		if (!guard.ok) return guard.response;

		const parsed = createVerticalSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please review vertical configuration.',
			};
		}

		const created = await createVerticalWithDefaultStages(parsed.data);

		revalidatePath('/');
		revalidatePath('/verticals');
		revalidatePath('/admin/verticals');

		return {
			success: true,
			message: `Provisioned ${created.slug}.trndzz.com with value-chain stages!`,
			data: { id: created.id, slug: created.slug },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Could not provision vertical (slug or name may already exist).',
		};
	}
}

