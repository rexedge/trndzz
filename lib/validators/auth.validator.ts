import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().trim().email('Enter a valid work or business email'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Full name must be at least 2 characters')
		.max(100, 'Name is too long'),
	email: z.string().trim().email('Enter a valid work email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password is too long'),
	companyName: z
		.string()
		.trim()
		.min(2, 'Enter your company or organization name')
		.max(140, 'Company name is too long'),
	jobTitle: z
		.string()
		.trim()
		.max(100, 'Job title is too long')
		.optional()
		.or(z.literal('')),
	phone: z
		.string()
		.trim()
		.max(30, 'Phone number is too long')
		.optional()
		.or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

