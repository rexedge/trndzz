import Link from 'next/link';
import {
	ArrowLeft,
	FileSpreadsheet,
	Layers,
	Search,
} from 'lucide-react';
import type { ValueChainStage } from '@prisma/client';
import { RfqCartDrawer } from '@/components/biz/rfq-cart-drawer';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/macro/theme-toggle';
import { getCurrentUser } from '@/lib/auth/guards';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';

interface VerticalHeaderProps {
	verticalName: string;
	verticalSlug: string;
	stages: Pick<ValueChainStage, 'id' | 'name' | 'slug' | 'streamPosition'>[];
}

export async function VerticalHeader({
	verticalName,
	verticalSlug,
	stages,
}: VerticalHeaderProps) {
	const user = await getCurrentUser();

	return (
		<header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur'>
			{/* Ecosystem Cross-Subdomain Bar */}
			<div className='border-b border-border bg-muted/50'>
				<div className='mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8'>
					<a
						href={buildMacroUrl('/')}
						className='inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors'
					>
						<ArrowLeft className='h-3.5 w-3.5' />
						<span>TRNDZZ Macro Hub</span>
					</a>

					<div className='hidden md:flex items-center gap-4 text-[11px] font-tabular text-muted-foreground'>
						{(['aluminium', 'steel', 'solar'] as const).map((slug) => (
							<a
								key={slug}
								href={buildVerticalUrl(slug, '/')}
								className={
									slug === verticalSlug
										? 'font-bold text-foreground'
										: 'hover:text-foreground transition-colors'
								}
							>
								{slug}.trndzz.com
							</a>
						))}
					</div>
				</div>
			</div>

			{/* Main Vertical Masthead */}
			<div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center gap-6'>
					<Link href='/' className='flex items-center gap-2.5'>
						<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-vertical text-white'>
							<Layers className='h-5 w-5' />
						</div>
						<div className='leading-none'>
							<span className='block text-lg font-extrabold tracking-tight uppercase'>
								TRNDZZ{' '}
								<span className='text-vertical'>
									{verticalName}
								</span>
							</span>
							<span className='font-tabular block text-[10px] uppercase tracking-widest text-muted-foreground'>
								Value-Chain & Procurement Hub
							</span>
						</div>
					</Link>

					<nav className='hidden xl:flex items-center gap-4 text-sm font-medium text-muted-foreground'>
						<Link
							href='/'
							className='hover:text-foreground transition-colors'
						>
							Overview
						</Link>
						<Link
							href='/pulse'
							className='hover:text-foreground transition-colors'
						>
							Pulse
						</Link>
						<Link
							href='/prices'
							className='hover:text-foreground transition-colors'
						>
							Prices
						</Link>
						<Link
							href='/directory'
							className='hover:text-foreground transition-colors'
						>
							Directory
						</Link>
						<Link
							href='/products'
							className='hover:text-foreground transition-colors'
						>
							Products
						</Link>
						<Link
							href='/rfq'
							className='hover:text-foreground transition-colors'
						>
							Live RFQs
						</Link>
						<Link
							href='/learn'
							className='hover:text-foreground transition-colors'
						>
							Learn
						</Link>
					</nav>
				</div>

				<div className='flex items-center gap-2'>
					<Button
						asChild
						variant='ghost'
						size='icon'
						aria-label={`Search ${verticalName} Portal`}
					>
						<Link href='/search'>
							<Search className='h-4 w-4' />
						</Link>
					</Button>

					<RfqCartDrawer
						verticalSlug={verticalSlug}
						verticalName={verticalName}
					/>

					<ThemeToggle />

					{user ? (
						<Button
							asChild
							variant='outline'
							size='sm'
							className='hidden sm:inline-flex'
						>
							<a href={buildMacroUrl('/dashboard')}>Workspace</a>
						</Button>
					) : (
						<Button
							asChild
							variant='ghost'
							size='sm'
							className='hidden sm:inline-flex'
						>
							<a href={buildMacroUrl('/auth/login')}>Sign In</a>
						</Button>
					)}

					<Button
						asChild
						size='sm'
						className='bg-amber text-white hover:opacity-90 gap-1.5'
					>
						<Link href='/rfq/new'>
							<FileSpreadsheet className='h-4 w-4' />
							<span className='hidden sm:inline'>
								Broadcast RFQ
							</span>
							<span className='sm:hidden'>RFQ</span>
						</Link>
					</Button>
				</div>
			</div>

			{/* Value-Chain Stage Strip */}
			{stages.length > 0 && (
				<div className='border-t border-border bg-card/60'>
					<div className='mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 scrollbar-hide'>
						<span className='font-tabular shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground mr-1'>
							Value Chain:
						</span>
						{stages.map((stage) => (
							<Link
								key={stage.id}
								href={`/pulse/stage/${stage.slug}`}
								className='shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-vertical hover:text-foreground transition-colors'
							>
								{stage.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</header>
	);
}
