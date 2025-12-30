declare module 'google-trends-api' {
	interface RealtimeTrendsOptions {
		geo: string;
		category?: string;
		hl?: string;
	}

	interface TrendResult {
		default?: {
			trendingSearchesDays?: any[];
		};
		items?: any[];
		trends?: any[];
		storyArticles?: any[];
	}

	const googleTrends: {
		realTimeTrends(options: RealtimeTrendsOptions): Promise<string>;
	};

	export default googleTrends;
}
