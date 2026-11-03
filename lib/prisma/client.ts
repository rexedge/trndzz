import 'server-only';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const SCHEMA_CLIENT_REVISION = 'phase3-golive-outbox-v1';

const globalForPrisma = globalThis as unknown as {
	pgPool: Pool | undefined;
	prisma: PrismaClient | undefined;
	prismaRevision: string | undefined;
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

function resolvePrismaSingleton(): PrismaClient {
	const cached = globalForPrisma.prisma;
	const hasCurrentModels =
		cached &&
		globalForPrisma.prismaRevision === SCHEMA_CLIENT_REVISION &&
		'knowledgeResource' in cached &&
		'resourceLead' in cached &&
		'notificationDispatch' in cached;

	if (hasCurrentModels) {
		return cached;
	}

	const fresh = createPrismaClient();
	if (process.env.NODE_ENV !== 'production') {
		globalForPrisma.prisma = fresh;
		globalForPrisma.prismaRevision = SCHEMA_CLIENT_REVISION;
	}
	return fresh;
}

export const prisma = resolvePrismaSingleton();
