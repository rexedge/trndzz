'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import {
	createSessionToken,
	verifySessionToken,
	setSessionCookie,
	clearSessionCookie,
	getTokenFromCookies,
} from '@/lib/auth/session';
import {
	performWebResearch,
	performMultiQueryResearch,
} from '@/lib/services/webResearch';
import { generateArticleContent } from '@/lib/services/contentGeneration';
import { fetchImageFromPrompt } from '@/lib/services/imageService';
import {
	loginSchema,
	generatePostSchema,
	publishPostSchema,
	updatePostSchema,
	deletePostSchema,
	saveTrendSchema,
	type LoginInput,
	type GeneratePostInput,
	type PublishPostInput,
	type UpdatePostInput,
	type DeletePostInput,
	type SaveTrendInput,
} from '@/lib/validators/admin';

/**
 * Standard Server Action Response
 * All Server Actions MUST return this structure
 */
type ActionResponse<T = unknown> = {
	success: boolean;
	message: string;
	data?: T;
	errors?: unknown;
};

// Helper functions
function unauthorized<T = unknown>(): ActionResponse<T> {
	return { success: false, message: 'Unauthorized' };
}

function validationError<T = unknown>(errors: unknown): ActionResponse<T> {
	return { success: false, message: 'Invalid input', errors };
}

async function getSessionValid() {
	const token = await getTokenFromCookies();
	return await verifySessionToken(token);
}

/**
 * LOGIN ACTION
 * Authenticates admin user and sets session cookie
 */
export async function loginAction(input: LoginInput): Promise<ActionResponse> {
	const parsed = loginSchema.safeParse(input);
	if (!parsed.success) return validationError(parsed.error.flatten());

	const password = parsed.data.password;
	if (password !== process.env.ADMIN_PASSWORD) {
		return { success: false, message: 'Invalid credentials' };
	}

	const token = await createSessionToken({ role: 'admin' });
	await setSessionCookie(token);
	return { success: true, message: 'Signed in' };
}

/**
 * LOGOUT ACTION
 * Clears admin session
 */
export async function logoutAction(): Promise<ActionResponse> {
	await clearSessionCookie();
	return { success: true, message: 'Signed out' };
}

/**
 * LOAD ADMIN DATA ACTION
 * Fetches existing drafts for the dashboard
 * CSV-based workflow - no automatic trend fetching
 */
export async function loadAdminDataAction(): Promise<
	ActionResponse<{
		drafts: {
			id: string;
			title: string;
			slug: string;
			createdAt: string;
			tags: string[];
			status: string;
		}[];
	}>
