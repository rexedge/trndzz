import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { getTokenFromCookies, verifySessionToken } from '@/lib/auth/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	ArrowLeft,
	Calendar,
	Clock,
	FileText,
	ImageIcon,
	Tag,
} from 'lucide-react';

export default async function DraftsPage() {
	const token = await getTokenFromCookies();
	const isAdmin = await verifySessionToken(token);

	if (!isAdmin) {
		redirect('/admin');
	}

	const drafts = await prisma.post.findMany({
		where: { status: { in: ['draft', 'scheduled'] } },
		orderBy: { createdAt: 'desc' },
		include: {
			images: {
				orderBy: { order: 'asc' },
				take: 1,
			},
		},
	});

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-NG', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('en-NG', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<main className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
			{/* Sticky Header */}
			<header className='sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg'>
				<div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
					<div className='flex items-center gap-4'>
						<Button
							variant='ghost'
							size='icon'
							asChild
							className='h-9 w-9'
						>
							<Link href='/admin'>
								<ArrowLeft className='h-4 w-4' />
							</Link>
						</Button>
						<div>
							<h1 className='text-xl font-semibold tracking-tight'>
								Drafts
							</h1>
							<p className='text-xs text-muted-foreground'>
								{drafts.length} post
								{drafts.length !== 1 ? 's' : ''} pending review
							</p>
						</div>
					</div>
				</div>
			</header>

			<div className='mx-auto max-w-6xl px-6 py-8'>
				{drafts.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-24 text-center'>
						<div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-muted'>
							<FileText className='h-8 w-8 text-muted-foreground' />
						</div>
						<h2 className='mt-6 text-lg font-medium'>
							No drafts yet
						</h2>
						<p className='mt-2 max-w-sm text-sm text-muted-foreground'>
							Upload a CSV file in the dashboard to generate your
							first post draft.
						</p>
						<Button
							asChild
							className='mt-6'
						>
							<Link href='/admin'>Go to Dashboard</Link>
						</Button>
					</div>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{drafts.map((draft) => (
							<Link
								key={draft.id}
								href={`/admin/drafts/${draft.id}`}
								className='group'
							>
								<article className='relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'>
									{/* Thumbnail */}
									<div className='relative aspect-[16/9] w-full overflow-hidden bg-muted'>
										{draft.images[0]?.url ? (
											<Image
												src={draft.images[0].url}
												alt={draft.title}
												fill
												className='object-cover transition-transform duration-300 group-hover:scale-105'
											/>
										) : (
											<div className='flex h-full items-center justify-center'>
												<ImageIcon className='h-10 w-10 text-muted-foreground/40' />
											</div>
										)}
										{/* Status badge overlay */}
										<div className='absolute right-3 top-3'>
											<Badge
												variant={
													draft.status === 'scheduled'
														? 'default'
														: 'secondary'
												}
												className='text-xs font-medium shadow-sm'
											>
												{draft.status === 'scheduled'
													? 'Scheduled'
													: 'Draft'}
											</Badge>
										</div>
									</div>

									{/* Content */}
									<div className='flex flex-1 flex-col p-4'>
										<h3 className='line-clamp-2 font-medium leading-snug tracking-tight group-hover:text-primary'>
											{draft.title}
										</h3>

										{draft.excerpt && (
											<p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
												{draft.excerpt}
											</p>
										)}

										{/* Tags */}
										{draft.tags.length > 0 && (
											<div className='mt-3 flex flex-wrap gap-1'>
												{draft.tags
													.slice(0, 3)
													.map((tag) => (
														<span
															key={tag}
															className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'
														>
															<Tag className='mr-1 h-2.5 w-2.5' />
															{tag}
														</span>
													))}
												{draft.tags.length > 3 && (
													<span className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
														+{draft.tags.length - 3}
													</span>
												)}
											</div>
										)}

										{/* Footer */}
										<div className='mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground'>
											<div className='flex items-center gap-3'>
												<span className='flex items-center gap-1'>
													<Calendar className='h-3 w-3' />
													{formatDate(
														draft.createdAt
													)}
												</span>
												<span className='flex items-center gap-1'>
													<Clock className='h-3 w-3' />
													{formatTime(
														draft.createdAt
													)}
												</span>
											</div>
											{draft.images.length > 0 && (
												<span className='flex items-center gap-1'>
													<ImageIcon className='h-3 w-3' />
													{draft.images.length}
												</span>
											)}
										</div>
									</div>
								</article>
							</Link>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
