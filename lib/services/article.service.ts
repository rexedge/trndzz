import 'server-only';
import {
	ArticleStatus,
	ArticleType,
	VerificationTier,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import type { CreateOrUpdateArticleInput } from '@/lib/validators/pulse.validator';

export interface ListVerticalArticlesParams {
	verticalId: string;
	stageSlug?: string;
	categorySlug?: string;
	type?: ArticleType;
	query?: string;
}

export async function listVerticalArticles(
	params: ListVerticalArticlesParams
) {
	const { verticalId, stageSlug, categorySlug, type, query } = params;

	return prisma.article.findMany({
		where: {
			verticalId,
			status: ArticleStatus.PUBLISHED,
			...(stageSlug
				? { valueChainStage: { slug: stageSlug } }
				: {}),
			...(categorySlug ? { category: { slug: categorySlug } } : {}),
			...(type ? { type } : {}),
			...(query
				? {
						OR: [
							{
								title: {
									contains: query,
									mode: 'insensitive',
								},
							},
							{
								excerpt: {
									contains: query,
									mode: 'insensitive',
								},
							},
						],
					}
				: {}),
		},
		orderBy: [{ isVerticalPinned: 'desc' }, { publishedAt: 'desc' }],
		include: {
			author: { select: { name: true, jobTitle: true } },
			valueChainStage: {
				select: { id: true, name: true, slug: true, streamPosition: true },
			},
			category: {
				select: { id: true, name: true, slug: true, defaultUnit: true },
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
							headquartersState: true,
						},
					},
				},
			},
		},
	});
}

/**
 * Retrieves a vertical article by slug, increments viewCount, and loads
 * Pillar 5 Contextual Cross-Linking data (mentioned companies, category spec definitions,
 * and fallback verified category suppliers).
 */
export async function getVerticalArticleWithContext(
	verticalId: string,
	articleSlug: string
) {
	const article = await prisma.article.findFirst({
		where: {
			verticalId,
			slug: articleSlug,
			status: ArticleStatus.PUBLISHED,
		},
		include: {
			author: { select: { name: true, jobTitle: true } },
			vertical: { select: { id: true, name: true, slug: true } },
			valueChainStage: {
				select: { id: true, name: true, slug: true, streamPosition: true },
			},
			category: {
				select: {
					id: true,
					name: true,
					slug: true,
					defaultUnit: true,
				},
			},
			companyMentions: {
				orderBy: { displayOrder: 'asc' },
				include: {
					company: {
						select: {
							id: true,
							name: true,
							slug: true,
							tagline: true,
							businessRoles: true,
							claimStatus: true,
							verificationTier: true,
							headquartersState: true,
							productionCapacity: true,
						},
					},
				},
			},
		},
	});

	if (!article) return null;

	// Increment view counter asynchronously without blocking failure
	await prisma.article
		.update({
			where: { id: article.id },
			data: { viewCount: { increment: 1 } },
		})
		.catch(() => null);

	// Load SpecAttributeDefinitions for contextual 1-click RFQ prefill
	const specDefinitions = article.categoryId
		? await prisma.specAttributeDefinition.findMany({
				where: {
					verticalId,
					OR: [
						{ categoryId: article.categoryId },
						{ categoryId: null },
					],
				},
				orderBy: { displayOrder: 'asc' },
			})
		: [];

	// Also fetch category-matched verified suppliers not already in companyMentions
	const mentionedIds = article.companyMentions.map((m) => m.company.id);
	const categorySuppliers = article.categoryId
		? await prisma.company.findMany({
				where: {
					isPublished: true,
					id: { notIn: mentionedIds },
					verticals: { some: { verticalId } },
					categories: { some: { categoryId: article.categoryId } },
					verificationTier: { not: VerificationTier.UNVERIFIED },
				},
				take: 3,
				select: {
					id: true,
					name: true,
					slug: true,
					tagline: true,
					businessRoles: true,
					claimStatus: true,
					verificationTier: true,
					headquartersState: true,
					productionCapacity: true,
				},
			})
		: [];

	const relatedArticles = await prisma.article.findMany({
		where: {
			verticalId,
			status: ArticleStatus.PUBLISHED,
			id: { not: article.id },
		},
		orderBy: { publishedAt: 'desc' },
		take: 3,
		select: {
			id: true,
			title: true,
			slug: true,
			type: true,
			publishedAt: true,
			valueChainStage: { select: { name: true, streamPosition: true } },
		},
	});

	return {
		article,
		specDefinitions,
		categorySuppliers,
		relatedArticles,
	};
}

