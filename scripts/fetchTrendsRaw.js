const gtrends = require('google-trends-api');

(async () => {
	try {
		const ng = await gtrends.realTimeTrends({ geo: 'NG', category: 'all' });
		console.log('NG raw length', ng.length);
		try {
			console.log('NG parsed:', JSON.parse(ng));
		} catch (e) {
			console.log('NG parse failed, output sample:', ng.slice(0, 1000));
		}

		const us = await gtrends.realTimeTrends({ geo: 'US', category: 'all' });
		console.log('US raw length', us.length);
		try {
			console.log('US parsed:', JSON.parse(us));
		} catch (e) {
			console.log('US parse failed, output sample:', us.slice(0, 1000));
		}
	} catch (err) {
		console.error('err', err);
	}
})();
