import { z } from 'zod';
import { BusinessRole, ResourceType } from '@prisma/client';
import { BUSINESS_ROLE_VALUES } from './company.validator';

export const RESOURCE_TYPE_VALUES = [
	ResourceType.WHITEPAPER,
	ResourceType.SECTOR_REPORT,
	ResourceType.REGULATORY_GUIDE,
	ResourceType.TRADE_MAGAZINE,
	ResourceType.WEBINAR,
] as const;

export const unlockResourceLeadSchema = z.object({
	resourceId: z.string().min(1, 'Resource ID is required'),
	fullName: z.string().trim().min(2, 'Enter your full name').max(120),
	workEmail: z
		.string()
		.trim()
		.email('Enter a valid corporate email address')
		.max(160),
	phone: z
		.string()
		.trim()
		.min(7, 'Enter a direct phone or WhatsApp number')
		.max(40),
	companyName: z
		.string()
		.trim()
		.min(2, 'Enter your company or organization name')
		.max(160),
	jobTitle: z
		.string()
		.trim()
		.min(2, 'Enter your job title or procurement role')
		.max(120),
	businessRole: z.enum(BUSINESS_ROLE_VALUES).optional(),
	procurementTimeline: z.string().trim().max(80).optional().or(z.literal('')),
	estimatedBudgetBand: z.string().trim().max(80).optional().or(z.literal('')),
	deliveryState: z.string().trim().max(60).optional().or(z.literal('')),
});

export const createKnowledgeResourceSchema = z.object({
	verticalId: z.string().trim().optional().or(z.literal('')),
	categoryId: z.string().trim().optional().or(z.literal('')),
	sponsorCompanyId: z.string().trim().optional().or(z.literal('')),
	title: z.string().trim().min(8, 'Title must be at least 8 characters').max(200),
	slug: z
		.string()
		.trim()
		.min(4)
		.max(180)
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Use lowercase letters, numbers, and hyphens'
		),
	summary: z
		.string()
		.trim()
		.min(20, 'Provide a concise executive summary')
		.max(600),
	contentPreview: z
		.string()
		.trim()
		.min(40, 'Provide an ungated preview excerpt')
		.max(5000),
	fullContentMarkdown: z
		.string()
		.trim()
		.min(100, 'Provide the full gated whitepaper or report body'),
	fileUrl: z
		.string()
		.trim()
		.refine(
			(v) => !v || v.startsWith('/') || /^https?:\/\//i.test(v),
			'Enter a valid PDF URL or /api/documents/... path'
		)
		.optional()
		.or(z.literal('')),
	type: z.enum(RESOURCE_TYPE_VALUES).default(ResourceType.WHITEPAPER),
	isGated: z.boolean().default(true),
	isFeatured: z.boolean().default(false),
	pageCount: z.coerce.number().int().positive().max(1000).optional(),
});

export type UnlockResourceLeadInput = z.infer<typeof unlockResourceLeadSchema>;
export type CreateKnowledgeResourceInput = z.infer<
	typeof createKnowledgeResourceSchema
>;

