import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EcosystemSearchResults } from '@/components/search/ecosystem-search-results';
import {
	type EcosystemSearchScope,
	searchEcosystem,
} from '@/lib/services/search.service';
import { resolveRequiredVertical } from '@/lib/services/tenant-context';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ verticalSlug: string }>;
}): Promise<Metadata> {
	const { verticalSlug } = await params;
	const { vertical } = await resolveRequiredVertical(verticalSlug);
	return {
		title: `Search ${vertical.name} Suppliers, SKUs, RFQs & Reports | Trndzz`,
		description: `AI-assisted specification search across verified ${vertical.name} manufacturers, technical catalogs, live tenders, and market briefs.`,
	};
}

const VALID_SCOPES: EcosystemSearchScope[] = [
	'all',
	'suppliers',
	'products',
	'rfqs',
	'articles',
	'learn',
];

export default async function VerticalSearchPage({
	params,
	searchParams,
}: {
	params: Promise<{ verticalSlug: string }>;
	searchParams: Promise<{ q?: string; scope?: string }>;
}) {
	const { verticalSlug } = await params;
	const { q = '', scope } = await searchParams;
	const { vertical } = await resolveRequiredVertical(verticalSlug);

	const activeScope: EcosystemSearchScope = VALID_SCOPES.includes(
		scope as EcosystemSearchScope
	)
		? (scope as EcosystemSearchScope)
		: 'all';

	const data = await searchEcosystem({
		query: q,
		verticalId: vertical.id,
		verticalName: vertical.name,
		scope: activeScope,
	});

	return (
		<div className='mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='space-y-2'>
				<span className='font-tabular text-xs font-semibold uppercase tracking-wider text-vertical'>
					Trndzz {vertical.name} · Semantic & Spec Search
				</span>
				<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
					Search {vertical.name} Suppliers, Technical SKUs & Tenders
				</h1>
			</div>

			<form
				action='/search'
				method='GET'
				className='flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4'
			>
				<div className='relative min-w-64 flex-1'>
					<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						name='q'
						defaultValue={q}
						placeholder={`Search ${vertical.name} alloy, grade, dimension, supplier, or RFQ...`}
						className='pl-9'
					/>
				</div>

				<select
					name='scope'
					defaultValue={activeScope}
					className='flex h-9 rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value='all'>All {vertical.name} Entities</option>
					<option value='suppliers'>Suppliers & Mills</option>
					<option value='products'>Technical Catalog SKUs</option>
					<option value='rfqs'>Live Public RFQs</option>
					<option value='articles'>Pulse Market Briefs</option>
					<option value='learn'>Learn Whitepapers</option>
				</select>

				<Button type='submit' size='sm'>
					Search Portal
				</Button>
			</form>

			<EcosystemSearchResults
				data={data}
				currentVerticalSlug={vertical.slug}
			/>
		</div>
	);
}

