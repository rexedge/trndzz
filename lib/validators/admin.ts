import { z } from 'zod';

/**
 * Validation schemas for admin operations
 */

export const loginSchema = z.object({
	password: z.string().min(1, 'Password is required'),
});

export const generatePostSchema = z.object({
	trendId: z.string().min(1, 'Trend ID is required'),
	trendTitle: z.string().min(1, 'Trend title is required'),
	performResearch: z.boolean().optional().default(true),
	relatedQueries: z.array(z.string()).optional(),
});

export const publishPostSchema = z.object({
	postId: z.string().min(1, 'Post ID is required'),
	scheduledAt: z.string().optional(),
});

export const updatePostSchema = z.object({
	postId: z.string().min(1, 'Post ID is required'),
	title: z.string().min(1, 'Title is required').optional(),
	content: z.string().min(1, 'Content is required').optional(),
	excerpt: z.string().optional(),
	metaDescription: z.string().optional(),
	tags: z.array(z.string()).optional(),
	status: z.enum(['draft', 'published', 'scheduled']).optional(),
});

export const deletePostSchema = z.object({
	postId: z.string().min(1, 'Post ID is required'),
});

export const saveTrendSchema = z.object({
	provider: z.string().default('google'),
	identifier: z.string().min(1, 'Identifier is required'),
	title: z.string().min(1, 'Title is required'),
	metadata: z.any().optional(),
});

// CSV-based trend creation
export const createTrendFromCSVSchema = z.object({
	csvContent: z.string().min(1, 'CSV content is required'),
});

// Generate from CSV workflow
export const generateFromCSVSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	relatedQueries: z
		.array(z.string())
		.min(1, 'At least one related query is required'),
	metadata: z.any().optional(),
});

// Add images to post
export const addImageToPostSchema = z.object({
	postId: z.string().min(1, 'Post ID is required'),
	url: z.string().url('Valid image URL is required'),
	alt: z.string().optional(),
	caption: z.string().optional(),
	credit: z.string().optional(),
	order: z.number().int().min(0).optional(),
});

// Remove image from post
export const removeImageFromPostSchema = z.object({
	imageId: z.string().min(1, 'Image ID is required'),
});

// Update post content
export const updatePostContentSchema = z.object({
	postId: z.string().min(1, 'Post ID is required'),
	title: z.string().optional(),
	content: z.string().optional(),
	excerpt: z.string().optional(),
	tags: z.array(z.string()).optional(),
	metaDescription: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type GeneratePostInput = z.infer<typeof generatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type DeletePostInput = z.infer<typeof deletePostSchema>;
export type SaveTrendInput = z.infer<typeof saveTrendSchema>;
export type CreateTrendFromCSVInput = z.infer<typeof createTrendFromCSVSchema>;
export type GenerateFromCSVInput = z.infer<typeof generateFromCSVSchema>;
export type AddImageToPostInput = z.infer<typeof addImageToPostSchema>;
export type RemoveImageFromPostInput = z.infer<
	typeof removeImageFromPostSchema
>;
export type UpdatePostContentInput = z.infer<typeof updatePostContentSchema>;