> {
	if (!(await getSessionValid())) return unauthorized();

	try {
		// Fetch existing drafts
		const draftsRaw = await prisma.post.findMany({
			where: { status: { in: ['draft', 'scheduled'] } },
			orderBy: { createdAt: 'desc' },
			take: 50,
		});

		const drafts = draftsRaw.map((d) => ({
			id: d.id,
			title: d.title,
			slug: d.slug,
			tags: d.tags,
			status: d.status,
			createdAt: d.createdAt.toISOString(),
		}));

		return {
			success: true,
			message: 'Loaded admin data',
			data: { drafts },
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to load data',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * GENERATE DRAFT ACTION
 * Creates a new draft post from a trend using:
 * 1. Web research (optional)
 * 2. Content generation
 * 3. Image fetching
 */
export async function generateDraftAction(
	input: GeneratePostInput
): Promise<ActionResponse> {
	const parsed = generatePostSchema.safeParse(input);
	if (!parsed.success) return validationError(parsed.error.flatten());
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { trendId, trendTitle, performResearch, relatedQueries } =
			parsed.data;

		// Fetch trend from database
		const trend = await prisma.trend.findUnique({
			where: { id: trendId },
		});

		if (!trend) {
			return { success: false, message: 'Trend not found' };
		}

		let researchData = undefined;

		// Perform web research if requested
		if (performResearch) {
			const queries =
				relatedQueries && relatedQueries.length > 0
					? relatedQueries
					: [trend.title];

			const researchResult =
				queries.length > 1
					? await performMultiQueryResearch(queries, trend.title)
					: await performWebResearch(trend.title);

			if (researchResult.success) {
				researchData = researchResult.data;
			}
		}

		// Generate article content
		const contentResult = await generateArticleContent({
			trendTitle: trend.title,
			researchData,
			tone: 'neutral, informative',
			targetWords: 1200,
			context: 'Nigerian and African perspective',
		});

		if (!contentResult.success || !contentResult.data) {
			return {
				success: false,
				message: contentResult.message,
				errors: contentResult.errors,
			};
		}

		const { title, slug, content, excerpt, tags, featuredImagePrompt } =
			contentResult.data;

		// Fetch featured image
		let featuredImageUrl = null;
		let featuredImageAlt = null;
		let featuredImageCredit = null;

		if (featuredImagePrompt) {
			const imageResult = await fetchImageFromPrompt(featuredImagePrompt);
			if (imageResult.success && imageResult.data) {
				featuredImageUrl = imageResult.data.url;
				featuredImageAlt = imageResult.data.alt;
				featuredImageCredit = imageResult.data.credit;
			}
		}

		// Create draft post
		const post = await prisma.post.create({
			data: {
				title,
				slug: await generateUniqueSlug(slug),
				content,
				excerpt,
				tags,
				featuredImagePrompt,
				status: 'draft',
				generatedFromTrendId: trend.id,
			},
		});

		return {
			success: true,
			message: 'Draft generated successfully',
			data: {
				id: post.id,
				title: post.title,
				slug: post.slug,
				tags: post.tags,
				status: post.status,
				createdAt: post.createdAt.toISOString(),
				featuredImage: featuredImageUrl
					? {
							url: featuredImageUrl,
							alt: featuredImageAlt,
							credit: featuredImageCredit,
					  }
					: null,
			},
		};
	} catch (error) {
		console.error('Generate draft error:', error);
		return {
			success: false,
			message: 'Failed to generate draft',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * PUBLISH POST ACTION
 * Publishes a draft post
 */
export async function publishPostAction(
	input: PublishPostInput
): Promise<ActionResponse> {
	const parsed = publishPostSchema.safeParse(input);
	if (!parsed.success) return validationError(parsed.error.flatten());
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { postId, scheduledAt } = parsed.data;

		const updateData: any = {
			status: scheduledAt ? 'scheduled' : 'published',
		};

		if (scheduledAt) {
			updateData.scheduledAt = new Date(scheduledAt);
		} else {
			updateData.publishedAt = new Date();
		}

		const post = await prisma.post.update({
			where: { id: postId },
			data: updateData,
		});

		// Revalidate paths
		revalidatePath('/');
		revalidatePath('/posts');
		revalidatePath(`/posts/${post.slug}`);

		return {
			success: true,
			message: scheduledAt ? 'Post scheduled' : 'Post published',
			data: {
				id: post.id,
				slug: post.slug,
				title: post.title,
				status: post.status,
			},
		};
	} catch (error) {
		console.error('Publish post error:', error);
		return {
			success: false,
			message: 'Failed to publish post',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * UPDATE POST ACTION
 * Updates an existing post
 */
export async function updatePostAction(
	input: UpdatePostInput
): Promise<ActionResponse> {
	const parsed = updatePostSchema.safeParse(input);
	if (!parsed.success) return validationError(parsed.error.flatten());
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { postId, ...updates } = parsed.data;

		const post = await prisma.post.update({
			where: { id: postId },
			data: updates,
		});

		// Revalidate paths
		revalidatePath('/');
		revalidatePath('/admin');
		revalidatePath('/admin/posts');
		revalidatePath('/admin/drafts');
		revalidatePath(`/posts/${post.slug}`);
		revalidatePath(`/admin/posts/${post.id}`);
		revalidatePath(`/admin/drafts/${post.id}`);

		return {
			success: true,
			message: 'Post updated',
			data: {
				id: post.id,
				slug: post.slug,
				title: post.title,
				status: post.status,
			},
		};
	} catch (error) {
		console.error('Update post error:', error);
		return {
			success: false,
			message: 'Failed to update post',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * DELETE POST ACTION
 * Deletes a post
 */
export async function deletePostAction(
	input: DeletePostInput
): Promise<ActionResponse> {
	const parsed = deletePostSchema.safeParse(input);
	if (!parsed.success) return validationError(parsed.error.flatten());
	if (!(await getSessionValid())) return unauthorized();

	try {
		await prisma.post.delete({
			where: { id: parsed.data.postId },
		});

		revalidatePath('/');
		revalidatePath('/admin');

		return {
			success: true,
			message: 'Post deleted',
		};
	} catch (error) {
		console.error('Delete post error:', error);
		return {
			success: false,
			message: 'Failed to delete post',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * SAVE TREND ACTION
 * Manually saves a trend to the database
 */
export async function saveTrendAction(
	input: SaveTrendInput
): Promise<ActionResponse> {
	const parsed = saveTrendSchema.safeParse(input);
	if (!parsed.success) return validationError(parsed.error.flatten());
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { provider, identifier, title, metadata } = parsed.data;

		const trend = await prisma.trend.upsert({
			where: {
				provider_identifier: {
					provider,
					identifier,
				},
			},
			create: {
				provider,
				identifier,
				title,
				metadata,
			},
			update: {
				title,
				metadata,
				fetchedAt: new Date(),
			},
		});

		return {
			success: true,
			message: 'Trend saved',
			data: {
				id: trend.id,
				title: trend.title,
			},
		};
	} catch (error) {
		console.error('Save trend error:', error);
		return {
			success: false,
			message: 'Failed to save trend',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

// Helper function to generate unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existing = await prisma.post.findUnique({
			where: { slug },
		});

		if (!existing) {
			return slug;
		}

		slug = `${baseSlug}-${counter}`;
		counter++;
	}
}

/**
 * GENERATE FROM CSV ACTION
 * Creates a draft post from manually researched CSV data
 * This is the new workflow for manual research
 */
export async function generateFromCSVAction(input: {
	title: string;
	relatedQueries: string[];
	metadata?: any;
}): Promise<ActionResponse> {
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { title, relatedQueries, metadata } = input;

		if (!title || !relatedQueries || relatedQueries.length === 0) {
			return {
				success: false,
				message: 'Title and related queries are required',
			};
		}

		// Create or find trend
		const identifier = `csv-${Date.now()}`;
		const trend = await prisma.trend.create({
			data: {
				provider: 'csv-upload',
				identifier,
				title,
				metadata: metadata || {},
				fetchedAt: new Date(),
			},
		});

		// Perform web research using the related queries
		let researchData = undefined;
		const researchResult = await performMultiQueryResearch(
			relatedQueries.slice(0, 10), // Limit to top 10 queries
			title
		);

		if (researchResult.success) {
			researchData = researchResult.data;
		}

		// Generate article content
		const contentResult = await generateArticleContent({
			trendTitle: title,
			researchData,
			tone: 'neutral, informative',
			targetWords: 1200,
			context: 'Nigerian and African perspective',
		});

		if (!contentResult.success || !contentResult.data) {
			return {
				success: false,
				message: 'Failed to generate content',
				errors: contentResult.errors,
			};
		}

		const {
			title: generatedTitle,
			content,
			excerpt,
			tags,
			slug,
		} = contentResult.data;

		// Generate unique slug
		const uniqueSlug = await generateUniqueSlug(slug);

		// Create draft post (without auto-fetching image - user will add manually)
		const post = await prisma.post.create({
			data: {
				title: generatedTitle || title,
				slug: uniqueSlug,
				content,
				excerpt,
				tags: tags || [],
				relatedQueries: relatedQueries || [], // Store related queries for SEO
				status: 'draft',
				generatedFromTrendId: trend.id,
			},
		});

		revalidatePath('/admin');

		return {
			success: true,
			message:
				'Draft generated successfully. Add images before publishing.',
			data: {
				id: post.id,
				title: post.title,
				slug: post.slug,
				createdAt: post.createdAt.toISOString(),
				tags: post.tags,
				status: post.status,
			},
		};
	} catch (error) {
		console.error('Generate from CSV error:', error);
		return {
			success: false,
			message: 'Failed to generate draft',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * ADD IMAGE TO POST ACTION
 * Adds an uploaded image to a post
 */
export async function addImageToPostAction(input: {
	postId: string;
	url: string;
	alt?: string;
	caption?: string;
	credit?: string;
	order?: number;
}): Promise<ActionResponse> {
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { postId, url, alt, caption, credit, order } = input;

		// Verify post exists
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: { images: true },
		});

		if (!post) {
			return { success: false, message: 'Post not found' };
		}

		// Check image limit (max 5)
		if (post.images.length >= 5) {
			return { success: false, message: 'Maximum 5 images per post' };
		}

		// Add image
		const image = await prisma.postImage.create({
			data: {
				postId,
				url,
				alt: alt || '',
				caption: caption || '',
				credit: credit || '',
				order: order ?? post.images.length,
			},
		});

		// If this is the first image, set it as featured image
		if (post.images.length === 0) {
			await prisma.post.update({
				where: { id: postId },
				data: {
					featuredImageUrl: url,
					featuredImageAlt: alt || '',
					featuredImageCredit: credit || '',
				},
			});
		}

		revalidatePath('/admin');

		return {
			success: true,
			message: 'Image added successfully',
			data: {
				id: image.id,
				url: image.url,
				alt: image.alt,
				caption: image.caption,
				credit: image.credit,
				order: image.order,
			},
		};
	} catch (error) {
		console.error('Add image error:', error);
		return {
			success: false,
			message: 'Failed to add image',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * REMOVE IMAGE FROM POST ACTION
 * Removes an image from a post
 */
export async function removeImageFromPostAction(input: {
	imageId: string;
}): Promise<ActionResponse> {
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { imageId } = input;

		// Get image with post
		const image = await prisma.postImage.findUnique({
			where: { id: imageId },
			include: { post: { include: { images: true } } },
		});

		if (!image) {
			return { success: false, message: 'Image not found' };
		}

		// Delete image
		await prisma.postImage.delete({
			where: { id: imageId },
		});

		// If this was the featured image, update to next available or clear
		if (image.post.featuredImageUrl === image.url) {
			const remainingImages = image.post.images.filter(
				(i) => i.id !== imageId
			);
			const nextImage = remainingImages[0];

			await prisma.post.update({
				where: { id: image.postId },
				data: {
					featuredImageUrl: nextImage?.url || null,
					featuredImageAlt: nextImage?.alt || null,
					featuredImageCredit: nextImage?.credit || null,
				},
			});
		}

		revalidatePath('/admin');

		return {
			success: true,
			message: 'Image removed successfully',
		};
	} catch (error) {
		console.error('Remove image error:', error);
		return {
			success: false,
			message: 'Failed to remove image',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * GET POST WITH IMAGES ACTION
 * Fetches a post with all its images for editing
 */
export async function getPostWithImagesAction(
	postId: string
): Promise<ActionResponse> {
	if (!(await getSessionValid())) return unauthorized();

	try {
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				images: {
					orderBy: { order: 'asc' },
				},
			},
		});

		if (!post) {
			return { success: false, message: 'Post not found' };
		}

		return {
			success: true,
			message: 'Post loaded',
			data: {
				id: post.id,
				title: post.title,
				slug: post.slug,
				content: post.content,
				excerpt: post.excerpt,
				tags: post.tags,
				status: post.status,
				metaDescription: post.metaDescription,
				images: post.images.map((img) => ({
					id: img.id,
					url: img.url,
					alt: img.alt,
					caption: img.caption,
					credit: img.credit,
					order: img.order,
				})),
				createdAt: post.createdAt.toISOString(),
			},
		};
	} catch (error) {
		console.error('Get post error:', error);
		return {
			success: false,
			message: 'Failed to load post',
			errors: error instanceof Error ? error.message : error,
		};
	}
}

/**
 * UPDATE POST CONTENT ACTION
 * Updates the content of a draft post
 */
export async function updatePostContentAction(input: {
	postId: string;
	title?: string;
	content?: string;
	excerpt?: string;
	tags?: string[];
	metaDescription?: string;
}): Promise<ActionResponse> {
	if (!(await getSessionValid())) return unauthorized();

	try {
		const { postId, ...updates } = input;

		const post = await prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			return { success: false, message: 'Post not found' };
		}

		// Build update data
		const updateData: any = {};
		if (updates.title !== undefined) updateData.title = updates.title;
		if (updates.content !== undefined) updateData.content = updates.content;
		if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
		if (updates.tags !== undefined) updateData.tags = updates.tags;
		if (updates.metaDescription !== undefined)
			updateData.metaDescription = updates.metaDescription;

		const updated = await prisma.post.update({
			where: { id: postId },
			data: updateData,
		});

		revalidatePath('/admin');

		return {
			success: true,
			message: 'Post updated successfully',
			data: {
				id: updated.id,
				title: updated.title,
				slug: updated.slug,
			},
		};
	} catch (error) {
		console.error('Update post error:', error);
		return {
			success: false,
			message: 'Failed to update post',
			errors: error instanceof Error ? error.message : error,
		};
	}
}
