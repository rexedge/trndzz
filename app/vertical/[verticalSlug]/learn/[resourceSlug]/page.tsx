import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
	BookOpen,
	CheckCircle2,
	Download,
	FileText,
	LockOpen,
} from 'lucide-react';
import { VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContextualRfqDrawer } from '@/components/cross-link/contextual-rfq-drawer';
import { Markdown } from '@/components/markdown';
import { prisma } from '@/lib/prisma/client';
import { getResourceForReader } from '@/lib/services/learn.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';
import { ResourceLeadGateForm } from './_lead-gate-form';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ verticalSlug: string; resourceSlug: string }>;
}): Promise<Metadata> {
	const { verticalSlug, resourceSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);
	const resource = await getResourceForReader({
		slug: resourceSlug,
		verticalId: vertical.id,
	});
	if (!resource) return { title: 'Dossier Not Found' };
	return {
		title: `${resource.title} | Trndzz Learn`,
		description: resource.summary,
	};
}

export default async function VerticalLearnDetailPage({
	params,
}: {
	params: Promise<{ verticalSlug: string; resourceSlug: string }>;
}) {
	const { verticalSlug, resourceSlug } = await params;
	const { vertical, user } = await resolveRequiredVertical(verticalSlug);

	const cookieStore = await cookies();
	const unlockedCookie =
		cookieStore.get('trndzz_unlocked_learn')?.value ?? '';
	const unlockedResourceIds = unlockedCookie
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	const resource = await getResourceForReader({
		slug: resourceSlug,
		verticalId: vertical.id,
		userId: user?.userId,
		unlockedResourceIds,
	});

	if (!resource) {
		notFound();
	}

	const activeCategory = resource.category ?? vertical.categories[0];
	const specDefinitions = activeCategory
		? await prisma.specAttributeDefinition.findMany({
				where: {
					verticalId: vertical.id,
					OR: [
						{ categoryId: activeCategory.id },
						{ categoryId: null },
					],
				},
				orderBy: { displayOrder: 'asc' },
			})
		: [];

	const canonicalUrl = buildVerticalUrl(
		vertical.slug,
		`/learn/${resource.slug}`
	);
	const loginUrl = buildMacroUrl(
		`/auth/login?next=${encodeURIComponent(canonicalUrl)}`
	);

	return (
		<div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
			<div className='grid gap-8 lg:grid-cols-3'>
				<div className='space-y-8 lg:col-span-2'>
					{/* Header */}
					<header className='space-y-4 border-b border-border pb-6'>
						<div className='flex flex-wrap items-center gap-2'>
							<Link
								href='/learn'
								className='text-xs font-semibold text-vertical hover:underline mr-2'
							>
								← Trndzz Learn
							</Link>
							<Badge variant='secondary'>
								{resource.type.replace(/_/g, ' ')}
							</Badge>
							{resource.category && (
								<Badge variant='outline'>
									{resource.category.name}
								</Badge>
							)}
						</div>

						<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
							{resource.title}
						</h1>
						<p className='text-base text-muted-foreground leading-relaxed'>
							{resource.summary}
						</p>

						<div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-tabular'>
							{resource.pageCount && (
								<span className='inline-flex items-center gap-1'>
									<FileText className='h-3.5 w-3.5' />
									{resource.pageCount} Pages
								</span>
							)}
							<span className='inline-flex items-center gap-1'>
								<BookOpen className='h-3.5 w-3.5' />
								{formatNumber(resource.downloadCount)} Verified
								Unlocks
							</span>
						</div>
					</header>

					{/* Ungated Executive Preview */}
					<section className='rounded-2xl border border-border bg-card p-6 sm:p-8'>
						<div className='prose prose-neutral dark:prose-invert max-w-none'>
							<Markdown content={resource.contentPreview} />
						</div>
					</section>

					{/* Unlocked Full Content OR Lead Capture Gate */}
					{resource.isUnlocked && resource.fullContentMarkdown ? (
						<section className='space-y-6 rounded-2xl border border-verified/40 bg-card p-6 sm:p-8'>
							<div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4'>
								<div className='flex items-center gap-2 text-sm font-bold text-verified'>
									<LockOpen className='h-4 w-4' />
									<span>Full Technical Dossier Unlocked</span>
								</div>
								{resource.fileUrl && (
									<Button asChild size='sm' variant='outline'>
										<a
											href={resource.fileUrl}
											target='_blank'
											rel='noopener noreferrer'
										>
											<Download className='mr-1.5 h-4 w-4' />
											Download PDF Edition
										</a>
									</Button>
								)}
							</div>

							<div className='prose prose-neutral dark:prose-invert max-w-none'>
								<Markdown
									content={resource.fullContentMarkdown}
								/>
							</div>
						</section>
					) : (
						<ResourceLeadGateForm
							resourceId={resource.id}
							resourceTitle={resource.title}
							hasDownloadableFile={resource.hasDownloadableFile}
							initialUser={user}
						/>
					)}
				</div>

				{/* Contextual Commerce Sidebar */}
				<aside className='space-y-6'>
					{activeCategory && (
						<div className='rounded-2xl border border-border bg-card p-6 space-y-4'>
							<span className='font-tabular text-xs font-semibold uppercase tracking-wider text-amber'>
								Intelligence → Procurement
							</span>
							<h2 className='text-lg font-bold'>
								Source Spec-Compliant {activeCategory.name}
							</h2>
							<p className='text-xs text-muted-foreground leading-relaxed'>
								Apply the technical standards in this dossier
								directly to a verified multi-supplier RFQ
								broadcast.
							</p>
							<ContextualRfqDrawer
								verticalId={vertical.id}
								verticalSlug={vertical.slug}
								categoryId={activeCategory.id}
								categoryName={activeCategory.name}
								defaultUnit={activeCategory.defaultUnit ?? 'MT'}
								specDefinitions={specDefinitions.map((d) => ({
									id: d.id,
									key: d.key,
									label: d.label,
									unit: d.unit,
									inputType: d.inputType,
									options: d.options,
									isRequired: d.isRequired,
								}))}
								targetCompanyId={resource.sponsorCompany?.id}
								targetCompanyName={
									resource.sponsorCompany?.name
								}
								initialUser={user}
								loginUrl={loginUrl}
								triggerLabel={`Broadcast ${activeCategory.name} RFQ`}
							/>
						</div>
					)}

					{resource.sponsorCompany && (
						<div className='rounded-2xl border border-border bg-card p-6 space-y-3'>
							<span className='font-tabular text-xs uppercase tracking-wider text-muted-foreground'>
								Technical Knowledge Partner
							</span>
							<div className='flex items-center gap-2'>
								{resource.sponsorCompany.verificationTier !==
									VerificationTier.UNVERIFIED && (
									<CheckCircle2 className='h-4 w-4 text-verified shrink-0' />
								)}
								<h3 className='font-bold'>
									{resource.sponsorCompany.name}
								</h3>
							</div>
							<p className='text-xs text-muted-foreground'>
								HQ: {resource.sponsorCompany.headquartersState}
							</p>
							<Button
								asChild
								variant='outline'
								size='sm'
								className='w-full'
							>
								<Link
									href={`/directory/${resource.sponsorCompany.slug}`}
								>
									Inspect Verified Storefront →
								</Link>
							</Button>
						</div>
					)}
				</aside>
			</div>
		</div>
	);
}

