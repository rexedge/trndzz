import Link from 'next/link';
import {
	ClaimRequestStatus,
	ClaimStatus,
	RfqStatus,
} from '@prisma/client';
import {
	Building2,
	FileSpreadsheet,
	Layers,
	LineChart,
	Newspaper,
	ShieldCheck,
} from 'lucide-react';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { formatNumber } from '@/lib/utils/format';

export default async function AdminCommandCenterPage() {
	await requirePlatformStaff();

	const [
		verticalCount,
		articleCount,
		indicatorCount,
		companyCount,
		unclaimedCount,
		pendingClaimCount,
		openRfqCount,
	] = await Promise.all([
		prisma.vertical.count(),
		prisma.article.count(),
		prisma.commodityIndicator.count({ where: { isActive: true } }),
		prisma.company.count(),
		prisma.company.count({
			where: { claimStatus: ClaimStatus.UNCLAIMED },
		}),
		prisma.companyClaimRequest.count({
			where: { status: ClaimRequestStatus.PENDING },
		}),
		prisma.rfq.count({
			where: { status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] } },
		}),
	]);

	const modules = [
		{
			href: '/admin/verticals',
			label: 'Multi-Tenant Verticals',
			value: verticalCount,
			sub: 'Activate Draft subdomains (steel, solar) or provision new hubs',
			icon: Layers,
		},
		{
			href: '/admin/pulse',
			label: 'Trndzz Pulse Editorial CMS',
			value: articleCount,
			sub: 'Publish market briefs with contextual supplier cross-links',
			icon: Newspaper,
		},
		{
			href: '/admin/prices',
			label: 'Commodity & FX Price Desk',
			value: indicatorCount,
			sub: 'Record LME, NAFEM USD/NGN & wholesale Naira coil updates',
			icon: LineChart,
		},
		{
			href: '/admin/directory',
			label: 'Supplier Directory Seeder',
			value: companyCount,
			sub: `${formatNumber(unclaimedCount)} pre-seeded UNCLAIMED listings ready to convert`,
			icon: Building2,
		},
		{
			href: '/admin/claims',
			label: 'CAC Claim Verification Queue',
			value: pendingClaimCount,
			sub: 'Approve corporate claims & unlock matched RFQ leads',
			icon: ShieldCheck,
		},
		{
			href: '/admin/rfqs',
			label: 'Live RFQ Liquidity Monitor',
			value: openRfqCount,
			sub: 'Audit buyer broadcasts, vendor match scores & submitted quotes',
			icon: FileSpreadsheet,
		},
	];

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Ecosystem Command Center
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Super-Admin, Editorial & Market Analyst console across all
					multi-tenant verticals.
				</p>
			</div>

			<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{modules.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							className='rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60'
						>
							<div className='flex items-center justify-between'>
								<span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
									{item.label}
								</span>
								<Icon className='h-4 w-4 text-primary' />
							</div>
							<p className='font-tabular mt-3 text-3xl font-bold'>
								{formatNumber(item.value)}
							</p>
							<p className='mt-2 text-xs text-muted-foreground leading-relaxed'>
								{item.sub}
							</p>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
