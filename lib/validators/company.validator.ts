import { z } from 'zod';
import {
	BusinessRole,
	ClaimRequestStatus,
	StreamPosition,
	VerificationTier,
} from '@prisma/client';

export const BUSINESS_ROLE_VALUES = [
	BusinessRole.MANUFACTURER,
	BusinessRole.IMPORTER,
	BusinessRole.PROCESSOR_EXTRUDER,
	BusinessRole.DISTRIBUTOR,
	BusinessRole.FABRICATOR_INSTALLER,
	BusinessRole.EQUIPMENT_SUPPLIER,
	BusinessRole.SERVICE_PROVIDER,
] as const;

export const STREAM_POSITION_VALUES = [
	StreamPosition.UPSTREAM,
	StreamPosition.MIDSTREAM,
	StreamPosition.DOWNSTREAM,
	StreamPosition.CROSS_STREAM,
] as const;

export const seedCompanySchema = z.object({
	name: z.string().trim().min(2, 'Company name is required').max(160),
	slug: z
		.string()
		.trim()
		.min(3)
		.max(160)
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Use lowercase letters, numbers, and hyphens'
		),
	verticalId: z.string().min(1, 'Select primary vertical'),
	categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
	streamPositions: z
		.array(z.enum(STREAM_POSITION_VALUES))
		.min(1, 'Select at least one value-chain stage'),
	businessRoles: z
		.array(z.enum(BUSINESS_ROLE_VALUES))
		.min(1, 'Select at least one business role'),
	tagline: z.string().trim().max(220).optional().or(z.literal('')),
	description: z.string().trim().max(2500).optional().or(z.literal('')),
	headquartersState: z.string().trim().min(2, 'State is required').max(60),
	city: z.string().trim().max(80).optional().or(z.literal('')),
	coverageStatesCsv: z
		.string()
		.trim()
		.min(2, 'Enter at least one state covered (comma-separated)'),
	productionCapacity: z.string().trim().max(140).optional().or(z.literal('')),
	minimumOrderSummary: z.string().trim().max(140).optional().or(z.literal('')),
	publicEmail: z
		.string()
		.trim()
		.email('Invalid email')
		.optional()
		.or(z.literal('')),
	publicPhone: z.string().trim().max(40).optional().or(z.literal('')),
	websiteUrl: z.string().trim().url('Invalid URL').optional().or(z.literal('')),
	rcNumber: z.string().trim().max(40).optional().or(z.literal('')),
	verificationTier: z
		.enum([
			VerificationTier.UNVERIFIED,
			VerificationTier.VERIFIED,
			VerificationTier.VERIFIED_PRO,
			VerificationTier.ENTERPRISE_SPONSOR,
		])
		.default(VerificationTier.UNVERIFIED),
});

export const updateVendorProfileSchema = z.object({
	companyId: z.string().min(1),
	tagline: z.string().trim().max(220).optional().or(z.literal('')),
	description: z.string().trim().max(3000).optional().or(z.literal('')),
	city: z.string().trim().max(80).optional().or(z.literal('')),
	address: z.string().trim().max(300).optional().or(z.literal('')),
	coverageStatesCsv: z.string().trim().min(2, 'Enter covered states'),
	productionCapacity: z.string().trim().max(140).optional().or(z.literal('')),
	minimumOrderSummary: z.string().trim().max(140).optional().or(z.literal('')),
	publicEmail: z
		.string()
		.trim()
		.email('Invalid email')
		.optional()
		.or(z.literal('')),
	publicPhone: z.string().trim().max(40).optional().or(z.literal('')),
	whatsappNumber: z.string().trim().max(40).optional().or(z.literal('')),
	websiteUrl: z.string().trim().url('Invalid URL').optional().or(z.literal('')),
});

export const createCompanyProductSchema = z.object({
	companyId: z.string().min(1),
	verticalId: z.string().min(1),
	categoryId: z.string().min(1, 'Select product category'),
	name: z.string().trim().min(4, 'Product title is required').max(160),
	description: z.string().trim().max(1500).optional().or(z.literal('')),
	unit: z.string().trim().min(1, 'Unit is required').max(20),
	minOrderQty: z.coerce.number().positive().optional(),
	indicativeMin: z.coerce.number().positive().optional(),
	indicativeMax: z.coerce.number().positive().optional(),
	currency: z.string().trim().length(3).default('NGN'),
	datasheetUrl: z
		.string()
		.trim()
		.refine(
			(v) => !v || v.startsWith('/') || /^https?:\/\//i.test(v),
			'Enter a valid datasheet URL or /api/documents/... path'
		)
		.optional()
		.or(z.literal('')),
	specifications: z.record(z.string(), z.string()).default({}),
});

export const submitCompanyClaimSchema = z.object({
	companyId: z.string().min(1),
	workEmail: z.string().trim().email('Enter an official corporate email'),
	phone: z
		.string()
		.trim()
		.min(7, 'Enter a valid direct phone number')
		.max(30),
	jobTitle: z
		.string()
		.trim()
		.min(2, 'Enter your executive or commercial title')
		.max(100),
	rcNumber: z
		.string()
		.trim()
		.min(3, 'Enter CAC Registration Number (e.g., RC-123456)')
		.max(50),
	proofDocumentUrl: z
		.string()
		.trim()
		.url('Enter a valid document URL')
		.optional()
		.or(z.literal('')),
	message: z
		.string()
		.trim()
		.min(15, 'Briefly describe your authorization to claim this listing')
		.max(1000),
});

export const reviewCompanyClaimSchema = z.object({
	claimRequestId: z.string().min(1),
	decision: z.enum([
		ClaimRequestStatus.APPROVED,
		ClaimRequestStatus.REJECTED,
	]),
	verificationTier: z
		.enum([
			VerificationTier.UNVERIFIED,
			VerificationTier.VERIFIED,
			VerificationTier.VERIFIED_PRO,
			VerificationTier.ENTERPRISE_SPONSOR,
		])
		.default(VerificationTier.VERIFIED),
	reviewNote: z.string().trim().max(500).optional().or(z.literal('')),
});

export type SeedCompanyInput = z.infer<typeof seedCompanySchema>;
export type UpdateVendorProfileInput = z.infer<
	typeof updateVendorProfileSchema
>;
export type CreateCompanyProductInput = z.infer<
	typeof createCompanyProductSchema
>;
export type SubmitCompanyClaimInput = z.infer<typeof submitCompanyClaimSchema>;
export type ReviewCompanyClaimInput = z.infer<typeof reviewCompanyClaimSchema>;

