import 'server-only';
import {
	RfqStatus,
	VerificationTier,
	VerticalStatus,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';

export interface EcosystemStats {
	activeVerticals: number;
	indexedCompanies: number;
	verifiedSuppliers: number;
	openRfqsCount: number;
	monthlyReaders: number;
}

export async function refreshPlatformStatsCache(): Promise<EcosystemStats> {
	const [
		activeVerticals,
		indexedCompanies,
		verifiedSuppliers,
		openRfqsCount,
		existing,
	] = await Promise.all([
		prisma.vertical.count({
			where: { status: VerticalStatus.ACTIVE },
		}),
		prisma.company.count({ where: { isPublished: true } }),
		prisma.company.count({
			where: {
				isPublished: true,
				verificationTier: { not: VerificationTier.UNVERIFIED },
			},
		}),
		prisma.rfq.count({
			where: { status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] } },
		}),
		prisma.platformStats.findUnique({ where: { id: 'singleton' } }),
	]);

	const monthlyReaders = existing?.monthlyReaders ?? 14200;

	await prisma.platformStats.upsert({
		where: { id: 'singleton' },
		update: {
			activeVerticals,
			indexedCompanies,
			verifiedSuppliers,
			openRfqsCount,
		},
		create: {
			id: 'singleton',
			activeVerticals,
			indexedCompanies,
			verifiedSuppliers,
			openRfqsCount,
			monthlyReaders,
		},
	});

	return {
		activeVerticals,
		indexedCompanies,
		verifiedSuppliers,
		openRfqsCount,
		monthlyReaders,
	};
}

export async function getPlatformStats(): Promise<EcosystemStats> {
	try {
		const cached = await prisma.platformStats.findUnique({
			where: { id: 'singleton' },
		});

		if (cached) {
			return {
				activeVerticals: cached.activeVerticals,
				indexedCompanies: cached.indexedCompanies,
				verifiedSuppliers: cached.verifiedSuppliers,
				openRfqsCount: cached.openRfqsCount,
				monthlyReaders: cached.monthlyReaders,
			};
		}

		return await refreshPlatformStatsCache();
	} catch {
		return {
			activeVerticals: 1,
			indexedCompanies: 0,
			verifiedSuppliers: 0,
			openRfqsCount: 0,
			monthlyReaders: 0,
		};
	}
}
