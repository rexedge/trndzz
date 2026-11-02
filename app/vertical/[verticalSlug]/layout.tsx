import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { CommodityTickerBar } from '@/components/pulse/commodity-ticker-bar';
import { VerticalHeader } from '@/components/vertical/vertical-header';
import { VerticalFooter } from '@/components/vertical/vertical-footer';
import { getCurrentUser } from '@/lib/auth/guards';
import {
	getTickerIndicators,
	getVerticalTenantBySlug,
} from '@/lib/services/vertical.service';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ verticalSlug: string }>;
}): Promise<Metadata> {
	const { verticalSlug } = await params;
	const vertical = await getVerticalTenantBySlug(verticalSlug, {
		allowDraft: true,
	});

	if (!vertical) {
		return { title: 'Industry Vertical Not Found' };
	}

	return {
		title: {
			template: `%s | TRNDZZ ${vertical.name}`,
			default:
				vertical.metaTitle ||
				`TRNDZZ ${vertical.name} — ${vertical.tagline ?? 'B2B Trade & RFQ Portal'}`,
		},
		description:
			vertical.metaDescription ||
			vertical.description ||
			`Verified ${vertical.name} supplier directory, commodity prices, and structured RFQ sourcing.`,
	};
}

export default async function VerticalTenantLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ verticalSlug: string }>;
}) {
	const { verticalSlug } = await params;
	const user = await getCurrentUser();
	const canPreviewDraft =
		user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.EDITOR;

	const vertical = await getVerticalTenantBySlug(verticalSlug, {
		allowDraft: canPreviewDraft,
	});

	if (!vertical) {
		notFound();
	}

	const indicators = await getTickerIndicators(vertical.id);

	const accentVariables = {
		'--vertical-accent': vertical.themeColor || '#0284C7',
	} as CSSProperties;

	return (
		<div
			style={accentVariables}
			className='flex min-h-screen flex-col'
		>
			<CommodityTickerBar
				indicators={indicators}
				label={`${vertical.name.toUpperCase()} & FX`}
			/>
			<VerticalHeader
				verticalName={vertical.name}
				verticalSlug={vertical.slug}
				stages={vertical.valueChainStages}
			/>
			<main className='flex-1'>{children}</main>
			<VerticalFooter
				verticalName={vertical.name}
				verticalSlug={vertical.slug}
				tagline={vertical.tagline}
			/>
		</div>
	);
}

