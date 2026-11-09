import { BusinessRole, VerificationTier } from '@prisma/client';

export interface CandidateSupplierForMatch {
	id: string;
	businessRoles: BusinessRole[];
	headquartersState: string;
	coverageStates: string[];
	verificationTier: VerificationTier;
	categories: { categoryId: string }[];
}

export interface SupplierMatchInput {
	categoryId: string;
	deliveryState: string;
	preferredRoles: BusinessRole[];
	targetCompanyId?: string | null;
}

export interface ScoredSupplierMatch<T extends CandidateSupplierForMatch> {
	company: T;
	score: number;
	reason: string;
	hasCategory: boolean;
}

/**
 * Pure deterministic supplier scoring algorithm used by RFQ broadcasting.
 */
export function scoreSupplierMatch<T extends CandidateSupplierForMatch>(
	company: T,
	criteria: SupplierMatchInput
): ScoredSupplierMatch<T> {
	let score = 50;
	const reasons: string[] = [];

	const hasCategory = company.categories.some(
		(c) => c.categoryId === criteria.categoryId
	);
	if (hasCategory) {
		score += 25;
		reasons.push('Category match');
	}

	if (
		criteria.preferredRoles.length === 0 ||
		company.businessRoles.some((r) => criteria.preferredRoles.includes(r))
	) {
		score += 10;
		reasons.push('Role match');
	}

	const targetStateLower = criteria.deliveryState.toLowerCase();
	const servesState =
		company.headquartersState.toLowerCase() === targetStateLower ||
		company.coverageStates.some(
			(s) => s.toLowerCase() === targetStateLower
		);
	if (servesState) {
		score += 10;
		reasons.push(`Supplies ${criteria.deliveryState}`);
	}

	if (
		company.verificationTier === VerificationTier.ENTERPRISE_SPONSOR ||
		company.verificationTier === VerificationTier.VERIFIED_PRO
	) {
		score += 5;
		reasons.push('Priority Verified Tier');
	} else if (company.verificationTier === VerificationTier.VERIFIED) {
		score += 3;
		reasons.push('Verified Supplier');
	}

	if (criteria.targetCompanyId && criteria.targetCompanyId === company.id) {
		score = 100;
		reasons.unshift('Direct Buyer Selection');
	}

	return {
		company,
		score: Math.min(score, 100),
		reason: reasons.join(' · ') || 'Vertical supplier match',
		hasCategory,
	};
}

