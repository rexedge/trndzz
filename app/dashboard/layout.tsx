import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/macro/theme-toggle';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { requireServerUser } from '@/lib/auth/guards';

const WORKSPACE_LINKS = [
	{ href: '/dashboard', label: 'Overview' },
	{ href: '/dashboard/rfqs', label: 'Buyer RFQs & Matrix' },
	{ href: '/dashboard/quotes', label: 'Supplier Matches' },
	{ href: '/dashboard/company', label: 'Company & Catalog' },
	{ href: '/dashboard/claims', label: 'Claims' },
];

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await requireServerUser('/dashboard');
	const isStaff =
		user.role === UserRole.SUPER_ADMIN ||
		user.role === UserRole.EDITOR ||
		user.role === UserRole.ANALYST;

	return (
		<div className='flex min-h-screen flex-col bg-background'>
			<header className='border-b border-border bg-card'>
				<div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center gap-6'>
						<Link
							href='/dashboard'
							className='flex items-center gap-2'
						>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
								<Building2 className='h-4 w-4' />
							</div>
							<span className='text-base font-extrabold tracking-tight'>
								TRNDZZ WORKSPACE
							</span>
						</Link>
						<nav className='hidden lg:flex items-center gap-4 text-sm font-medium text-muted-foreground'>
							{WORKSPACE_LINKS.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className='hover:text-foreground transition-colors'
								>
									{item.label}
								</Link>
							))}
							{isStaff && (
								<Link
									href='/admin'
									className='font-semibold text-primary hover:underline'
								>
									Admin Console
								</Link>
							)}
						</nav>
					</div>

					<div className='flex items-center gap-2.5'>
						<span className='hidden xl:inline text-xs text-muted-foreground'>
							{user.email}
						</span>
						<ThemeToggle />
						<Button asChild variant='ghost' size='sm'>
							<Link href='/'>Macro Hub</Link>
						</Button>
						<SignOutButton />
					</div>
				</div>

				{/* Mobile Subnav */}
				<div className='flex gap-3 overflow-x-auto border-t border-border px-4 py-2 text-xs lg:hidden'>
					{WORKSPACE_LINKS.map((item) => (
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
