'use server';

import { prisma } from '@/lib/db';
import { verifySessionToken, getTokenFromCookies } from '@/lib/auth/session';
import { z } from 'zod';
import {
	analyzeKeywords,
	generateContentBrief,
	analyzeContentSeo,
	suggestCategories,
	suggestInternalLinks,
	generateWeeklyCalendar,
} from '@/lib/seo-ai';

// ============================================
// Authentication Helper
// ============================================

async function requireAuth() {
	const token = await getTokenFromCookies();
	const isValid = await verifySessionToken(token);
	if (!isValid) {
		return { success: false, message: 'Unauthorized' };
	}
	return null;
}

// ============================================
// Category Actions
// ============================================

export async function getCategoriesAction() {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { order: 'asc' },
			include: {
				_count: {
					select: { posts: true, keywords: true, contentPlans: true },
				},
			},
		});

		return {
			success: true,
			data: categories,
		};
	} catch (error) {
		console.error('Error fetching categories:', error);
		return { success: false, message: 'Failed to fetch categories' };
	}
}

export async function createCategoryAction(data: {
	name: string;
	slug: string;
	description?: string;
	color?: string;
	hubTitle?: string;
	hubDescription?: string;
	hubMetaDescription?: string;
}) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const category = await prisma.category.create({
			data: {
				name: data.name,
				slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
				description: data.description,
				color: data.color || '#6366f1',
				hubTitle: data.hubTitle,
				hubDescription: data.hubDescription,
				hubMetaDescription: data.hubMetaDescription,
			},
		});

		return { success: true, data: category };
	} catch (error) {
		console.error('Error creating category:', error);
		return { success: false, message: 'Failed to create category' };
	}
}

export async function updateCategoryAction(
	id: string,
	data: Partial<{
		name: string;
		slug: string;
		description: string;
		color: string;
		order: number;
		isActive: boolean;
		hubTitle: string;
		hubDescription: string;
		hubMetaDescription: string;
	}>
) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const category = await prisma.category.update({
			where: { id },
			data,
		});

		return { success: true, data: category };
	} catch (error) {
		console.error('Error updating category:', error);
		return { success: false, message: 'Failed to update category' };
	}
}

export async function deleteCategoryAction(id: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		await prisma.category.delete({ where: { id } });
		return { success: true, message: 'Category deleted' };
	} catch (error) {
		console.error('Error deleting category:', error);
		return { success: false, message: 'Failed to delete category' };
	}
}

// ============================================
// Keyword Actions
// ============================================

export async function getKeywordsAction(categoryId?: string) {
	try {
		const keywords = await prisma.keyword.findMany({
			where: categoryId ? { categoryId } : undefined,
			orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
			include: { category: true },
		});

		return { success: true, data: keywords };
	} catch (error) {
		console.error('Error fetching keywords:', error);
		return { success: false, message: 'Failed to fetch keywords' };
	}
}

export async function createKeywordAction(data: {
	keyword: string;
	categoryId?: string;
	searchVolume?: number;
	difficulty?: number;
	intent?: string;
	priority?: string;
	notes?: string;
}) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const keyword = await prisma.keyword.create({
			data: {
				keyword: data.keyword,
				categoryId: data.categoryId,
				searchVolume: data.searchVolume,
				difficulty: data.difficulty,
				intent: data.intent,
				priority: data.priority || 'medium',
				notes: data.notes,
			},
		});

		return { success: true, data: keyword };
	} catch (error) {
		console.error('Error creating keyword:', error);
		return { success: false, message: 'Failed to create keyword' };
	}
}

export async function updateKeywordAction(
	id: string,
	data: Partial<{
		keyword: string;
		categoryId: string;
		searchVolume: number;
		difficulty: number;
		intent: string;
		priority: string;
		status: string;
		currentRank: number;
		targetPostId: string;
		notes: string;
	}>
) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const keyword = await prisma.keyword.update({
			where: { id },
			data,
		});

		return { success: true, data: keyword };
	} catch (error) {
		console.error('Error updating keyword:', error);
		return { success: false, message: 'Failed to update keyword' };
	}
}

