const { PrismaClient } = require('@prisma/client');

(async () => {
	const prisma = new PrismaClient();
	try {
		const rows = await prisma.trend.findMany({
			orderBy: { fetchedAt: 'desc' },
			take: 50,
		});
		console.log(JSON.stringify(rows, null, 2));
	} catch (e) {
		console.error('Error listing trends', e);
	} finally {
		await prisma.$disconnect();
	}
})();
