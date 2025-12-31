'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import {
	updatePostAction,
	deletePostAction,
	publishPostAction,
	addImageToPostAction,
	removeImageFromPostAction,
} from '@/app/actions/admin';

// Schema for form validation
const draftFormSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	content: z.string().min(1, 'Content is required'),
	excerpt: z.string().optional(),
	metaDescription: z.string().optional(),
	tagsInput: z.string().optional(),
});

type DraftFormValues = z.infer<typeof draftFormSchema>;

interface DraftImage {
	id: string;
	url: string;
	alt: string;
	caption: string;
	credit: string;
	order: number;
}

interface DraftData {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	tags: string[];
	status: string;
	metaDescription: string;
	featuredImageUrl: string | null;
	featuredImageAlt: string | null;
	featuredImageCredit: string | null;
	createdAt: string;
	updatedAt: string;
	images: DraftImage[];
}

interface DraftEditorClientProps {
	draft: DraftData;
}

export function DraftEditorClient({ draft }: DraftEditorClientProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [images, setImages] = useState<DraftImage[]>(draft.images);
	const [isUploading, setIsUploading] = useState(false);
	const [isGeneratingAI, setIsGeneratingAI] = useState(false);
	const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [aiDialogOpen, setAiDialogOpen] = useState(false);
	const [aiPrompt, setAiPrompt] = useState('');
	const [aiSize, setAiSize] = useState<
		'1792x1024' | '1024x1024' | '1024x1792'
	>('1792x1024');
	const [aiQuality, setAiQuality] = useState<'standard' | 'hd'>('standard');
	const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		getValues,
	} = useForm<DraftFormValues>({
		resolver: zodResolver(draftFormSchema),
		defaultValues: {
			title: draft.title,
			content: draft.content,
			excerpt: draft.excerpt,
			metaDescription: draft.metaDescription,
			tagsInput: draft.tags.join(', '),
		},
	});

	// Track changes
	const watchedFields = watch();
	const handleFieldChange = useCallback(() => {
		setIsDirty(true);
	}, []);

	// Save draft
	const onSave = async (data: DraftFormValues) => {
		startTransition(async () => {
			const tags = data.tagsInput
				? data.tagsInput
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean)
				: [];

			const result = await updatePostAction({
				postId: draft.id,
				title: data.title,
				content: data.content,
				excerpt: data.excerpt || undefined,
				metaDescription: data.metaDescription || undefined,
				tags,
			});

			if (result.success) {
				toast.success('Draft saved');
				setIsDirty(false);
			} else {
				toast.error(result.message);
			}
		});
	};

	// Publish draft
	const handlePublish = async () => {
		if (images.length === 0) {
			toast.error('Add at least one image before publishing');
			return;
		}

		startTransition(async () => {
			// Save first if dirty
			if (isDirty) {
				const formData = watchedFields;
				const tags = formData.tagsInput
					? formData.tagsInput
							.split(',')
							.map((t) => t.trim())
							.filter(Boolean)
					: [];

				const saveResult = await updatePostAction({
					postId: draft.id,
					title: formData.title,
					content: formData.content,
					excerpt: formData.excerpt || undefined,
					metaDescription: formData.metaDescription || undefined,
					tags,
				});

				if (!saveResult.success) {
					toast.error('Failed to save before publishing');
					return;
				}
			}

			const result = await publishPostAction({ postId: draft.id });

			if (result.success) {
				toast.success('Post published!');
				router.push('/admin/drafts');
				router.refresh();
			} else {
				toast.error(result.message);
			}
		});
	};

	// Delete draft
	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this draft?')) {
			return;
		}

		startTransition(async () => {
			const result = await deletePostAction({ postId: draft.id });

			if (result.success) {
				toast.success('Draft deleted');
				router.push('/admin/drafts');
				router.refresh();
			} else {
				toast.error(result.message);
			}
		});
	};

	// Handle image upload
	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		if (images.length >= 5) {
			toast.error('Maximum 5 images per post');
			return;
		}

		const file = files[0];

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file');
			return;
		}

		// Note: Size validation happens after compression on server
		// Max 5MB after WebP compression

		setIsUploading(true);

		try {
			// Upload to server
			const formData = new FormData();
			formData.append('file', file);
			formData.append('slug', draft.slug);

			const uploadRes = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			const uploadData = await uploadRes.json();

			if (!uploadRes.ok) {
				throw new Error(uploadData.message || 'Upload failed');
			}

			// Add to post - url is in data.url from the API response
			const result = await addImageToPostAction({
				postId: draft.id,
				url: uploadData.data?.url || uploadData.url,
				alt: file.name.replace(/\.[^/.]+$/, ''),
			});

			if (result.success && result.data) {
				setImages((prev) => [...prev, result.data as DraftImage]);
				toast.success('Image added');
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to upload image'
			);
		} finally {
			setIsUploading(false);
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	// Remove image
	const handleRemoveImage = async (imageId: string) => {
		startTransition(async () => {
			const result = await removeImageFromPostAction({ imageId });

			if (result.success) {
				setImages((prev) => prev.filter((img) => img.id !== imageId));
				toast.success('Image removed');
			} else {
				toast.error(result.message);
			}
		});
	};

	// Generate AI image
	const handleGenerateAIImage = async () => {
		if (!aiPrompt.trim()) {
			toast.error('Please enter a prompt');
			return;
		}

		if (images.length >= 5) {
			toast.error('Maximum 5 images per post');
			return;
		}

		setIsGeneratingAI(true);

		try {
			const response = await fetch('/api/generate-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: aiPrompt,
					size: aiSize,
					quality: aiQuality,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to generate image');
			}

			// Add to post
			const result = await addImageToPostAction({
				postId: draft.id,
				url: data.data.url,
				alt: aiPrompt.slice(0, 100),
			});

			if (result.success && result.data) {
				setImages((prev) => [...prev, result.data as DraftImage]);
				toast.success('AI image generated and added');
				setAiDialogOpen(false);
				setAiPrompt('');
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to generate image'
			);
		} finally {
			setIsGeneratingAI(false);
		}
	};

	// Generate SEO
	const handleGenerateSEO = async () => {
		const currentValues = getValues();

		if (!currentValues.title || !currentValues.content) {
			toast.error('Title and content are required to generate SEO');
			return;
		}

		setIsGeneratingSEO(true);

		try {
			const response = await fetch('/api/generate-seo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: currentValues.title,
					content: currentValues.content,
					currentTags: currentValues.tagsInput
						?.split(',')
						.map((t) => t.trim())
						.filter(Boolean),
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to generate SEO');
			}

			// Update form fields
			if (data.data.metaDescription) {
				setValue('metaDescription', data.data.metaDescription);
			}
			if (data.data.tags && data.data.tags.length > 0) {
				setValue('tagsInput', data.data.tags.join(', '));
			}
			if (data.data.excerpt) {
				setValue('excerpt', data.data.excerpt);
			}
			if (data.data.relatedQueries) {
				setRelatedQueries(data.data.relatedQueries);
			}

			setIsDirty(true);
			toast.success('SEO data generated! Review and save changes.');
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to generate SEO'
			);
		} finally {
			setIsGeneratingSEO(false);
		}
	};

	return (
		<main className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
			{/* Sticky Header */}
			<div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6'>
					<div className='flex items-center gap-3'>
						<Link
							href='/admin/drafts'
							className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
						>
							<svg
								className='h-4 w-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 19l-7-7 7-7'
								/>
							</svg>
							Drafts
						</Link>
						<Badge
							variant={
								draft.status === 'published'
									? 'default'
									: draft.status === 'scheduled'
									? 'secondary'
									: 'outline'
							}
							className='text-xs'
						>
							{draft.status}
						</Badge>
						{isDirty && (
							<span className='text-xs text-amber-600'>
								• Unsaved
							</span>
						)}
					</div>

					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='sm'
							asChild
						>
							<Link
								href={`/posts/${draft.slug}`}
								target='_blank'
								className='flex items-center gap-1'
							>
								<svg
									className='h-4 w-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
									/>
								</svg>
								Preview
							</Link>
						</Button>
						<Button
							variant='ghost'
							size='sm'
							onClick={handleDelete}
							disabled={isPending}
							className='text-destructive hover:text-destructive hover:bg-destructive/10'
						>
							Delete
						</Button>
						<Button
							size='sm'
							onClick={handlePublish}
							disabled={isPending || images.length === 0}
							className='bg-green-600 hover:bg-green-700'
						>
							{isPending ? (
								<Spinner className='mr-2 h-4 w-4' />
							) : null}
							Publish
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='mx-auto max-w-5xl px-4 py-8 md:px-6'>
				{/* Title Section */}
				<div className='mb-8'>
					<h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
						{watchedFields.title || 'Untitled Draft'}
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Last updated{' '}
						{new Date(draft.updatedAt).toLocaleDateString('en-NG', {
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}
					</p>
				</div>

				<div className='grid gap-8 lg:grid-cols-3'>
					{/* Main Editor Column */}
					<div className='lg:col-span-2 space-y-6'>
						<form
							onSubmit={handleSubmit(onSave)}
							className='space-y-6'
						>
							{/* Title */}
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>
									Title
								</Label>
								<Input
									{...register('title', {
										onChange: handleFieldChange,
									})}
									placeholder='Post title'
									className='text-lg font-medium h-12'
								/>
								{errors.title && (
									<p className='text-sm text-destructive'>
										{errors.title.message}
									</p>
								)}
							</div>

							{/* Content */}
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>
									Content
								</Label>
								<Textarea
									{...register('content', {
										onChange: handleFieldChange,
									})}
									placeholder='Write your post content in Markdown...'
									rows={24}
									className='font-mono text-sm resize-none'
								/>
								{errors.content && (
									<p className='text-sm text-destructive'>
										{errors.content.message}
									</p>
								)}
								<p className='text-xs text-muted-foreground'>
									Supports Markdown formatting
								</p>
							</div>

							{/* Excerpt */}
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>
									Excerpt
								</Label>
								<Textarea
									{...register('excerpt', {
										onChange: handleFieldChange,
									})}
									placeholder='Brief summary of the post (used for previews)...'
									rows={3}
								/>
							</div>

							{/* Save Button - Floating */}
							<div className='sticky bottom-4 flex justify-end'>
								<Button
									type='submit'
									disabled={isPending || !isDirty}
									className='shadow-lg'
								>
									{isPending ? (
										<Spinner className='mr-2 h-4 w-4' />
									) : null}
									Save Draft
								</Button>
							</div>
						</form>
					</div>

					{/* Sidebar */}
					<div className='space-y-6'>
						{/* Images Section */}
						<Card className='overflow-hidden pt-0'>
							<CardHeader className='bg-muted/50 py-4'>
								<div className='flex items-center justify-between'>
									<CardTitle className='text-sm font-medium'>
										Images ({images.length}/5)
									</CardTitle>
									{images.length < 5 && (
										<div className='flex gap-1.5'>
											<Dialog
												open={aiDialogOpen}
												onOpenChange={setAiDialogOpen}
											>
												<DialogTrigger asChild>
													<Button
														variant='outline'
														size='sm'
														className='h-8 text-xs'
														disabled={
															isGeneratingAI
														}
													>
														<svg
															className='mr-1.5 h-3.5 w-3.5'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
															/>
														</svg>
														AI
													</Button>
												</DialogTrigger>
												<DialogContent className='sm:max-w-lg'>
													<DialogHeader>
														<DialogTitle>
															Generate Image with
															AI
														</DialogTitle>
														<DialogDescription>
															Describe the image
															you want to create.
															DALL-E 3 will
															generate it.
														</DialogDescription>
													</DialogHeader>
													<div className='space-y-4 pt-4'>
														<div className='space-y-2'>
															<Label>
																Prompt
															</Label>
															<Textarea
																value={aiPrompt}
																onChange={(e) =>
																	setAiPrompt(
																		e.target
																			.value
																	)
																}
																placeholder='A professional photograph of...'
																rows={4}
																className='resize-none'
															/>
															<p className='text-xs text-muted-foreground'>
																Be specific and
																descriptive for
																best results.
															</p>
														</div>
														<div className='grid grid-cols-2 gap-4'>
															<div className='space-y-2'>
																<Label>
																	Size
																</Label>
																<Select
																	value={
																		aiSize
																	}
																	onValueChange={(
																		v
																	) =>
																		setAiSize(
																			v as typeof aiSize
																		)
																	}
																>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value='1792x1024'>
																			Landscape
																			(1792×1024)
																		</SelectItem>
																		<SelectItem value='1024x1024'>
																			Square
																			(1024×1024)
																		</SelectItem>
																		<SelectItem value='1024x1792'>
																			Portrait
																			(1024×1792)
																		</SelectItem>
																	</SelectContent>
																</Select>
															</div>
															<div className='space-y-2'>
																<Label>
																	Quality
																</Label>
																<Select
																	value={
																		aiQuality
																	}
																	onValueChange={(
																		v
																	) =>
																		setAiQuality(
																			v as typeof aiQuality
																		)
																	}
																>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value='standard'>
																			Standard
																		</SelectItem>
																		<SelectItem value='hd'>
																			HD
																			(Slower)
																		</SelectItem>
																	</SelectContent>
																</Select>
															</div>
														</div>
														<Button
															onClick={
																handleGenerateAIImage
															}
															disabled={
																isGeneratingAI ||
																!aiPrompt.trim()
															}
															className='w-full'
														>
															{isGeneratingAI ? (
																<>
																	<Spinner className='mr-2 h-4 w-4' />
																	Generating...
																</>
															) : (
																'Generate Image'
															)}
														</Button>
													</div>
												</DialogContent>
											</Dialog>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													fileInputRef.current?.click()
												}
												disabled={isUploading}
												className='h-8 text-xs'
											>
												{isUploading ? (
													<>
														<Spinner className='mr-2 h-3 w-3' />
														Uploading
													</>
												) : (
													<>
														<svg
															className='mr-1.5 h-3.5 w-3.5'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
															/>
														</svg>
														Upload
													</>
												)}
											</Button>
										</div>
									)}
								</div>
							</CardHeader>
							<CardContent className='p-4'>
								<input
									title='upload image'
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleImageUpload}
									className='hidden'
								/>
								{images.length === 0 ? (
									<div className='space-y-3'>
										<div
											className='rounded-lg border-2 border-dashed p-6 text-center cursor-pointer hover:border-primary/50 transition-colors'
											onClick={() =>
												fileInputRef.current?.click()
											}
										>
											<div className='mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3'>
												<svg
													className='w-5 h-5 text-muted-foreground'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
													/>
												</svg>
											</div>
											<p className='text-sm text-muted-foreground'>
												Click to upload
											</p>
											<p className='text-xs text-muted-foreground mt-1'>
												Required before publishing
											</p>
										</div>
										<div className='flex items-center gap-2 text-xs text-muted-foreground'>
											<span className='h-px flex-1 bg-border'></span>
											<span>or</span>
											<span className='h-px flex-1 bg-border'></span>
										</div>
										<Button
											variant='outline'
											size='sm'
											className='w-full'
											onClick={() =>
												setAiDialogOpen(true)
											}
										>
											<svg
												className='mr-2 h-4 w-4'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
												/>
											</svg>
											Generate with AI
										</Button>
									</div>
								) : (
									<div className='grid grid-cols-2 gap-2'>
										{images.map((img, index) => (
											<div
												key={img.id}
												className='group relative aspect-video overflow-hidden rounded-lg border bg-muted'
											>
												<Image
													src={img.url}
													alt={img.alt}
													fill
													className='object-cover'
												/>
												{index === 0 && (
													<Badge
														className='absolute left-1.5 top-1.5 text-[10px] px-1.5 py-0'
														variant='default'
													>
														Featured
													</Badge>
												)}
												<Button
													variant='destructive'
													size='sm'
													className='absolute right-1.5 top-1.5 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'
													onClick={() =>
														handleRemoveImage(
															img.id
														)
													}
													disabled={isPending}
												>
													<svg
														className='h-3 w-3'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M6 18L18 6M6 6l12 12'
														/>
													</svg>
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Tags */}
						<Card className='overflow-hidden pt-0'>
							<CardHeader className='bg-muted/50 py-4'>
								<CardTitle className='text-sm font-medium'>
									Tags
								</CardTitle>
							</CardHeader>
							<CardContent className='p-4'>
								<Input
									{...register('tagsInput', {
										onChange: handleFieldChange,
									})}
									placeholder='technology, africa, innovation'
									className='text-sm'
								/>
								<p className='mt-2 text-xs text-muted-foreground'>
									Separate tags with commas
								</p>
							</CardContent>
						</Card>

						{/* SEO */}
						<Card className='overflow-hidden pt-0'>
							<CardHeader className='bg-muted/50 py-4'>
								<div className='flex items-center justify-between'>
									<CardTitle className='text-sm font-medium'>
										SEO
									</CardTitle>
									<Button
										variant='outline'
										size='sm'
										onClick={handleGenerateSEO}
										disabled={isGeneratingSEO}
										className='h-8 text-xs'
									>
										{isGeneratingSEO ? (
											<>
												<Spinner className='mr-1.5 h-3 w-3' />
												Generating...
											</>
										) : (
											<>
												<svg
													className='mr-1.5 h-3.5 w-3.5'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
													/>
												</svg>
												Generate
											</>
										)}
									</Button>
								</div>
							</CardHeader>
							<CardContent className='p-4 space-y-4'>
								<div className='space-y-2'>
									<Label className='text-xs text-muted-foreground'>
										Slug
									</Label>
									<Input
										value={draft.slug}
										disabled
										className='bg-muted text-xs h-8'
									/>
								</div>
								<div className='space-y-2'>
									<Label className='text-xs text-muted-foreground'>
										Meta Description
									</Label>
									<Textarea
										{...register('metaDescription', {
											onChange: handleFieldChange,
										})}
										placeholder='SEO description (150-160 chars)'
										rows={3}
										className='text-sm resize-none'
									/>
									<p className='text-xs text-muted-foreground'>
										{watchedFields.metaDescription
											?.length || 0}
										/160 characters
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Related Queries */}
						{relatedQueries.length > 0 && (
							<Card className='overflow-hidden pt-0'>
								<CardHeader className='bg-muted/50 py-4'>
									<CardTitle className='text-sm font-medium'>
										Related Queries
									</CardTitle>
								</CardHeader>
								<CardContent className='p-4'>
									<div className='flex flex-wrap gap-1.5'>
										{relatedQueries.map((query) => (
											<Badge
												key={query}
												variant='outline'
												className='text-xs'
											>
												{query}
											</Badge>
										))}
									</div>
									<p className='mt-2 text-xs text-muted-foreground'>
										Consider incorporating these into your
										content
									</p>
								</CardContent>
							</Card>
						)}

						{/* Metadata */}
						<Card className='overflow-hidden pt-0'>
							<CardHeader className='bg-muted/50 py-4'>
								<CardTitle className='text-sm font-medium'>
									Info
								</CardTitle>
							</CardHeader>
							<CardContent className='p-4 text-xs text-muted-foreground space-y-1'>
								<p>
									Created:{' '}
									{new Date(
										draft.createdAt
									).toLocaleDateString('en-NG', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</p>
								<p>
									Updated:{' '}
									{new Date(
										draft.updatedAt
									).toLocaleDateString('en-NG', {
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
