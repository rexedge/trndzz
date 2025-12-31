import { getOpenAIModel, getOptionalSamplingParams } from '../openai-model';
import { getOpenAIClient } from '../openai-client';

const client = getOpenAIClient();

export interface ContentGenerationResult {
	success: boolean;
	message: string;
	data?: {
		title: string;
		slug: string;
		content: string;
		excerpt: string;
		tags: string[];
		featuredImagePrompt: string;
	};
	errors?: any;
}

/**
 * Generates blog content using OpenAI's text generation
 * Reference: https://platform.openai.com/docs/guides/text
 *
 * Guidelines:
 * - Articles are synthesized, not copied
 * - Clear headings and structure
 * - Neutral, informative tone
 * - Nigerian / African context by default
 * - Target length: 1,000–1,500 words
 */
export async function generateArticleContent(params: {
	trendTitle: string;
	researchData?: {
		insights: string[];
		sources: Array<{ title: string; url: string; snippet: string }>;
		summary: string;
	};
	tone?: string;
	targetWords?: number;
	context?: string;
}): Promise<ContentGenerationResult> {
	try {
		const {
			trendTitle,
			researchData,
			tone = 'neutral, informative',
			targetWords = 1200,
			context = 'Nigerian and African perspective',
		} = params;

		if (!trendTitle || trendTitle.trim().length === 0) {
			return {
				success: false,
				message: 'Trend title is required',
			};
		}

		const systemPrompt = `You are a skilled journalist and content writer for Trend Pulse, a minimalist, reader-first blog.

Your writing style:
- Clear, calm, and professional
- Well-structured with proper headings
- Factual and well-researched
- Accessible to general audiences
- Contextually relevant to ${context}

Your output must be a JSON object with these exact keys:
{
  "title": "Compelling article title",
  "slug": "url-friendly-slug",
  "content": "Full article content in markdown format with proper headings",
  "excerpt": "A compelling 150-200 character summary",
  "tags": ["tag1", "tag2", "tag3"],
  "featuredImagePrompt": "A detailed prompt for generating a calm, editorial featured image"
}`;

		const userPrompt = buildContentPrompt(
			trendTitle,
			researchData,
			tone,
			targetWords
		);

		const model = getOpenAIModel();
		const response = await client.chat.completions.create({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			max_completion_tokens: 4000,
			...getOptionalSamplingParams({ model, temperature: 0.7 }),
		});

		const rawContent = response.choices?.[0]?.message?.content ?? '';
		const parsed = parseGeneratedContent(rawContent, trendTitle);

		if (!parsed) {
			return {
				success: false,
				message: 'Failed to parse generated content',
			};
		}

		return {
			success: true,
			message: 'Content generated successfully',
			data: parsed,
		};
	} catch (error) {
		console.error('Content generation error:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to generate content',
			errors: error,
		};
	}
}

function buildContentPrompt(
	trendTitle: string,
	researchData: any,
	tone: string,
	targetWords: number
): string {
	let prompt = `Write a comprehensive, well-researched article about: "${trendTitle}"\n\n`;

	prompt += `Target length: ${targetWords} words\n`;
	prompt += `Tone: ${tone}\n\n`;

	if (researchData) {
		prompt += `Research Context:\n\n`;

		if (researchData.insights && researchData.insights.length > 0) {
			prompt += `Key Insights:\n`;
			researchData.insights
				.slice(0, 10)
				.forEach((insight: string, idx: number) => {
					prompt += `${idx + 1}. ${insight}\n`;
				});
			prompt += `\n`;
		}

		if (researchData.sources && researchData.sources.length > 0) {
			prompt += `Sources for reference (do not copy directly):\n`;
			researchData.sources
				.slice(0, 5)
				.forEach((source: any, idx: number) => {
					prompt += `${idx + 1}. ${source.title} - ${
						source.snippet
					}\n`;
				});
			prompt += `\n`;
		}
	}

	prompt += `Requirements:
1. Start with an engaging introduction that sets context
2. Use clear H2 and H3 headings to structure the content
3. Include relevant facts and insights from the research
4. Maintain a balanced, objective perspective
5. End with a thoughtful conclusion
6. The content should be original and synthesized, not copied
7. If uncertain about facts, acknowledge the uncertainty
8. Make it relevant to Nigerian/African readers where applicable

Content Structure:
- Introduction (2-3 paragraphs)
- 3-5 main sections with H2 headings
- Each section should have 2-4 paragraphs
- Conclusion (1-2 paragraphs)

Remember: Return ONLY a valid JSON object with the required keys.`;

	return prompt;
}