export async function deleteKeywordAction(id: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		await prisma.keyword.delete({ where: { id } });
		return { success: true, message: 'Keyword deleted' };
	} catch (error) {
		console.error('Error deleting keyword:', error);
		return { success: false, message: 'Failed to delete keyword' };
	}
}

// ============================================
// Content Plan Actions
// ============================================

export async function getContentPlansAction(status?: string) {
	try {
		const plans = await prisma.contentPlan.findMany({
			where: status ? { status } : undefined,
			orderBy: [
				{ priority: 'desc' },
				{ dueDate: 'asc' },
				{ createdAt: 'desc' },
			],
			include: { category: true },
		});

		return { success: true, data: plans };
	} catch (error) {
		console.error('Error fetching content plans:', error);
		return { success: false, message: 'Failed to fetch content plans' };
	}
}

export async function createContentPlanAction(data: {
	title: string;
	targetKeyword?: string;
	secondaryKeywords?: string[];
	searchIntent?: string;
	contentType?: string;
	categoryId?: string;
	outline?: string;
	targetWordCount?: number;
	internalLinks?: string[];
	competitors?: string[];
	status?: string;
	priority?: string;
	dueDate?: Date;
	notes?: string;
}) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const plan = await prisma.contentPlan.create({
			data: {
				title: data.title,
				targetKeyword: data.targetKeyword,
				secondaryKeywords: data.secondaryKeywords || [],
				searchIntent: data.searchIntent,
				contentType: data.contentType || 'post',
				categoryId: data.categoryId,
				outline: data.outline,
				targetWordCount: data.targetWordCount,
				internalLinks: data.internalLinks || [],
				competitors: data.competitors || [],
				status: data.status || 'idea',
				priority: data.priority || 'medium',
				dueDate: data.dueDate,
				notes: data.notes,
			},
		});

		return { success: true, data: plan };
	} catch (error) {
		console.error('Error creating content plan:', error);
		return { success: false, message: 'Failed to create content plan' };
	}
}

export async function updateContentPlanAction(
	id: string,
	data: Partial<{
		title: string;
		targetKeyword: string;
		secondaryKeywords: string[];
		searchIntent: string;
		contentType: string;
		categoryId: string;
		outline: string;
		targetWordCount: number;
		internalLinks: string[];
		competitors: string[];
		status: string;
		priority: string;
		dueDate: Date;
		publishedPostId: string;
		notes: string;
	}>
) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const plan = await prisma.contentPlan.update({
			where: { id },
			data,
		});

		return { success: true, data: plan };
	} catch (error) {
		console.error('Error updating content plan:', error);
		return { success: false, message: 'Failed to update content plan' };
	}
}

export async function deleteContentPlanAction(id: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		await prisma.contentPlan.delete({ where: { id } });
		return { success: true, message: 'Content plan deleted' };
	} catch (error) {
		console.error('Error deleting content plan:', error);
		return { success: false, message: 'Failed to delete content plan' };
	}
}

