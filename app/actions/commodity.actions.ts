'use server';

import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { guardPlatformRole } from '@/lib/auth/guards';
import {
	createCommodityIndicator,
	recordCommodityPriceUpdate,
} from '@/lib/services/commodity.service';
import {
	createCommodityIndicatorSchema,
	updateCommodityPriceSchema,
	type CreateCommodityIndicatorInput,
	type UpdateCommodityPriceInput,
} from '@/lib/validators/pulse.validator';
import type { ActionResponse } from '@/types/actions';

export async function updateCommodityPriceAction(
	rawInput: UpdateCommodityPriceInput
): Promise<ActionResponse<{ id: string }>> {
	try {
		const guard = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.ANALYST,
			UserRole.EDITOR,
		]);
		if (!guard.ok) return guard.response;

		const parsed = updateCommodityPriceSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Invalid price update payload.',
			};
		}

		const updated = await recordCommodityPriceUpdate(parsed.data);

		revalidatePath('/');
		revalidatePath('/admin/prices');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `Updated ${updated.name} benchmark price.`,
			data: { id: updated.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to update benchmark price.',
		};
	}
}

export async function createCommodityIndicatorAction(
	rawInput: CreateCommodityIndicatorInput
): Promise<ActionResponse<{ id: string }>> {
	try {
		const guard = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.ANALYST,
		]);
		if (!guard.ok) return guard.response;

		const parsed = createCommodityIndicatorSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Invalid indicator fields.',
			};
		}

		const created = await createCommodityIndicator(parsed.data);

		revalidatePath('/');
		revalidatePath('/admin/prices');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `Created ticker ${created.code}.`,
			data: { id: created.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to create commodity indicator.',
		};
	}
}

