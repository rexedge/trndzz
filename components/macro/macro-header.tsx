import Link from 'next/link';
import {
	ArrowUpRight,
	Building2,
	Layers,
	Search,
	ShieldCheck,
} from 'lucide-react';
import { UserRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/macro/theme-toggle';
import { getCurrentUser } from '@/lib/auth/guards';
import { buildVerticalUrl } from '@/lib/tenancy/host';

export async function MacroHeader() {
	const user = await getCurrentUser();
	const isStaff =
		user &&
		(user.role === UserRole.SUPER_ADMIN ||
			user.role === UserRole.EDITOR ||
			user.role === UserRole.ANALYST);

	return (
		<header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur'>
			<div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center gap-8'>
					<Link href='/' className='flex items-center gap-2.5'>
						<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							<Building2 className='h-5 w-5' />
						</div>
						<div className='leading-none'>
							<span className='block text-lg font-extrabold tracking-tight'>
								TRNDZZ
							</span>
							<span className='font-tabular block text-[10px] uppercase tracking-widest text-muted-foreground'>
								B2B Trade Infrastructure
							</span>
						</div>
					</Link>

					<nav className='hidden lg:flex items-center gap-5 text-sm font-medium text-muted-foreground'>
						<Link
							href='/verticals'
							className='hover:text-foreground transition-colors'
						>
							Verticals
						</Link>
						<Link
							href='/news'
							className='hover:text-foreground transition-colors'
						>
							Macro Pulse
						</Link>
						<Link
							href='/learn'
							className='hover:text-foreground transition-colors'
						>
							Trndzz Learn
						</Link>
						<a
							href={buildVerticalUrl('aluminium', '/')}
							className='inline-flex items-center gap-1 text-primary hover:opacity-85 transition-opacity font-semibold'
						>
							<Layers className='h-3.5 w-3.5' />
							Aluminium
							<ArrowUpRight className='h-3 w-3' />
						</a>
						<a
							href={buildVerticalUrl('steel', '/')}
							className='inline-flex items-center gap-0.5 hover:text-foreground transition-colors'
						>
							Steel
							<ArrowUpRight className='h-3 w-3' />
						</a>
						<a
							href={buildVerticalUrl('solar', '/')}
							className='inline-flex items-center gap-0.5 hover:text-foreground transition-colors'
						>
							Solar
							<ArrowUpRight className='h-3 w-3' />
						</a>
						<Link
							href='/advertise'
							className='hover:text-foreground transition-colors'
						>
							Sponsor
						</Link>
					</nav>
				</div>

				<div className='flex items-center gap-2'>
					<Button
						asChild
						variant='ghost'
						size='icon'
						aria-label='Search Ecosystem'
					>
						<Link href='/search'>
							<Search className='h-4 w-4' />
						</Link>
					</Button>
					<ThemeToggle />
					{user ? (
						<>
							{isStaff && (
								<Button
									asChild
									variant='outline'
									size='sm'
									className='hidden sm:inline-flex'
								>
									<Link href='/admin'>Admin Console</Link>
								</Button>
							)}
							<Button asChild size='sm'>
								<Link href='/dashboard'>Workspace</Link>
							</Button>
						</>
					) : (
						<>
							<Button asChild variant='ghost' size='sm'>
								<Link href='/auth/login'>Sign In</Link>
							</Button>
							<Button asChild size='sm' className='gap-1.5'>
								<Link href='/auth/register'>
									<ShieldCheck className='h-4 w-4' />
									Join / Claim Profile
								</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