export async function createContentPlansFromCalendarAction(input: {
	calendarId: string;
}) {
	const authError = await requireAuth();
	if (authError) return authError;

	const parsed = z.object({ calendarId: z.string().min(1) }).safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			message: 'Invalid request',
			errors: parsed.error.flatten(),
		};
	}

	try {
		const items = await prisma.contentCalendarItem.findMany({
			where: { calendarId: parsed.data.calendarId, isCompleted: false },
			orderBy: [{ day: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
			select: {
				title: true,
				targetKeyword: true,
				contentType: true,
				priority: true,
				estimatedTime: true,
				notes: true,
				category: true,
				day: true,
			},
		});

		if (items.length === 0) {
			return {
				success: true,
				message: 'Nothing to add',
				data: { createdCount: 0 },
			};
		}

		const createManyResult = await prisma.contentPlan.createMany({
			data: items.map((item) => ({
				title: item.title,
				targetKeyword: item.targetKeyword ?? undefined,
				contentType: item.contentType ?? 'post',
				priority: item.priority ?? 'medium',
				status: 'idea',
				notes: [
					item.notes ?? '',
					`Estimated time: ${item.estimatedTime ?? 'N/A'}`,
					`Category: ${item.category ?? 'N/A'}`,
					`Day: ${item.day ?? 'N/A'}`,
				]
					.filter(Boolean)
					.join('\n'),
			})),
		});

		return {
			success: true,
			message: 'Added to content plans',
			data: { createdCount: createManyResult.count },
		};
	} catch (error) {
		console.error('Error creating content plans from calendar:', error);
		return {
			success: false,
			message: 'Failed to add items to content plans',
			errors: error,
		};
	}
}

// ============================================
// AI-Powered SEO Actions
// ============================================

export async function aiGenerateDraftFromPlanAction(planId: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const plan = await prisma.contentPlan.findUnique({
			where: { id: planId },
			include: { category: true },
		});

		if (!plan) {
			return { success: false, message: 'Plan not found' };
		}

		// Import at runtime to avoid SSR issues
		const { generateArticleContent } = await import(
			'@/lib/services/contentGeneration'
		);
		const { performWebResearch } = await import(
			'@/lib/services/webResearch'
		);

		// Step 1: Research the topic
		let researchData;
		if (plan.targetKeyword || plan.title) {
			const researchResult = await performWebResearch(
				plan.targetKeyword || plan.title,
				plan.notes || undefined
			);
			if (researchResult.success && researchResult.data) {
				researchData = researchResult.data;
			}
		}

		// Step 2: Generate article
		const result = await generateArticleContent({
			trendTitle: plan.title,
			researchData,
			tone: 'neutral, informative',
			targetWords: plan.targetWordCount || 1200,
			context: plan.category?.name || 'Global with Nigerian focus',
		});

		if (!result.success || !result.data) {
			return {
				success: false,
				message: result.message || 'Failed to generate draft',
			};
		}

		// Step 3: Create the draft post in the database
		const draft = await prisma.post.create({
			data: {
				title: result.data.title,
				slug: result.data.slug,
				content: result.data.content,
				excerpt: result.data.excerpt,
				tags: result.data.tags,
				status: 'draft',
				categoryId: plan.categoryId,
				featuredImagePrompt: result.data.featuredImagePrompt,
				focusKeyword: plan.targetKeyword,
				secondaryKeywords: plan.secondaryKeywords,
			},
		});

		// Step 4: Update the content plan status to "writing"
		await prisma.contentPlan.update({
			where: { id: planId },
			data: { status: 'writing' },
		});

		return {
			success: true,
			message: 'Draft created successfully',
			data: {
				postId: draft.id,
				slug: draft.slug,
			},
		};
	} catch (error) {
		console.error('Error generating draft from plan:', error);
		return {
			success: false,
			message: 'Failed to generate draft',
			errors: error,
		};
	}
}

export async function aiAnalyzeKeywordsAction(topic: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const result = await analyzeKeywords(topic);
		return { success: true, data: result };
	} catch (error) {
		console.error('Error analyzing keywords:', error);
		return { success: false, message: 'Failed to analyze keywords' };
	}
}

export async function aiGenerateContentBriefAction(
	topic: string,
	primaryKeyword: string,
	categoryId?: string
) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		// Get existing posts for internal linking suggestions
		const existingPosts = await prisma.post.findMany({
			where: { status: 'published' },
			select: { title: true, slug: true },
		});

		// Get category name if provided
		let categoryName: string | undefined;
		if (categoryId) {
			const category = await prisma.category.findUnique({
				where: { id: categoryId },
				select: { name: true },
			});
			categoryName = category?.name;
		}

		const result = await generateContentBrief(
			topic,
			primaryKeyword,
			existingPosts,
			categoryName
		);

		return { success: true, data: result };
	} catch (error) {
		console.error('Error generating content brief:', error);
		return { success: false, message: 'Failed to generate content brief' };
	}
}

export async function aiAnalyzePostSeoAction(postId: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: { images: true },
		});

		if (!post) {
			return { success: false, message: 'Post not found' };
		}

		const result = await analyzeContentSeo(
			post.title,
			post.content,
			post.metaDescription,
			post.focusKeyword,
			post.images.map((img) => ({ alt: img.alt }))
		);

		return { success: true, data: result };
	} catch (error) {
		console.error('Error analyzing post SEO:', error);
		return { success: false, message: 'Failed to analyze SEO' };
	}
}

