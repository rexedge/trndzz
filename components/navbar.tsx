import Link from 'next/link';
import { PushNotificationButton } from './push-notification-button';

interface NavbarProps {
	totalStories?: number;
}

export function Navbar({ totalStories }: NavbarProps) {
	return (
		<header className='border-b border-border bg-background sticky top-0 z-50'>
			{/* Top Bar */}
			<div className='border-b border-border/50'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-14 items-center justify-between'>
						{/* Logo / Brand */}
						<Link
							href='/'
							className='inline-flex items-center gap-3 group'
						>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm transition-transform group-hover:scale-105'>
								TP
							</div>
							<span className='text-xl font-bold tracking-tight'>
								Trend Pulse
							</span>
						</Link>

						{/* Push Notification */}
						<PushNotificationButton />
					</div>
				</div>
			</div>

			{/* Navigation Bar */}
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<nav className='flex h-12 items-center gap-6 text-sm font-medium overflow-x-auto'>
					<Link
						href='/'
						className='text-foreground hover:text-foreground/80 transition-colors whitespace-nowrap'
					>
						Home
					</Link>
					<Link
						href='/topics'
						className='text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap'
					>
						Topics
					</Link>
					<Link
						href='/tags'
						className='text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap'
					>
						Tags
					</Link>
					<Link
						href='/posts'
						className='text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap'
					>
						All Stories
					</Link>
					{totalStories && (
						<div className='ml-auto flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap'>
							<span className='font-semibold'>
								{totalStories}
							</span>
							<span>stories</span>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
}