function parseGeneratedContent(
	rawContent: string,
	fallbackTitle: string
): ContentGenerationResult['data'] | null {
	try {
		// Try to extract JSON from markdown code block
		const jsonBlockMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
		let jsonString = jsonBlockMatch ? jsonBlockMatch[1] : rawContent;

		// If no code block, try to find JSON object
		if (!jsonBlockMatch) {
			const objectMatch = rawContent.match(/\{[\s\S]*\}/);
			if (objectMatch) {
				jsonString = objectMatch[0];
			}
		}

		const parsed = JSON.parse(jsonString);

		// Validate required fields
		if (!parsed.title || !parsed.content) {
			return null;
		}

		// Generate slug if not provided
		const slug = parsed.slug || generateSlug(parsed.title);

		// Extract excerpt if not provided
		const excerpt = parsed.excerpt || generateExcerpt(parsed.content);

		// Ensure tags is an array
		let tags: string[] = [];
		if (Array.isArray(parsed.tags)) {
			tags = parsed.tags;
		} else if (typeof parsed.tags === 'string') {
			tags = parsed.tags
				.split(/[,\n]/)
				.map((t: string) => t.trim())
				.filter(Boolean);
		}

		return {
			title: parsed.title,
			slug,
			content: parsed.content,
			excerpt,
			tags: tags.slice(0, 5), // Limit to 5 tags
			featuredImagePrompt:
				parsed.featuredImagePrompt || generateImagePrompt(parsed.title),
		};
	} catch (error) {
		console.error('Failed to parse content:', error);
		return null;
	}
}

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.substring(0, 100);
}

function generateExcerpt(content: string): string {
	// Remove markdown syntax
	const plainText = content
		.replace(/#{1,6}\s+/g, '') // Remove headings
		.replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
		.replace(/\*([^*]+)\*/g, '$1') // Remove italic
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
		.replace(/\n+/g, ' ') // Replace newlines with spaces
		.trim();

	// Get first 150-200 characters
	if (plainText.length <= 200) {
		return plainText;
	}

	const truncated = plainText.substring(0, 200);
	const lastSpace = truncated.lastIndexOf(' ');

	return lastSpace > 150
		? truncated.substring(0, lastSpace) + '…'
		: truncated + '…';
}

function generateImagePrompt(title: string): string {
	return `A calm, editorial, high-quality photograph representing: ${title}. Minimalist composition, professional lighting, suitable for a modern blog. No text or logos.`;
}

/**
 * Refines existing article content
 */
export async function refineArticleContent(
	currentContent: string,
	refinementInstructions: string
): Promise<ContentGenerationResult> {
	try {
		const systemPrompt = `You are an editor refining article content. Maintain the article's core message while improving clarity, structure, and readability.`;

		const userPrompt = `Please refine the following article based on these instructions: ${refinementInstructions}\n\nCurrent Article:\n${currentContent}\n\nReturn the refined content as a JSON object with: title, slug, content, excerpt, tags, featuredImagePrompt`;

		const model = getOpenAIModel();
		const response = await client.chat.completions.create({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			max_completion_tokens: 4000,
			...getOptionalSamplingParams({ model, temperature: 0.5 }),
		});

		const rawContent = response.choices?.[0]?.message?.content ?? '';
		const parsed = parseGeneratedContent(rawContent, 'Refined Article');

		if (!parsed) {
			return {
				success: false,
				message: 'Failed to parse refined content',
			};
		}

		return {
			success: true,
			message: 'Content refined successfully',
			data: parsed,
		};
	} catch (error) {
		console.error('Content refinement error:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to refine content',
			errors: error,
		};
	}
}
