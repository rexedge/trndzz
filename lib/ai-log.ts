type AnyRecord = Record<string, unknown>;

function truncate(value: unknown, max = 4000): unknown {
	if (typeof value !== 'string') return value;
	if (value.length <= max) return value;
	return value.slice(0, max) + `\n…(truncated, ${value.length - max} chars)`;
}

function safeJson(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

export function aiDebugEnabled(): boolean {
	return (
		process.env.AI_DEBUG_LOG === 'true' ||
		process.env.AI_DEBUG_LOG === '1' ||
		process.env.AI_DEBUG_LOG === 'yes'
	);
}

export function logAiEvent(label: string, payload: AnyRecord) {
	if (!aiDebugEnabled()) return;

	const scrubbed: AnyRecord = {
		...payload,
		// Normalize any known big fields
		prompt: truncate(payload.prompt),
		responseText: truncate(payload.responseText),
	};

	// Also truncate message content if present
	if (Array.isArray(scrubbed.messages)) {
		scrubbed.messages = (scrubbed.messages as unknown[]).map((m) => {
			if (!m || typeof m !== 'object') return m;
			const msg = m as AnyRecord;
			return {
				...msg,
				content: truncate(msg.content),
			};
		});
	}

	// eslint-disable-next-line no-console
	console.log(`\n[AI] ${label}\n${safeJson(scrubbed)}\n`);
}
