import Link from 'next/link';
import { ArrowUpRight, Newspaper, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listMacroFeaturedArticles } from '@/lib/services/article.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';

export default async function MacroNewsIndexPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q } = await searchParams;
	const articles = await listMacroFeaturedArticles(q);

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary'>
						<Newspaper className='h-4 w-4' />
						<span>TRNDZZ Macro Trade Desk</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						Cross-Sector Industrial Intelligence
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Macroeconomic policy shifts, FX liquidity, import
						tariffs, and flagship briefs syndicated across all{' '}
						<span className='font-tabular'>*.trndzz.com</span>{' '}
						verticals.
					</p>
				</div>
				<Button asChild variant='outline' size='sm'>
					<Link href='/verticals'>Explore Vertical Portals</Link>
				</Button>
			</div>

			<form action='/news' method='GET' className='flex gap-3 max-w-xl'>
				<div className='relative flex-1'>
					<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						name='q'
						defaultValue={q ?? ''}
						placeholder='Search macro & cross-sector intelligence...'
						className='pl-9'
					/>
				</div>
				<Button type='submit' variant='secondary'>
					Search
				</Button>
				{q && (
					<Button asChild variant='ghost'>
						<Link href='/news'>Reset</Link>
					</Button>
				)}
			</form>

			{articles.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No featured macro briefs matched your query.
				</div>
			) : (
				<div className='grid gap-6 md:grid-cols-2'>
					{articles.map((article) => (
						<article
							key={article.id}
							className='flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60'
						>
							<div>
								<div className='flex flex-wrap items-center gap-2 text-xs'>
									{article.vertical ? (
										<Badge variant='secondary'>
											{article.vertical.name}
										</Badge>
									) : (
										<Badge variant='outline'>
											Macro Brief
										</Badge>
									)}
									{article.valueChainStage && (
										<span className='font-tabular text-muted-foreground'>
											{article.valueChainStage.streamPosition.replace(
												'_',
												' '
											)}
										</span>
									)}
								</div>

								<h2 className='mt-3 text-xl font-bold leading-snug'>
									<Link
										href={`/news/${article.slug}`}
										className='hover:text-primary transition-colors'
									>
										{article.title}
									</Link>
								</h2>

								<p className='mt-2 text-sm text-muted-foreground line-clamp-3'>
									{article.excerpt}
								</p>
							</div>

							<div className='mt-5 flex items-center justify-between border-t border-border pt-4 text-xs'>
								<Link
									href={`/news/${article.slug}`}
									className='font-semibold text-foreground hover:underline'
								>
									Read Brief →
								</Link>
								{article.vertical && (
									<a
										href={buildVerticalUrl(
											article.vertical.slug,
											`/pulse/${article.slug}`
										)}
										className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
									>
										<span>
											Open on {article.vertical.slug}
											.trndzz.com
										</span>
										<ArrowUpRight className='h-3.5 w-3.5' />
									</a>
								)}
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}