export async function aiSuggestCategoriesAction() {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		// Get existing post titles for context
		const existingPosts = await prisma.post.findMany({
			select: { title: true },
		});

		const result = await suggestCategories(
			'Trend Pulse - A minimalist, reader-first blog delivering fresh, well-researched stories from real-time trends. Covers breaking news, trending topics, viral content.',
			existingPosts.map((p) => p.title)
		);

		return { success: true, data: result };
	} catch (error) {
		console.error('Error suggesting categories:', error);
		return { success: false, message: 'Failed to suggest categories' };
	}
}

export async function aiSuggestInternalLinksAction(postId: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { title: true, slug: true, content: true },
		});

		if (!post) {
			return { success: false, message: 'Post not found' };
		}

		const otherPosts = await prisma.post.findMany({
			where: {
				status: 'published',
				id: { not: postId },
			},
			select: { title: true, slug: true, excerpt: true },
		});

		const result = await suggestInternalLinks(post, otherPosts);

		return { success: true, data: result };
	} catch (error) {
		console.error('Error suggesting internal links:', error);
		return { success: false, message: 'Failed to suggest internal links' };
	}
}

export async function aiGenerateWeeklyCalendarAction() {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		// Get existing categories
		const categories = await prisma.category.findMany({
			where: { isActive: true },
			select: { name: true },
		});

		// Get existing post titles to avoid duplicates
		const existingPosts = await prisma.post.findMany({
			select: { title: true },
		});

		const categoryNames =
			categories.length > 0
				? categories.map((c) => c.name)
				: [
						'Technology & AI',
						'Entertainment & Pop Culture',
						'Business & Finance',
				  ];

		const result = await generateWeeklyCalendar(
			categoryNames,
			3, // posts per day
			existingPosts.map((p) => p.title)
		);

		// Save calendar to database
		const now = new Date();
		const weekStart = getWeekStart(now);
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);

		const savedCalendar = await prisma.contentCalendar.create({
			data: {
				weekStart,
				weekEnd,
				name: `Week of ${weekStart.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				})}`,
				items: {
					create: result.map((item, index) => ({
						day: normalizeDay(item.day),
						title: item.title,
						targetKeyword: item.targetKeyword,
						contentType: item.contentType,
						category: item.category,
						priority: item.priority || 'medium',
						estimatedTime: item.estimatedTime,
						notes: item.notes,
						order: index,
					})),
				},
			},
			include: {
				items: {
					orderBy: [{ day: 'asc' }, { order: 'asc' }],
				},
			},
		});

		return { success: true, data: savedCalendar };
	} catch (error) {
		console.error('Error generating weekly calendar:', error);
		return { success: false, message: 'Failed to generate calendar' };
	}
}

// Helper to get the start of the week (Monday)
function getWeekStart(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
	d.setDate(diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

// Normalize day names to canonical form
function normalizeDay(day: string): string {
	const normalized = (day ?? '').trim().toLowerCase();
	if (normalized.startsWith('mon')) return 'Monday';
	if (normalized.startsWith('tue')) return 'Tuesday';
	if (normalized.startsWith('wed')) return 'Wednesday';
	if (normalized.startsWith('thu')) return 'Thursday';
	if (normalized.startsWith('fri')) return 'Friday';
	if (normalized.startsWith('sat')) return 'Saturday';
	if (normalized.startsWith('sun')) return 'Sunday';
	return day; // Return original if no match
}

// ============================================
// Content Calendar Actions
// ============================================

export async function getContentCalendarsAction(limit: number = 10) {
	try {
		const calendars = await prisma.contentCalendar.findMany({
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				items: {
					orderBy: [{ day: 'asc' }, { order: 'asc' }],
				},
				_count: {
					select: { items: true },
				},
			},
		});

		return { success: true, data: calendars };
	} catch (error) {
		console.error('Error fetching calendars:', error);
		return { success: false, message: 'Failed to fetch calendars' };
	}
}

export async function getContentCalendarAction(calendarId: string) {
	try {
		const calendar = await prisma.contentCalendar.findUnique({
			where: { id: calendarId },
			include: {
				items: {
					orderBy: [{ day: 'asc' }, { order: 'asc' }],
				},
			},
		});

		if (!calendar) {
			return { success: false, message: 'Calendar not found' };
		}

		return { success: true, data: calendar };
	} catch (error) {
		console.error('Error fetching calendar:', error);
		return { success: false, message: 'Failed to fetch calendar' };
	}
}

export async function toggleCalendarItemCompletionAction(itemId: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const item = await prisma.contentCalendarItem.findUnique({
			where: { id: itemId },
		});

		if (!item) {
			return { success: false, message: 'Item not found' };
		}

		const updatedItem = await prisma.contentCalendarItem.update({
			where: { id: itemId },
			data: {
				isCompleted: !item.isCompleted,
				completedAt: !item.isCompleted ? new Date() : null,
			},
		});

		return { success: true, data: updatedItem };
	} catch (error) {
		console.error('Error toggling item completion:', error);
		return { success: false, message: 'Failed to update item' };
	}
}

