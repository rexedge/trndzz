import 'server-only';
import {
	ClaimStatus,
	RfqMatchStatus,
	RfqQuoteStatus,
	RfqStatus,
	RfqVisibility,
	VerificationTier,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import {
	dispatchQuoteAwardedAlert,
	dispatchQuoteSubmittedAlert,
	dispatchRfqBroadcastAlerts,
} from '@/lib/services/notification.service';
import { refreshPlatformStatsCache } from '@/lib/services/stats.service';
import {
	validateDynamicSpecs,
	type CreateRfqInput,
	type SubmitRfqQuoteInput,
	type UpdateQuoteStatusInput,
} from '@/lib/validators/rfq.validator';

export async function getVerticalRfqFormMeta(verticalId: string) {
	const [categories, specDefinitions] = await Promise.all([
		prisma.category.findMany({
			where: { verticalId },
			orderBy: { displayOrder: 'asc' },
			select: {
				id: true,
				name: true,
				slug: true,
				defaultUnit: true,
				valueChainStageId: true,
			},
		}),
		prisma.specAttributeDefinition.findMany({
			where: { verticalId },
			orderBy: { displayOrder: 'asc' },
		}),
	]);

	return { categories, specDefinitions };
}

export async function listPublicVerticalRfqs(params: {
	verticalId: string;
	categorySlug?: string;
	state?: string;
}) {
	const rows = await prisma.rfq.findMany({
		where: {
			verticalId: params.verticalId,
			visibility: {
				in: [
					RfqVisibility.PUBLIC_BOARD,
					RfqVisibility.VERIFIED_VENDORS_ONLY,
				],
			},
			status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] },
			...(params.categorySlug
				? { category: { slug: params.categorySlug } }
				: {}),
			...(params.state
				? {
						deliveryState: {
							equals: params.state,
							mode: 'insensitive',
						},
					}
				: {}),
		},
		orderBy: { createdAt: 'desc' },
		take: 50,
		include: {
			category: { select: { id: true, name: true, slug: true } },
			valueChainStage: {
				select: { name: true, slug: true, streamPosition: true },
			},
			_count: { select: { quotes: true, matches: true } },
		},
	});

	return rows.map((r) => ({
		id: r.id,
		referenceNumber: r.referenceNumber,
		title: r.title,
		specifications: (r.specifications as Record<string, string>) ?? {},
		quantity: Number(r.quantity),
		unit: r.unit,
		targetUnitPrice:
			r.targetUnitPrice !== null ? Number(r.targetUnitPrice) : null,
		currency: r.currency,
		deliveryState: r.deliveryState,
		deliveryCity: r.deliveryCity,
		requiredByDate: r.requiredByDate?.toISOString() ?? null,
		visibility: r.visibility,
		status: r.status,
		preferredRoles: r.preferredRoles,
		category: r.category,
		valueChainStage: r.valueChainStage,
		quotesCount: r._count.quotes,
		matchesCount: r._count.matches,
		createdAt: r.createdAt.toISOString(),
	}));
}

export async function getVerticalRfqByReference(
	verticalId: string,
	referenceNumber: string
) {
	const rfq = await prisma.rfq.findFirst({
		where: {
			verticalId,
			referenceNumber: referenceNumber.toUpperCase(),
		},
		include: {
			category: { select: { id: true, name: true, slug: true } },
			valueChainStage: {
				select: { name: true, slug: true, streamPosition: true },
			},
			sourceArticle: { select: { id: true, title: true, slug: true } },
			targetCompany: { select: { id: true, name: true, slug: true } },
			_count: { select: { quotes: true, matches: true } },
		},
	});

	if (!rfq) return null;

	return {
		id: rfq.id,
		referenceNumber: rfq.referenceNumber,
		verticalId: rfq.verticalId,
		buyerId: rfq.buyerId,
		buyerCompanyName: rfq.buyerCompanyName,
		title: rfq.title,
		specifications: (rfq.specifications as Record<string, string>) ?? {},
		additionalNotes: rfq.additionalNotes,
		quantity: Number(rfq.quantity),
		unit: rfq.unit,
		targetUnitPrice:
			rfq.targetUnitPrice !== null ? Number(rfq.targetUnitPrice) : null,
		currency: rfq.currency,
		deliveryState: rfq.deliveryState,
		deliveryCity: rfq.deliveryCity,
		requiredByDate: rfq.requiredByDate?.toISOString() ?? null,
		paymentTermsPreference: rfq.paymentTermsPreference,
		visibility: rfq.visibility,
		status: rfq.status,
		preferredRoles: rfq.preferredRoles,
		category: rfq.category,
		valueChainStage: rfq.valueChainStage,
		sourceArticle: rfq.sourceArticle,
		targetCompany: rfq.targetCompany,
		quotesCount: rfq._count.quotes,
		matchesCount: rfq._count.matches,
		createdAt: rfq.createdAt.toISOString(),
	};
}

