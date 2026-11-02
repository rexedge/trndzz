import { z } from 'zod';
import { ArticleStatus, ArticleType } from '@prisma/client';

export const createOrUpdateArticleSchema = z.object({
	id: z.string().optional(),
	verticalId: z.string().optional().or(z.literal('')),
	valueChainStageId: z.string().optional().or(z.literal('')),
	categoryId: z.string().optional().or(z.literal('')),
	title: z
		.string()
		.trim()
		.min(10, 'Headline must be at least 10 characters')
		.max(200, 'Headline is too long'),
	slug: z
		.string()
		.trim()
		.min(5, 'Slug must be at least 5 characters')
		.max(200)
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Slug must contain lowercase letters, numbers, and hyphens only'
		),
	excerpt: z
		.string()
		.trim()
		.min(20, 'Excerpt must be at least 20 characters')
		.max(500, 'Excerpt must be 500 characters or fewer'),
	body: z
		.string()
		.trim()
		.min(80, 'Article body must be at least 80 characters'),
	type: z.enum([
		ArticleType.NEWS,
		ArticleType.MARKET_BRIEF,
		ArticleType.PRICE_ANALYSIS,
		ArticleType.POLICY_REGULATORY,
		ArticleType.EXECUTIVE_INTERVIEW,
	]),
	status: z.enum([
		ArticleStatus.DRAFT,
		ArticleStatus.IN_REVIEW,
		ArticleStatus.PUBLISHED,
		ArticleStatus.ARCHIVED,
	]),
	isMacroFeatured: z.boolean().default(false),
	isVerticalPinned: z.boolean().default(false),
	sourceName: z.string().trim().max(120).optional().or(z.literal('')),
	sourceUrl: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
	metaTitle: z.string().trim().max(160).optional().or(z.literal('')),
	metaDescription: z.string().trim().max(300).optional().or(z.literal('')),
	mentionedCompanyIds: z.array(z.string()).default([]),
});

export const updateCommodityPriceSchema = z.object({
	indicatorId: z.string().min(1, 'Select an indicator'),
	newPrice: z.coerce
		.number()
		.positive('Price must be greater than zero'),
	note: z.string().trim().max(240).optional().or(z.literal('')),
});

export const createCommodityIndicatorSchema = z.object({
	verticalId: z.string().optional().or(z.literal('')),
	code: z
		.string()
		.trim()
		.min(3)
		.max(40)
		.regex(/^[A-Z0-9_]+$/, 'Use uppercase letters, numbers, and underscores'),
	name: z.string().trim().min(3).max(120),
	unit: z.string().trim().min(1).max(20),
	currency: z.string().trim().length(3).default('NGN'),
	latestPrice: z.coerce.number().positive(),
	sourceLabel: z.string().trim().max(100).optional().or(z.literal('')),
});

export type CreateOrUpdateArticleInput = z.infer<
	typeof createOrUpdateArticleSchema
>;
export type UpdateCommodityPriceInput = z.infer<
	typeof updateCommodityPriceSchema
>;
export type CreateCommodityIndicatorInput = z.infer<
	typeof createCommodityIndicatorSchema
>;

