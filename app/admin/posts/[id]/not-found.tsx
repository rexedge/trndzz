import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PostEditNotFound() {
	return (
		<main className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
			<div className='flex min-h-[50vh] flex-col items-center justify-center px-4 text-center'>
				<div className='rounded-full bg-muted p-4'>
					<svg
						className='h-8 w-8 text-muted-foreground'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
						/>
					</svg>
				</div>
				<h1 className='mt-4 text-xl font-semibold'>Post not found</h1>
				<p className='mt-2 text-sm text-muted-foreground'>
					The post you&apos;re looking for doesn&apos;t exist or has
					been deleted.
				</p>
				<div className='mt-6'>
					<Button asChild>
						<Link href='/admin/posts'>Back to Posts</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
