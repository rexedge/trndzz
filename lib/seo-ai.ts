import { getOpenAIModel, getOptionalSamplingParams } from './openai-model';
import { getOpenAIClient } from './openai-client';

const openai = getOpenAIClient();

// ============================================
// Keyword Research & Analysis
// ============================================

export interface KeywordResearchResult {
	primaryKeyword: string;
	secondaryKeywords: string[];
	longTailKeywords: string[];
	questions: string[];
	searchIntent:
		| 'informational'
		| 'navigational'
		| 'transactional'
		| 'commercial';
	difficulty: 'low' | 'medium' | 'high';
	suggestedTitle: string;
	suggestedMetaDescription: string;
}

export async function analyzeKeywords(
	topic: string,
	targetAudience: string = 'global, with focus on Nigeria'
): Promise<KeywordResearchResult> {
	const model = getOpenAIModel();
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: `You are an expert SEO strategist specializing in keyword research and search intent analysis.
Your target audience is ${targetAudience}.
Always respond with valid JSON matching the exact schema provided.`,
			},
			{
				role: 'user',
				content: `Analyze this topic for SEO keyword optimization: "${topic}"

Provide comprehensive keyword research including:
1. The best primary keyword to target (high relevance, reasonable competition)
2. 5-10 secondary keywords (related terms and variations)
3. 5-10 long-tail keywords (specific, lower competition phrases)
4. 5-10 questions people search for about this topic (for FAQ sections)
5. The dominant search intent (informational, navigational, transactional, or commercial)
6. Estimated keyword difficulty (low, medium, high)
7. An SEO-optimized title (60 chars max, include primary keyword)
8. An SEO-optimized meta description (155 chars max, compelling, include primary keyword)

Respond ONLY with this JSON structure:
{
  "primaryKeyword": "string",
  "secondaryKeywords": ["string"],
  "longTailKeywords": ["string"],
  "questions": ["string"],
  "searchIntent": "informational|navigational|transactional|commercial",
  "difficulty": "low|medium|high",
  "suggestedTitle": "string",
  "suggestedMetaDescription": "string"
}`,
			},
		],
		...getOptionalSamplingParams({ model, temperature: 0.7 }),
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('No response from OpenAI');
	}

	return JSON.parse(content) as KeywordResearchResult;
}

// ============================================
// Content Brief Generation
// ============================================

export interface ContentBrief {
	title: string;
	targetKeyword: string;
	searchIntent: string;
	targetWordCount: number;
	outline: {
		h2: string;
		h3s?: string[];
		keyPoints: string[];
	}[];
	mustInclude: string[];
	internalLinkSuggestions: string[];
	faqQuestions: string[];
	competitorAngles: string[];
	uniqueAngle: string;
	callToAction: string;
}

export async function generateContentBrief(
	topic: string,
	primaryKeyword: string,
	existingPosts: { title: string; slug: string }[] = [],
	category?: string
): Promise<ContentBrief> {
	const existingPostsList = existingPosts
		.map((p) => `- "${p.title}" (/${p.slug})`)
		.join('\n');

	const model = getOpenAIModel();

	const response = await openai.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: `You are an expert content strategist creating detailed content briefs for SEO-optimized articles.
Focus on creating content that ranks well and provides genuine value to readers.
Target audience: Global with focus on Nigeria.`,
			},
			{
				role: 'user',
				content: `Create a comprehensive content brief for an article about: "${topic}"
Primary keyword to target: "${primaryKeyword}"
${category ? `Category/Topic cluster: ${category}` : ''}

${
	existingPosts.length > 0
		? `Existing posts to potentially link to:\n${existingPostsList}`
		: 'No existing posts yet.'
}

Generate a detailed content brief including:
1. SEO-optimized title
2. Target word count (based on topic complexity)
3. Detailed outline with H2 sections, optional H3 subsections, and key points for each
4. Must-include elements (statistics, examples, definitions, etc.)
5. Suggestions for internal links (use slugs from existing posts if relevant)
6. FAQ questions to include
7. What competitors likely cover (to ensure we don't miss anything)
8. Our unique angle (what makes this article stand out)
9. Call-to-action suggestion

Respond ONLY with this JSON structure:
{
  "title": "string",
  "targetKeyword": "string",
  "searchIntent": "string",
  "targetWordCount": number,
  "outline": [
    {
      "h2": "string",
      "h3s": ["string"],
      "keyPoints": ["string"]
    }
  ],
  "mustInclude": ["string"],
  "internalLinkSuggestions": ["string"],
  "faqQuestions": ["string"],
  "competitorAngles": ["string"],
  "uniqueAngle": "string",
  "callToAction": "string"
}`,
			},
		],
		...getOptionalSamplingParams({ model, temperature: 0.7 }),
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('No response from OpenAI');
	}

	return JSON.parse(content) as ContentBrief;
}

