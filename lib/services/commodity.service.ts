import 'server-only';
import { prisma } from '@/lib/prisma/client';
import type {
	CreateCommodityIndicatorInput,
	UpdateCommodityPriceInput,
} from '@/lib/validators/pulse.validator';

export interface IndicatorWithSeries {
	id: string;
	verticalId: string | null;
	verticalName: string | null;
	code: string;
	name: string;
	unit: string;
	currency: string;
	latestPrice: number;
	previousPrice: number | null;
	changePercent: number | null;
	sourceLabel: string | null;
	updatedAt: string;
	series: {
		id: string;
		price: number;
		recordedAt: string;
		note: string | null;
	}[];
}

export async function listIndicatorsWithHistory(
	verticalId?: string
): Promise<IndicatorWithSeries[]> {
	const rows = await prisma.commodityIndicator.findMany({
		where: {
			isActive: true,
			...(verticalId
				? { OR: [{ verticalId }, { verticalId: null }] }
				: {}),
		},
		orderBy: [{ verticalId: 'desc' }, { displayOrder: 'asc' }],
		include: {
			vertical: { select: { name: true } },
			pricePoints: {
				orderBy: { recordedAt: 'asc' },
				take: 30,
			},
		},
	});

	return rows.map((row) => ({
		id: row.id,
		verticalId: row.verticalId,
		verticalName: row.vertical?.name ?? null,
		code: row.code,
		name: row.name,
		unit: row.unit,
		currency: row.currency,
		latestPrice: Number(row.latestPrice),
		previousPrice:
			row.previousPrice !== null ? Number(row.previousPrice) : null,
		changePercent:
			row.changePercent !== null ? Number(row.changePercent) : null,
		sourceLabel: row.sourceLabel,
		updatedAt: row.updatedAt.toISOString(),
		series: row.pricePoints.map((pt) => ({
			id: pt.id,
			price: Number(pt.price),
			recordedAt: pt.recordedAt.toISOString(),
			note: pt.note,
		})),
	}));
}

export async function recordCommodityPriceUpdate(
	input: UpdateCommodityPriceInput
) {
	return prisma.$transaction(async (tx) => {
		const indicator = await tx.commodityIndicator.findUnique({
			where: { id: input.indicatorId },
		});

		if (!indicator) {
			throw new Error('Selected commodity indicator was not found.');
		}

		const prevPrice = Number(indicator.latestPrice);
		const nextPrice = input.newPrice;
		const changePct =
			prevPrice > 0 ? ((nextPrice - prevPrice) / prevPrice) * 100 : 0;

		const updated = await tx.commodityIndicator.update({
			where: { id: indicator.id },
			data: {
				previousPrice: prevPrice.toFixed(4),
				latestPrice: nextPrice.toFixed(4),
				changePercent: changePct.toFixed(4),
			},
		});

		await tx.commodityPricePoint.create({
			data: {
				indicatorId: indicator.id,
				price: nextPrice.toFixed(4),
				note: input.note || null,
			},
		});

		return updated;
	});
}

export async function createCommodityIndicator(
	input: CreateCommodityIndicatorInput
) {
	return prisma.$transaction(async (tx) => {
		const indicator = await tx.commodityIndicator.create({
			data: {
				verticalId: input.verticalId || null,
				code: input.code,
				name: input.name,
				unit: input.unit,
				currency: input.currency.toUpperCase(),
				latestPrice: input.latestPrice.toFixed(4),
				previousPrice: input.latestPrice.toFixed(4),
				changePercent: '0.0000',
				sourceLabel: input.sourceLabel || null,
			},
		});

		await tx.commodityPricePoint.create({
			data: {
				indicatorId: indicator.id,
				price: input.latestPrice.toFixed(4),
				note: 'Initial baseline benchmark',
			},
		});

		return indicator;
	});
}

