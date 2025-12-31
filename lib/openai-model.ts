export function getOpenAIModel(): string {
	return process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
}

function supportsSamplingParams(model: string): boolean {
	const normalized = model.trim().toLowerCase();

	// OpenAI docs: `temperature`, `top_p`, `logprobs` are not supported for
	// older GPT-5 family models like `gpt-5`, `gpt-5-mini`, `gpt-5-nano`.
	// They are supported for `gpt-5.2`/`gpt-5.1` when reasoning effort is `none`.
	if (
		normalized === 'gpt-5' ||
		normalized.startsWith('gpt-5-mini') ||
		normalized.startsWith('gpt-5-nano')
	) {
		return false;
	}

	return true;
}

export function getOptionalSamplingParams(params: {
	model: string;
	temperature?: number;
	top_p?: number;
}): { temperature?: number; top_p?: number } {
	if (!supportsSamplingParams(params.model)) {
		return {};
	}

	const out: { temperature?: number; top_p?: number } = {};

	if (typeof params.temperature === 'number') {
		out.temperature = params.temperature;
	}
	if (typeof params.top_p === 'number') {
		out.top_p = params.top_p;
	}

	return out;
}
