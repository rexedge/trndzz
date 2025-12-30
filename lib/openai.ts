import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractJSON(text: string) {
	// Try to find a ```json ... ``` block first
	const jsonBlock = text.match(/```json([\s\S]*?)```/i);
	let candidate = jsonBlock ? jsonBlock[1].trim() : text;

	// If there's surrounding text, try to extract the first { ... }
	if (!jsonBlock) {
		const firstObj = candidate.match(/\{[\s\S]*\}/);
		if (firstObj) candidate = firstObj[0];
	}

	try {
		return JSON.parse(candidate);
	} catch (e) {
		return null;
	}
}

export async function generatePostFromTrend({
	title,
	trendMeta,
	tone = 'neutral professional',
	minWords = 1000,
}: {
	title: string;
	trendMeta?: any;
	tone?: string;
	minWords?: number;
}) {
	const system = `You are a helpful journalist and SEO copywriter. Produce a well-structured news-style article.`;

	const user = `Please produce a JSON object only (no extra human text) with these keys: title, slug, content, metaDescription, tags (array of strings), imagePrompt. Write a ${Math.max(
		minWords,
		800
	)}+ word news-style article under the 'content' field. Keep tone: ${tone}. Use the following context metadata: ${JSON.stringify(
		trendMeta ?? {}
	)}. Keep factual claims conservative; if unsure, note uncertainty in the content. Ensure tags are short keywords.`;

	const resp = await client.chat.completions.create({
		model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		],
		max_tokens: 3500,
	});

	const text = resp.choices?.[0]?.message?.content ?? '';
	const parsed = extractJSON(text);

	if (parsed) {
		const tags = Array.isArray(parsed.tags)
			? parsed.tags
			: typeof parsed.tags === 'string'
			? parsed.tags.split(/[,\n]/).map((s: string) => s.trim())
			: [];
		return {
			raw: text,
			parsed: {
				title: parsed.title ?? title,
				slug: parsed.slug,
				content: parsed.content ?? '',
				metaDescription: parsed.metaDescription ?? undefined,
				tags,
				imagePrompt: parsed.imagePrompt ?? undefined,
			},
		};
	}

	// Fallback simple parsing
	const imagePromptMatch = text.match(/image prompt[:\s-]*([\s\S]{10,200})/i);
	const metaMatch = text.match(/meta description[:\s-]*([\s\S]{10,200})/i);
	const tagsMatch = text.match(/tags[:\s-]*([\s\S]{1,200})/i);

	return {
		raw: text,
		parsed: {
			title,
			slug: undefined,
			content: text,
			metaDescription: metaMatch ? metaMatch[1].trim() : undefined,
			tags: tagsMatch
				? tagsMatch[1]
						.split(/[,\n]/)
						.map((s) => s.trim())
						.filter(Boolean)
				: [],
			imagePrompt: imagePromptMatch
				? imagePromptMatch[1].trim()
				: undefined,
		},
	};
}
