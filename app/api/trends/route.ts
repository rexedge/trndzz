import { NextResponse } from 'next/server';
import { fetchRealtimeTrends } from '../../../lib/googleTrends';
import { prisma } from '../../../lib/db';

export async function GET() {
	// Fetch for Nigeria and US
	const [ng, us] = await Promise.all([
		fetchRealtimeTrends('NG'),
		fetchRealtimeTrends('US'),
	]);

	// Basic upsert of top story titles
	const results: any[] = [];

	for (const { geo, data } of [
		{ geo: 'NG', data: ng },
		{ geo: 'US', data: us },
	]) {
		// try to extract a list of trending articles / storyTitles
		// support multiple response shapes, including our Reddit fallback { fallback: true, items: [...] }
		let items: any[] = [];
		if (data?.items && Array.isArray(data.items)) items = data.items;
		else if (data?.storyArticles) items = data.storyArticles;
		else if (data?.default?.trendingSearchesDays)
			items = data.default.trendingSearchesDays;
		else if (data?.trends && Array.isArray(data.trends))
			items = data.trends;
		else if (Array.isArray(data)) items = data;

		// take first 10
		const sliced = items.slice?.(0, 10) ?? [];

		for (const it of sliced) {
			const title = it.title?.query || it.title || it;
			if (!title) continue;
			const identifier = (it.title?.query || title)
				.toString()
				.slice(0, 200);
			let t = await prisma.trend.findFirst({
				where: { provider: 'google', identifier },
			});
			if (!t) {
				t = await prisma.trend.create({
					data: {
						provider: 'google',
						identifier,
						title: title.toString(),
						metadata: it,
					} as any,
				});
			} else {
				t = await prisma.trend.update({
					where: { id: t.id },
					data: {
						title: title.toString(),
						metadata: it,
						fetchedAt: new Date(),
					} as any,
				});
			}
			results.push({ geo, title, id: t.id });
		}
	}

	return NextResponse.json({ ok: true, results });
}
