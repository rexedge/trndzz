/**
 * Formats commercial & commodity monetary figures.
 * Defaults to Nigerian Naira (NGN / ₦) per TRNDZZ localization standards;
 * supports explicit international benchmark currencies (e.g., USD for LME).
 */
export function formatCurrency(
	amount: number | string,
	currency: string = 'NGN',
	options?: { maximumFractionDigits?: number; compact?: boolean }
): string {
	const numeric = typeof amount === 'string' ? Number(amount) : amount;
	if (Number.isNaN(numeric)) return '—';

	const code = currency.toUpperCase();
	const locale = code === 'NGN' ? 'en-NG' : 'en-US';
	const maxDigits =
		options?.maximumFractionDigits ?? (numeric % 1 === 0 ? 0 : 2);

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: code,
		notation: options?.compact ? 'compact' : 'standard',
		maximumFractionDigits: maxDigits,
	}).format(numeric);
}

/**
 * Formats integer/decimal statistics cleanly with thousands separators.
 */
export function formatNumber(
	value: number | string,
	maximumFractionDigits = 0
): string {
	const numeric = typeof value === 'string' ? Number(value) : value;
	if (Number.isNaN(numeric)) return '0';
	return new Intl.NumberFormat('en-NG', {
		maximumFractionDigits,
	}).format(numeric);
}

/**
 * Formats signed percentage deltas for commodity price tickers (e.g., "+1.85%" or "-0.42%").
 */
export function formatPercentDelta(value: number | string | null | undefined): {
	label: string;
	direction: 'up' | 'down' | 'flat';
} {
	if (value === null || value === undefined) {
		return { label: '0.00%', direction: 'flat' };
	}
	const numeric = typeof value === 'string' ? Number(value) : value;
	if (Number.isNaN(numeric) || numeric === 0) {
		return { label: '0.00%', direction: 'flat' };
	}
	const sign = numeric > 0 ? '+' : '';
	return {
		label: `${sign}${numeric.toFixed(2)}%`,
		direction: numeric > 0 ? 'up' : 'down',
	};
}

