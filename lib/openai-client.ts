import 'server-only';
import OpenAI from 'openai';

let singleton: OpenAI | null = null;

/**
 * Server-only OpenAI singleton reserved strictly for semantic search,
 * entity matching, and RFQ specification normalization.
 */
export function getOpenAIClient(): OpenAI {
	if (!singleton) {
		singleton = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}
	return singleton;
}
