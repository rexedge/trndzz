import Link from 'next/link';

interface HeroSectionProps {
	totalStories: number;
}

export function HeroSection({ totalStories }: HeroSectionProps) {
	return (
		<header className='relative overflow-hidden border-b border-border/50'>
			{/* Background gradient */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10' />
			<div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent' />

			<div className='relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24'>
				<div className='max-w-3xl space-y-6'>
					{/* Logo / Brand */}
					<Link
						href='/'
						className='inline-flex items-center gap-3 group'
					>
						<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background font-bold text-lg transition-transform group-hover:scale-105'>
							TP
						</div>
						<span className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
							Trend Pulse
						</span>
					</Link>

					{/* Tagline */}
					<h1 className='text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
						Stories that{' '}
						<span className='bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent'>
							matter
						</span>
					</h1>

					<p className='text-lg text-muted-foreground sm:text-xl max-w-2xl'>
						Fresh perspectives on trending topics. Thoughtful
						analysis, clear writing, and insights you can use.
					</p>

					{/* Stats */}
					<div className='flex items-center gap-6 pt-4'>
						<div className='space-y-1'>
							<p className='text-2xl font-bold'>{totalStories}</p>
							<p className='text-xs text-muted-foreground uppercase tracking-wide'>
								Stories
							</p>
						</div>
						<div className='h-8 w-px bg-border' />
						<div className='space-y-1'>
							<p className='text-2xl font-bold'>Daily</p>
							<p className='text-xs text-muted-foreground uppercase tracking-wide'>
								Updates
							</p>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
