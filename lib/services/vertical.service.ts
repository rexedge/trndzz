import 'server-only';
import {
	ArticleStatus,
	RfqStatus,
	StreamPosition,
	VerticalStatus,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { refreshPlatformStatsCache } from '@/lib/services/stats.service';
import type { CreateVerticalInput } from '@/lib/validators/vertical.validator';

export interface SerializedIndicator {
	id: string;
	code: string;
	name: string;
	unit: string;
	currency: string;
	latestPrice: number;
	previousPrice: number | null;
	changePercent: number | null;
	sourceLabel: string | null;
}

/**
 * Fetches all verticals for the Macro Hub (trndzz.com), including active portals and upcoming drafts.
 */
export async function listAllVerticals() {
	try {
		return await prisma.vertical.findMany({
			where: {
				status: { in: [VerticalStatus.ACTIVE, VerticalStatus.DRAFT] },
			},
			orderBy: { displayOrder: 'asc' },
			include: {
				_count: {
					select: {
						companies: true,
						articles: true,
						rfqs: true,
					},
				},
			},
		});
	} catch {
		return [];
	}
}

/**
 * Resolves a single Vertical tenant by subdomain slug (e.g., "aluminium").
 */
export async function getVerticalTenantBySlug(
	slug: string,
	options?: { allowDraft?: boolean }
) {
	try {
		const vertical = await prisma.vertical.findUnique({
			where: { slug: slug.toLowerCase() },
			include: {
				valueChainStages: {
					orderBy: { displayOrder: 'asc' },
				},
				categories: {
					orderBy: { displayOrder: 'asc' },
				},
			},
		});

		if (!vertical) return null;
		if (
			vertical.status !== VerticalStatus.ACTIVE &&
			!options?.allowDraft
		) {
			return null;
		}
		return vertical;
	} catch {
		return null;
	}
}

/**
 * Fetches serialized commodity & FX indicators for either the Macro Hub or a specific Vertical.
 */
export async function getTickerIndicators(
	verticalId?: string
): Promise<SerializedIndicator[]> {
	try {
		const rows = await prisma.commodityIndicator.findMany({
			where: {
				isActive: true,
				...(verticalId
					? { OR: [{ verticalId }, { verticalId: null }] }
					: {}),
			},
			orderBy: [{ verticalId: 'desc' }, { displayOrder: 'asc' }],
			take: 8,
		});

		return rows.map((row) => ({
			id: row.id,
			code: row.code,
			name: row.name,
			unit: row.unit,
			currency: row.currency,
			latestPrice: Number(row.latestPrice),
			previousPrice:
				row.previousPrice !== null ? Number(row.previousPrice) : null,
			changePercent:
				row.changePercent !== null ? Number(row.changePercent) : null,
			sourceLabel: row.sourceLabel,
		}));
	} catch {
		return [];
	}
}

/**
 * Fetches the complete overview payload for the Macro Hub (trndzz.com).
 */
export async function getMacroHubOverview() {
	try {
		const [verticals, indicators, featuredArticles, recentRfqs] =
			await Promise.all([
				listAllVerticals(),
				getTickerIndicators(),
				prisma.article.findMany({
					where: {
						status: ArticleStatus.PUBLISHED,
						isMacroFeatured: true,
					},
					orderBy: { publishedAt: 'desc' },
					take: 6,
					include: {
						vertical: {
							select: { name: true, slug: true, themeColor: true },
						},
						valueChainStage: {
							select: { name: true, slug: true, streamPosition: true },
						},
					},
				}),
				prisma.rfq.findMany({
					where: {
						status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] },
					},
					orderBy: { createdAt: 'desc' },
					take: 5,
					include: {
						vertical: { select: { name: true, slug: true } },
						category: { select: { name: true, slug: true } },
						_count: { select: { quotes: true, matches: true } },
					},
				}),
			]);

		return {
			verticals,
			indicators,
			featuredArticles,
			recentRfqs: recentRfqs.map((r) => ({
				id: r.id,
				referenceNumber: r.referenceNumber,
				title: r.title,
				quantity: Number(r.quantity),
				unit: r.unit,
				deliveryState: r.deliveryState,
				verticalName: r.vertical.name,
				verticalSlug: r.vertical.slug,
				categoryName: r.category.name,
				quotesCount: r._count.quotes,
				matchesCount: r._count.matches,
				createdAt: r.createdAt,
			})),
		};
	} catch {
		return {
			verticals: [],
			indicators: [],
			featuredArticles: [],
			recentRfqs: [],
		};
	}
}

