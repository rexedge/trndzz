import type { Metadata } from 'next';
import Link from 'next/link';
import {
	BookOpen,
	CheckCircle2,
	Download,
	FileText,
	Lock,
	Search,
} from 'lucide-react';
import { ResourceType, VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listVerticalResources } from '@/lib/services/learn.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { formatNumber } from '@/lib/utils/format';
import { RESOURCE_TYPE_VALUES } from '@/lib/validators/learn.validator';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ verticalSlug: string }>;
}): Promise<Metadata> {
	const { verticalSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);
	return {
		title: `Trndzz Learn — ${vertical.name} Whitepapers, SON Guides & Sector Reports`,
		description: `Download technical procurement handbooks, regulatory compliance guides, and quarterly market outlook reports for the ${vertical.name} value chain.`,
	};
}

export default async function VerticalLearnHubPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{ type?: string; q?: string }>;
}) {
	const { verticalSlug } = await params;
	const { type, q } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const validType = RESOURCE_TYPE_VALUES.includes(type as ResourceType)
		? (type as ResourceType)
		: undefined;

	const resources = await listVerticalResources({
		verticalId: vertical.id,
		type: validType,
		query: q,
	});

	return (
		<div className='mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end'>
				<div>
					<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vertical'>
						<BookOpen className='h-4 w-4' />
						<span>
							Trndzz Learn · Technical Intelligence & Handbooks
						</span>
					</div>
					<h1 className='mt-2 text-3xl font-extrabold tracking-tight'>
						{vertical.name} Knowledge Hub & Regulatory Dossiers
					</h1>
					<p className='mt-1.5 max-w-2xl text-sm text-muted-foreground'>
						Specification handbooks, SON/MANCAP compliance guides,
						and quarterly supply-demand outlook reports engineered
						for commercial procurement teams.
					</p>
				</div>
				<Button
					asChild
					size='sm'
					className='bg-amber text-white hover:opacity-90'
				>
					<Link href='/rfq/new'>Broadcast Spec RFQ</Link>
				</Button>
			</div>

			{/* Filter Bar */}
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
						placeholder={`Search ${vertical.name} standards, whitepapers, outlook reports...`}
						className='pl-9'
					/>
				</div>

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
					Filter Library
				</Button>
				{(validType || q) && (
					<Button asChild variant='ghost' size='sm'>
						<Link href='/learn'>Reset</Link>
					</Button>
				)}
			</form>

			{resources.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
					No technical dossiers matched your filter. Reset filters to
					browse all published {vertical.name} reports.
				</div>
			) : (
				<div className='grid gap-6 md:grid-cols-2'>
					{resources.map((res) => (
						<article
							key={res.id}
							className='flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-vertical/60'
						>
							<div>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<div className='flex flex-wrap items-center gap-2'>
										<Badge variant='secondary'>
											{res.type.replace(/_/g, ' ')}
										</Badge>
										{res.category && (
											<Badge variant='outline'>
												{res.category.name}
											</Badge>
										)}
										{res.isFeatured && (
											<Badge className='bg-amber/15 text-amber border-amber/30'>
												Featured Dossier
											</Badge>
										)}
									</div>
									{res.isGated && (
										<span className='inline-flex items-center gap-1 text-xs font-medium text-muted-foreground'>
											<Lock className='h-3.5 w-3.5 text-amber' />
											Corporate Gate
										</span>
									)}
								</div>

								<h2 className='mt-3 text-xl font-bold leading-snug'>
									<Link
										href={`/learn/${res.slug}`}
										className='hover:underline'
									>
										{res.title}
									</Link>
								</h2>

								<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
									{res.summary}
								</p>
							</div>

							<div className='mt-6 space-y-3 border-t border-border pt-4'>
								<div className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
									<div className='flex items-center gap-3 font-tabular'>
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

									{res.sponsorCompany && (
										<Link
											href={`/directory/${res.sponsorCompany.slug}`}
											className='inline-flex items-center gap-1 font-medium text-foreground hover:underline'
										>
											{res.sponsorCompany
												.verificationTier !==
												VerificationTier.UNVERIFIED && (
												<CheckCircle2 className='h-3.5 w-3.5 text-verified' />
											)}
											<span>
												Technical Partner:{' '}
												{res.sponsorCompany.name}
											</span>
										</Link>
									)}
								</div>

								<div className='flex justify-end'>
									<Button asChild size='sm'>
										<Link href={`/learn/${res.slug}`}>
											Read Preview & Unlock Report →
										</Link>
									</Button>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}

