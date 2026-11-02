'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArticleStatus, ArticleType } from '@prisma/client';
import { toast } from 'sonner';
import { saveArticleAction } from '@/app/actions/article.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VerticalOption {
	id: string;
	name: string;
	stages: { id: string; name: string }[];
	categories: { id: string; name: string }[];
}

interface CompanyOption {
	id: string;
	name: string;
}

export function AdminArticleEditor({
	verticals,
	companies,
}: {
	verticals: VerticalOption[];
	companies: CompanyOption[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [verticalId, setVerticalId] = useState(verticals[0]?.id ?? '');
	const activeVertical = verticals.find((v) => v.id === verticalId);

	const [valueChainStageId, setValueChainStageId] = useState(
		activeVertical?.stages[0]?.id ?? ''
	);
	const [categoryId, setCategoryId] = useState(
		activeVertical?.categories[0]?.id ?? ''
	);
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [body, setBody] = useState('');
	const [type, setType] = useState<ArticleType>(ArticleType.MARKET_BRIEF);
	const [status, setStatus] = useState<ArticleStatus>(
		ArticleStatus.PUBLISHED
	);
	const [isMacroFeatured, setIsMacroFeatured] = useState(true);
	const [isVerticalPinned, setIsVerticalPinned] = useState(false);
	const [sourceName, setSourceName] = useState('');
	const [sourceUrl, setSourceUrl] = useState('');
	const [mentionedCompanyIds, setMentionedCompanyIds] = useState<string[]>(
		[]
	);

	const handleVerticalChange = (nextId: string) => {
		setVerticalId(nextId);
		const found = verticals.find((v) => v.id === nextId);
		setValueChainStageId(found?.stages[0]?.id ?? '');
		setCategoryId(found?.categories[0]?.id ?? '');
	};

	const toggleMention = (id: string) => {
		setMentionedCompanyIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await saveArticleAction({
				verticalId,
				valueChainStageId,
				categoryId,
				title,
				slug,
				excerpt,
				body,
				type,
				status,
				isMacroFeatured,
				isVerticalPinned,
				sourceName,
				sourceUrl,
				mentionedCompanyIds,
			});

			if (!res.success) {
				const firstErr = res.errors
					? Object.values(res.errors)[0]?.[0]
					: undefined;
				toast.error(firstErr || res.message);
				return;
			}

			toast.success(res.message);
			setTitle('');
			setSlug('');
			setExcerpt('');
			setBody('');
			setMentionedCompanyIds([]);
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-5 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Publish Value-Chain Intelligence Brief
			</h2>

			<div className='grid gap-4 sm:grid-cols-3'>
				<div className='space-y-1.5'>
					<Label htmlFor='cms-vert'>Vertical Portal</Label>
					<select
						id='cms-vert'
						value={verticalId}
						onChange={(e) => handleVerticalChange(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>Macro Hub Only (Cross-Sector)</option>
						{verticals.map((v) => (
							<option key={v.id} value={v.id}>
								{v.name}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='cms-stage'>Value-Chain Stage</Label>
					<select
						id='cms-stage'
						value={valueChainStageId}
						onChange={(e) => setValueChainStageId(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>None</option>
						{activeVertical?.stages.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='cms-cat'>
						Contextual RFQ Category Link
					</Label>
					<select
						id='cms-cat'
						value={categoryId}
						onChange={(e) => setCategoryId(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value=''>None</option>
						{activeVertical?.categories.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='cms-title'>Headline *</Label>
					<Input
						id='cms-title'
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
					<Label htmlFor='cms-slug'>URL Slug *</Label>
					<Input
						id='cms-slug'
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='cms-type'>Article Format</Label>
					<select
						id='cms-type'
						value={type}
						onChange={(e) => setType(e.target.value as ArticleType)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						{Object.values(ArticleType).map((t) => (
							<option key={t} value={t}>
								{t.replace(/_/g, ' ')}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='cms-status'>Workflow Status</Label>
					<select
						id='cms-status'
						value={status}
						onChange={(e) =>
							setStatus(e.target.value as ArticleStatus)
						}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						{Object.values(ArticleStatus).map((st) => (
							<option key={st} value={st}>
								{st}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='cms-excerpt'>Executive Summary Excerpt *</Label>
				<Textarea
					id='cms-excerpt'
					rows={2}
					value={excerpt}
					onChange={(e) => setExcerpt(e.target.value)}
					required
				/>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='cms-body'>
					Markdown Editorial Body * (min 80 chars)
				</Label>
				<Textarea
					id='cms-body'
					rows={8}
					value={body}
					onChange={(e) => setBody(e.target.value)}
					className='font-mono text-xs'
					required
				/>
			</div>

			{/* Pillar 5 Contextual Supplier Cross-Link Multi-Select */}
			{companies.length > 0 && (
				<div className='space-y-2 rounded-xl border border-border bg-muted/30 p-4'>
					<Label className='text-xs uppercase tracking-wider text-muted-foreground'>
						Cross-Link Indexed Directory Companies (Pillar 5)
					</Label>
					<div className='flex flex-wrap gap-2'>
						{companies.map((c) => {
							const selected = mentionedCompanyIds.includes(c.id);
							return (
								<button
									key={c.id}
									type='button'
									onClick={() => toggleMention(c.id)}
									className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${selected
										? 'border-verified bg-verified/15 text-verified'
										: 'border-border bg-background text-muted-foreground hover:text-foreground'
										}`}
								>
									{c.name}
								</button>
							);
						})}
					</div>
				</div>
			)}

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='cms-src-name'>
						External Reference Name (Optional)
					</Label>
					<Input
						id='cms-src-name'
						value={sourceName}
						onChange={(e) => setSourceName(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='cms-src-url'>
						External Reference URL (Optional)
					</Label>
					<Input
						id='cms-src-url'
						type='url'
						value={sourceUrl}
						onChange={(e) => setSourceUrl(e.target.value)}
					/>
				</div>
			</div>

			<div className='flex flex-wrap gap-6 text-xs'>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={isMacroFeatured}
						onChange={(e) => setIsMacroFeatured(e.target.checked)}
					/>
					<span>Syndicate to Root Macro Hub (trndzz.com)</span>
				</label>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={isVerticalPinned}
						onChange={(e) => setIsVerticalPinned(e.target.checked)}
					/>
					<span>Pin as Lead Brief on Vertical Subdomain</span>
				</label>
			</div>

			<Button type='submit' disabled={isPending}>
				{isPending ? 'Saving Brief...' : 'Publish Intelligence Brief'}
			</Button>
		</form>

	);
}
