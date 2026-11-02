import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';

export default async function AdminRfqsMonitorPage() {
	await requirePlatformStaff();

	const rfqs = await prisma.rfq.findMany({
		orderBy: { createdAt: 'desc' },
		take: 100,
		include: {
			vertical: { select: { name: true, slug: true } },
			category: { select: { name: true } },
			sourceArticle: { select: { title: true } },
			_count: { select: { matches: true, quotes: true } },
		},
	});

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Ecosystem RFQ & Marketplace Liquidity Monitor
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Monitor buyer procurement broadcasts, automated supplier
					matching coverage, editorial cross-link attribution, and
					quote density.
				</p>
			</div>

			<section className='rounded-2xl border border-border bg-card p-6'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Reference</TableHead>
							<TableHead>Tender & Buyer</TableHead>
							<TableHead>Vertical / Category</TableHead>
							<TableHead>Volume</TableHead>
							<TableHead>Liquidity</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rfqs.map((rfq) => (
							<TableRow key={rfq.id}>
								<TableCell className='font-tabular font-bold text-amber'>
									<a
										href={buildVerticalUrl(
											rfq.vertical.slug,
											`/rfq/${rfq.referenceNumber}`
										)}
										className='hover:underline'
									>
										{rfq.referenceNumber}
									</a>
								</TableCell>
								<TableCell className='max-w-xs'>
									<p className='font-semibold truncate'>
										{rfq.title}
									</p>
									<p className='text-xs text-muted-foreground'>
										{rfq.buyerCompanyName ||
											rfq.buyerContactEmail}{' '}
										· {rfq.deliveryState}
									</p>
									{rfq.sourceArticle && (
										<p className='text-[11px] text-amber truncate'>
											Cross-linked:{' '}
											{rfq.sourceArticle.title}
										</p>
									)}
								</TableCell>
								<TableCell className='text-xs'>
									{rfq.vertical.name}
									<span className='block text-muted-foreground'>
										{rfq.category.name}
									</span>
								</TableCell>
								<TableCell className='font-tabular text-xs font-semibold'>
									{formatNumber(Number(rfq.quantity))}{' '}
									{rfq.unit}
								</TableCell>
								<TableCell className='font-tabular text-xs'>
									{rfq._count.matches} matches ·{' '}
									<strong>{rfq._count.quotes}</strong> quotes
								</TableCell>
								<TableCell>
									<Badge variant='outline'>
										{rfq.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>
		</div>
	);
}

