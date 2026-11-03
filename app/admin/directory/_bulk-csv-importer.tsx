'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Download, FileUp, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { bulkSeedDirectoryCompaniesAction } from '@/app/actions/company.actions';
import { SAMPLE_SUPPLIER_CSV_TEMPLATE } from '@/lib/validators/bulk-seed.validator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VerticalReference {
	slug: string;
	name: string;
	categories: { slug: string; name: string }[];
}

export function BulkCsvDirectoryImporter({
	verticals,
}: {
	verticals: VerticalReference[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [csvText, setCsvText] = useState('');
	const [resultSummary, setResultSummary] = useState<{
		totalRows: number;
		createdCount: number;
		updatedCount: number;
		rowErrors: string[];
	} | null>(null);

	const handleDownloadTemplate = () => {
		const blob = new Blob([SAMPLE_SUPPLIER_CSV_TEMPLATE], {
			type: 'text/csv;charset=utf-8;',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'trndzz-supplier-bulk-seed-template.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleLoadSampleIntoEditor = () => {
		setCsvText(SAMPLE_SUPPLIER_CSV_TEMPLATE);
		setResultSummary(null);
		toast.info('Loaded 3-vertical sample CSV into editor');
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			const content =
				typeof ev.target?.result === 'string' ? ev.target.result : '';
			setCsvText(content);
			setResultSummary(null);
			toast.success(`Loaded "${file.name}"`);
		};
		reader.onerror = () => {
			toast.error('Unable to read CSV file');
		};
		reader.readAsText(file);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await bulkSeedDirectoryCompaniesAction({ csvText });
			if (!res.success || !res.data) {
				toast.error(res.message);
				return;
			}

			setResultSummary(res.data);
			toast.success(res.message);
			router.refresh();
		});
	};

	return (
		<div className='space-y-6 rounded-2xl border border-border bg-card p-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h2 className='text-lg font-bold'>
						Bulk CSV Supplier Importer (Up to 250 Rows)
					</h2>
					<p className='mt-0.5 text-xs text-muted-foreground'>
						Idempotently onboard pre-seeded UNCLAIMED industrial
						suppliers across Aluminium, Steel, and Solar using
						pipe-delimited (<code className='font-mono'>|</code>)
						multi-value columns.
					</p>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleLoadSampleIntoEditor}
					>
						Load Sample Rows
					</Button>
					<Button
						type='button'
						variant='secondary'
						size='sm'
						onClick={handleDownloadTemplate}
						className='gap-1.5'
					>
						<Download className='h-3.5 w-3.5' />
						<span>Download CSV Template</span>
					</Button>
				</div>
			</div>

			<div className='grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-xs sm:grid-cols-3'>
				{verticals.map((v) => (
					<div key={v.slug} className='space-y-1'>
						<p className='font-semibold'>
							{v.name}{' '}
							<code className='font-mono text-primary'>
								({v.slug})
							</code>
						</p>
						<p className='font-mono text-[11px] text-muted-foreground leading-relaxed'>
							{v.categories.map((c) => c.slug).join(' | ')}
						</p>
					</div>
				))}
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='flex flex-wrap items-center justify-between gap-2'>
					<Label htmlFor='bulk-csv-text'>
						CSV Payload (RFC-4180 · Header + Data Rows)
					</Label>
					<label className='inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted'>
						<FileUp className='h-3.5 w-3.5' />
						<span>Upload .csv File</span>
						<input
							type='file'
							accept='.csv,text/csv'
							onChange={handleFileUpload}
							className='hidden'
						/>
					</label>
				</div>

				<Textarea
					id='bulk-csv-text'
					rows={9}
					value={csvText}
					onChange={(e) => setCsvText(e.target.value)}
					placeholder='name,slug,verticalSlug,categorySlugs,streamPositions,businessRoles,headquartersState,...'
					className='font-mono text-xs leading-relaxed'
					required
				/>

				<Button
					type='submit'
					disabled={isPending || !csvText.trim()}
					className='bg-amber text-white hover:opacity-90 gap-1.5'
				>
					<Upload className='h-4 w-4' />
					<span>
						{isPending
							? 'Validating & Indexing Suppliers...'
							: 'Run Bulk Directory Import'}
					</span>
				</Button>
			</form>

			{resultSummary && (
				<div className='space-y-3 rounded-xl border border-border bg-muted/20 p-4 text-xs'>
					<div className='flex flex-wrap items-center gap-4 font-semibold'>
						<span className='inline-flex items-center gap-1.5 text-verified'>
							<CheckCircle2 className='h-4 w-4' />
							<span>
								{resultSummary.createdCount} Created ·{' '}
								{resultSummary.updatedCount} Updated (of{' '}
								{resultSummary.totalRows} rows)
							</span>
						</span>
						{resultSummary.rowErrors.length > 0 && (
							<span className='inline-flex items-center gap-1 text-destructive'>
								<AlertCircle className='h-4 w-4' />
								<span>
									{resultSummary.rowErrors.length} Row Warning(s)
								</span>
							</span>
						)}
					</div>

					{resultSummary.rowErrors.length > 0 && (
						<ul className='max-h-40 space-y-1 overflow-y-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3 font-mono text-[11px] text-destructive'>
							{resultSummary.rowErrors.map((err, idx) => (
								<li key={idx}>{err}</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}

