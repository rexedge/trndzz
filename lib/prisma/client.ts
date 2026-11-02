import 'server-only';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	pgPool: Pool | undefined;
	prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
	const connectionString = process.env.DATABASE_URL;
	const pool =
		globalForPrisma.pgPool ??
		new Pool({
			connectionString,
			max: 10,
		});

	if (process.env.NODE_ENV !== 'production') {
		globalForPrisma.pgPool = pool;
	}

	const adapter = new PrismaPg(pool);

	return new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === 'development'
				? ['error', 'warn']
				: ['error'],
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
