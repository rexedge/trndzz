import { MacroHeader } from '@/components/macro/macro-header';
import { MacroFooter } from '@/components/macro/macro-footer';

export default function MacroLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex min-h-screen flex-col'>
			<MacroHeader />
			<main className='flex-1'>{children}</main>
			<MacroFooter />
		</div>
	);
}

