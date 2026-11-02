import React from 'react';

interface JsonLdProps {
	data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders structured Schema.org JSON-LD safely in Server Components
 * (escapes `<` to `\u003c` per Next.js JSON-LD security guidance).
 */
export function JsonLd({ data }: JsonLdProps) {
	const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
	return (
		<script
			type='application/ld+json'
			dangerouslySetInnerHTML={{ __html: serialized }}
		/>
	);
}

export function buildBreadcrumbJsonLd(
	items: { name: string; url: string }[]
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, idx) => ({
			'@type': 'ListItem',
			position: idx + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

export function buildNewsArticleJsonLd(params: {
	headline: string;
	description: string;
	url: string;
	datePublished?: Date | string | null;
	dateModified?: Date | string | null;
	authorName?: string | null;
	verticalName?: string | null;
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		headline: params.headline,
		description: params.description,
		mainEntityOfPage: params.url,
		datePublished: params.datePublished
			? new Date(params.datePublished).toISOString()
			: undefined,
		dateModified: params.dateModified
			? new Date(params.dateModified).toISOString()
			: undefined,
		author: {
			'@type': 'Person',
			name: params.authorName || 'Trndzz Market Intelligence Desk',
		},
		publisher: {
			'@type': 'Organization',
			name: params.verticalName
				? `Trndzz ${params.verticalName}`
				: 'Trndzz',
		},
	};
}

export function buildOrganizationJsonLd(params: {
	name: string;
	description?: string | null;
	url: string;
	state: string;
	city?: string | null;
	email?: string | null;
	telephone?: string | null;
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: params.name,
		description: params.description || undefined,
		url: params.url,
		email: params.email || undefined,
		telephone: params.telephone || undefined,
		address: {
			'@type': 'PostalAddress',
			addressLocality: params.city || undefined,
			addressRegion: params.state,
			addressCountry: 'NG',
		},
	};
}

export function buildProductJsonLd(params: {
	name: string;
	description?: string | null;
	url: string;
	categoryName: string;
	supplierName: string;
	currency: string;
	lowPrice?: number | null;
	highPrice?: number | null;
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: params.name,
		description: params.description || `${params.name} supplied by ${params.supplierName}`,
		category: params.categoryName,
		brand: {
			'@type': 'Organization',
			name: params.supplierName,
		},
		...(params.lowPrice
			? {
					offers: {
						'@type': 'AggregateOffer',
						priceCurrency: params.currency,
						lowPrice: params.lowPrice,
						highPrice: params.highPrice ?? params.lowPrice,
						url: params.url,
					},
				}
			: {}),
	};
}

