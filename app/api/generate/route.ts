import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { generatePostFromTrend } from '../../../lib/openai';
import {
	getTokenFromRequest,
	verifySessionToken,
} from '../../../lib/adminSession';

export async function POST(req: Request) {
	const token = getTokenFromRequest(req);
	if (!verifySessionToken(token))
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

	const body = await req.json();
	const { trendId } = body;
	if (!trendId)
		return NextResponse.json({ error: 'missing trendId' }, { status: 400 });

	const trend = await prisma.trend.findUnique({ where: { id: trendId } });
	if (!trend)
		return NextResponse.json({ error: 'trend not found' }, { status: 404 });

	const title = trend.title;

	const gen = await generatePostFromTrend({
		title,
		trendMeta: trend.metadata,
		minWords: 1000,
	});

	const parsed = gen.parsed ?? {};

	const finalTitle = parsed.title ?? title;
	const rawSlug = parsed.slug ?? finalTitle;
	const slug = rawSlug
		.toString()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 180);

	// sanitize tags
	const tagsRaw: any[] = Array.isArray(parsed.tags) ? parsed.tags : [];
	const tags = tagsRaw
		.map((t) =>
			typeof t === 'string'
				? t.replace(/["'*_`\n\r]/g, '').trim()
				: String(t)
		)
		.map((t) => t.replace(/[^\w\s-]/g, '').trim())
		.filter((t) => t.length > 0)
		.slice(0, 10);

	const post = await prisma.post.create({
		data: {
			title: finalTitle,
			slug,
			content: parsed.content ?? gen.raw,
			excerpt: parsed.metaDescription ?? undefined,
			featuredImagePrompt: parsed.imagePrompt ?? undefined,
			tags,
			status: 'draft',
			generatedFromTrendId: trend.id,
		},
	});

	return NextResponse.json({ ok: true, post });
}