// ============================================
// SEO Analysis for Existing Content
// ============================================

export interface SeoAnalysis {
	score: number; // 0-100
	issues: {
		severity: 'critical' | 'warning' | 'suggestion';
		issue: string;
		fix: string;
	}[];
	keywordUsage: {
		inTitle: boolean;
		inFirstParagraph: boolean;
		density: string;
		inHeadings: boolean;
	};
	contentQuality: {
		wordCount: number;
		readabilityLevel: string;
		hasImages: boolean;
		hasInternalLinks: boolean;
		hasExternalLinks: boolean;
		hasFaq: boolean;
	};
	suggestions: string[];
	improvedMetaDescription?: string;
}

export async function analyzeContentSeo(
	title: string,
	content: string,
	metaDescription: string | null,
	focusKeyword: string | null,
	images: { alt: string | null }[]
): Promise<SeoAnalysis> {
	const model = getOpenAIModel();
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: `You are an expert SEO auditor analyzing content for on-page SEO optimization.
Provide actionable, specific feedback to improve rankings.`,
			},
			{
				role: 'user',
				content: `Analyze this content for SEO optimization:

Title: ${title}
Meta Description: ${metaDescription || 'None'}
Focus Keyword: ${focusKeyword || 'None specified'}
Word Count: ~${content.split(/\s+/).length}
Images: ${images.length} (with alts: ${images.filter((i) => i.alt).length})

Content (first 2000 chars):
${content.substring(0, 2000)}...

Analyze and provide:
1. Overall SEO score (0-100)
2. List of issues with severity (critical, warning, suggestion) and how to fix each
3. Keyword usage analysis
4. Content quality metrics
5. Specific suggestions for improvement
6. If meta description is weak, suggest an improved version

Respond ONLY with this JSON structure:
{
  "score": number,
  "issues": [
    {
      "severity": "critical|warning|suggestion",
      "issue": "string",
      "fix": "string"
    }
  ],
  "keywordUsage": {
    "inTitle": boolean,
    "inFirstParagraph": boolean,
    "density": "string",
    "inHeadings": boolean
  },
  "contentQuality": {
    "wordCount": number,
    "readabilityLevel": "string",
    "hasImages": boolean,
    "hasInternalLinks": boolean,
    "hasExternalLinks": boolean,
    "hasFaq": boolean
  },
  "suggestions": ["string"],
  "improvedMetaDescription": "string or null"
}`,
			},
		],
		...getOptionalSamplingParams({ model, temperature: 0.5 }),
		response_format: { type: 'json_object' },
	});

	const responseContent = response.choices[0]?.message?.content;
	if (!responseContent) {
		throw new Error('No response from OpenAI');
	}

	return JSON.parse(responseContent) as SeoAnalysis;
}

// ============================================
// Category/Topic Cluster Suggestions
// ============================================

export interface CategorySuggestion {
	name: string;
	slug: string;
	description: string;
	color: string;
	sampleTopics: string[];
	hubPageTitle: string;
	hubPageDescription: string;
}

export async function suggestCategories(
	siteDescription: string,
	existingPosts: string[] = []
): Promise<CategorySuggestion[]> {
	const model = getOpenAIModel();
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: `You are an SEO strategist specializing in topical authority and site architecture.
Suggest category structures that will help build topical authority and rank for competitive terms.`,
			},
			{
				role: 'user',
				content: `Suggest 3 main content categories (topic clusters) for this site:

Site: ${siteDescription}
Target audience: Global with focus on Nigeria
Existing posts: ${
					existingPosts.length > 0
						? existingPosts.join(', ')
						: 'None yet'
				}

For each category, provide:
1. Category name (concise, SEO-friendly)
2. URL slug
3. Short description
4. Brand color (hex code)
5. 5 sample article topics that would fit this category
6. Hub page title (SEO optimized)
7. Hub page meta description

Categories should:
- Cover trending, newsworthy topics
- Have clear topical boundaries (no overlap)
- Be broad enough for 50+ articles each
- Target search terms with real volume

Respond ONLY with this JSON object:
{
	"categories": [
		{
			"name": "string",
			"slug": "string",
			"description": "string",
			"color": "#hexcode",
			"sampleTopics": ["string"],
			"hubPageTitle": "string",
			"hubPageDescription": "string"
		}
	]
}`,
			},
		],
		...getOptionalSamplingParams({ model, temperature: 0.8 }),
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('No response from OpenAI');
	}

	const parsed = JSON.parse(content);
	// Handle both array and object with categories key
	return Array.isArray(parsed) ? parsed : parsed.categories || [];
}