export async function linkCalendarItemToPostAction(
	itemId: string,
	postId: string | null
) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const updatedItem = await prisma.contentCalendarItem.update({
			where: { id: itemId },
			data: {
				postId,
				isCompleted: postId ? true : false,
				completedAt: postId ? new Date() : null,
			},
		});

		return { success: true, data: updatedItem };
	} catch (error) {
		console.error('Error linking item to post:', error);
		return { success: false, message: 'Failed to link item to post' };
	}
}

export async function deleteContentCalendarAction(calendarId: string) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		await prisma.contentCalendar.delete({
			where: { id: calendarId },
		});

		return { success: true, message: 'Calendar deleted' };
	} catch (error) {
		console.error('Error deleting calendar:', error);
		return { success: false, message: 'Failed to delete calendar' };
	}
}

// ============================================
// Post Category Assignment
// ============================================

export async function assignPostCategoryAction(
	postId: string,
	categoryId: string | null
) {
	const authError = await requireAuth();
	if (authError) return authError;

	try {
		const post = await prisma.post.update({
			where: { id: postId },
			data: { categoryId },
		});

		return { success: true, data: post };
	} catch (error) {
		console.error('Error assigning category:', error);
		return { success: false, message: 'Failed to assign category' };
	}
}

// ============================================
// SEO Dashboard Stats
// ============================================

export async function getSeoStatsAction() {
	try {
		const [
			totalPosts,
			publishedPosts,
			draftPosts,
			postsWithCategory,
			postsWithFocusKeyword,
			postsWithMetaDescription,
			totalCategories,
			totalKeywords,
			contentPlansIdea,
			contentPlansPlanned,
			contentPlansWriting,
		] = await Promise.all([
			prisma.post.count(),
			prisma.post.count({ where: { status: 'published' } }),
			prisma.post.count({ where: { status: 'draft' } }),
			prisma.post.count({ where: { categoryId: { not: null } } }),
			prisma.post.count({ where: { focusKeyword: { not: null } } }),
			prisma.post.count({ where: { metaDescription: { not: null } } }),
			prisma.category.count({ where: { isActive: true } }),
			prisma.keyword.count(),
			prisma.contentPlan.count({ where: { status: 'idea' } }),
			prisma.contentPlan.count({ where: { status: 'planned' } }),
			prisma.contentPlan.count({ where: { status: 'writing' } }),
		]);

		return {
			success: true,
			data: {
				posts: {
					total: totalPosts,
					published: publishedPosts,
					drafts: draftPosts,
					withCategory: postsWithCategory,
					withFocusKeyword: postsWithFocusKeyword,
					withMetaDescription: postsWithMetaDescription,
				},
				categories: totalCategories,
				keywords: totalKeywords,
				contentPlans: {
					ideas: contentPlansIdea,
					planned: contentPlansPlanned,
					writing: contentPlansWriting,
				},
			},
		};
	} catch (error) {
		console.error('Error fetching SEO stats:', error);
		return { success: false, message: 'Failed to fetch SEO stats' };
	}
}
