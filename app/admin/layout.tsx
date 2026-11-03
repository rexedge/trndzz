import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/macro/theme-toggle';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { requirePlatformStaff } from '@/lib/auth/guards';

const ADMIN_LINKS = [
	{ href: '/admin', label: 'Overview' },
	{ href: '/admin/verticals', label: 'Verticals' },
	{ href: '/admin/pulse', label: 'Pulse CMS' },
	{ href: '/admin/prices', label: 'Price Desk' },
	{ href: '/admin/directory', label: 'Directory Seeder' },
	{ href: '/admin/claims', label: 'Claim Queue' },
	{ href: '/admin/rfqs', label: 'RFQ Monitor' },
	{ href: '/admin/learn', label: 'Learn & Leads' },
	{ href: '/admin/notifications', label: 'Alert Outbox' },
];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const staff = await requirePlatformStaff();

	return (
		<div className='flex min-h-screen flex-col bg-background'>
			<header className='border-b border-border bg-card'>
				<div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center gap-6'>
						<Link
							href='/admin'
							className='flex items-center gap-2'
						>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
								<Shield className='h-4 w-4' />
							</div>
							<span className='text-base font-extrabold tracking-tight'>
								TRNDZZ ADMIN
							</span>
						</Link>
						<Badge variant='secondary'>{staff.role}</Badge>

						<nav className='hidden xl:flex items-center gap-4 text-sm font-medium text-muted-foreground'>
							{ADMIN_LINKS.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className='hover:text-foreground transition-colors'
								>
									{item.label}
								</Link>
							))}
						</nav>
					</div>

					<div className='flex items-center gap-2.5'>
						<ThemeToggle />
						<Button asChild variant='outline' size='sm'>
							<Link href='/dashboard'>Workspace</Link>
						</Button>
						<Button asChild variant='ghost' size='sm'>
							<Link href='/'>Macro Hub</Link>
						</Button>
						<SignOutButton />
					</div>
				</div>

				<div className='flex gap-2.5 overflow-x-auto border-t border-border px-4 py-2 text-xs xl:hidden'>
					{ADMIN_LINKS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className='shrink-0 rounded-md bg-muted/60 px-2.5 py-1 font-medium text-muted-foreground hover:text-foreground'
						>
							{item.label}
						</Link>
					))}
				</div>
			</header>

			<main className='mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8'>
				{children}
			</main>
		</div>
	);
}
