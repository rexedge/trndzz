import Link from 'next/link';
import { ArticleType, VerificationTier } from '@prisma/client';
import { CheckCircle2, Newspaper, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listVerticalArticles } from '@/lib/services/article.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';

const ARTICLE_TYPE_OPTIONS: { value: ArticleType; label: string }[] = [
	{ value: ArticleType.MARKET_BRIEF, label: 'Market Briefs' },
	{ value: ArticleType.PRICE_ANALYSIS, label: 'Price Analysis' },
	{ value: ArticleType.POLICY_REGULATORY, label: 'Policy & Tariffs' },
	{ value: ArticleType.NEWS, label: 'Industry News' },
	{ value: ArticleType.EXECUTIVE_INTERVIEW, label: 'Executive Interviews' },
];

export default async function VerticalPulseFeedPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{ stage?: string; type?: string; q?: string }>;
}) {
	const { verticalSlug } = await params;
	const { stage, type, q } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const validType = ARTICLE_TYPE_OPTIONS.find((o) => o.value === type)?.value;

	const articles = await listVerticalArticles({
		verticalId: vertical.id,
		stageSlug: stage,
		type: validType,
		query: q,
	});

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			{/* Header */}
			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vertical'>
						<Newspaper className='h-4 w-4' />
						<span>Trndzz Pulse · {vertical.name} Desk</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						{vertical.name} Value-Chain Intelligence
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Daily mill price movements, import tariff analysis, and
						downstream project briefs directly cross-linked to
						verified {vertical.name.toLowerCase()} suppliers.
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Button asChild variant='outline' size='sm'>
						<Link href='/prices'>Live Price Trackers</Link>
					</Button>
					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90'
					>
						<Link href='/rfq/new'>Broadcast RFQ</Link>
					</Button>
				</div>
			</div>

			{/* Filter Bar */}
			<div className='space-y-4 rounded-xl border border-border bg-card p-4'>
				<form action='/pulse' method='GET' className='flex flex-wrap gap-3'>
					{stage && <input type='hidden' name='stage' value={stage} />}
					{validType && (
						<input type='hidden' name='type' value={validType} />
					)}
					<div className='relative flex-1 min-w-60'>
						<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							name='q'
							defaultValue={q ?? ''}
							placeholder={`Search ${vertical.name.toLowerCase()} market briefs, alloys, tariffs...`}
							className='pl-9'
						/>
					</div>
					<Button type='submit' variant='secondary'>
						Filter Briefs
					</Button>
					{(stage || validType || q) && (
						<Button asChild variant='ghost'>
							<Link href='/pulse'>Clear</Link>
						</Button>
					)}
				</form>

				{/* Stage + Type Pills */}
				<div className='flex flex-wrap items-center gap-2 pt-1'>
					<Link
						href='/pulse'
						className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
							!stage
								? 'border-vertical bg-vertical/15 text-vertical'
								: 'border-border bg-background text-muted-foreground hover:text-foreground'
						}`}
					>
						All Value-Chain Stages
					</Link>
					{vertical.valueChainStages.map((s) => (
						<Link
							key={s.id}
							href={`/pulse?stage=${s.slug}${validType ? `&type=${validType}` : ''}`}
							className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
								stage === s.slug
									? 'border-vertical bg-vertical/15 text-vertical'
									: 'border-border bg-background text-muted-foreground hover:text-foreground'
							}`}
						>
							{s.streamPosition.replace('_', ' ')}
						</Link>
					))}
				</div>

				<div className='flex flex-wrap items-center gap-2 border-t border-border pt-3'>
					<span className='font-tabular text-[11px] uppercase tracking-wider text-muted-foreground'>
						Format:
					</span>
					{ARTICLE_TYPE_OPTIONS.map((opt) => (
						<Link
							key={opt.value}
							href={`/pulse?type=${opt.value}${stage ? `&stage=${stage}` : ''}`}
							className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
								validType === opt.value
									? 'bg-primary text-primary-foreground font-semibold'
									: 'bg-muted/60 text-muted-foreground hover:text-foreground'
							}`}
						>
							{opt.label}
						</Link>
					))}
				</div>
			</div>

			{/* Articles List */}
			{articles.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center'>
					<p className='text-sm text-muted-foreground'>
						No {vertical.name} briefs matched your current filter
						selection.
					</p>
					<Button asChild variant='outline' size='sm' className='mt-4'>
						<Link href='/pulse'>View All Briefs</Link>
					</Button>
				</div>
			) : (
				<div className='grid gap-6 md:grid-cols-2'>
					{articles.map((article) => (
						<article
							key={article.id}
							className='flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-vertical/60'
						>
							<div>
								<div className='flex flex-wrap items-center gap-2 text-xs'>
									{article.isVerticalPinned && (
										<Badge className='bg-vertical text-white'>
											PINNED BRIEF
										</Badge>
									)}
									{article.valueChainStage && (
										<Link
											href={`/pulse/stage/${article.valueChainStage.slug}`}
										>
											<Badge variant='secondary'>
												{article.valueChainStage.streamPosition.replace(
													'_',
													' '
												)}
											</Badge>
										</Link>
									)}
									<span className='font-tabular text-muted-foreground'>
										{article.type.replace(/_/g, ' ')}
									</span>
								</div>

								<h2 className='mt-3 text-xl font-bold leading-snug'>
									<Link
										href={`/pulse/${article.slug}`}
										className='hover:text-vertical transition-colors'
									>
										{article.title}
									</Link>
								</h2>

								<p className='mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3'>
									{article.excerpt}
								</p>
							</div>

							<div className='mt-5 space-y-3 border-t border-border pt-4'>
								{article.companyMentions.length > 0 && (
									<div className='flex flex-wrap items-center gap-1.5 text-xs'>
										<span className='text-muted-foreground'>
											Suppliers:
										</span>
										{article.companyMentions.map((m) => (
											<Link
												key={m.company.id}
												href={`/directory/${m.company.slug}`}
												className='inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 font-medium hover:border-vertical'
											>
												{m.company.verificationTier !==
													VerificationTier.UNVERIFIED && (
													<CheckCircle2 className='h-3 w-3 text-verified' />
												)}
												<span>{m.company.name}</span>
											</Link>
										))}
									</div>
								)}

								<div className='flex items-center justify-between text-xs text-muted-foreground'>
									<span>
										{article.publishedAt
											? new Date(
													article.publishedAt
												).toLocaleDateString('en-NG', {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												})
											: 'Editorial Draft'}
									</span>
									<Link
										href={`/pulse/${article.slug}`}
										className='font-semibold text-vertical hover:underline'
									>
										Read & Source →
									</Link>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}

