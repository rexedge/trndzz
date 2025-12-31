import OpenAI from 'openai';

import { logAiEvent } from './ai-log';

let singleton: OpenAI | null = null;
let patched = false;

function patchClient(client: OpenAI) {
	if (patched) return;
	patched = true;

	const originalChatCreate = client.chat.completions.create.bind(
		client.chat.completions
	);

	// Patch chat completions to log requests/responses.
	(client.chat.completions as any).create = async (
		args: any,
		options?: any
	) => {
		const startedAt = Date.now();
		try {
			const resp = await originalChatCreate(args, options);

			logAiEvent('chat.completions.create', {
				ms: Date.now() - startedAt,
				model: args?.model,
				max_completion_tokens: args?.max_completion_tokens,
				messages: args?.messages,
				id: resp?.id,
				usage: resp?.usage,
				finish_reason: resp?.choices?.[0]?.finish_reason,
				responseText: resp?.choices?.[0]?.message?.content ?? '',
			});

			return resp;
		} catch (error) {
			logAiEvent('chat.completions.create:error', {
				ms: Date.now() - startedAt,
				model: args?.model,
				max_completion_tokens: args?.max_completion_tokens,
				temperature: args?.temperature,
				top_p: args?.top_p,
				response_format: args?.response_format,
				messages: args?.messages,
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
						  }
						: error,
			});
			throw error;
		}
	};

	// Patch image generation to log requests/responses (avoid logging base64).
	const originalImagesGenerate = client.images.generate.bind(client.images);
	(client.images as any).generate = async (args: any, options?: any) => {
		const startedAt = Date.now();
		try {
			const resp = await originalImagesGenerate(args, options);
			const first = resp?.data?.[0];
			const b64Len =
				typeof first?.b64_json === 'string' ? first.b64_json.length : 0;

			logAiEvent('images.generate', {
				ms: Date.now() - startedAt,
				model: args?.model,
				prompt: args?.prompt,
				n: args?.n,
				size: args?.size,
				quality: args?.quality,
				response_format: args?.response_format,
				revised_prompt: first?.revised_prompt,
				hasB64: Boolean(first?.b64_json),
				b64Len,
			});

			return resp;
		} catch (error) {
			logAiEvent('images.generate:error', {
				ms: Date.now() - startedAt,
				model: args?.model,
				prompt: args?.prompt,
				n: args?.n,
				size: args?.size,
				quality: args?.quality,
				response_format: args?.response_format,
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
						  }
						: error,
			});
			throw error;
		}
	};
}

export function getOpenAIClient(): OpenAI {
	if (!singleton) {
		singleton = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	}

	patchClient(singleton);
	return singleton;
}
