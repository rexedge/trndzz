'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import {
	loginSchema,
	registerSchema,
	type LoginInput,
	type RegisterInput,
} from '@/lib/validators/auth.validator';
import type { ActionResponse } from '@/types/actions';

function flattenFieldErrors(
	issues: { path: PropertyKey[]; message: string }[]
): Record<string, string[]> {
	const map: Record<string, string[]> = {};
	for (const issue of issues) {
		const key = String(issue.path[0] ?? 'form');
		if (!map[key]) map[key] = [];
		map[key].push(issue.message);
	}
	return map;
}

export async function signInAction(
	rawInput: LoginInput
): Promise<ActionResponse<{ redirectTo: string }>> {
	try {
		const parsed = loginSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Please review your sign-in details.',
				errors: flattenFieldErrors(parsed.error.issues),
			};
		}

		await auth.api.signInEmail({
			body: {
				email: parsed.data.email,
				password: parsed.data.password,
			},
			headers: await headers(),
		});

		return {
			success: true,
			message: 'Signed in successfully.',
			data: { redirectTo: '/dashboard' },
		};
	} catch (error) {
		const message =
			error instanceof Error && error.message
				? error.message
				: 'Invalid email or password.';
		return {
			success: false,
			message,
		};
	}
}

export async function signUpAction(
	rawInput: RegisterInput
): Promise<ActionResponse<{ redirectTo: string }>> {
	try {
		const parsed = registerSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message: 'Please correct the highlighted registration fields.',
				errors: flattenFieldErrors(parsed.error.issues),
			};
		}

		await auth.api.signUpEmail({
			body: {
				name: parsed.data.name,
				email: parsed.data.email,
				password: parsed.data.password,
				companyName: parsed.data.companyName,
				jobTitle: parsed.data.jobTitle || undefined,
				phone: parsed.data.phone || undefined,
			},
			headers: await headers(),
		});

		return {
			success: true,
			message: 'Account created. Welcome to TRNDZZ.',
			data: { redirectTo: '/dashboard' },
		};
	} catch (error) {
		const message =
			error instanceof Error && error.message
				? error.message
				: 'Could not create account. This email may already be registered.';
		return {
			success: false,
			message,
		};
	}
}

export async function signOutAction(): Promise<ActionResponse> {
	try {
		await auth.api.signOut({
			headers: await headers(),
		});
		return {
			success: true,
			message: 'Signed out successfully.',
		};
	} catch {
		return {
			success: false,
			message: 'Unable to sign out right now.',
		};
	}
}

