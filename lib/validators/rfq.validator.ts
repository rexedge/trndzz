import { z } from 'zod';
import {
	BusinessRole,
	RfqQuoteStatus,
	RfqVisibility,
	type SpecAttributeDefinition,
} from '@prisma/client';

export const createRfqSchema = z.object({
	verticalId: z.string().min(1, 'Vertical is required'),
	categoryId: z.string().min(1, 'Select a product/material category'),
	title: z
		.string()
		.trim()
		.min(10, 'Provide a clear specification headline (min 10 characters)')
		.max(180),
	buyerCompanyName: z
		.string()
		.trim()
		.min(2, 'Buyer company name is required')
		.max(160),
	buyerContactName: z
		.string()
		.trim()
		.min(2, 'Contact person name is required')
		.max(120),
	buyerContactEmail: z
		.string()
		.trim()
		.email('Enter a valid corporate email'),
	buyerContactPhone: z
		.string()
		.trim()
		.min(7, 'Enter a valid phone / WhatsApp number')
		.max(30),
	quantity: z.coerce
		.number()
		.positive('Quantity must be greater than zero'),
	unit: z.string().trim().min(1, 'Unit is required').max(24),
	targetUnitPrice: z.preprocess(
		(val) => (val === '' || val === null || val === undefined ? undefined : val),
		z.coerce.number().positive().optional()
	),
	currency: z.string().trim().length(3).default('NGN'),
	deliveryState: z
		.string()
		.trim()
		.min(2, 'Select or enter delivery state')
		.max(60),
	deliveryCity: z.string().trim().max(80).optional().or(z.literal('')),
	requiredByDate: z.string().optional().or(z.literal('')),
	paymentTermsPreference: z
		.string()
		.trim()
		.max(160)
		.optional()
		.or(z.literal('')),
	additionalNotes: z
		.string()
		.trim()
		.max(2500)
		.optional()
		.or(z.literal('')),
	visibility: z
		.enum([
			RfqVisibility.PUBLIC_BOARD,
			RfqVisibility.VERIFIED_VENDORS_ONLY,
			RfqVisibility.INVITED_ONLY,
		])
		.default(RfqVisibility.PUBLIC_BOARD),
	preferredRoles: z
		.array(
			z.enum([
				BusinessRole.MANUFACTURER,
				BusinessRole.IMPORTER,
				BusinessRole.PROCESSOR_EXTRUDER,
				BusinessRole.DISTRIBUTOR,
				BusinessRole.FABRICATOR_INSTALLER,
				BusinessRole.EQUIPMENT_SUPPLIER,
				BusinessRole.SERVICE_PROVIDER,
			])
		)
		.default([]),
	specifications: z.record(z.string(), z.string()).default({}),
	sourceArticleId: z.string().optional().or(z.literal('')),
	targetCompanyId: z.string().optional().or(z.literal('')),
	allowPeerQuotes: z.boolean().default(true),
});

export const submitRfqQuoteSchema = z.object({
	rfqId: z.string().min(1),
	companyId: z.string().min(1, 'Select your verified supplier profile'),
	unitPrice: z.coerce
		.number()
		.positive('Unit price must be greater than zero'),
	currency: z.string().trim().length(3).default('NGN'),
	minimumOrderQty: z.preprocess(
		(val) => (val === '' || val === null || val === undefined ? undefined : val),
		z.coerce.number().positive().optional()
	),
	leadTimeDays: z.coerce
		.number()
		.int()
		.min(1, 'Enter delivery lead time in days')
		.max(365),
	validUntilDays: z.coerce.number().int().min(1).max(180).default(14),
	paymentTerms: z
		.string()
		.trim()
		.min(3, 'Specify commercial payment terms')
		.max(200),
	complianceNotes: z
		.string()
		.trim()
		.max(2000)
		.optional()
		.or(z.literal('')),
});

export const updateQuoteStatusSchema = z.object({
	quoteId: z.string().min(1),
	decision: z.enum([
		RfqQuoteStatus.SHORTLISTED,
		RfqQuoteStatus.ACCEPTED,
		RfqQuoteStatus.REJECTED,
	]),
});

/**
 * Validates dynamic JSON specification key-values against the active
 * SpecAttributeDefinition schema for the chosen Vertical + Category.
 */
export function validateDynamicSpecs(
	specs: Record<string, string>,
	definitions: Pick<
		SpecAttributeDefinition,
		'key' | 'label' | 'isRequired' | 'options' | 'inputType'
	>[]
): {
	ok: boolean;
	cleaned: Record<string, string>;
	errors: Record<string, string[]>;
} {
	const cleaned: Record<string, string> = {};
	const errors: Record<string, string[]> = {};

	for (const def of definitions) {
		const rawVal = (specs[def.key] ?? '').trim();

		if (!rawVal) {
			if (def.isRequired) {
				errors[`specifications.${def.key}`] = [
					`${def.label} is required for this category`,
				];
			}
			continue;
		}

		if (
			def.inputType === 'SELECT' &&
			def.options.length > 0 &&
			!def.options.includes(rawVal)
		) {
			errors[`specifications.${def.key}`] = [
				`Invalid ${def.label}. Allowed: ${def.options.join(', ')}`,
			];
			continue;
		}

		cleaned[def.key] = rawVal;
	}

	return {
		ok: Object.keys(errors).length === 0,
		cleaned,
		errors,
	};
}

export type CreateRfqInput = z.infer<typeof createRfqSchema>;
export type SubmitRfqQuoteInput = z.infer<typeof submitRfqQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;

