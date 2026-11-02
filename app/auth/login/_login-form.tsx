'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signInAction } from '@/app/actions/auth.actions';
import {
	loginSchema,
	type LoginInput,
} from '@/lib/validators/auth.validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ nextPath }: { nextPath?: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = (values: LoginInput) => {
		startTransition(async () => {
			const res = await signInAction(values);
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.push(nextPath || res.data?.redirectTo || '/dashboard');
			router.refresh();
		});
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='space-y-4'
			noValidate
		>
			<div className='space-y-1.5'>
				<Label htmlFor='email'>Work Email</Label>
				<Input
					id='email'
					type='email'
					autoComplete='email'
					placeholder='procurement@company.ng'
					aria-invalid={Boolean(errors.email)}
					{...register('email')}
				/>
				{errors.email && (
					<p className='text-xs text-destructive'>
						{errors.email.message}
					</p>
				)}
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='password'>Password</Label>
				<Input
					id='password'
					type='password'
					autoComplete='current-password'
					placeholder='••••••••'
					aria-invalid={Boolean(errors.password)}
					{...register('password')}
				/>
				{errors.password && (
					<p className='text-xs text-destructive'>
						{errors.password.message}
					</p>
				)}
			</div>

			<Button
				type='submit'
				disabled={isPending}
				className='w-full'
			>
				{isPending ? 'Signing in...' : 'Sign In to Workspace'}
			</Button>

			<p className='pt-2 text-center text-xs text-muted-foreground'>
				New buyer or supplier?{' '}
				<Link
					href='/auth/register'
					className='font-semibold text-primary hover:underline'
				>
					Create a B2B account
				</Link>
			</p>
		</form>
	);
}

