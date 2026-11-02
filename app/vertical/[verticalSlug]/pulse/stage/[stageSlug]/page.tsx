import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Layers } from 'lucide-react';
import { VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listVerticalArticles } from '@/lib/services/article.service';
import { searchVerticalCompanies } from '@/lib/services/company.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';

export default async function ValueChainStageHubPage({
	params,
}: {
	params: Promise<{ verticalSlug: string; stageSlug: string }>;
}) {
	const { verticalSlug, stageSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const stage = vertical.valueChainStages.find((s) => s.slug === stageSlug);
	if (!stage) {
		notFound();
	}

	const [articles, stageCompanies] = await Promise.all([
		listVerticalArticles({
			verticalId: vertical.id,
			stageSlug: stage.slug,
		}),
		searchVerticalCompanies({
			verticalId: vertical.id,
			stream: stage.streamPosition,
		}),
	]);

	return (
		<div className='mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8'>
			{/* Stage Banner */}
			<section className='rounded-2xl border border-border bg-card p-8'>
				<div className='flex flex-wrap items-center gap-2 text-xs'>
					<Badge className='bg-vertical text-white'>
						<Layers className='mr-1 h-3 w-3' />
						{stage.streamPosition.replace('_', ' ')}
					</Badge>
					<Link
						href='/pulse'
						className='text-muted-foreground hover:text-foreground'
					>
						← All {vertical.name} Value-Chain Stages
					</Link>
				</div>
				<h1 className='mt-3 text-3xl font-extrabold tracking-tight'>
					{stage.name}
				</h1>
				{stage.description && (
					<p className='mt-2 max-w-3xl text-sm text-muted-foreground leading-relaxed'>
						{stage.description}
					</p>
				)}
				<div className='mt-5 flex flex-wrap gap-3'>
					<Button asChild size='sm' variant='secondary'>
						<Link
							href={`/directory?stream=${stage.streamPosition}`}
						>
							Browse {stage.streamPosition.replace('_', ' ')}{' '}
							Suppliers ({stageCompanies.length})
						</Link>
					</Button>
					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90'
					>
						<Link href='/rfq/new'>Broadcast Stage RFQ</Link>
					</Button>
				</div>
			</section>

			<div className='grid gap-8 lg:grid-cols-3'>
				{/* Stage Articles */}
				<div className='space-y-4 lg:col-span-2'>
					<h2 className='text-xl font-bold tracking-tight'>
						Stage Market Briefs ({articles.length})
					</h2>
					{articles.length === 0 ? (
						<div className='rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
							No briefs published for {stage.name} yet.
						</div>
					) : (
						articles.map((article) => (
							<article
								key={article.id}
								className='rounded-xl border border-border bg-card p-6'
							>
								<div className='flex items-center gap-2 text-xs text-muted-foreground'>
									<span className='font-tabular'>
										{article.type.replace(/_/g, ' ')}
									</span>
									{article.category && (
										<span>· {article.category.name}</span>
									)}
								</div>
								<h3 className='mt-2 text-lg font-bold'>
									<Link
										href={`/pulse/${article.slug}`}
										className='hover:text-vertical'
									>
										{article.title}
									</Link>
								</h3>
								<p className='mt-2 text-sm text-muted-foreground'>
									{article.excerpt}
								</p>
							</article>
						))
					)}
				</div>

				{/* Stage Suppliers */}
				<div className='space-y-4'>
					<h2 className='text-xl font-bold tracking-tight'>
						Indexed Stage Operators
					</h2>
					{stageCompanies.length === 0 ? (
						<div className='rounded-xl border border-dashed border-border p-6 text-xs text-muted-foreground'>
							No suppliers mapped to this stream yet.
						</div>
					) : (
						<div className='space-y-3'>
							{stageCompanies.slice(0, 6).map((company) => (
								<Link
									key={company.id}
									href={`/directory/${company.slug}`}
									className='block rounded-xl border border-border bg-card p-4 transition-colors hover:border-vertical/60'
								>
									<div className='flex items-center justify-between gap-2'>
										<span className='font-semibold text-sm'>
											{company.name}
										</span>
										{company.verificationTier !==
											VerificationTier.UNVERIFIED && (
											<CheckCircle2 className='h-4 w-4 shrink-0 text-verified' />
										)}
									</div>
									<p className='mt-1 text-xs text-muted-foreground line-clamp-2'>
										{company.tagline ||
											company.headquartersState}
									</p>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

