import gtrends from 'google-trends-api';

async function fetchRedditFallback(geo: string) {
	try {
		// Choose subreddits for NG and US
		const sub = geo === 'NG' ? 'nigeria' : 'news';
		const url = `https://www.reddit.com/r/${sub}/hot.json?limit=20`;
		const res = await fetch(url, {
			headers: { 'User-Agent': 'trend-pulse/1.0' },
		});
		if (!res.ok) return { error: `reddit fetch ${res.status}` };
		const data = await res.json();
		const items = (data.data?.children || []).map((c: any) => ({
			title: c.data.title,
			url: c.data.url,
		}));
		return { fallback: true, items };
	} catch (e) {
		return { error: String(e) };
	}
}

export async function fetchRealtimeTrends(geo: string) {
	try {
		const res = await gtrends.realTimeTrends({ geo, category: 'all' });
		try {
			const obj = JSON.parse(res as unknown as string);
			return obj;
		} catch (e) {
			// If parsing failed, fallback to Reddit
			return await fetchRedditFallback(geo);
		}
	} catch (err) {
		// On error, fallback to Reddit
		return await fetchRedditFallback(geo);
	}
}
