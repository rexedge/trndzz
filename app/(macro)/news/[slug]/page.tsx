import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { VerificationTier } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/markdown';
import { JsonLd, buildNewsArticleJsonLd } from '@/components/seo/json-ld';
import { getMacroArticleBySlug } from '@/lib/services/article.service';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';

export default async function MacroArticleDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const article = await getMacroArticleBySlug(slug);

	if (!article) {
		notFound();
	}

	const canonicalUrl = article.vertical
		? buildVerticalUrl(article.vertical.slug, `/pulse/${article.slug}`)
		: buildMacroUrl(`/news/${article.slug}`);

	return (
		<div className='mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<JsonLd
				data={buildNewsArticleJsonLd({
					headline: article.title,
					description: article.excerpt,
					url: canonicalUrl,
					datePublished: article.publishedAt,
					dateModified: article.updatedAt,
					authorName: article.author?.name,
					verticalName: article.vertical?.name,
				})}
			/>

			<div className='space-y-3 border-b border-border pb-6'>
				<div className='flex flex-wrap items-center gap-2 text-xs'>
					<Link
						href='/news'
						className='font-semibold text-primary hover:underline'
					>
						← Macro Intelligence
					</Link>
					{article.vertical && (
						<Badge variant='secondary'>
							{article.vertical.name}
						</Badge>
					)}
					<Badge variant='outline'>
						{article.type.replace(/_/g, ' ')}
					</Badge>
				</div>

				<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
					{article.title}
				</h1>
				<p className='text-base text-muted-foreground'>
					{article.excerpt}
				</p>

				{article.vertical && (
					<div className='pt-2'>
						<Button asChild size='sm' className='gap-1.5'>
							<a
								href={buildVerticalUrl(
									article.vertical.slug,
									`/pulse/${article.slug}`
								)}
							>
								<span>
									Source Verified Suppliers on{' '}
									{article.vertical.slug}.trndzz.com
								</span>
								<ArrowUpRight className='h-4 w-4' />
							</a>
						</Button>
					</div>
				)}
			</div>

			<div className='rounded-2xl border border-border bg-card p-6 sm:p-8'>
				<Markdown content={article.body} />
			</div>

			{article.companyMentions.length > 0 && article.vertical && (
				<div className='rounded-xl border border-border bg-card p-6 space-y-3'>
					<h2 className='text-base font-bold'>
						Indexed Directory Suppliers Referenced
					</h2>
					<div className='flex flex-wrap gap-2'>
						{article.companyMentions.map(({ company }) => (
							<a
								key={company.id}
								href={buildVerticalUrl(
									article.vertical!.slug,
									`/directory/${company.slug}`
								)}
								className='inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary'
							>
								{company.verificationTier !==
									VerificationTier.UNVERIFIED && (
									<CheckCircle2 className='h-3.5 w-3.5 text-verified' />
								)}
								<span>{company.name}</span>
							</a>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

