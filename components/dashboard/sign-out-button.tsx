'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { signOutAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleSignOut = () => {
		startTransition(async () => {
			const res = await signOutAction();
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.push('/');
			router.refresh();
		});
	};

	return (
		<Button
			type='button'
			variant='outline'
			size='sm'
			disabled={isPending}
			onClick={handleSignOut}
			className='gap-1.5'
		>
			<LogOut className='h-3.5 w-3.5' />
			{isPending ? 'Signing out...' : 'Sign Out'}
		</Button>
	);
}

