/**
 * CSV Parser for Google Trends Related Queries
 * Extracts title and related queries from downloaded CSV files
 */

export interface ParsedTrendCSV {
	title: string;
	category: string;
	dateRange: string;
	location: string;
	topQueries: { query: string; score: number }[];
	risingQueries: { query: string; trend: string }[];
}

export interface TrendDataForGeneration {
	title: string;
	relatedQueries: string[];
	metadata: {
		category: string;
		dateRange: string;
		location: string;
		topQueries: { query: string; score: number }[];
		risingQueries: { query: string; trend: string }[];
	};
}

/**
 * Parse Google Trends Related Queries CSV file
 */
export function parseRelatedQueriesCSV(csvContent: string): ParsedTrendCSV {
	const lines = csvContent.trim().split('\n');

	let category = 'All categories';
	let title = '';
	let dateRange = '';
	let location = '';
	const topQueries: { query: string; score: number }[] = [];
	const risingQueries: { query: string; trend: string }[] = [];

	let currentSection: 'none' | 'top' | 'rising' = 'none';

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip empty lines
		if (!line) continue;

		// Parse category line (first line)
		if (line.startsWith('Category:')) {
			category = line.replace('Category:', '').trim();
			continue;
		}

		// Parse title line - format: "title: (dateRange, location)"
		// Example: "anthony joshua accident: (12/29/25, 8:15 AM - 12/30/25, 8:15 AM, Nigeria)"
		const titleMatch = line.match(
			/^"?([^:]+):\s*\(([^,]+,\s*[\d:]+\s*[AP]M\s*-\s*[^,]+,\s*[\d:]+\s*[AP]M),\s*([^)]+)\)"?$/
		);
		if (titleMatch) {
			title = titleMatch[1].trim();
			dateRange = titleMatch[2].trim();
			location = titleMatch[3].trim();
			continue;
		}

		// Detect section headers
		if (line === 'TOP') {
			currentSection = 'top';
			continue;
		}
		if (line === 'RISING') {
			currentSection = 'rising';
			continue;
		}

		// Parse data rows
		if (currentSection === 'top') {
			const parts = line.split(',');
			if (parts.length >= 2) {
				const query = parts.slice(0, -1).join(',').trim();
				const score = parseInt(parts[parts.length - 1], 10);
				if (query && !isNaN(score)) {
					topQueries.push({ query, score });
				}
			}
		}

		if (currentSection === 'rising') {
			const parts = line.split(',');
			if (parts.length >= 2) {
				const query = parts.slice(0, -1).join(',').trim();
				const trend = parts[parts.length - 1].trim();
				if (query && trend) {
					risingQueries.push({ query, trend });
				}
			}
		}
	}

	// If title wasn't found with the regex, try simpler parsing
	if (!title) {
		for (const line of lines) {
			if (
				line.includes(':') &&
				line.includes('(') &&
				!line.startsWith('Category')
			) {
				const colonIndex = line.indexOf(':');
				title = line.substring(0, colonIndex).replace(/^"/, '').trim();
				break;
			}
		}
	}

	return {
		title: title || 'Untitled Trend',
		category,
		dateRange,
		location,
		topQueries,
		risingQueries,
	};
}

/**
 * Extract data needed for content generation
 */
export function extractGenerationData(
	parsed: ParsedTrendCSV
): TrendDataForGeneration {
	// Combine top and rising queries, prioritizing top queries
	const allQueries = [
		...parsed.topQueries.map((q) => q.query),
		...parsed.risingQueries.map((q) => q.query),
	];

	// Remove duplicates and limit to most relevant
	const uniqueQueries = [...new Set(allQueries)].slice(0, 15);

	return {
		title: parsed.title,
		relatedQueries: uniqueQueries,
		metadata: {
			category: parsed.category,
			dateRange: parsed.dateRange,
			location: parsed.location,
			topQueries: parsed.topQueries,
			risingQueries: parsed.risingQueries,
		},
	};
}

/**
 * Clean and format the title for display
 */
export function cleanTitle(title: string): string {
	return title
		.split(' ')
		.map(
			(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join(' ');
}
