import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifySessionToken, getTokenFromCookies } from '@/lib/auth/session';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const token = await getTokenFromCookies();
		if (!(await verifySessionToken(token))) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { title, content, currentTags = [] } = body;

		if (!title || !content) {
			return NextResponse.json(
				{ success: false, message: 'Title and content are required' },
				{ status: 400 }
			);
		}

		// Generate SEO details using OpenAI
		const prompt = `You are an SEO expert. Analyze this article and provide optimized SEO elements.

ARTICLE TITLE: ${title}

ARTICLE CONTENT (excerpt):
${content.slice(0, 3000)}

CURRENT TAGS: ${currentTags.join(', ') || 'None'}

Please provide a JSON response with the following structure:
{
  "metaDescription": "A compelling meta description between 150-160 characters that includes the main keyword and encourages clicks",
  "tags": ["array", "of", "10-15", "relevant", "SEO", "keywords", "and", "tags"],
  "relatedQueries": ["array", "of", "8-12", "related", "search", "queries", "people", "might", "use"],
  "excerpt": "A 2-3 sentence engaging excerpt/summary that captures the article's essence",
  "suggestedTitle": "An SEO-optimized alternative title (if current can be improved)",
  "focusKeyword": "The primary keyword this article should rank for"
}

Important guidelines:
- Meta description should be action-oriented and include the focus keyword
- Tags should include both broad and long-tail keywords
- Related queries should be actual search queries people might type
- Consider Nigerian/African audience if content is region-specific
- Include trending search terms where relevant`;

		const response = await openai.chat.completions.create({
			model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are an SEO expert. Always respond with valid JSON only, no markdown or extra text.',
				},
				{ role: 'user', content: prompt },
			],
			max_tokens: 1500,
			temperature: 0.7,
		});

		const text = response.choices?.[0]?.message?.content ?? '';

		// Parse JSON response
		let seoData;
		try {
			// Try to extract JSON from the response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				seoData = JSON.parse(jsonMatch[0]);
			} else {
				throw new Error('No JSON found in response');
			}
		} catch {
			return NextResponse.json(
				{ success: false, message: 'Failed to parse SEO data' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: 'SEO data generated successfully',
			data: {
				metaDescription: seoData.metaDescription || '',
				tags: Array.isArray(seoData.tags) ? seoData.tags : [],
				relatedQueries: Array.isArray(seoData.relatedQueries)
					? seoData.relatedQueries
					: [],
				excerpt: seoData.excerpt || '',
				suggestedTitle: seoData.suggestedTitle || '',
				focusKeyword: seoData.focusKeyword || '',
			},
		});
	} catch (error) {
		console.error('SEO generation error:', error);
		return NextResponse.json(
			{ success: false, message: 'Failed to generate SEO data' },
			{ status: 500 }
		);
	}
}
