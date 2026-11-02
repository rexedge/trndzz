'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceType } from '@prisma/client';
import { toast } from 'sonner';
import { createKnowledgeResourceAction } from '@/app/actions/learn.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RESOURCE_TYPE_VALUES } from '@/lib/validators/learn.validator';

interface ResourceEditorProps {
	verticals: {
		id: string;
		name: string;
		categories: { id: string; name: string }[];
	}[];
	companies: { id: string; name: string }[];
}

export function AdminResourceEditor({
	verticals,
	companies,
}: ResourceEditorProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [verticalId, setVerticalId] = useState(verticals[0]?.id ?? '');
	const [categoryId, setCategoryId] = useState('');
	const [sponsorCompanyId, setSponsorCompanyId] = useState('');
	const [type, setType] = useState<ResourceType>(ResourceType.WHITEPAPER);
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [summary, setSummary] = useState('');
	const [contentPreview, setContentPreview] = useState('');
	const [fullContentMarkdown, setFullContentMarkdown] = useState('');
	const [fileUrl, setFileUrl] = useState('');
	const [pageCount, setPageCount] = useState('24');
	const [isGated, setIsGated] = useState(true);
	const [isFeatured, setIsFeatured] = useState(false);

	const activeVertical = verticals.find((v) => v.id === verticalId);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await createKnowledgeResourceAction({
				verticalId,
				categoryId,
				sponsorCompanyId,
				type,
				title,
				slug,
				summary,
				contentPreview,
				fullContentMarkdown,
				fileUrl,
				pageCount: pageCount ? Number(pageCount) : undefined,
				isGated,
				isFeatured,
			});

			if (!res.success) {
				const firstFieldErr = res.errors
					? Object.values(res.errors)[0]?.[0]
					: undefined;
				toast.error(firstFieldErr || res.message);
				return;
			}

			toast.success(res.message);
			setTitle('');
			setSlug('');
			setSummary('');
			setContentPreview('');
			setFullContentMarkdown('');
			setFileUrl('');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Publish Gated Whitepaper / Sector Dossier
			</h2>

			<div className='grid gap-3 sm:grid-cols-4'>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-vert'>Vertical</Label>
					<select
						id='kr-vert'
						value={verticalId}
						onChange={(e) => {
							setVerticalId(e.target.value);
							setCategoryId('');
						}}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>Cross-Sector (Macro)</option>
						{verticals.map((v) => (
							<option key={v.id} value={v.id}>
								{v.name}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='kr-cat'>Category (Optional)</Label>
					<select
						id='kr-cat'
						value={categoryId}
						onChange={(e) => setCategoryId(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>All Categories</option>
						{(activeVertical?.categories ?? []).map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='kr-type'>Resource Type *</Label>
					<select
						id='kr-type'
						value={type}
						onChange={(e) =>
							setType(e.target.value as ResourceType)
						}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						{RESOURCE_TYPE_VALUES.map((rt) => (
							<option key={rt} value={rt}>
								{rt.replace(/_/g, ' ')}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='kr-sponsor'>Sponsor Supplier</Label>
					<select
						id='kr-sponsor'
						value={sponsorCompanyId}
						onChange={(e) => setSponsorCompanyId(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>None (Editorial)</option>
						{companies.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-title'>Dossier Title *</Label>
					<Input
						id='kr-title'
						value={title}
						onChange={(e) => {
							setTitle(e.target.value);
							if (!slug) {
								setSlug(
									e.target.value
										.toLowerCase()
										.replace(/[^a-z0-9]+/g, '-')
										.replace(/^-|-$/g, '')
										.slice(0, 120)
								);
							}
						}}
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-slug'>URL Slug *</Label>
					<Input
						id='kr-slug'
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						className='font-mono text-xs'
						required
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='kr-sum'>Card Summary *</Label>
				<Input
					id='kr-sum'
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
					required
				/>
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-prev'>
						Ungated Executive Preview (Markdown) *
					</Label>
					<Textarea
						id='kr-prev'
						rows={4}
						value={contentPreview}
						onChange={(e) => setContentPreview(e.target.value)}
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-body'>
						Gated Full Report Content (Markdown) *
					</Label>
					<Textarea
						id='kr-body'
						rows={4}
						value={fullContentMarkdown}
						onChange={(e) => setFullContentMarkdown(e.target.value)}
						required
					/>
				</div>
			</div>

			<div className='grid gap-3 sm:grid-cols-3 items-end'>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-pdf'>Downloadable PDF URL</Label>
					<Input
						id='kr-pdf'
						type='url'
						value={fileUrl}
						onChange={(e) => setFileUrl(e.target.value)}
						placeholder='https://...'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='kr-pages'>Page Count</Label>
					<Input
						id='kr-pages'
						type='number'
						value={pageCount}
						onChange={(e) => setPageCount(e.target.value)}
						className='font-tabular'
					/>
				</div>
				<div className='flex items-center gap-5 pb-2 text-xs font-medium'>
					<label className='inline-flex items-center gap-2'>
						<input
							type='checkbox'
							checked={isGated}
							onChange={(e) => setIsGated(e.target.checked)}
						/>
						<span>Require Lead Gate</span>
					</label>
					<label className='inline-flex items-center gap-2'>
						<input
							type='checkbox'
							checked={isFeatured}
							onChange={(e) => setIsFeatured(e.target.checked)}
						/>
						<span>Featured</span>
					</label>
				</div>
			</div>

			<Button type='submit' disabled={isPending}>
				{isPending ? 'Publishing...' : 'Publish to Trndzz Learn'}
			</Button>
		</form>
	);
}

