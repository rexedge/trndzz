import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { ThemeToggle } from '@/components/macro/theme-toggle';

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex min-h-screen flex-col bg-background'>
			<header className='border-b border-border bg-card'>
				<div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
					<Link
						href='/'
						className='flex items-center gap-2.5'
					>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							<Building2 className='h-4 w-4' />
						</div>
						<span className='text-base font-extrabold tracking-tight'>
							TRNDZZ
						</span>
					</Link>
					<ThemeToggle />
				</div>
			</header>
			<main className='flex flex-1 items-center justify-center px-4 py-12'>
				{children}
			</main>
		</div>
	);
}

