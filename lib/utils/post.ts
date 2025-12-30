/**
 * Post Utility Functions
 * Shared helpers for formatting and processing post data
 */

/**
 * Format a date for display
 */
export function formatDate(
	date: Date | null,
	format: 'short' | 'long' = 'short'
) {
	if (!date) return 'Recently';

	if (format === 'long') {
		return date.toLocaleDateString('en-NG', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	}

	return date.toLocaleDateString('en-NG', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

/**
 * Estimate read time based on word count
 */
export function estimateReadTime(
	content: string,
	format: 'short' | 'long' = 'short'
) {
	const words = content.split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / 220));

	if (format === 'long') {
		return `${minutes} minute${minutes > 1 ? 's' : ''}`;
	}

	return `${minutes} min`;
}

/**
 * Extract a clean excerpt from content
 */
export function getExcerpt(
	content: string,
	excerpt?: string | null,
	length = 150
) {
	if (excerpt && excerpt.trim().length > 0) {
		const trimmed = excerpt.trim();
		return trimmed.length > length
			? trimmed.substring(0, length) + '…'
			: trimmed;
	}

	// Remove markdown syntax for clean excerpt
	const plainText = content
		.replace(/#{1,6}\s+/g, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\n+/g, ' ')
		.trim();

	if (plainText.length <= length) return plainText;
	const truncated = plainText.substring(0, length);
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > Math.floor(length * 0.6)
		? truncated.substring(0, lastSpace) + '…'
		: truncated + '…';
}

/**
 * Get summary for meta descriptions (SEO)
 */
export function getSummary(
	content: string,
	excerpt?: string | null,
	maxLength = 160
) {
	if (excerpt && excerpt.trim().length > 0) {
		const trimmed = excerpt.trim();
		return trimmed.length > maxLength
			? trimmed.substring(0, maxLength) + '…'
			: trimmed;
	}

	const plainText = content
		.replace(/#{1,6}\s+/g, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\n+/g, ' ')
		.trim();

	if (plainText.length <= maxLength) return plainText;
	return plainText.slice(0, maxLength) + '…';
}
