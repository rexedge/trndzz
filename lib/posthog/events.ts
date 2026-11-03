import { posthog } from '@/lib/posthog/client';

export type B2BFunnelEventMap = {
	pulse_contextual_rfq_opened: {
		verticalSlug: string;
		categoryId: string;
		sourceArticleId?: string | null;
		targetCompanyId?: string | null;
	};
	rfq_basket_item_added: {
		verticalSlug: string;
		productId: string;
		categorySlug: string;
		quantity: number;
	};
	rfq_broadcast_submitted: {
		verticalSlug?: string;
		categoryId: string;
		referenceNumber: string;
		fromArticle: boolean;
		fromTargetCompany: boolean;
	};
	company_claim_submitted: {
		companyId: string;
		companyName: string;
	};
	supplier_quote_submitted: {
		rfqId: string;
		companyId: string;
		currency: string;
	};
	learn_dossier_unlocked: {
		resourceId: string;
		procurementTimeline: string;
		estimatedBudgetBand: string;
	};
};

export function trackB2BEvent<K extends keyof B2BFunnelEventMap>(
	event: K,
	properties: B2BFunnelEventMap[K]
): void {
	if (typeof window === 'undefined') return;
	if (!process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()) return;

	try {
		posthog.capture(event, properties);
	} catch {
		// Never interrupt B2B UX if analytics is blocked by browser privacy extensions
	}
}
