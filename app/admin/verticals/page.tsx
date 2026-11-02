import { ArrowUpRight } from 'lucide-react';
import { VerticalStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { listAllVerticals } from '@/lib/services/vertical.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';
import {
	CreateVerticalForm,
	VerticalStatusToggle,
} from './_vertical-controls';

export default async function AdminVerticalsPage() {
	await requirePlatformStaff();
	const verticals = await listAllVerticals();

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Multi-Tenant Vertical Portals
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Toggle live subdomain routing (`ACTIVE` vs `DRAFT`) or
					replicate the Trndzz blueprint into new sectors with zero
					codebase changes.
				</p>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				{verticals.map((v) => {
					const isLive = v.status === VerticalStatus.ACTIVE;
					return (
						<div
							key={v.id}
							className='flex flex-col justify-between rounded-xl border border-border bg-card p-6 space-y-4'
						>
							<div>
								<div className='flex items-center justify-between gap-2'>
									<span className='font-tabular text-xs text-muted-foreground'>
										{v.slug}.trndzz.com
									</span>
									<Badge
										variant={
											isLive ? 'default' : 'outline'
										}
									>
										{v.status}
									</Badge>
								</div>
								<h2 className='mt-2 text-xl font-bold'>
									{v.name}
								</h2>
								<p className='mt-1 text-xs text-muted-foreground'>
									{v.tagline}
								</p>
								<div className='mt-4 flex justify-between border-t border-border pt-3 text-xs text-muted-foreground font-tabular'>
									<span>
										{formatNumber(v._count.companies)}{' '}
										companies
									</span>
									<span>
										{formatNumber(v._count.articles)} briefs
									</span>
									<span>
										{formatNumber(v._count.rfqs)} RFQs
									</span>
								</div>
							</div>

							<div className='flex items-center justify-between gap-2 pt-2'>
								<a
									href={buildVerticalUrl(v.slug, '/')}
									className='inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline'
								>
									Preview Portal
									<ArrowUpRight className='h-3.5 w-3.5' />
								</a>
								<VerticalStatusToggle
									verticalId={v.id}
									currentStatus={v.status}
								/>
							</div>
						</div>
					);
				})}
			</div>

			<CreateVerticalForm />
		</div>
	);
}

