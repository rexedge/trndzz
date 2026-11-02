import 'server-only';
import {
	ArticleStatus,
	RfqStatus,
	RfqVisibility,
	VerticalStatus,
} from '@prisma/client';
import { getOpenAIClient } from '@/lib/openai-client';
import {
	getOpenAIModel,
	getOptionalSamplingParams,
} from '@/lib/openai-model';
import { prisma } from '@/lib/prisma/client';

export type EcosystemSearchScope =
	| 'all'
	| 'suppliers'
	| 'products'
	| 'articles'
	| 'rfqs'
	| 'learn';

export interface SemanticIntentExpansion {
	expandedKeywords: string[];
	detectedSpecs: Record<string, string>;
	intentSummary: string | null;
	aiAssisted: boolean;
}

function deterministicSpecParse(rawQuery: string): SemanticIntentExpansion {
	const detectedSpecs: Record<string, string> = {};
	const synonyms = new Set<string>();

	const alloyMatch = rawQuery.match(/\b(AA\d{4}(?:-[A-Z0-9]+)?|6063|3003|1100)\b/i);
	if (alloyMatch) {
		detectedSpecs.alloy = alloyMatch[1].toUpperCase();
		synonyms.add(alloyMatch[1].toUpperCase());
	}

	const gaugeMatch = rawQuery.match(/\b(0\.\d{2,3}|\d{1,2}(?:\.\d+)?)\s*mm\b/i);
	if (gaugeMatch) {
		detectedSpecs.dimension_mm = `${gaugeMatch[1]}mm`;
		synonyms.add(gaugeMatch[1]);
	}

	const rebarGradeMatch = rawQuery.match(/\b(B500B|B500C|BS4449|TMT)\b/i);
	if (rebarGradeMatch) {
		detectedSpecs.steel_grade = rebarGradeMatch[1].toUpperCase();
		synonyms.add('TMT rebar');
	}

	const wattMatch = rawQuery.match(/\b(\d{3,4})\s*(?:Wp|W|kW|kWh)\b/i);
	if (wattMatch) {
		detectedSpecs.power_rating = wattMatch[0];
		synonyms.add(wattMatch[1]);
	}

	const qLower = rawQuery.toLowerCase();
	if (qLower.includes('iron rod') || qLower.includes('reinforcement')) {
		synonyms.add('TMT');
		synonyms.add('Rebar');
	}
	if (qLower.includes('roof') || qLower.includes('corrugated')) {
		synonyms.add('Stucco');
		synonyms.add('Coil');
	}
	if (qLower.includes('panel') || qLower.includes('pv')) {
		synonyms.add('Bifacial');
		synonyms.add('TOPCon');
	}
	if (qLower.includes('battery') || qLower.includes('storage')) {
		synonyms.add('LFP');
		synonyms.add('BESS');
	}

	return {
		expandedKeywords: Array.from(synonyms).slice(0, 4),
		detectedSpecs,
		intentSummary: null,
		aiAssisted: false,
	};
}

async function expandIndustrialSearchIntent(
	rawQuery: string,
	verticalName?: string
): Promise<SemanticIntentExpansion> {
	const base = deterministicSpecParse(rawQuery);
	if (!process.env.OPENAI_API_KEY || rawQuery.trim().length < 3) {
		return base;
	}

	try {
		const client = getOpenAIClient();
		const model = getOpenAIModel();

		const completion = await client.chat.completions.create(
			{
				model,
				...getOptionalSamplingParams({ model, temperature: 0.1 }),
				response_format: { type: 'json_object' },
				max_completion_tokens: 220,
				messages: [
					{
						role: 'system',
						content:
							'You are an industrial B2B procurement search parser for West African supply chains (Aluminium, Steel, Solar, Construction). Return JSON with keys: "expandedKeywords" (string[] max 4 technical synonyms/alloys/standards), "detectedSpecs" (Record<string,string> of technical attributes like alloy, gauge_mm, rebar_diameter_mm, wattage_wp), and "intentSummary" (1 concise sentence <= 110 chars).',
					},
					{
						role: 'user',
						content: verticalName
							? `Vertical: ${verticalName}\nQuery: ${rawQuery}`
							: `Query: ${rawQuery}`,
					},
				],
			},
			{ timeout: 3200 }
		);

		const text = completion.choices[0]?.message?.content;
		if (!text) return base;

		const parsed = JSON.parse(text) as {
			expandedKeywords?: unknown;
			detectedSpecs?: unknown;
			intentSummary?: unknown;
		};

		const aiKeywords = Array.isArray(parsed.expandedKeywords)
			? parsed.expandedKeywords
					.filter((x): x is string => typeof x === 'string')
					.map((s) => s.trim())
					.filter((s) => s.length >= 2)
					.slice(0, 4)
			: [];

		const aiSpecs: Record<string, string> = { ...base.detectedSpecs };
		if (
			parsed.detectedSpecs &&
			typeof parsed.detectedSpecs === 'object' &&
			!Array.isArray(parsed.detectedSpecs)
		) {
			for (const [k, v] of Object.entries(parsed.detectedSpecs)) {
				if (typeof v === 'string' && v.trim()) {
					aiSpecs[k] = v.trim();
				}
			}
		}

		return {
			expandedKeywords: Array.from(
				new Set([...base.expandedKeywords, ...aiKeywords])
			).slice(0, 5),
			detectedSpecs: aiSpecs,
			intentSummary:
				typeof parsed.intentSummary === 'string'
					? parsed.intentSummary.slice(0, 140)
					: null,
			aiAssisted: true,
		};
	} catch {
		return base;
	}
}

