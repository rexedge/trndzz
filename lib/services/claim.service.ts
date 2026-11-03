import 'server-only';
import {
	ClaimRequestStatus,
	ClaimStatus,
	CompanyMemberRole,
	RfqMatchStatus,
	VerificationTier,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { dispatchClaimReviewDecisionAlert } from '@/lib/services/notification.service';
import { refreshPlatformStatsCache } from '@/lib/services/stats.service';
import type {
	ReviewCompanyClaimInput,
	SubmitCompanyClaimInput,
} from '@/lib/validators/company.validator';

export async function submitCompanyClaimRequest(
	requesterId: string,
	input: SubmitCompanyClaimInput
) {
	return prisma.$transaction(async (tx) => {
		const company = await tx.company.findUnique({
			where: { id: input.companyId },
			select: { id: true, name: true, claimStatus: true },
		});

		if (!company) {
			throw new Error('Company profile not found.');
		}

		if (company.claimStatus === ClaimStatus.CLAIMED) {
			throw new Error(
				'This company profile has already been claimed by verified representatives.'
			);
		}

		const duplicatePending = await tx.companyClaimRequest.findFirst({
			where: {
				companyId: input.companyId,
				requesterId,
				status: ClaimRequestStatus.PENDING,
			},
		});

		if (duplicatePending) {
			throw new Error(
				'You already have a pending claim request under review for this company.'
			);
		}

		const claim = await tx.companyClaimRequest.create({
			data: {
				companyId: input.companyId,
				requesterId,
				workEmail: input.workEmail,
				phone: input.phone,
				jobTitle: input.jobTitle,
				rcNumber: input.rcNumber,
				proofDocumentUrl: input.proofDocumentUrl || null,
				message: input.message,
				status: ClaimRequestStatus.PENDING,
			},
		});

		await tx.company.update({
			where: { id: input.companyId },
			data: { claimStatus: ClaimStatus.CLAIM_PENDING },
		});

		return claim;
	});
}

export async function reviewCompanyClaimRequest(
	reviewerId: string,
	input: ReviewCompanyClaimInput
) {
	const result = await prisma.$transaction(async (tx) => {
		const claim = await tx.companyClaimRequest.findUnique({
			where: { id: input.claimRequestId },
			include: { company: true },
		});

		if (!claim) {
			throw new Error('Claim request not found.');
		}

		if (claim.status !== ClaimRequestStatus.PENDING) {
			throw new Error('This claim request has already been processed.');
		}

		const updatedClaim = await tx.companyClaimRequest.update({
			where: { id: claim.id },
			data: {
				status: input.decision,
				reviewedById: reviewerId,
				reviewNote: input.reviewNote || null,
				reviewedAt: new Date(),
			},
		});

		if (input.decision === ClaimRequestStatus.APPROVED) {
			await tx.company.update({
				where: { id: claim.companyId },
				data: {
					claimStatus: ClaimStatus.CLAIMED,
					verificationTier: input.verificationTier,
					rcNumber: claim.rcNumber || claim.company.rcNumber,
					verifiedAt:
						input.verificationTier !== VerificationTier.UNVERIFIED
							? new Date()
							: claim.company.verifiedAt,
				},
			});

			await tx.companyMember.upsert({
				where: {
					companyId_userId: {
						companyId: claim.companyId,
						userId: claim.requesterId,
					},
				},
				update: { role: CompanyMemberRole.OWNER },
				create: {
					companyId: claim.companyId,
					userId: claim.requesterId,
					role: CompanyMemberRole.OWNER,
				},
			});

			// Unlock any pre-existing matched RFQs ("Claim & Convert" conversion payoff!)
			const unlockedMatches = await tx.rfqVendorMatch.updateMany({
				where: {
					companyId: claim.companyId,
					status: RfqMatchStatus.MATCHED,
				},
				data: {
					status: RfqMatchStatus.NOTIFIED,
					notifiedAt: new Date(),
				},
			});

			return {
				updatedClaim,
				claim,
				unlockedRfqCount: unlockedMatches.count,
			};
		} else {
			// Check if any other pending claim exists; otherwise revert to UNCLAIMED
			const otherPending = await tx.companyClaimRequest.count({
				where: {
					companyId: claim.companyId,
					status: ClaimRequestStatus.PENDING,
				},
			});

			if (
				otherPending === 0 &&
				claim.company.claimStatus === ClaimStatus.CLAIM_PENDING
			) {
				await tx.company.update({
					where: { id: claim.companyId },
					data: { claimStatus: ClaimStatus.UNCLAIMED },
				});
			}

			return { updatedClaim, claim, unlockedRfqCount: 0 };
		}
	});

	await refreshPlatformStatsCache().catch(() => null);

	await dispatchClaimReviewDecisionAlert({
		companyId: result.claim.companyId,
		companyName: result.claim.company.name,
		workEmail: result.claim.workEmail,
		phone: result.claim.phone,
		decision: input.decision,
		verificationTier: input.verificationTier,
		reviewNote: input.reviewNote,
		unlockedRfqCount: result.unlockedRfqCount,
	}).catch(() => null);

	return result.updatedClaim;
}

export async function listAdminClaimRequests() {
	return prisma.companyClaimRequest.findMany({
		orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
		take: 100,
		include: {
			company: {
				select: {
					id: true,
					name: true,
					slug: true,
					headquartersState: true,
					claimStatus: true,
					verificationTier: true,
					_count: { select: { rfqMatches: true } },
				},
			},
			requester: {
				select: { id: true, name: true, email: true },
			},
			reviewedBy: {
				select: { name: true },
			},
		},
	});
}

