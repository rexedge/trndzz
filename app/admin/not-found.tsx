import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
	return (
		<div className='rounded-xl border border-border bg-card p-8 text-center'>
			<h1 className='text-xl font-bold'>Admin module not found</h1>
			<Button
				asChild
				className='mt-5'
			>
				<Link href='/admin'>Back to Command Center</Link>
			</Button>
		</div>
	);
}
