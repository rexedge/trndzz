import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Download, FileText, Lock, Search } from 'lucide-react';
import { ResourceType, VerticalStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listMacroResources } from '@/lib/services/learn.service';
import { listAllVerticals } from '@/lib/services/vertical.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';
import { RESOURCE_TYPE_VALUES } from '@/lib/validators/learn.validator';

export const metadata: Metadata = {
	title: 'Trndzz Learn — Cross-Sector Industrial Whitepapers & Market Reports',
	description:
		'SON compliance handbooks, quarterly sector outlook reports, and technical B2B procurement guides across Aluminium, Steel, Solar, and Industrial Markets.',
};

export default async function MacroLearnPage({
	searchParams,
}: {
	searchParams: Promise<{ vertical?: string; type?: string; q?: string }>;
}) {
	const { vertical: verticalFilter, type, q } = await searchParams;

	const validType = RESOURCE_TYPE_VALUES.includes(type as ResourceType)
		? (type as ResourceType)
		: undefined;

	const [resources, verticals] = await Promise.all([
		listMacroResources({
			verticalSlug: verticalFilter,
			type: validType,
			query: q,
		}),
		listAllVerticals(),
	]);

	const activeVerticals = verticals.filter(
		(v) => v.status === VerticalStatus.ACTIVE
	);

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='space-y-2 border-b border-border pb-6'>
				<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary'>
					<BookOpen className='h-4 w-4' />
					<span>Trndzz Learn · Multi-Sector Intelligence Library</span>
				</div>
				<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
					Industrial Whitepapers, SON Guides & Sector Outlook Dossiers
				</h1>
				<p className='max-w-3xl text-sm text-muted-foreground'>
					Actionable specification manuals and market intelligence
					reports published across Trndzz vertical trade portals.
				</p>
			</div>

			<form
				action='/learn'
				method='GET'
				className='flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4'
			>
				<div className='relative min-w-60 flex-1'>
					<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						name='q'
						defaultValue={q ?? ''}
						placeholder='Search alloy guides, BS4449 rebar audits, solar LCOE benchmarks...'
						className='pl-9'
					/>
				</div>

				<select
					name='vertical'
					defaultValue={verticalFilter ?? ''}
					className='flex h-9 rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value=''>All Industry Verticals</option>
					{activeVerticals.map((v) => (
						<option key={v.id} value={v.slug}>
							{v.name}
						</option>
					))}
				</select>

				<select
					name='type'
					defaultValue={validType ?? ''}
					className='flex h-9 rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value=''>All Dossier Types</option>
					{RESOURCE_TYPE_VALUES.map((rt) => (
						<option key={rt} value={rt}>
							{rt.replace(/_/g, ' ')}
						</option>
					))}
				</select>

				<Button type='submit' variant='secondary' size='sm'>
					Filter Dossiers
				</Button>
				{(verticalFilter || validType || q) && (
					<Button asChild variant='ghost' size='sm'>
						<Link href='/learn'>Reset</Link>
					</Button>
				)}
			</form>

			{resources.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No Knowledge Hub reports matched your query.
				</div>
			) : (
				<div className='grid gap-6 md:grid-cols-2'>
					{resources.map((res) => {
						const vSlug = res.vertical?.slug ?? 'aluminium';
						const targetHref = buildVerticalUrl(
							vSlug,
							`/learn/${res.slug}`
						);

						return (
							<article
								key={res.id}
								className='flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50'
							>
								<div>
									<div className='flex flex-wrap items-center justify-between gap-2'>
										<div className='flex flex-wrap items-center gap-2'>
											{res.vertical && (
												<Badge>{res.vertical.name}</Badge>
											)}
											<Badge variant='secondary'>
												{res.type.replace(/_/g, ' ')}
											</Badge>
										</div>
										{res.isGated && (
											<span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
												<Lock className='h-3.5 w-3.5 text-amber' />
												Gated Report
											</span>
										)}
									</div>

									<h2 className='mt-3 text-xl font-bold leading-snug'>
										<a
											href={targetHref}
											className='hover:underline'
										>
											{res.title}
										</a>
									</h2>
									<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
										{res.summary}
									</p>
								</div>

								<div className='mt-6 flex items-center justify-between border-t border-border pt-4 text-xs'>
									<div className='flex items-center gap-3 font-tabular text-muted-foreground'>
										{res.pageCount && (
											<span className='inline-flex items-center gap-1'>
												<FileText className='h-3.5 w-3.5' />
												{res.pageCount} pp
											</span>
										)}
										<span className='inline-flex items-center gap-1'>
											<Download className='h-3.5 w-3.5' />
											{formatNumber(res.downloadCount)}{' '}
											unlocks
										</span>
									</div>

									<Button asChild size='sm' variant='outline'>
										<a href={targetHref}>
											Open on {res.vertical?.name ?? 'Portal'}
											<ArrowUpRight className='ml-1 h-3.5 w-3.5' />
										</a>
									</Button>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
}

