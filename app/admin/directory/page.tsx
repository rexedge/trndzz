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
import { listAdminDirectoryCompanies } from '@/lib/services/company.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { DirectoryCompanySeeder } from './_company-seeder';

export default async function AdminDirectoryPage() {
	await requirePlatformStaff();

	const [companies, verticals] = await Promise.all([
		listAdminDirectoryCompanies(),
		prisma.vertical.findMany({
			orderBy: { displayOrder: 'asc' },
			include: {
				categories: {
					orderBy: { displayOrder: 'asc' },
					select: { id: true, name: true },
				},
			},
		}),
	]);

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Supplier Directory Seeder & Registry
				</h1>
				<p className='mt-1 text-sm text-muted-foreground'>
					Onboard pre-seeded industrial suppliers and monitor the
					Claim & Convert pipeline across verticals.
				</p>
			</div>

			<DirectoryCompanySeeder
				verticals={verticals.map((v) => ({
					id: v.id,
					name: v.name,
					categories: v.categories,
				}))}
			/>

			<section className='rounded-2xl border border-border bg-card p-6 space-y-4'>
				<h2 className='text-lg font-bold'>
					Indexed Directory Companies ({companies.length})
				</h2>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Company</TableHead>
							<TableHead>Verticals</TableHead>
							<TableHead>Claim Status</TableHead>
							<TableHead>Tier</TableHead>
							<TableHead>Liquidity</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{companies.map((c) => {
							const vSlug = c.verticals[0]?.vertical.slug;
							return (
								<TableRow key={c.id}>
									<TableCell className='font-semibold'>
										{vSlug ? (
											<a
												href={buildVerticalUrl(
													vSlug,
													`/directory/${c.slug}`
												)}
												className='hover:underline'
											>
												{c.name}
											</a>
										) : (
											c.name
										)}
										<span className='block text-xs font-normal text-muted-foreground'>
											{c.headquartersState}
										</span>
									</TableCell>
									<TableCell className='text-xs'>
										{c.verticals
											.map((v) => v.vertical.name)
											.join(', ')}
									</TableCell>
									<TableCell>
										<Badge variant='outline'>
											{c.claimStatus}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant='secondary'>
											{c.verificationTier}
										</Badge>
									</TableCell>
									<TableCell className='font-tabular text-xs'>
										{c._count.products} SKUs ·{' '}
										{c._count.rfqMatches} matches ·{' '}
										{c._count.rfqQuotes} quotes
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</section>
		</div>
	);
}

