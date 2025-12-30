'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
	loginAction,
	logoutAction,
	loadAdminDataAction,
	generateFromCSVAction,
	publishPostAction,
	deletePostAction,
	addImageToPostAction,
	removeImageFromPostAction,
	getPostWithImagesAction,
} from '@/app/actions/admin';
import {
	parseRelatedQueriesCSV,
	extractGenerationData,
	cleanTitle,
} from '@/lib/utils/csvParser';

const loginSchema = z.object({
	password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type PostImage = {
	id: string;
	url: string;
	alt: string | null;
	caption: string | null;
	credit: string | null;
	order: number;
};

type Draft = {
	id: string;
	title: string;
	slug: string;
	tags: string[];
	createdAt: string;
	content?: string;
	excerpt?: string;
	images?: PostImage[];
};

interface Props {
	initialAuthed: boolean;
	initialDrafts: Draft[];
}

export function AdminClient({ initialAuthed, initialDrafts }: Props) {
	const [authed, setAuthed] = useState(initialAuthed);
	const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
	const [signingOut, setSigningOut] = useState(false);

	// CSV Upload state - now supports multiple CSVs
	const [csvQueue, setCsvQueue] = useState<
		Array<{
			id: string;
			title: string;
			relatedQueries: string[];
			metadata: unknown;
			status: 'pending' | 'generating' | 'done' | 'error';
		}>
	>([]);
	const [generating, setGenerating] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Draft editing state
	const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
	const [loadingDraft, setLoadingDraft] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [pendingPublish, setPendingPublish] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { password: '' },
	});

	const refreshDrafts = useCallback(async () => {
		const res = await loadAdminDataAction();
		if (res.success && res.data) {
			setDrafts(res.data.drafts);
		}
	}, []);

	const onLogin = form.handleSubmit(async (values) => {
		const res = await loginAction(values);
		if (res.success) {
			setAuthed(true);
			form.reset();
			await refreshDrafts();
			toast.success('Signed in');
		} else {
			toast.error(res.message || 'Login failed');
			form.setError('password', { message: res.message });
		}
	});

	const onLogout = async () => {
		setSigningOut(true);
		await logoutAction();
		setAuthed(false);
		setDrafts([]);
		setCsvQueue([]);
		setEditingDraft(null);
		toast.success('Signed out');
		setSigningOut(false);
	};

	// CSV Upload Handler - now supports multiple files
	const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		Array.from(files).forEach((file) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const content = event.target?.result as string;
					const parsed = parseRelatedQueriesCSV(content);
					const data = extractGenerationData(parsed);

					setCsvQueue((prev) => [
						...prev,
						{
							id: `${Date.now()}-${Math.random()
								.toString(36)
								.substr(2, 9)}`,
							title: cleanTitle(data.title),
							relatedQueries: data.relatedQueries,
							metadata: data.metadata,
							status: 'pending',
						},
					]);

					toast.success(`Added: "${cleanTitle(data.title)}"`);
				} catch (error) {
					toast.error(`Failed to parse: ${file.name}`);
					console.error('CSV parse error:', error);
				}
			};
			reader.readAsText(file);
		});

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Remove a CSV from queue
	const removeCsvFromQueue = (id: string) => {
		setCsvQueue((prev) => prev.filter((csv) => csv.id !== id));
	};

	// Clear all CSVs from queue
	const clearCsvQueue = () => {
		setCsvQueue([]);
	};

	// Generate Draft from single CSV
	const handleGenerateSingle = async (csvId: string) => {
		const csv = csvQueue.find((c) => c.id === csvId);
		if (!csv) return;

		setCsvQueue((prev) =>
			prev.map((c) =>
				c.id === csvId ? { ...c, status: 'generating' } : c
			)
		);

		try {
			const res = await generateFromCSVAction({
				title: csv.title,
				relatedQueries: csv.relatedQueries,
				metadata: csv.metadata,
			});

			if (res.success && res.data) {
				const newDraft = res.data as Draft;
				setDrafts((prev) => [newDraft, ...prev]);
				setCsvQueue((prev) =>
					prev.map((c) =>
						c.id === csvId ? { ...c, status: 'done' } : c
					)
				);
				toast.success(`Draft created: "${csv.title}"`);
			} else {
				setCsvQueue((prev) =>
					prev.map((c) =>
						c.id === csvId ? { ...c, status: 'error' } : c
					)
				);
				toast.error(res.message || 'Failed to generate draft');
			}
		} catch (error) {
			setCsvQueue((prev) =>
				prev.map((c) =>
					c.id === csvId ? { ...c, status: 'error' } : c
				)
			);
			toast.error('Generation failed');
			console.error('Generate error:', error);
		}
	};

	// Generate all pending CSVs
	const handleGenerateAll = async () => {
		const pendingCsvs = csvQueue.filter((c) => c.status === 'pending');
		if (pendingCsvs.length === 0) return;

		setGenerating(true);

		for (const csv of pendingCsvs) {
			await handleGenerateSingle(csv.id);
			// Small delay between generations to avoid rate limits
			await new Promise((r) => setTimeout(r, 1000));
		}

		setGenerating(false);
		toast.success('All drafts generated!');
	};

	// Load draft for editing
	const loadDraftForEditing = async (draftId: string) => {
		setLoadingDraft(true);
		const res = await getPostWithImagesAction(draftId);
		if (res.success && res.data) {
			setEditingDraft(res.data as Draft);
		} else {
			toast.error('Failed to load draft');
		}
		setLoadingDraft(false);
	};

	// Image upload
	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!editingDraft) return;
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append('file', file);

			const uploadRes = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			const uploadData = await uploadRes.json();

			if (!uploadData.success) {
				toast.error(uploadData.message || 'Upload failed');
				setUploadingImage(false);
				return;
			}

			// Add image to post
			const addRes = await addImageToPostAction({
				postId: editingDraft.id,
				url: uploadData.data.url,
				alt: file.name.replace(/\.[^/.]+$/, ''),
			});

			if (addRes.success) {
				// Refresh draft data
				await loadDraftForEditing(editingDraft.id);
				toast.success('Image added');
			} else {
				toast.error(addRes.message || 'Failed to add image');
			}
		} catch (error) {
			toast.error('Upload failed');
			console.error('Upload error:', error);
		}
		setUploadingImage(false);
	};

	// Remove image
	const handleRemoveImage = async (imageId: string) => {
		if (!editingDraft) return;

		const res = await removeImageFromPostAction({ imageId });
		if (res.success) {
			await loadDraftForEditing(editingDraft.id);
			toast.success('Image removed');
		} else {
			toast.error(res.message || 'Failed to remove image');
		}
	};

	// Publish
	const handlePublish = async (draftId: string) => {
		setPendingPublish(draftId);
		const res = await publishPostAction({ postId: draftId });
		if (res.success) {
			setDrafts((prev) => prev.filter((d) => d.id !== draftId));
			setEditingDraft(null);
			toast.success('Published!');
		} else {
			toast.error(res.message || 'Publish failed');
		}
		setPendingPublish(null);
	};

	// Delete
	const handleDelete = async (draftId: string) => {
		if (!confirm('Delete this draft? This cannot be undone.')) return;

		setPendingDelete(draftId);
		const res = await deletePostAction({ postId: draftId });
		if (res.success) {
			setDrafts((prev) => prev.filter((d) => d.id !== draftId));
			if (editingDraft?.id === draftId) {
				setEditingDraft(null);
			}
			toast.success('Deleted');
		} else {
			toast.error(res.message || 'Delete failed');
		}
		setPendingDelete(null);
	};

	// Login Screen
	if (!authed) {
		return (
			<main className='min-h-screen flex items-center justify-center px-6 py-12'>
				<Card className='w-full max-w-md'>
					<CardHeader>
						<CardTitle>Admin Login</CardTitle>
						<CardDescription>
							Enter your password to access the admin panel.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							className='space-y-4'
							onSubmit={onLogin}
						>
							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									placeholder='Enter admin password'
									{...form.register('password')}
								/>
								{form.formState.errors.password && (
									<p className='text-sm text-destructive'>
										{form.formState.errors.password.message}
									</p>
								)}
							</div>
							<Button
								type='submit'
								className='w-full'
							>
								Sign in
							</Button>
						</form>
					</CardContent>
				</Card>
			</main>
		);
	}

	return (
		<main className='min-h-screen px-6 py-12'>
			<div className='mx-auto max-w-6xl space-y-8'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-semibold'>
							Admin Dashboard
						</h1>
						<p className='text-sm text-muted-foreground'>
							Upload CSV → Generate Draft → Add Images → Publish
						</p>
					</div>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							asChild
						>
							<Link href='/admin/drafts'>All Drafts</Link>
						</Button>
						<Button
							variant='outline'
							asChild
						>
							<Link href='/admin/posts'>Published Posts</Link>
						</Button>
						<Button
							variant='outline'
							asChild
						>
							<Link href='/'>View Site</Link>
						</Button>
						<Button
							variant='outline'
							asChild
						>
							<Link href='/posts'>All Posts</Link>
						</Button>
						<Button
							variant='outline'
							onClick={onLogout}
							disabled={signingOut}
						>
							{signingOut ? 'Signing out...' : 'Sign out'}
						</Button>
					</div>
				</div>

				{/* Stats */}
				<div className='grid gap-4 md:grid-cols-3'>
					<Card>
						<CardHeader className='pb-3'>
							<CardDescription>Drafts</CardDescription>
							<CardTitle className='text-3xl'>
								{drafts.length}
							</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className='pb-3'>
							<CardDescription>CSV Queue</CardDescription>
							<CardTitle className='text-3xl'>
								{csvQueue.length}
							</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className='pb-3'>
							<CardDescription>Workflow</CardDescription>
							<CardTitle className='text-sm font-normal'>
								CSV → Research → Draft → Images → Publish
							</CardTitle>
						</CardHeader>
					</Card>
				</div>

				<div className='grid gap-6 lg:grid-cols-3'>
					{/* Step 1: CSV Upload */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
									1
								</span>
								Upload CSVs
							</CardTitle>
							<CardDescription>
								Upload multiple relatedQueries.csv files from
								Google Trends.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<input
								title='upload'
								ref={fileInputRef}
								type='file'
								accept='.csv'
								multiple
								onChange={handleCSVUpload}
								className='hidden'
								id='csv-upload'
							/>
							<Button
								variant='outline'
								className='w-full'
								onClick={() => fileInputRef.current?.click()}
							>
								Choose CSV Files
							</Button>

							{csvQueue.length > 0 && (
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<p className='text-sm font-medium'>
											Queue ({csvQueue.length})
										</p>
										<Button
											size='sm'
											variant='ghost'
											onClick={clearCsvQueue}
										>
											Clear All
										</Button>
									</div>

									<div className='max-h-64 overflow-y-auto space-y-2'>
										{csvQueue.map((csv) => (
											<div
												key={csv.id}
												className='rounded-lg border p-2 space-y-2'
											>
												<div className='flex items-start justify-between gap-2'>
													<div className='flex-1 min-w-0'>
														<p className='text-sm font-medium truncate'>
															{csv.title}
														</p>
														<p className='text-xs text-muted-foreground'>
															{
																csv
																	.relatedQueries
																	.length
															}{' '}
															queries
														</p>
													</div>
													<div className='flex items-center gap-1'>
														{csv.status ===
															'pending' && (
															<Badge
																variant='outline'
																className='text-xs'
															>
																Pending
															</Badge>
														)}
														{csv.status ===
															'generating' && (
															<Badge
																variant='secondary'
																className='text-xs'
															>
																Generating...
															</Badge>
														)}
														{csv.status ===
															'done' && (
															<Badge
																variant='default'
																className='text-xs bg-green-600'
															>
																Done
															</Badge>
														)}
														{csv.status ===
															'error' && (
															<Badge
																variant='destructive'
																className='text-xs'
															>
																Error
															</Badge>
														)}
													</div>
												</div>
												<div className='flex gap-1'>
													{csv.status ===
														'pending' && (
														<Button
															size='sm'
															variant='secondary'
															className='flex-1 h-7 text-xs'
															onClick={() =>
																handleGenerateSingle(
																	csv.id
																)
															}
															disabled={
																generating
															}
														>
															Generate
														</Button>
													)}
													<Button
														size='sm'
														variant='ghost'
														className='h-7 text-xs'
														onClick={() =>
															removeCsvFromQueue(
																csv.id
															)
														}
													>
														Remove
													</Button>
												</div>
											</div>
										))}
									</div>

									<Separator />
									<Button
										size='sm'
										onClick={handleGenerateAll}
										disabled={
											generating ||
											csvQueue.filter(
												(c) => c.status === 'pending'
											).length === 0
										}
										className='w-full'
									>
										{generating
											? 'Generating...'
											: `Generate All (${
													csvQueue.filter(
														(c) =>
															c.status ===
															'pending'
													).length
											  })`}
									</Button>
								</div>
							)}

							{csvQueue.length === 0 && (
								<p className='text-xs text-muted-foreground'>
									Go to Google Trends → Search topic → Related
									queries → Download CSV
								</p>
							)}
						</CardContent>
					</Card>

					{/* Step 2 & 3: Draft List */}
					<Card className='lg:col-span-2'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
									2
								</span>
								Drafts
							</CardTitle>
							<CardDescription>
								Click a draft to edit and add images.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{drafts.length === 0 ? (
								<p className='text-sm text-muted-foreground py-8 text-center'>
									No drafts yet. Upload a CSV to generate one.
								</p>
							) : (
								<div className='space-y-3'>
									{drafts.map((draft) => (
										<div
											key={draft.id}
											className={`rounded-lg border p-3 cursor-pointer transition-colors ${
												editingDraft?.id === draft.id
													? 'border-primary bg-muted/50'
													: 'hover:bg-muted/30'
											}`}
											onClick={() =>
												loadDraftForEditing(draft.id)
											}
										>
											<div className='flex items-start justify-between gap-2'>
												<div className='flex-1 min-w-0'>
													<p className='font-medium truncate'>
														{draft.title}
													</p>
													<div className='flex flex-wrap gap-1 mt-1'>
														{draft.tags
															.slice(0, 3)
															.map((tag) => (
																<Badge
																	key={tag}
																	variant='outline'
																	className='text-xs'
																>
																	{tag}
																</Badge>
															))}
													</div>
												</div>
												<div
													className='flex gap-1'
													onClick={(e) =>
														e.stopPropagation()
													}
												>
													<Button
														size='sm'
														variant='ghost'
														asChild
													>
														<Link
															href={`/posts/${draft.slug}`}
															target='_blank'
														>
															Preview
														</Link>
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Step 3: Edit Draft & Add Images */}
				{editingDraft && (
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
									3
								</span>
								Edit &amp; Add Images
							</CardTitle>
							<CardDescription>
								Add 1-5 images, then publish when ready.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{loadingDraft ? (
								<div className='py-8 text-center text-muted-foreground'>
									Loading...
								</div>
							) : (
								<>
									{/* Post Info */}
									<div className='space-y-2'>
										<Label>Title</Label>
										<p className='font-medium'>
											{editingDraft.title}
										</p>
									</div>

									{/* Images Section */}
									<div className='space-y-3'>
										<div className='flex items-center justify-between'>
											<Label>
												Images (
												{editingDraft.images?.length ||
													0}
												/5)
											</Label>
											<input
												title='image'
												type='file'
												accept='image/*'
												onChange={handleImageUpload}
												className='hidden'
												id='image-upload'
												disabled={
													uploadingImage ||
													(editingDraft.images
														?.length || 0) >= 5
												}
											/>
											<Button
												size='sm'
												variant='outline'
												onClick={() =>
													document
														.getElementById(
															'image-upload'
														)
														?.click()
												}
												disabled={
													uploadingImage ||
													(editingDraft.images
														?.length || 0) >= 5
												}
											>
												{uploadingImage
													? 'Uploading...'
													: 'Add Image'}
											</Button>
										</div>

										{editingDraft.images &&
										editingDraft.images.length > 0 ? (
											<div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
												{editingDraft.images.map(
													(img) => (
														<div
															key={img.id}
															className='relative group'
														>
															<div className='aspect-video relative rounded-lg overflow-hidden border'>
																<Image
																	src={
																		img.url
																	}
																	alt={
																		img.alt ||
																		''
																	}
																	fill
																	className='object-cover'
																/>
															</div>
															<Button
																size='sm'
																variant='destructive'
																className='absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
																onClick={() =>
																	handleRemoveImage(
																		img.id
																	)
																}
															>
																×
															</Button>
															{img.order ===
																0 && (
																<Badge className='absolute bottom-1 left-1 text-xs'>
																	Featured
																</Badge>
															)}
														</div>
													)
												)}
											</div>
										) : (
											<div className='border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground'>
												<p>
													No images yet. Add at least
													one image before publishing.
												</p>
											</div>
										)}
									</div>

									<Separator />

									{/* Actions */}
									<div className='flex items-center justify-between'>
										<Button
											variant='ghost'
											className='text-destructive hover:text-destructive'
											onClick={() =>
												handleDelete(editingDraft.id)
											}
											disabled={
												pendingDelete ===
												editingDraft.id
											}
										>
											{pendingDelete === editingDraft.id
												? 'Deleting...'
												: 'Delete Draft'}
										</Button>
										<div className='flex gap-2'>
											<Button
												variant='outline'
												onClick={() =>
													setEditingDraft(null)
												}
											>
												Close
											</Button>
											<Button
												onClick={() =>
													handlePublish(
														editingDraft.id
													)
												}
												disabled={
													pendingPublish ===
														editingDraft.id ||
													!editingDraft.images?.length
												}
											>
												{pendingPublish ===
												editingDraft.id
													? 'Publishing...'
													: 'Publish'}
											</Button>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</main>
	);
}
