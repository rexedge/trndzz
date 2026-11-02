'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signUpAction } from '@/app/actions/auth.actions';
import {
	registerSchema,
	type RegisterInput,
} from '@/lib/validators/auth.validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm({ claimSlug }: { claimSlug?: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			companyName: '',
			jobTitle: '',
			phone: '',
		},
	});

	const onSubmit = (values: RegisterInput) => {
		startTransition(async () => {
			const res = await signUpAction(values);
			if (!res.success) {
				toast.error(res.message);
				return;
			}
			toast.success(res.message);
			router.push(
				claimSlug
					? `/dashboard?claim=${encodeURIComponent(claimSlug)}`
					: res.data?.redirectTo || '/dashboard'
			);
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
				<Label htmlFor='name'>Full Name</Label>
				<Input
					id='name'
					placeholder='Engr. Chidi Okafor'
					aria-invalid={Boolean(errors.name)}
					{...register('name')}
				/>
				{errors.name && (
					<p className='text-xs text-destructive'>
						{errors.name.message}
					</p>
				)}
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='email'>Work Email</Label>
				<Input
					id='email'
					type='email'
					autoComplete='email'
					placeholder='chidi@company.ng'
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
				<Label htmlFor='companyName'>Company / Organization</Label>
				<Input
					id='companyName'
					placeholder='Apex Industrial Fabricators Ltd'
					aria-invalid={Boolean(errors.companyName)}
					{...register('companyName')}
				/>
				{errors.companyName && (
					<p className='text-xs text-destructive'>
						{errors.companyName.message}
					</p>
				)}
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-1.5'>
					<Label htmlFor='jobTitle'>Role / Title</Label>
					<Input
						id='jobTitle'
						placeholder='Procurement Lead'
						{...register('jobTitle')}
					/>
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='phone'>Phone / WhatsApp</Label>
					<Input
						id='phone'
						type='tel'
						placeholder='+234 803 000 0000'
						{...register('phone')}
					/>
				</div>
			</div>

			<div className='space-y-1.5'>
				<Label htmlFor='password'>Password (min 8 chars)</Label>
				<Input
					id='password'
					type='password'
					autoComplete='new-password'
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
				{isPending
					? 'Creating Workspace...'
					: claimSlug
						? 'Create Account & Continue Claim'
						: 'Create B2B Account'}
			</Button>

			<p className='pt-2 text-center text-xs text-muted-foreground'>
				Already registered?{' '}
				<Link
					href='/auth/login'
					className='font-semibold text-primary hover:underline'
				>
					Sign in here
				</Link>
			</p>
		</form>
	);
}

