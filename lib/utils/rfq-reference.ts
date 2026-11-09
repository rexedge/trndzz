/**
 * Pure helpers for RFQ reference numbers (e.g. "RFQ-ALU-2026-00042").
 * Kept free of database imports so they can be unit tested directly.
 */

export const RFQ_SEQUENCE_DIGITS = 5;

export function rfqPrefixFromVerticalSlug(verticalSlug: string): string {
	const letters = verticalSlug.replace(/[^a-z]/gi, '').toUpperCase();
	return (letters.slice(0, 3) || 'GEN').padEnd(3, 'X');
}

export function formatRfqReference(
	prefix: string,
	year: number,
	sequence: number
): string {
	return `RFQ-${prefix}-${year}-${String(sequence).padStart(RFQ_SEQUENCE_DIGITS, '0')}`;
}

/**
 * Extracts the trailing sequence number from a reference, or 0 when the
 * reference does not follow the expected format.
 */
export function parseRfqSequence(referenceNumber: string): number {
	const match = /^RFQ-[A-Z]{3}-\d{4}-(\d+)$/.exec(referenceNumber.trim());
	if (!match) return 0;
	const value = Number(match[1]);
	return Number.isSafeInteger(value) ? value : 0;
}

