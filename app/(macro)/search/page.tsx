import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EcosystemSearchResults } from '@/components/search/ecosystem-search-results';
import {
	type EcosystemSearchScope,
	searchEcosystem,
} from '@/lib/services/search.service';

export const metadata: Metadata = {
	title: 'Ecosystem Semantic Search — Suppliers, Specs, Briefs & RFQs | Trndzz',
	description:
		'AI-assisted specification and supplier search across Aluminium, Steel, Solar, and West African industrial trade portals.',
};

const VALID_SCOPES: EcosystemSearchScope[] = [
	'all',
	'suppliers',
	'products',
	'rfqs',
	'articles',
	'learn',
];

export default async function MacroSearchPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; scope?: string }>;
}) {
	const { q = '', scope } = await searchParams;
	const activeScope: EcosystemSearchScope = VALID_SCOPES.includes(
		scope as EcosystemSearchScope
	)
		? (scope as EcosystemSearchScope)
		: 'all';

	const data = await searchEcosystem({
		query: q,
		scope: activeScope,
	});

	return (
		<div className='mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
			<div className='space-y-2'>
				<span className='font-tabular text-xs font-semibold uppercase tracking-wider text-primary'>
					Cross-Sector Procurement & Intelligence Search
				</span>
				<h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
					Search Suppliers, Technical SKUs, Live RFQs & Reports
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
						placeholder='Search e.g. "0.55mm AA3003 coil", "BS4449 16mm TMT rebar", "580Wp TOPCon"...'
						className='pl-9'
					/>
				</div>

				<select
					name='scope'
					defaultValue={activeScope}
					className='flex h-9 rounded-md border border-input bg-background px-3 text-xs'
				>
					<option value='all'>All Ecosystem Entities</option>
					<option value='suppliers'>Suppliers & Mills</option>
					<option value='products'>Technical Catalog SKUs</option>
					<option value='rfqs'>Live Public RFQs</option>
					<option value='articles'>Pulse Market Briefs</option>
					<option value='learn'>Learn Whitepapers</option>
				</select>

				<Button type='submit' size='sm'>
					Search Ecosystem
				</Button>
			</form>

			<EcosystemSearchResults data={data} />
		</div>
	);
}

