import { BookOpen, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma/client';
import { listAdminResourcesAndLeads } from '@/lib/services/learn.service';
import { formatNumber } from '@/lib/utils/format';
import { AdminResourceEditor } from './_resource-editor';

export default async function AdminLearnPage() {
	await requirePlatformStaff();

	const [{ resources, leads }, verticals, companies] = await Promise.all([
		listAdminResourcesAndLeads(),
		prisma.vertical.findMany({
			orderBy: { displayOrder: 'asc' },
			select: {
				id: true,
				name: true,
				categories: {
					orderBy: { displayOrder: 'asc' },
					select: { id: true, name: true },
				},
			},
		}),
		prisma.company.findMany({
			where: { isPublished: true },
			orderBy: { name: 'asc' },
			select: { id: true, name: true },
			take: 100,
		}),
	]);

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Trndzz Learn CMS & B2B Lead Capture Desk
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Publish gated technical whitepapers, SON compliance guides,
					and inspect high-intent buyer leads captured across
					verticals.
				</p>
			</div>

			<AdminResourceEditor verticals={verticals} companies={companies} />

			{/* Captured High-Intent Buyer Leads */}
			<section className='space-y-4'>
				<div className='flex items-center gap-2'>
					<Users className='h-5 w-5 text-amber' />
					<h2 className='text-xl font-bold'>
						Captured B2B Procurement Leads ({leads.length})
					</h2>
				</div>

				{leads.length === 0 ? (
					<div className='rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
						No gated whitepaper leads captured yet.
					</div>
				) : (
					<div className='overflow-x-auto rounded-xl border border-border bg-card'>
						<table className='w-full text-left text-xs'>
							<thead className='border-b border-border bg-muted/50 text-muted-foreground uppercase font-tabular'>
								<tr>
									<th className='px-4 py-3'>Buyer & Company</th>
									<th className='px-4 py-3'>Contact</th>
									<th className='px-4 py-3'>Dossier Unlocked</th>
									<th className='px-4 py-3'>Timeline & Budget</th>
									<th className='px-4 py-3'>State</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border'>
								{leads.map((lead) => (
									<tr key={lead.id}>
										<td className='px-4 py-3'>
											<p className='font-bold text-foreground'>
												{lead.fullName}
											</p>
											<p className='text-muted-foreground'>
												{lead.jobTitle} · {lead.companyName}
											</p>
										</td>
										<td className='px-4 py-3 font-tabular'>
											<p>{lead.workEmail}</p>
											<p className='text-muted-foreground'>
												{lead.phone}
											</p>
										</td>
										<td className='px-4 py-3'>
											{lead.resource.vertical && (
												<Badge
													variant='outline'
													className='mr-1.5 text-[10px]'
												>
													{lead.resource.vertical.name}
												</Badge>
											)}
											<span className='font-medium'>
												{lead.resource.title}
											</span>
										</td>
										<td className='px-4 py-3 font-tabular'>
											<p>
												{lead.procurementTimeline || '—'}
											</p>
											<p className='font-semibold text-amber'>
												{lead.estimatedBudgetBand || '—'}
											</p>
										</td>
										<td className='px-4 py-3'>
											{lead.deliveryState || '—'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* Published Knowledge Resources */}
			<section className='space-y-4'>
				<div className='flex items-center gap-2'>
					<BookOpen className='h-5 w-5 text-primary' />
					<h2 className='text-xl font-bold'>
						Indexed Knowledge Hub Dossiers ({resources.length})
					</h2>
				</div>

				<div className='grid gap-4 md:grid-cols-2'>
					{resources.map((res) => (
						<div
							key={res.id}
							className='rounded-xl border border-border bg-card p-5 space-y-2'
						>
							<div className='flex items-center justify-between gap-2'>
								<div className='flex items-center gap-2'>
									<Badge variant='secondary'>
										{res.type.replace(/_/g, ' ')}
									</Badge>
									<Badge variant='outline'>
										{res.vertical?.name ?? 'Macro'}
									</Badge>
								</div>
								<span className='font-tabular text-xs text-muted-foreground'>
									{formatNumber(res.downloadCount)} unlocks ·{' '}
									{formatNumber(res._count.leads)} leads
								</span>
							</div>
							<h3 className='font-bold'>{res.title}</h3>
							{res.sponsorCompany && (
								<p className='text-xs text-muted-foreground'>
									Sponsor: {res.sponsorCompany.name}
								</p>
							)}
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

