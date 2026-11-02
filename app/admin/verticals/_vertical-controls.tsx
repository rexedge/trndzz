'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { VerticalStatus } from '@prisma/client';
import { toast } from 'sonner';
import {
	createVerticalAction,
	updateVerticalStatusAction,
} from '@/app/actions/vertical.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function VerticalStatusToggle({
	verticalId,
	currentStatus,
}: {
	verticalId: string;
	currentStatus: VerticalStatus;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const nextStatus =
		currentStatus === VerticalStatus.ACTIVE
			? VerticalStatus.DRAFT
			: VerticalStatus.ACTIVE;

	const handleToggle = () => {
		startTransition(async () => {
			const res = await updateVerticalStatusAction({
				verticalId,
				status: nextStatus,
			});
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.refresh();
		});
	};

	return (
		<Button
			size='sm'
			variant={
				currentStatus === VerticalStatus.ACTIVE
					? 'outline'
					: 'default'
			}
			disabled={isPending}
			onClick={handleToggle}
		>
			{currentStatus === VerticalStatus.ACTIVE
				? 'Set to Draft'
				: 'Launch Live Subdomain'}
		</Button>
	);
}

export function CreateVerticalForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [tagline, setTagline] = useState('');
	const [description, setDescription] = useState('');
	const [themeColor, setThemeColor] = useState('#0284C7');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await createVerticalAction({
				name,
				slug,
				tagline,
				description,
				themeColor,
				status: VerticalStatus.DRAFT,
			});

			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			setName('');
			setSlug('');
			setTagline('');
			setDescription('');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-2xl border border-border bg-card p-6'
		>
			<h2 className='text-lg font-bold'>
				Provision New Multi-Tenant Vertical
			</h2>
			<p className='text-xs text-muted-foreground'>
				Automatically configures Upstream, Midstream, Downstream, and
				Cross-Stream value-chain stages on{' '}
				<span className='font-tabular'>[slug].trndzz.com</span>.
			</p>

			<div className='grid gap-3 sm:grid-cols-3'>
				<div className='space-y-1.5'>
					<Label htmlFor='v-name'>Sector Name *</Label>
					<Input
						id='v-name'
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							if (!slug) {
								setSlug(
									e.target.value
										.toLowerCase()
										.replace(/[^a-z0-9]+/g, '-')
										.replace(/^-|-$/g, '')
								);
							}
						}}
						placeholder='e.g. Cement & Concrete'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='v-slug'>Subdomain Slug *</Label>
					<Input
						id='v-slug'
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						placeholder='cement'
						className='font-tabular'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='v-color'>Accent Hex Color *</Label>
					<Input
						id='v-color'
						value={themeColor}
						onChange={(e) => setThemeColor(e.target.value)}
						className='font-tabular'
						required
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='v-tagline'>Portal Masthead Tagline *</Label>
				<Input
					id='v-tagline'
					value={tagline}
					onChange={(e) => setTagline(e.target.value)}
					placeholder='West Africa Clinker, Bulk Cement & Ready-Mix Procurement Hub'
					required
				/>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='v-desc'>Sector Description *</Label>
				<Textarea
					id='v-desc'
					rows={2}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
				/>
			</div>

			<Button type='submit' disabled={isPending}>
				{isPending ? 'Provisioning...' : 'Provision Vertical Subdomain'}
			</Button>
		</form>
	);
}