export async function searchEcosystem(params: {
	query: string;
	verticalId?: string;
	verticalName?: string;
	scope?: EcosystemSearchScope;
}) {
	const trimmed = params.query.trim();
	const scope: EcosystemSearchScope = params.scope ?? 'all';

	if (!trimmed) {
		return {
			query: '',
			intent: {
				expandedKeywords: [],
				detectedSpecs: {},
				intentSummary: null,
				aiAssisted: false,
			},
			companies: [],
			products: [],
			articles: [],
			rfqs: [],
			resources: [],
			totalResults: 0,
		};
	}

	const intent = await expandIndustrialSearchIntent(
		trimmed,
		params.verticalName
	);

	const terms = Array.from(
		new Set([trimmed, ...intent.expandedKeywords])
	).filter(Boolean);

	const wantSuppliers = scope === 'all' || scope === 'suppliers';
	const wantProducts = scope === 'all' || scope === 'products';
	const wantArticles = scope === 'all' || scope === 'articles';
	const wantRfqs = scope === 'all' || scope === 'rfqs';
	const wantLearn = scope === 'all' || scope === 'learn';

	const [companies, productsRaw, articles, rfqsRaw, resources] =
		await Promise.all([
			wantSuppliers
				? prisma.company.findMany({
						where: {
							isPublished: true,
							...(params.verticalId
								? {
										verticals: {
											some: {
												verticalId: params.verticalId,
											},
										},
									}
								: {
										verticals: {
											some: {
												vertical: {
													status: VerticalStatus.ACTIVE,
												},
											},
										},
									}),
							OR: terms.flatMap((t) => [
								{ name: { contains: t, mode: 'insensitive' } },
								{
									tagline: {
										contains: t,
										mode: 'insensitive',
									},
								},
								{
									description: {
										contains: t,
										mode: 'insensitive',
									},
								},
								{
									headquartersState: {
										contains: t,
										mode: 'insensitive',
									},
								},
							]),
						},
						orderBy: [
							{ verificationTier: 'desc' },
							{ claimStatus: 'desc' },
						],
						take: 12,
						include: {
							verticals: {
								take: 2,
								include: {
									vertical: {
										select: { name: true, slug: true },
									},
								},
							},
							certifications: {
								where: { isVerified: true },
								take: 2,
							},
						},
					})
				: Promise.resolve([]),

			wantProducts
				? prisma.companyProduct.findMany({
						where: {
							isActive: true,
							company: { isPublished: true },
							...(params.verticalId
								? { verticalId: params.verticalId }
								: {
										vertical: {
											status: VerticalStatus.ACTIVE,
										},
									}),
						},
						orderBy: [
							{ company: { verificationTier: 'desc' } },
							{ createdAt: 'desc' },
						],
						take: 60,
						include: {
							vertical: { select: { name: true, slug: true } },
							category: { select: { name: true, slug: true } },
							company: {
								select: {
									name: true,
									slug: true,
									verificationTier: true,
									headquartersState: true,
								},
							},
						},
					})
				: Promise.resolve([]),

			wantArticles
				? prisma.article.findMany({
						where: {
							status: ArticleStatus.PUBLISHED,
							...(params.verticalId
								? { verticalId: params.verticalId }
								: {}),
							OR: terms.flatMap((t) => [
								{ title: { contains: t, mode: 'insensitive' } },
								{
									excerpt: {
										contains: t,
										mode: 'insensitive',
									},
								},
								{ body: { contains: t, mode: 'insensitive' } },
							]),
						},
						orderBy: { publishedAt: 'desc' },
						take: 12,
						include: {
							vertical: { select: { name: true, slug: true } },
							valueChainStage: {
								select: { name: true, slug: true },
							},
						},
					})
				: Promise.resolve([]),

			wantRfqs
				? prisma.rfq.findMany({
						where: {
							visibility: RfqVisibility.PUBLIC_BOARD,
							status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] },
							...(params.verticalId
								? { verticalId: params.verticalId }
								: {
										vertical: {
											status: VerticalStatus.ACTIVE,
										},
									}),
							OR: terms.flatMap((t) => [
								{
									referenceNumber: {
										contains: t,
										mode: 'insensitive',
									},
								},
								{ title: { contains: t, mode: 'insensitive' } },
								{
									deliveryState: {
										contains: t,
										mode: 'insensitive',
									},
								},
								{
									category: {
										name: {
											contains: t,
											mode: 'insensitive',
										},
									},
								},
							]),
						},
						orderBy: { createdAt: 'desc' },
						take: 10,
						include: {
							vertical: { select: { name: true, slug: true } },
							category: { select: { name: true, slug: true } },
							_count: { select: { quotes: true } },
						},
					})
				: Promise.resolve([]),

			wantLearn
				? prisma.knowledgeResource.findMany({
						where: {
							isPublished: true,
							...(params.verticalId
								? {
										OR: [
											{ verticalId: params.verticalId },
											{ verticalId: null },
										],
									}
								: {}),
							AND: [
								{
									OR: terms.flatMap((t) => [
										{
											title: {
												contains: t,
												mode: 'insensitive',
											},
										},
										{
											summary: {
												contains: t,
												mode: 'insensitive',
											},
										},
										{
											contentPreview: {
												contains: t,
												mode: 'insensitive',
											},
										},
									]),
								},
							],
						},
						orderBy: [
							{ isFeatured: 'desc' },
							{ publishedAt: 'desc' },
						],
						take: 10,
						include: {
							vertical: { select: { name: true, slug: true } },
						},
					})
				: Promise.resolve([]),
		]);

	// Filter products against name, description, category, AND JSON specifications
	const lowerTerms = terms.map((t) => t.toLowerCase());
	const products = productsRaw
		.filter((p) => {
			const specValues = Object.entries(
				(p.specifications as Record<string, string>) ?? {}
			)
				.map(([k, v]) => `${k} ${v}`)
				.join(' ')
				.toLowerCase();
			const haystack =
				`${p.name} ${p.description ?? ''} ${p.category.name} ${specValues}`.toLowerCase();
			return lowerTerms.some((term) => haystack.includes(term));
		})
		.slice(0, 12)
		.map((p) => ({
			id: p.id,
			name: p.name,
			slug: p.slug,
			description: p.description,
			specifications: (p.specifications as Record<string, string>) ?? {},
			unit: p.unit,
			indicativeMin:
				p.indicativeMin !== null ? Number(p.indicativeMin) : null,
			indicativeMax:
				p.indicativeMax !== null ? Number(p.indicativeMax) : null,
			currency: p.currency,
			datasheetUrl: p.datasheetUrl,
			vertical: p.vertical,
			category: p.category,
			company: p.company,
		}));

	const rfqs = rfqsRaw.map((r) => ({
		id: r.id,
		referenceNumber: r.referenceNumber,
		title: r.title,
		quantity: Number(r.quantity),
		unit: r.unit,
		deliveryState: r.deliveryState,
		vertical: r.vertical,
		category: r.category,
		quotesCount: r._count.quotes,
	}));

	const totalResults =
		companies.length +
		products.length +
		articles.length +
		rfqs.length +
		resources.length;

	return {
		query: trimmed,
		intent,
		companies,
		products,
		articles,
		rfqs,
		resources,
		totalResults,
	};
}

