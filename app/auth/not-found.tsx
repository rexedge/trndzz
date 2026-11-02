import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthNotFound() {
	return (
		<div className='w-full max-w-md rounded-xl border border-border bg-card p-8 text-center'>
			<h1 className='text-xl font-bold'>Auth route not found</h1>
			<Button
				asChild
				className='mt-5'
			>
				<Link href='/auth/login'>Go to Sign In</Link>
			</Button>
		</div>
	);
}

