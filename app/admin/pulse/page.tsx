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
import { listAdminArticles } from '@/lib/services/article.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { AdminArticleEditor } from './_article-editor';

export default async function AdminPulseCmsPage() {
	await requirePlatformStaff();

	const [articles, verticals, companies] = await Promise.all([
		listAdminArticles(),
		prisma.vertical.findMany({
			orderBy: { displayOrder: 'asc' },
			include: {
				valueChainStages: {
					orderBy: { displayOrder: 'asc' },
					select: { id: true, name: true },
				},
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
		}),
	]);

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Trndzz Pulse Editorial CMS
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Author value-chain market intelligence and cross-link
					articles directly to verified directory profiles and RFQ
					categories.
				</p>
			</div>

			<AdminArticleEditor
				verticals={verticals.map((v) => ({
					id: v.id,
					name: v.name,
					stages: v.valueChainStages,
					categories: v.categories,
				}))}
				companies={companies}
			/>

			<section className='rounded-2xl border border-border bg-card p-6 space-y-4'>
				<h2 className='text-lg font-bold'>
					Published & Draft Briefs ({articles.length})
				</h2>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Headline</TableHead>
							<TableHead>Vertical / Stage</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Cross-Links</TableHead>
							<TableHead>Views</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{articles.map((art) => (
							<TableRow key={art.id}>
								<TableCell className='max-w-md font-semibold'>
									{art.vertical ? (
										<a
											href={buildVerticalUrl(
												art.vertical.slug,
												`/pulse/${art.slug}`
											)}
											className='hover:underline'
										>
											{art.title}
										</a>
									) : (
										art.title
									)}
								</TableCell>
								<TableCell className='text-xs'>
									{art.vertical?.name || 'Macro Hub'}
									{art.valueChainStage
										? ` · ${art.valueChainStage.name}`
										: ''}
								</TableCell>
								<TableCell>
									<Badge variant='outline'>
										{art.status}
									</Badge>
								</TableCell>
								<TableCell className='font-tabular text-xs'>
									{art._count.companyMentions} suppliers ·{' '}
									{art._count.attributedRfqs} RFQs
								</TableCell>
								<TableCell className='font-tabular text-xs'>
									{art.viewCount}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>
		</div>
	);
}