// ============================================
// Internal Linking Suggestions
// ============================================

export interface InternalLinkSuggestion {
	fromSlug: string;
	toSlug: string;
	anchorText: string;
	context: string;
	relevanceScore: number;
}

export async function suggestInternalLinks(
	currentPost: { title: string; slug: string; content: string },
	allPosts: { title: string; slug: string; excerpt: string | null }[]
): Promise<InternalLinkSuggestion[]> {
	if (allPosts.length === 0) {
		return [];
	}

	const postsList = allPosts
		.filter((p) => p.slug !== currentPost.slug)
		.map((p) => `- "${p.title}" (/${p.slug}): ${p.excerpt || 'No excerpt'}`)
		.join('\n');

	const model = getOpenAIModel();

	const response = await openai.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: `You are an SEO expert specializing in internal linking strategies.
Suggest natural, contextually relevant internal links that improve user experience and SEO.`,
			},
			{
				role: 'user',
				content: `Suggest internal links for this post:

Current Post: "${currentPost.title}" (/${currentPost.slug})
Content preview: ${currentPost.content.substring(0, 1500)}...

Available posts to link to:
${postsList}

For each suggested link, provide:
1. The slug to link to
2. Suggested anchor text (natural, varied - avoid exact match spam)
3. Context (where in the content this link would fit)
4. Relevance score (1-10)

Only suggest genuinely relevant links. Quality over quantity.

Respond ONLY with this JSON object:
{
	"suggestions": [
		{
			"fromSlug": "${currentPost.slug}",
			"toSlug": "string",
			"anchorText": "string",
			"context": "string",
			"relevanceScore": number
		}
	]
}`,
			},
		],
		...getOptionalSamplingParams({ model, temperature: 0.6 }),
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('No response from OpenAI');
	}

	const parsed = JSON.parse(content);
	return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
}

// ============================================
// Weekly Content Calendar Generation
// ============================================

export interface ContentCalendarItem {
	day: string;
	title: string;
	targetKeyword: string;
	contentType: 'evergreen' | 'trending' | 'news' | 'listicle' | 'how-to';
	category: string;
	priority: 'high' | 'medium' | 'low';
	estimatedTime: string;
	notes: string;
}

export async function generateWeeklyCalendar(
	categories: string[],
	postsPerDay: number = 3,
	existingTopics: string[] = []
): Promise<ContentCalendarItem[]> {
	const model = getOpenAIModel();
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: `You are a content strategist creating weekly editorial calendars.
Balance evergreen content with trending topics. Optimize for both immediate traffic and long-term SEO value.`,
			},
			{
				role: 'user',
				content: `Create a 7-day content calendar for a trends/news blog.

Categories: ${categories.join(', ')}
Posts per day: ${postsPerDay}
Topics already covered: ${
					existingTopics.length > 0
						? existingTopics.join(', ')
						: 'None'
				}

Requirements:
- Mix of evergreen and trending content
- Each category should have roughly equal representation
- Include variety: how-tos, listicles, news analysis, explainers
- Prioritize topics with search demand
- Consider what's likely trending (tech, entertainment, business news)

For each content piece, provide:
1. Day (Monday-Sunday)
2. Article title
3. Target keyword
4. Content type
5. Category
6. Priority (high for evergreen pillars, medium for regular, low for quick news)
7. Estimated writing time
8. Quick notes/angle

Respond ONLY with this JSON object:
{
	"calendar": [
		{
			"day": "string",
			"title": "string",
			"targetKeyword": "string",
			"contentType": "evergreen|trending|news|listicle|how-to",
			"category": "string",
			"priority": "high|medium|low",
			"estimatedTime": "string",
			"notes": "string"
		}
	]
}`,
			},
		],
		...getOptionalSamplingParams({ model, temperature: 0.9 }),
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('No response from OpenAI');
	}

	const parsed = JSON.parse(content);
	return Array.isArray(parsed)
		? parsed
		: parsed.calendar || parsed.items || [];
}
