import { z } from 'zod';
import { VerticalStatus } from '@prisma/client';

export const updateVerticalStatusSchema = z.object({
	verticalId: z.string().min(1),
	status: z.enum([
		VerticalStatus.DRAFT,
		VerticalStatus.ACTIVE,
		VerticalStatus.ARCHIVED,
	]),
});

export const createVerticalSchema = z.object({
	name: z.string().trim().min(2).max(80),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(40)
		.regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
	tagline: z.string().trim().min(10).max(200),
	description: z.string().trim().min(20).max(1500),
	themeColor: z
		.string()
		.trim()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid 6-digit hex color')
		.default('#0284C7'),
	status: z
		.enum([VerticalStatus.DRAFT, VerticalStatus.ACTIVE])
		.default(VerticalStatus.DRAFT),
});

export type UpdateVerticalStatusInput = z.infer<
	typeof updateVerticalStatusSchema
>;
export type CreateVerticalInput = z.infer<typeof createVerticalSchema>;

