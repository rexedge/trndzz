'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessRole } from '@prisma/client';
import { Download, LockOpen, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { unlockKnowledgeResourceAction } from '@/app/actions/learn.actions';
import { Markdown } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trackB2BEvent } from '@/lib/posthog/events';
import { BUSINESS_ROLE_VALUES } from '@/lib/validators/company.validator';

interface LeadGateFormProps {
	resourceId: string;
	resourceTitle: string;
	hasDownloadableFile: boolean;
	initialUser?: {
		name: string;
		email: string;
		phone?: string | null;
		jobTitle?: string | null;
		companyName?: string | null;
	} | null;
}

export function ResourceLeadGateForm({
	resourceId,
	resourceTitle,
	hasDownloadableFile,
	initialUser,
}: LeadGateFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [unlockedPayload, setUnlockedPayload] = useState<{
		fullContentMarkdown: string;
		fileUrl: string | null;
	} | null>(null);

	const [fullName, setFullName] = useState(initialUser?.name ?? '');
	const [workEmail, setWorkEmail] = useState(initialUser?.email ?? '');
	const [phone, setPhone] = useState(initialUser?.phone ?? '');
	const [companyName, setCompanyName] = useState(
		initialUser?.companyName ?? ''
	);
	const [jobTitle, setJobTitle] = useState(initialUser?.jobTitle ?? '');
	const [businessRole, setBusinessRole] = useState<BusinessRole>(
		BusinessRole.FABRICATOR_INSTALLER
	);
	const [procurementTimeline, setProcurementTimeline] = useState(
		'Active Tender (0–30 Days)'
	);
	const [estimatedBudgetBand, setEstimatedBudgetBand] =
		useState('₦25M – ₦100M');
	const [deliveryState, setDeliveryState] = useState('Lagos');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		startTransition(async () => {
			const res = await unlockKnowledgeResourceAction({
				resourceId,
				fullName,
				workEmail,
				phone,
				companyName,
				jobTitle,
				businessRole,
				procurementTimeline,
				estimatedBudgetBand,
				deliveryState,
			});

			if (!res.success || !res.data) {
				const firstFieldErr = res.errors
					? Object.values(res.errors)[0]?.[0]
					: undefined;
				toast.error(firstFieldErr || res.message);
				return;
			}

			trackB2BEvent('learn_dossier_unlocked', {
				resourceId,
				procurementTimeline,
				estimatedBudgetBand,
			});
			toast.success(res.message);
			setUnlockedPayload(res.data);
			router.refresh();
		});
	};

	if (unlockedPayload) {
		return (
			<div className='space-y-6 rounded-2xl border border-verified/40 bg-card p-6 sm:p-8'>
				<div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4'>
					<div className='flex items-center gap-2 text-sm font-bold text-verified'>
						<LockOpen className='h-4 w-4' />
						<span>Full Technical Dossier Unlocked</span>
					</div>
					{unlockedPayload.fileUrl && (
						<Button asChild size='sm' variant='outline'>
							<a
								href={unlockedPayload.fileUrl}
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
					<Markdown content={unlockedPayload.fullContentMarkdown} />
				</div>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-5 rounded-2xl border border-amber/50 bg-card p-6 sm:p-8'
		>
			<div className='space-y-1.5'>
				<div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber'>
					<ShieldCheck className='h-4 w-4' />
					<span>B2B Trade Intelligence Access Gate</span>
				</div>
				<h3 className='text-xl font-bold'>
					Unlock Full Dossier:{' '}
					<span className='text-muted-foreground font-semibold'>
						{resourceTitle}
					</span>
				</h3>
				<p className='text-xs text-muted-foreground'>
					Enter your corporate procurement credentials for immediate
					full-text engineering tables
					{hasDownloadableFile ? ' and PDF download access' : ''}.
				</p>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-name'>Full Name *</Label>
					<Input
						id='lg-name'
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder='Engr. Chinedu Okafor'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-email'>Corporate Email *</Label>
					<Input
						id='lg-email'
						type='email'
						value={workEmail}
						onChange={(e) => setWorkEmail(e.target.value)}
						placeholder='procurement@company.com.ng'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-company'>Company / Organization *</Label>
					<Input
						id='lg-company'
						value={companyName}
						onChange={(e) => setCompanyName(e.target.value)}
						placeholder='PrimeCrest Civil & EPC Ltd'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-title'>Job Title *</Label>
					<Input
						id='lg-title'
						value={jobTitle}
						onChange={(e) => setJobTitle(e.target.value)}
						placeholder='Head of Procurement / Project Engineer'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-phone'>Direct Phone / WhatsApp *</Label>
					<Input
						id='lg-phone'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder='+234 803 000 0000'
						required
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-role'>Primary Industry Role</Label>
					<select
						id='lg-role'
						value={businessRole}
						onChange={(e) =>
							setBusinessRole(e.target.value as BusinessRole)
						}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						{BUSINESS_ROLE_VALUES.map((r) => (
							<option key={r} value={r}>
								{r.replace(/_/g, ' ')}
							</option>
						))}
					</select>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-timeline'>Sourcing Horizon</Label>
					<select
						id='lg-timeline'
						value={procurementTimeline}
						onChange={(e) => setProcurementTimeline(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
					>
						<option value='Active Tender (0–30 Days)'>
							Active Tender (0–30 Days)
						</option>
						<option value='Upcoming Project (1–3 Months)'>
							Upcoming Project (1–3 Months)
						</option>
						<option value='Annual Framework Planning (3–6 Months)'>
							Annual Framework Planning (3–6 Months)
						</option>
						<option value='Market Research Only'>
							Market Research Only
						</option>
					</select>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='lg-budget'>
						Estimated Procurement Volume (₦)
					</Label>
					<select
						id='lg-budget'
						value={estimatedBudgetBand}
						onChange={(e) => setEstimatedBudgetBand(e.target.value)}
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-tabular'
					>
						<option value='Under ₦25M'>Under ₦25M</option>
						<option value='₦25M – ₦100M'>₦25M – ₦100M</option>
						<option value='₦100M – ₦500M'>₦100M – ₦500M</option>
						<option value='₦500M+ Enterprise Tender'>
							₦500M+ Enterprise Tender
						</option>
					</select>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='lg-state'>Primary Project State</Label>
				<Input
					id='lg-state'
					value={deliveryState}
					onChange={(e) => setDeliveryState(e.target.value)}
					placeholder='Lagos'
				/>
			</div>

			<Button
				type='submit'
				size='lg'
				disabled={isPending}
				className='w-full bg-amber text-white hover:opacity-90'
			>
				{isPending
					? 'Verifying & Unlocking Dossier...'
					: 'Unlock Full Technical Report →'}
			</Button>
		</form>
	);
}
