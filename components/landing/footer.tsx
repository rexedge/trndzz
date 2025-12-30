import Link from 'next/link';

export function Footer() {
	return (
		<footer className='border-t border-border mt-16 bg-muted/30'>
			<div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
				<div className='flex flex-col items-center gap-6 sm:flex-row sm:justify-between'>
					{/* Brand */}
					<Link
						href='/'
						className='flex items-center gap-3 group'
					>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm transition-transform group-hover:scale-105'>
							TP
						</div>
						<span className='text-sm font-medium'>Trend Pulse</span>
					</Link>

					{/* Links */}
					<div className='flex items-center gap-6 text-sm text-muted-foreground'>
						<Link
							href='/posts'
							className='hover:text-foreground transition-colors'
						>
							All Stories
						</Link>
						<Link
							href='/admin'
							className='hover:text-foreground transition-colors'
						>
							Admin
						</Link>
					</div>

					{/* Copyright */}
					<p className='text-sm text-muted-foreground'>
						© {new Date().getFullYear()} Trend Pulse
					</p>
				</div>
			</div>
		</footer>
	);
}
