'use server';

import { revalidatePath } from 'next/cache';
import { CompanyMemberRole, RfqVisibility } from '@prisma/client';
import { guardActionAuth, guardCompanyAccess } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { evaluateBotSubmission } from '@/lib/security/bot-check';
import { consumeRateLimit } from '@/lib/security/rate-limit';
import {
	createAndBroadcastRfq,
	decideBuyerQuoteStatus,
	submitSupplierRfqQuote,
} from '@/lib/services/rfq.service';
import {
	createRfqSchema,
	submitRfqQuoteSchema,
	updateQuoteStatusSchema,
	type CreateRfqInput,
	type SubmitRfqQuoteInput,
	type UpdateQuoteStatusInput,
} from '@/lib/validators/rfq.validator';
import type { ActionResponse } from '@/types/actions';

export async function createRfqAction(
	rawInput: CreateRfqInput
): Promise<
	ActionResponse<{
		id: string;
		referenceNumber: string;
		matchedCount: number;
	}>
> {
	try {
		const auth = await guardActionAuth();
		if (!auth.ok) return auth.response;

		const parsed = createRfqSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please review your RFQ requirements.',
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
			key: `rfq_broadcast:user:${auth.user.userId}`,
			limit: 5,
			windowSeconds: 3600,
		});
		if (!rate.allowed) {
			return {
				success: false,
				message: `Hourly RFQ broadcast limit (5/hr) reached. Please retry in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
			};
		}

		const outcome = await createAndBroadcastRfq(
			auth.user.userId,
			parsed.data
		);

		if (!outcome.ok) {
			return {
				success: false,
				message: outcome.message,
				errors: outcome.errors,
			};
		}

		revalidatePath('/');
		revalidatePath('/dashboard');
		revalidatePath('/dashboard/rfqs');
		revalidatePath('/admin/rfqs');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `Broadcast ${outcome.rfq.referenceNumber} to ${outcome.matchedCount} pre-qualified supplier(s).`,
			data: {
				id: outcome.rfq.id,
				referenceNumber: outcome.rfq.referenceNumber,
				matchedCount: outcome.matchedCount,
			},
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Unable to broadcast RFQ right now.',
		};
	}
}

export async function submitRfqQuoteAction(
	rawInput: SubmitRfqQuoteInput
): Promise<ActionResponse<{ quoteId: string }>> {
	try {
		const parsed = submitRfqQuoteSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please review your quote figures and lead time.',
			};
		}

		const rfq = await prisma.rfq.findUnique({
			where: { id: parsed.data.rfqId },
			select: { id: true, visibility: true },
		});

		if (!rfq) {
			return {
				success: false,
				message: 'Target RFQ does not exist.',
			};
		}

		const access = await guardCompanyAccess(
			parsed.data.companyId,
			[
				CompanyMemberRole.OWNER,
				CompanyMemberRole.ADMIN,
				CompanyMemberRole.SALES_REP,
			],
			{
				requireVerifiedTier:
					rfq.visibility === RfqVisibility.VERIFIED_VENDORS_ONLY,
			}
		);
		if (!access.ok) return access.response;

		const rate = await consumeRateLimit({
			key: `rfq_quote:user:${access.user.userId}`,
			limit: 30,
			windowSeconds: 3600,
		});
		if (!rate.allowed) {
			return {
				success: false,
				message: `Hourly quote submission limit (30/hr) reached. Please retry in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
			};
		}

		const quote = await submitSupplierRfqQuote(
			access.user.userId,
			parsed.data
		);

		revalidatePath('/dashboard/quotes');
		revalidatePath('/dashboard/rfqs');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: 'Formal commercial quote submitted to buyer.',
			data: { quoteId: quote.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to submit supplier quote.',
		};
	}
}

export async function decideQuoteStatusAction(
	rawInput: UpdateQuoteStatusInput
): Promise<ActionResponse<{ id: string }>> {
	try {
		const auth = await guardActionAuth();
		if (!auth.ok) return auth.response;

		const parsed = updateQuoteStatusSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Invalid quote status update.',
			};
		}

		const updated = await decideBuyerQuoteStatus(
			auth.user.userId,
			parsed.data
		);

		revalidatePath('/dashboard/rfqs');
		revalidatePath('/dashboard/quotes');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message:
				parsed.data.decision === 'ACCEPTED'
					? 'Supplier quote accepted and RFQ marked AWARDED!'
					: `Quote status updated to ${parsed.data.decision}.`,
			data: { id: updated.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Could not update quote status.',
		};
	}
}

