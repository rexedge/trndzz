import Link from 'next/link';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVerticalRfqFormMeta } from '@/lib/services/rfq.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { RfqBroadcastForm } from './_rfq-form';

export default async function NewVerticalRfqPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{ category?: string }>;
}) {
	const { verticalSlug } = await params;
	const { category } = await searchParams;
	const { vertical, user } = await resolveRequiredVertical(verticalSlug);

	const { categories, specDefinitions } = await getVerticalRfqFormMeta(
		vertical.id
	);

	const returnUrl = buildVerticalUrl(
		vertical.slug,
		category ? `/rfq/new?category=${category}` : '/rfq/new'
	);

	return (
		<div className='mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='space-y-2'>
				<Link
					href='/rfq'
					className='text-xs font-semibold text-vertical hover:underline'
				>
					← Back to Live {vertical.name} RFQ Board
				</Link>
				<div className='flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-wider text-amber'>
					<FileSpreadsheet className='h-4 w-4' />
					<span>Specification-Driven Sourcing Broadcast</span>
				</div>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Submit Structured {vertical.name} RFQ
				</h1>
				<p className='text-sm text-muted-foreground leading-relaxed'>
					Define exact technical parameters once and receive
					standardized, side-by-side Naira (`₦`) quotes from
					pre-qualified manufacturers and importers.
				</p>
			</div>

			{!user ? (
				<div className='rounded-2xl border border-border bg-card p-8 space-y-4'>
					<h2 className='text-lg font-bold'>
						Sign in to broadcast a verified buyer RFQ
					</h2>
					<p className='text-sm text-muted-foreground'>
						Authenticated buyer accounts track supplier quotes in a
						side-by-side comparison matrix and award purchase orders
						securely.
					</p>
					<div className='flex flex-wrap gap-3 pt-2'>
						<Button asChild>
							<a
								href={buildMacroUrl(
									`/auth/login?next=${encodeURIComponent(returnUrl)}`
								)}
							>
								Sign In to Broadcast RFQ
							</a>
						</Button>
						<Button asChild variant='outline'>
							<a
								href={buildMacroUrl(
									`/auth/register?next=${encodeURIComponent(returnUrl)}`
								)}
							>
								Create Buyer Account
							</a>
						</Button>
					</div>
				</div>
			) : (
				<RfqBroadcastForm
					verticalId={vertical.id}
					verticalName={vertical.name}
					categories={categories.map((c) => ({
						id: c.id,
						name: c.name,
						slug: c.slug,
						defaultUnit: c.defaultUnit ?? 'MT',
					}))}
					specDefinitions={specDefinitions.map((d) => ({
						id: d.id,
						categoryId: d.categoryId,
						key: d.key,
						label: d.label,
						unit: d.unit,
						inputType: d.inputType,
						options: d.options,
						isRequired: d.isRequired,
					}))}
					initialCategorySlug={category}
					user={user}
				/>
			)}
		</div>
	);
}

