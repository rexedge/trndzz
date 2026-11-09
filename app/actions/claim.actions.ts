'use server';

import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { guardActionAuth, guardPlatformRole } from '@/lib/auth/guards';
import { evaluateBotSubmission } from '@/lib/security/bot-check';
import { consumeRateLimit } from '@/lib/security/rate-limit';
import {
	reviewCompanyClaimRequest,
	submitCompanyClaimRequest,
} from '@/lib/services/claim.service';
import {
	reviewCompanyClaimSchema,
	submitCompanyClaimSchema,
	type ReviewCompanyClaimInput,
	type SubmitCompanyClaimInput,
} from '@/lib/validators/company.validator';
import type { ActionResponse } from '@/types/actions';

export async function submitCompanyClaimAction(
	rawInput: SubmitCompanyClaimInput
): Promise<ActionResponse<{ claimId: string }>> {
	try {
		const auth = await guardActionAuth();
		if (!auth.ok) return auth.response;

		const parsed = submitCompanyClaimSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please complete all verification fields.',
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

		const rate = await consumeRateLimit({
			key: `company_claim:user:${auth.user.userId}`,
			limit: 3,
			windowSeconds: 86400,
		});
		if (!rate.allowed) {
			return {
				success: false,
				message:
					'Daily company claim submission limit (3/day) reached. Please contact verification support if you manage additional entities.',
			};
		}

		const claim = await submitCompanyClaimRequest(
			auth.user.userId,
			parsed.data
		);

		revalidatePath('/dashboard');
		revalidatePath('/dashboard/claims');
		revalidatePath('/admin/claims');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message:
				'Ownership claim submitted! Our verification analysts will review your CAC & corporate credentials.',
			data: { claimId: claim.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Could not submit ownership claim.',
		};
	}
}

export async function reviewCompanyClaimAction(
	rawInput: ReviewCompanyClaimInput
): Promise<ActionResponse<{ id: string }>> {
	try {
		const guard = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.ANALYST,
		]);
		if (!guard.ok) return guard.response;

		const parsed = reviewCompanyClaimSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Invalid claim review decision.',
			};
		}

		const updated = await reviewCompanyClaimRequest(
			guard.user.userId,
			parsed.data
		);

		revalidatePath('/');
		revalidatePath('/admin/claims');
		revalidatePath('/admin/directory');
		revalidatePath('/dashboard');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message:
				parsed.data.decision === 'APPROVED'
					? 'Claim approved! Company transitioned to CLAIMED and unlocked matched RFQs.'
					: 'Claim request marked as rejected.',
			data: { id: updated.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to process claim decision.',
		};
	}
}

