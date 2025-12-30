/**
 * Image service for fetching featured images from Unsplash and Pexels
 *
 * Images are:
 * - Editorial
 * - Calm
 * - Relevant
 * - Non-sensational
 *
 * Always includes alt text for accessibility and SEO
 */

export interface ImageResult {
	success: boolean;
	message: string;
	data?: {
		url: string;
		thumbnailUrl: string;
		alt: string;
		credit: string;
		source: 'unsplash' | 'pexels';
	};
	errors?: any;
}

/**
 * Fetches an editorial image from Unsplash
 */
export async function fetchUnsplashImage(query: string): Promise<ImageResult> {
	try {
		const accessKey = process.env.UNSPLASH_ACCESS_KEY;

		if (!accessKey) {
			return {
				success: false,
				message: 'Unsplash API key not configured',
			};
		}

		const url = new URL('https://api.unsplash.com/search/photos');
		url.searchParams.set('query', query);
		url.searchParams.set('per_page', '1');
		url.searchParams.set('orientation', 'landscape');
		url.searchParams.set('content_filter', 'high');

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Client-ID ${accessKey}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Unsplash API error: ${response.status}`);
		}

		const data = await response.json();

		if (!data.results || data.results.length === 0) {
			return {
				success: false,
				message: 'No images found on Unsplash',
			};
		}

		const photo = data.results[0];

		return {
			success: true,
			message: 'Image fetched from Unsplash',
			data: {
				url: photo.urls.regular,
				thumbnailUrl: photo.urls.small,
				alt: photo.alt_description || photo.description || query,
				credit: `Photo by ${photo.user.name} on Unsplash`,
				source: 'unsplash',
			},
		};
	} catch (error) {
		console.error('Unsplash fetch error:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to fetch from Unsplash',
			errors: error,
		};
	}
}

/**
 * Fetches an editorial image from Pexels
 */
export async function fetchPexelsImage(query: string): Promise<ImageResult> {
	try {
		const apiKey = process.env.PEXELS_API_KEY;

		if (!apiKey) {
			return {
				success: false,
				message: 'Pexels API key not configured',
			};
		}

		const url = new URL('https://api.pexels.com/v1/search');
		url.searchParams.set('query', query);
		url.searchParams.set('per_page', '1');
		url.searchParams.set('orientation', 'landscape');

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: apiKey,
			},
		});

		if (!response.ok) {
			throw new Error(`Pexels API error: ${response.status}`);
		}

		const data = await response.json();

		if (!data.photos || data.photos.length === 0) {
			return {
				success: false,
				message: 'No images found on Pexels',
			};
		}

		const photo = data.photos[0];

		return {
			success: true,
			message: 'Image fetched from Pexels',
			data: {
				url: photo.src.large,
				thumbnailUrl: photo.src.medium,
				alt: photo.alt || query,
				credit: `Photo by ${photo.photographer} on Pexels`,
				source: 'pexels',
			},
		};
	} catch (error) {
		console.error('Pexels fetch error:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to fetch from Pexels',
			errors: error,
		};
	}
}

/**
 * Fetches an image with fallback logic: Unsplash first, then Pexels
 */
export async function fetchFeaturedImage(query: string): Promise<ImageResult> {
	// Try Unsplash first (primary source)
	const unsplashResult = await fetchUnsplashImage(query);

	if (unsplashResult.success) {
		return unsplashResult;
	}

	// Fallback to Pexels
	const pexelsResult = await fetchPexelsImage(query);

	if (pexelsResult.success) {
		return pexelsResult;
	}

	// Both failed
	return {
		success: false,
		message: 'Failed to fetch image from both Unsplash and Pexels',
		errors: {
			unsplash: unsplashResult.message,
			pexels: pexelsResult.message,
		},
	};
}

/**
 * Generates a search query from an image prompt
 */
export function sanitizeImageQuery(prompt: string): string {
	// Remove common AI prompt instructions
	const cleaned = prompt
		.replace(
			/\b(photograph|photo|image|picture|editorial|high-quality|professional|minimalist|calm)\b/gi,
			''
		)
		.replace(/\b(no text|no logos?|no watermarks?)\b/gi, '')
		.replace(/[,\.;:]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	// Extract the main subject (first meaningful phrase)
	const words = cleaned.split(' ').filter((w) => w.length > 2);
	const mainQuery = words.slice(0, 4).join(' ');

	return mainQuery || 'editorial news';
}

/**
 * Fetches and processes a featured image based on an AI-generated prompt
 */
export async function fetchImageFromPrompt(
	imagePrompt: string
): Promise<ImageResult> {
	const query = sanitizeImageQuery(imagePrompt);
	return await fetchFeaturedImage(query);
}