/**
 * Validates dynamic category specifications, creates a structured RFQ,
 * and runs the Automated Supplier Matching Engine across verified & pre-seeded vendors.
 */
export async function createAndBroadcastRfq(
	buyerId: string,
	input: CreateRfqInput
) {
	const [vertical, category, definitions] = await Promise.all([
		prisma.vertical.findUnique({
			where: { id: input.verticalId },
			select: { id: true, slug: true, name: true },
		}),
		prisma.category.findFirst({
			where: { id: input.categoryId, verticalId: input.verticalId },
			select: { id: true, name: true, valueChainStageId: true },
		}),
		prisma.specAttributeDefinition.findMany({
			where: {
				verticalId: input.verticalId,
				OR: [{ categoryId: input.categoryId }, { categoryId: null }],
			},
		}),
	]);

	if (!vertical || !category) {
		return {
			ok: false as const,
			message: 'Invalid vertical or category selected.',
		};
	}

	const specValidation = validateDynamicSpecs(
		input.specifications,
		definitions
	);
	if (!specValidation.ok) {
		return {
			ok: false as const,
			message: 'Please complete the required technical specifications.',
			errors: specValidation.errors,
		};
	}

	const prefix = vertical.slug.slice(0, 3).toUpperCase();
	const year = new Date().getFullYear();
	const currentCount = await prisma.rfq.count({
		where: { verticalId: vertical.id },
	});
	const seq = String(currentCount + 19).padStart(5, '0');
	const referenceNumber = `RFQ-${prefix}-${year}-${seq}`;

	// Find candidate suppliers in this vertical
	const candidateCompanies = await prisma.company.findMany({
		where: {
			isPublished: true,
			verticals: { some: { verticalId: vertical.id } },
			...(input.allowPeerQuotes === false && input.targetCompanyId
				? { id: input.targetCompanyId }
				: {}),
		},
		include: {
			categories: { select: { categoryId: true } },
		},
	});

	const scoredMatches = candidateCompanies
		.map((company) => {
			let score = 50;
			const reasons: string[] = [];

			const hasCategory = company.categories.some(
				(c) => c.categoryId === category.id
			);
			if (hasCategory) {
				score += 25;
				reasons.push('Category match');
			}

			if (
				input.preferredRoles.length === 0 ||
				company.businessRoles.some((r) =>
					input.preferredRoles.includes(r)
				)
			) {
				score += 10;
				reasons.push('Role match');
			}

			const servesState =
				company.headquartersState.toLowerCase() ===
					input.deliveryState.toLowerCase() ||
				company.coverageStates.some(
					(s) => s.toLowerCase() === input.deliveryState.toLowerCase()
				);
			if (servesState) {
				score += 10;
				reasons.push(`Supplies ${input.deliveryState}`);
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

			if (input.targetCompanyId === company.id) {
				score = 100;
				reasons.unshift('Direct Buyer Selection');
			}

			return {
				company,
				score: Math.min(score, 100),
				reason: reasons.join(' · ') || 'Vertical supplier match',
				hasCategory,
			};
		})
		.filter((m) => m.hasCategory || m.company.id === input.targetCompanyId)
		.sort((a, b) => b.score - a.score)
		.slice(0, 20);

	const created = await prisma.$transaction(async (tx) => {
		const rfq = await tx.rfq.create({
			data: {
				referenceNumber,
				verticalId: vertical.id,
				valueChainStageId: category.valueChainStageId,
				categoryId: category.id,
				buyerId,
				buyerCompanyName: input.buyerCompanyName,
				buyerContactName: input.buyerContactName,
				buyerContactEmail: input.buyerContactEmail,
				buyerContactPhone: input.buyerContactPhone,
				title: input.title,
				specifications: specValidation.cleaned,
				additionalNotes: input.additionalNotes || null,
				quantity: input.quantity.toFixed(3),
				unit: input.unit,
				targetUnitPrice: input.targetUnitPrice?.toFixed(4) ?? null,
				currency: input.currency.toUpperCase(),
				deliveryState: input.deliveryState,
				deliveryCity: input.deliveryCity || null,
				requiredByDate: input.requiredByDate
					? new Date(input.requiredByDate)
					: null,
				paymentTermsPreference: input.paymentTermsPreference || null,
				visibility: input.visibility,
				status: RfqStatus.OPEN,
				preferredRoles: input.preferredRoles,
				sourceArticleId: input.sourceArticleId || null,
				targetCompanyId: input.targetCompanyId || null,
				allowPeerQuotes: input.allowPeerQuotes,
				expiresAt: new Date(Date.now() + 14 * 86_400_000),
			},
		});

		if (scoredMatches.length > 0) {
			await tx.rfqVendorMatch.createMany({
				data: scoredMatches.map((m) => {
					const isClaimed =
						m.company.claimStatus === ClaimStatus.CLAIMED;
					const canNotifyUnclaimed =
						m.company.claimStatus === ClaimStatus.UNCLAIMED &&
						Boolean(m.company.publicEmail);
					return {
						rfqId: rfq.id,
						companyId: m.company.id,
						status: isClaimed
							? RfqMatchStatus.NOTIFIED
							: RfqMatchStatus.MATCHED,
						matchScore: m.score,
						matchReason: isClaimed
							? m.reason
							: `${m.reason} (Claim teaser queued)`,
						notifiedAt:
							isClaimed || canNotifyUnclaimed ? new Date() : null,
					};
				}),
				skipDuplicates: true,
			});
		}

		return rfq;
	});

	await refreshPlatformStatsCache().catch(() => null);

	await dispatchRfqBroadcastAlerts({
		rfqId: created.id,
		referenceNumber: created.referenceNumber,
		title: created.title,
		verticalSlug: vertical.slug,
		verticalName: vertical.name,
		categoryName: category.name,
		quantity: input.quantity,
		unit: input.unit,
		deliveryState: input.deliveryState,
		specifications: specValidation.cleaned,
		buyerCompanyName: input.buyerCompanyName,
		buyerContactEmail: input.buyerContactEmail,
		matchedVendors: scoredMatches.map((m) => ({
			companyId: m.company.id,
			companyName: m.company.name,
			companySlug: m.company.slug,
			claimStatus: m.company.claimStatus,
			publicEmail: m.company.publicEmail,
			whatsappNumber: m.company.whatsappNumber,
			publicPhone: m.company.publicPhone,
		})),
	}).catch(() => null);

	return {
		ok: true as const,
		rfq: created,
		matchedCount: scoredMatches.length,
	};
}

export async function submitSupplierRfqQuote(
	submittedById: string,
	input: SubmitRfqQuoteInput
) {
	const txResult = await prisma.$transaction(async (tx) => {
		const [rfq, supplier] = await Promise.all([
			tx.rfq.findUnique({
				where: { id: input.rfqId },
				select: {
					id: true,
					referenceNumber: true,
					title: true,
					quantity: true,
					unit: true,
					status: true,
					visibility: true,
					buyerId: true,
					buyerContactEmail: true,
				},
			}),
			tx.company.findUnique({
				where: { id: input.companyId },
				select: { id: true, name: true },
			}),
		]);

		if (!rfq) {
			throw new Error('RFQ not found.');
		}

		if (
			rfq.status !== RfqStatus.OPEN &&
			rfq.status !== RfqStatus.QUOTING
		) {
			throw new Error('This RFQ is no longer accepting quotes.');
		}

		if (rfq.buyerId === submittedById) {
			throw new Error('You cannot submit a quote on your own RFQ.');
		}

		const qty = Number(rfq.quantity);
		const totalPrice = input.unitPrice * qty;
		const validUntil = new Date(
			Date.now() + input.validUntilDays * 86_400_000
		);

		const quote = await tx.rfqQuote.upsert({
			where: {
				rfqId_companyId: {
					rfqId: rfq.id,
					companyId: input.companyId,
				},
			},
			update: {
				submittedById,
				unitPrice: input.unitPrice.toFixed(4),
				totalPrice: totalPrice.toFixed(4),
				currency: input.currency.toUpperCase(),
				minimumOrderQty: input.minimumOrderQty?.toFixed(3) ?? null,
				leadTimeDays: input.leadTimeDays,
				validUntil,
				paymentTerms: input.paymentTerms,
				complianceNotes: input.complianceNotes || null,
				status: RfqQuoteStatus.SUBMITTED,
			},
			create: {
				rfqId: rfq.id,
				companyId: input.companyId,
				submittedById,
				unitPrice: input.unitPrice.toFixed(4),
				totalPrice: totalPrice.toFixed(4),
				currency: input.currency.toUpperCase(),
				minimumOrderQty: input.minimumOrderQty?.toFixed(3) ?? null,
				leadTimeDays: input.leadTimeDays,
				validUntil,
				paymentTerms: input.paymentTerms,
				complianceNotes: input.complianceNotes || null,
			},
		});

		await tx.rfqVendorMatch.upsert({
			where: {
				rfqId_companyId: {
					rfqId: rfq.id,
					companyId: input.companyId,
				},
			},
			update: { status: RfqMatchStatus.QUOTED, viewedAt: new Date() },
			create: {
				rfqId: rfq.id,
				companyId: input.companyId,
				status: RfqMatchStatus.QUOTED,
				matchScore: 90,
				matchReason: 'Public tender board quote submission',
				viewedAt: new Date(),
			},
		});

		if (rfq.status === RfqStatus.OPEN) {
			await tx.rfq.update({
				where: { id: rfq.id },
				data: { status: RfqStatus.QUOTING },
			});
		}

		return { quote, rfq, supplierName: supplier?.name ?? 'Verified Supplier', totalPrice };
	});

	await dispatchQuoteSubmittedAlert({
		rfqId: txResult.rfq.id,
		referenceNumber: txResult.rfq.referenceNumber,
		rfqTitle: txResult.rfq.title,
		buyerContactEmail: txResult.rfq.buyerContactEmail,
		supplierName: txResult.supplierName,
		supplierId: input.companyId,
		unitPrice: input.unitPrice,
		totalPrice: txResult.totalPrice,
		currency: input.currency.toUpperCase(),
		unit: txResult.rfq.unit,
		leadTimeDays: input.leadTimeDays,
	}).catch(() => null);

	return txResult.quote;
}

export async function decideBuyerQuoteStatus(
	buyerUserId: string,
	input: UpdateQuoteStatusInput
) {
	const result = await prisma.$transaction(async (tx) => {
		const quote = await tx.rfqQuote.findUnique({
			where: { id: input.quoteId },
			include: {
				rfq: true,
				company: { select: { id: true, name: true, publicEmail: true } },
				submittedBy: { select: { email: true } },
			},
		});

		if (!quote) {
			throw new Error('Quote not found.');
		}

		if (quote.rfq.buyerId !== buyerUserId) {
			throw new Error(
				'Only the RFQ buyer can shortlist, award, or reject quotes.'
			);
		}

		const updated = await tx.rfqQuote.update({
			where: { id: quote.id },
			data: { status: input.decision },
		});

		if (input.decision === RfqQuoteStatus.ACCEPTED) {
			await tx.rfq.update({
				where: { id: quote.rfqId },
				data: { status: RfqStatus.AWARDED },
			});

			// Reject remaining non-accepted quotes automatically on award
			await tx.rfqQuote.updateMany({
				where: {
					rfqId: quote.rfqId,
					id: { not: quote.id },
					status: {
						in: [
							RfqQuoteStatus.SUBMITTED,
							RfqQuoteStatus.SHORTLISTED,
						],
					},
				},
				data: { status: RfqQuoteStatus.REJECTED },
			});
		}

		return { updated, quote };
	});

	await refreshPlatformStatsCache().catch(() => null);

	if (input.decision === RfqQuoteStatus.ACCEPTED) {
		const recipientEmail =
			result.quote.company.publicEmail || result.quote.submittedBy.email;
		await dispatchQuoteAwardedAlert({
			rfqId: result.quote.rfqId,
			referenceNumber: result.quote.rfq.referenceNumber,
			rfqTitle: result.quote.rfq.title,
			buyerCompanyName: result.quote.rfq.buyerCompanyName,
			buyerContactName: result.quote.rfq.buyerContactName,
			buyerContactEmail: result.quote.rfq.buyerContactEmail,
			buyerContactPhone: result.quote.rfq.buyerContactPhone,
			supplierId: result.quote.company.id,
			supplierName: result.quote.company.name,
			supplierEmail: recipientEmail,
			totalPrice: Number(result.quote.totalPrice),
			currency: result.quote.currency,
		}).catch(() => null);
	}

	return result.updated;
}