export async function listMacroFeaturedArticles(query?: string) {
	return prisma.article.findMany({
		where: {
			status: ArticleStatus.PUBLISHED,
			OR: [{ isMacroFeatured: true }, { verticalId: null }],
			...(query
				? {
						title: { contains: query, mode: 'insensitive' },
					}
				: {}),
		},
		orderBy: { publishedAt: 'desc' },
		take: 24,
		include: {
			vertical: { select: { id: true, name: true, slug: true } },
			valueChainStage: {
				select: { name: true, slug: true, streamPosition: true },
			},
			author: { select: { name: true, jobTitle: true } },
		},
	});
}

export async function getMacroArticleBySlug(slug: string) {
	return prisma.article.findFirst({
		where: {
			slug,
			status: ArticleStatus.PUBLISHED,
		},
		include: {
			vertical: { select: { id: true, name: true, slug: true } },
			valueChainStage: {
				select: { name: true, slug: true, streamPosition: true },
			},
			category: { select: { id: true, name: true, slug: true } },
			author: { select: { name: true, jobTitle: true } },
			companyMentions: {
				orderBy: { displayOrder: 'asc' },
				include: {
					company: {
						select: {
							id: true,
							name: true,
							slug: true,
							verificationTier: true,
							headquartersState: true,
						},
					},
				},
			},
		},
	});
}

export async function listAdminArticles() {
	return prisma.article.findMany({
		orderBy: { createdAt: 'desc' },
		take: 50,
		include: {
			vertical: { select: { id: true, name: true, slug: true } },
			valueChainStage: { select: { id: true, name: true } },
			category: { select: { id: true, name: true } },
			author: { select: { name: true } },
			_count: {
				select: { companyMentions: true, attributedRfqs: true },
			},
		},
	});
}

export async function upsertArticleWithMentions(
	authorId: string,
	input: CreateOrUpdateArticleInput
) {
	const verticalId = input.verticalId || null;
	const valueChainStageId = input.valueChainStageId || null;
	const categoryId = input.categoryId || null;
	const isPublishing = input.status === ArticleStatus.PUBLISHED;

	return prisma.$transaction(async (tx) => {
		const saved = input.id
			? await tx.article.update({
					where: { id: input.id },
					data: {
						verticalId,
						valueChainStageId,
						categoryId,
						title: input.title,
						slug: input.slug,
						excerpt: input.excerpt,
						body: input.body,
						type: input.type,
						status: input.status,
						isMacroFeatured: input.isMacroFeatured,
						isVerticalPinned: input.isVerticalPinned,
						sourceName: input.sourceName || null,
						sourceUrl: input.sourceUrl || null,
						metaTitle: input.metaTitle || null,
						metaDescription: input.metaDescription || null,
						...(isPublishing ? { publishedAt: new Date() } : {}),
					},
				})
			: await tx.article.create({
					data: {
						verticalId,
						valueChainStageId,
						categoryId,
						title: input.title,
						slug: input.slug,
						excerpt: input.excerpt,
						body: input.body,
						type: input.type,
						status: input.status,
						isMacroFeatured: input.isMacroFeatured,
						isVerticalPinned: input.isVerticalPinned,
						sourceName: input.sourceName || null,
						sourceUrl: input.sourceUrl || null,
						metaTitle: input.metaTitle || null,
						metaDescription: input.metaDescription || null,
						authorId,
						publishedAt: isPublishing ? new Date() : null,
					},
				});

		await tx.articleCompanyMention.deleteMany({
			where: { articleId: saved.id },
		});

		if (input.mentionedCompanyIds.length > 0) {
			await tx.articleCompanyMention.createMany({
				data: input.mentionedCompanyIds.map((companyId, idx) => ({
					articleId: saved.id,
					companyId,
					displayOrder: idx + 1,
				})),
				skipDuplicates: true,
			});
		}

		return saved;
	});
}

