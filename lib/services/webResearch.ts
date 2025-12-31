import { getOpenAIModel, getOptionalSamplingParams } from '../openai-model';
import { getOpenAIClient } from '../openai-client';

const client = getOpenAIClient();

export interface WebSearchResult {
	success: boolean;
	message: string;
	data?: {
		insights: string[];
		sources: Array<{
			title: string;
			url: string;
			snippet: string;
		}>;
		summary: string;
	};
	errors?: any;
}

/**
 * Performs research using OpenAI to synthesize information about a topic
 *
 * Note: This uses the chat completions API with the model's training knowledge.
 * For real-time web data, you would need to integrate a separate search API.
 *
 * This function:
 * - Takes a search query related to a trend
 * - Uses OpenAI to generate comprehensive research content
 * - Returns structured research data for content generation
 */
export async function performWebResearch(
	query: string,
	context?: string
): Promise<WebSearchResult> {
	try {
		if (!query || query.trim().length === 0) {
			return {
				success: false,
				message: 'Search query is required',
			};
		}

		const systemPrompt = `You are an expert research assistant helping gather factual information about trending topics.
Provide comprehensive, well-researched information based on your knowledge.
Focus on providing accurate facts, relevant background information, and balanced perspectives.
Structure your response with:
1. Key Facts & Background
2. Recent Context & Developments
3. Different Perspectives (if applicable)
4. Important Details

Be thorough but concise. Focus on Nigerian and African perspectives when relevant.`;

		const userPrompt = context
			? `Research and provide comprehensive information about: "${query}"\n\nAdditional context: ${context}\n\nProvide detailed, factual information that would be useful for writing a news article.`
			: `Research and provide comprehensive information about: "${query}"\n\nProvide detailed, factual information that would be useful for writing a news article.`;

		const model = getOpenAIModel();
		const response = await client.chat.completions.create({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			max_completion_tokens: 2000,
			...getOptionalSamplingParams({ model, temperature: 0.7 }),
		});

		const content = response.choices?.[0]?.message?.content ?? '';
		const insights = extractInsights(content);

		return {
			success: true,
			message: 'Research completed successfully',
			data: {
				insights,
				sources: [], // No external sources without web search
				summary: content,
			},
		};
	} catch (error) {
		console.error('Research error:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to perform research',
			errors: error,
		};
	}
}

function extractInsights(content: string): string[] {
	const insights: string[] = [];

	// Look for numbered lists or bullet points
	const lines = content.split('\n');
	for (const line of lines) {
		const trimmed = line.trim();
		if (
			trimmed.match(/^\d+\./) ||
			trimmed.startsWith('- ') ||
			trimmed.startsWith('• ')
		) {
			const cleaned = trimmed.replace(/^[\d+\.\-•]\s*/, '').trim();
			if (cleaned.length > 20) {
				insights.push(cleaned);
			}
		}
	}

	// If no structured insights found, extract sentences
	if (insights.length === 0) {
		const sentences = content
			.split(/[.!?]+/)
			.filter((s) => s.trim().length > 30);
		return sentences.slice(0, 5).map((s) => s.trim());
	}

	return insights;
}

function extractSources(
	content: string
): Array<{ title: string; url: string; snippet: string }> {
	const sources: Array<{ title: string; url: string; snippet: string }> = [];

	// Extract URLs from the content
	const urlRegex = /https?:\/\/[^\s)]+/g;
	const urls = content.match(urlRegex) || [];

	// Try to find context around URLs for titles and snippets
	urls.forEach((url) => {
		const index = content.indexOf(url);
		if (index === -1) return;

		// Look for text before the URL (potential title)
		const before = content.substring(Math.max(0, index - 100), index);
		const titleMatch = before.match(/([^.!?\n]+)$/);
		const title = titleMatch ? titleMatch[1].trim() : 'Source';

		// Look for text after the URL (potential snippet)
		const after = content.substring(
			index + url.length,
			Math.min(content.length, index + url.length + 150)
		);
		const snippetMatch = after.match(/^([^.!?\n]+)/);
		const snippet = snippetMatch ? snippetMatch[1].trim() : '';

		sources.push({
			title: title.length > 5 ? title : 'Referenced Source',
			url,
			snippet:
				snippet.length > 10 ? snippet : 'Relevant information source',
		});
	});

	return sources.slice(0, 10); // Limit to 10 sources
}

/**
 * Performs multiple related searches and synthesizes the results
 */
export async function performMultiQueryResearch(
	queries: string[],
	mainTopic: string
): Promise<WebSearchResult> {
	try {
		if (!queries || queries.length === 0) {
			return {
				success: false,
				message: 'At least one query is required',
			};
		}

		// Perform research for each query
		const results = await Promise.all(
			queries.slice(0, 3).map((q) => performWebResearch(q, mainTopic))
		);

		// Filter successful results
		const successfulResults = results.filter((r) => r.success && r.data);

		if (successfulResults.length === 0) {
			return {
				success: false,
				message: 'All research queries failed',
			};
		}

		// Merge insights and sources
		const allInsights: string[] = [];
		const allSources: Array<{
			title: string;
			url: string;
			snippet: string;
		}> = [];
		const summaries: string[] = [];

		successfulResults.forEach((result) => {
			if (result.data) {
				allInsights.push(...result.data.insights);
				allSources.push(...result.data.sources);
				summaries.push(result.data.summary);
			}
		});

		// Deduplicate sources by URL
		const uniqueSources = Array.from(
			new Map(allSources.map((s) => [s.url, s])).values()
		);

		// Deduplicate insights
		const uniqueInsights = Array.from(new Set(allInsights));

		return {
			success: true,
			message: 'Multi-query research completed successfully',
			data: {
				insights: uniqueInsights,
				sources: uniqueSources,
				summary: summaries.join('\n\n---\n\n'),
			},
		};
	} catch (error) {
		console.error('Multi-query research error:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to perform multi-query research',
			errors: error,
		};
	}
}