/**
 * Fetches the complete portal home payload strictly scoped to a single Vertical ID.
 */
export async function getVerticalHomeOverview(verticalId: string) {
	try {
		const [indicators, articles, companies, openRfqs] = await Promise.all([
			getTickerIndicators(verticalId),
			prisma.article.findMany({
				where: {
					verticalId,
					status: ArticleStatus.PUBLISHED,
				},
				orderBy: [{ isVerticalPinned: 'desc' }, { publishedAt: 'desc' }],
				take: 6,
				include: {
					valueChainStage: {
						select: {
							id: true,
							name: true,
							slug: true,
							streamPosition: true,
						},
					},
					category: {
						select: { id: true, name: true, slug: true },
					},
					companyMentions: {
						orderBy: { displayOrder: 'asc' },
						include: {
							company: {
								select: {
									id: true,
									name: true,
									slug: true,
									verificationTier: true,
									claimStatus: true,
								},
							},
						},
					},
				},
			}),
			prisma.company.findMany({
				where: {
					isPublished: true,
					verticals: {
						some: { verticalId },
					},
				},
				orderBy: [
					{ verificationTier: 'desc' },
					{ claimStatus: 'desc' },
					{ createdAt: 'desc' },
				],
				take: 6,
				include: {
					certifications: {
						where: { isVerified: true },
						take: 2,
					},
					verticals: {
						where: { verticalId },
						select: { streamPositions: true },
					},
				},
			}),
			prisma.rfq.findMany({
				where: {
					verticalId,
					status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] },
				},
				orderBy: { createdAt: 'desc' },
				take: 5,
				include: {
					category: { select: { name: true, slug: true } },
					_count: { select: { quotes: true, matches: true } },
				},
			}),
		]);

		return {
			indicators,
			articles,
			companies,
			openRfqs: openRfqs.map((r) => ({
				id: r.id,
				referenceNumber: r.referenceNumber,
				title: r.title,
				quantity: Number(r.quantity),
				unit: r.unit,
				deliveryState: r.deliveryState,
				deliveryCity: r.deliveryCity,
				specifications:
					(r.specifications as Record<string, string>) ?? {},
				categoryName: r.category.name,
				quotesCount: r._count.quotes,
				matchesCount: r._count.matches,
				createdAt: r.createdAt,
			})),
		};
	} catch {
		return {
			indicators: [],
			articles: [],
			companies: [],
			openRfqs: [],
		};
	}
}

export async function setVerticalStatus(
	verticalId: string,
	status: VerticalStatus
) {
	const updated = await prisma.vertical.update({
		where: { id: verticalId },
		data: { status },
	});
	await refreshPlatformStatsCache().catch(() => null);
	return updated;
}

export async function createVerticalWithDefaultStages(
	input: CreateVerticalInput
) {
	const count = await prisma.vertical.count();

	const created = await prisma.$transaction(async (tx) => {
		const vertical = await tx.vertical.create({
			data: {
				name: input.name,
				slug: input.slug.toLowerCase(),
				tagline: input.tagline,
				description: input.description,
				themeColor: input.themeColor,
				status: input.status,
				displayOrder: count + 1,
			},
		});

		await tx.valueChainStage.createMany({
			data: [
				{
					verticalId: vertical.id,
					name: `Upstream: Raw Materials & Primary Supply`,
					slug: 'upstream',
					streamPosition: StreamPosition.UPSTREAM,
					displayOrder: 1,
				},
				{
					verticalId: vertical.id,
					name: `Midstream: Processing & Manufacturing`,
					slug: 'midstream',
					streamPosition: StreamPosition.MIDSTREAM,
					displayOrder: 2,
				},
				{
					verticalId: vertical.id,
					name: `Downstream: Fabrication, Distribution & EPC`,
					slug: 'downstream',
					streamPosition: StreamPosition.DOWNSTREAM,
					displayOrder: 3,
				},
				{
					verticalId: vertical.id,
					name: `Cross-Stream: Equipment, Testing & Logistics`,
					slug: 'cross-stream',
					streamPosition: StreamPosition.CROSS_STREAM,
					displayOrder: 4,
				},
			],
		});

		return vertical;
	});

	await refreshPlatformStatsCache().catch(() => null);
	return created;
}

