import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
	basePath?: string;
}

export function Pagination({
	currentPage,
	totalPages,
	hasNext,
	hasPrev,
	basePath = '/',
}: PaginationProps) {
	if (!hasNext && !hasPrev) return null;

	return (
		<nav className='flex items-center justify-center gap-4 pt-8'>
			<Button
				variant='outline'
				size='lg'
				asChild
				disabled={!hasPrev}
				className={!hasPrev ? 'opacity-50 pointer-events-none' : ''}
			>
				<Link href={`${basePath}?page=${currentPage - 1}`}>
					<svg
						className='h-4 w-4 mr-2'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M15 19l-7-7 7-7'
						/>
					</svg>
					Previous
				</Link>
			</Button>

			<span className='text-sm text-muted-foreground px-4'>
				Page {currentPage} of {totalPages}
			</span>

			<Button
				variant='outline'
				size='lg'
				asChild
				disabled={!hasNext}
				className={!hasNext ? 'opacity-50 pointer-events-none' : ''}
			>
				<Link href={`${basePath}?page=${currentPage + 1}`}>
					Next
					<svg
						className='h-4 w-4 ml-2'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 5l7 7-7 7'
						/>
					</svg>
				</Link>
			</Button>
		</nav>
	);
}
