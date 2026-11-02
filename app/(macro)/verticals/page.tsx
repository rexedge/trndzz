import type { Metadata } from 'next';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { VerticalStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listAllVerticals } from '@/lib/services/vertical.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';

export const metadata: Metadata = {
	title: 'Industry Verticals Directory',
	description:
		'Explore all active and upcoming specialized B2B trade portals on the TRNDZZ multi-tenant ecosystem.',
};

export default async function VerticalsDirectoryPage() {
	const verticals = await listAllVerticals();

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8'>
			<div className='max-w-2xl'>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Industry Trade Portals
				</h1>
				<p className='mt-2 text-muted-foreground leading-relaxed'>
					Every vertical operates on a dedicated{' '}
					<span className='font-tabular text-foreground'>
						*.trndzz.com
					</span>{' '}
					subdomain with tailored value-chain stages, technical
					specification schemas, verified vendor directories, and live
					RFQ routing.
				</p>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				{verticals.map((vertical) => {
					const isLive = vertical.status === VerticalStatus.ACTIVE;
					return (
						<div
							key={vertical.id}
							className='flex flex-col justify-between rounded-xl border border-border bg-card p-6'
						>
							<div>
								<div className='flex items-center justify-between'>
									<span className='font-tabular text-xs text-muted-foreground'>
										{vertical.slug}.trndzz.com
									</span>
									{isLive ? (
										<Badge className='bg-verified/15 text-verified border-verified/30 hover:bg-verified/20'>
											<CheckCircle2 className='mr-1 h-3 w-3' />
											LIVE
										</Badge>
									) : (
										<Badge variant='outline'>
											UPCOMING
										</Badge>
									)}
								</div>
								<h2 className='mt-3 text-xl font-bold'>
									{vertical.name}
								</h2>
								<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
									{vertical.description || vertical.tagline}
								</p>
							</div>

							<div className='mt-6 border-t border-border pt-4'>
								<p className='mb-4 text-xs text-muted-foreground'>
									<strong className='font-tabular text-foreground'>
										{formatNumber(
											vertical._count.companies
										)}
									</strong>{' '}
									companies ·{' '}
									<strong className='font-tabular text-foreground'>
										{formatNumber(vertical._count.rfqs)}
									</strong>{' '}
									RFQs
								</p>

								{isLive ? (
									<Button
										asChild
										className='w-full justify-between'
									>
										<a
											href={buildVerticalUrl(
												vertical.slug,
												'/'
											)}
										>
											<span>
												Launch {vertical.name} Portal
											</span>
											<ArrowUpRight className='h-4 w-4' />
										</a>
									</Button>
								) : (
									<Button
										variant='outline'
										disabled
										className='w-full'
									>
										Directory Onboarding in Progress
									</Button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

