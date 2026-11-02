import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
	ClaimStatus,
	CompanyMemberRole,
	UserRole,
	VerificationTier,
} from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma/client';
import type { ActionResponse } from '@/types/actions';

export interface AuthenticatedContext {
	userId: string;
	email: string;
	name: string;
	emailVerified: boolean;
	role: UserRole;
	phone: string | null;
	jobTitle: string | null;
	companyName: string | null;
}

/**
 * Retrieves the current server-side user session and fresh database role.
 * Safe to call in any Server Component or Server Action.
 */
export async function getCurrentUser(): Promise<AuthenticatedContext | null> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				email: true,
				name: true,
				emailVerified: true,
				role: true,
				phone: true,
				jobTitle: true,
				companyName: true,
			},
		});

		if (!dbUser) {
			return null;
		}

		return {
			userId: dbUser.id,
			email: dbUser.email,
			name: dbUser.name,
			emailVerified: dbUser.emailVerified,
			role: dbUser.role,
			phone: dbUser.phone,
			jobTitle: dbUser.jobTitle,
			companyName: dbUser.companyName,
		};
	} catch {
		return null;
	}
}

/**
 * Server Component route guard: redirects unauthenticated visitors to /auth/login.
 */
export async function requireServerUser(
	callbackPath = '/dashboard'
): Promise<AuthenticatedContext> {
	const user = await getCurrentUser();
	if (!user) {
		redirect(`/auth/login?next=${encodeURIComponent(callbackPath)}`);
	}
	return user;
}

/**
 * Server Component route guard for platform staff (/admin).
 */
export async function requirePlatformStaff(
	allowedRoles: UserRole[] = [
		UserRole.SUPER_ADMIN,
		UserRole.EDITOR,
		UserRole.ANALYST,
	]
): Promise<AuthenticatedContext> {
	const user = await requireServerUser('/admin');
	if (!allowedRoles.includes(user.role)) {
		redirect('/dashboard');
	}
	return user;
}

/**
 * Server Action guard: ensures an authenticated user without throwing exceptions.
 */
export async function guardActionAuth(): Promise<
	| { ok: true; user: AuthenticatedContext }
	| { ok: false; response: ActionResponse<never> }
> {
	const user = await getCurrentUser();
	if (!user) {
		return {
			ok: false,
			response: {
				success: false,
				message: 'Please sign in to continue.',
			},
		};
	}
	return { ok: true, user };
}

/**
 * Server Action guard for platform staff roles (SUPER_ADMIN, EDITOR, ANALYST).
 */
export async function guardPlatformRole(
	allowedRoles: UserRole[]
): Promise<
	| { ok: true; user: AuthenticatedContext }
	| { ok: false; response: ActionResponse<never> }
> {
	const authResult = await guardActionAuth();
	if (!authResult.ok) return authResult;

	if (!allowedRoles.includes(authResult.user.role)) {
		return {
			ok: false,
			response: {
				success: false,
				message: 'You do not have permission to perform this action.',
			},
		};
	}

	return authResult;
}

/**
 * Server Action guard for vendor workspace mutations.
 * Enforces CompanyMember membership, ClaimStatus.CLAIMED, and optional VerificationTier check.
 */
export async function guardCompanyAccess(
	companyId: string,
	allowedMemberRoles: CompanyMemberRole[] = [
		CompanyMemberRole.OWNER,
		CompanyMemberRole.ADMIN,
		CompanyMemberRole.SALES_REP,
	],
	options?: { requireVerifiedTier?: boolean }
) {
	const authResult = await guardActionAuth();
	if (!authResult.ok) return authResult;

	const membership = await prisma.companyMember.findUnique({
		where: {
			companyId_userId: {
				companyId,
				userId: authResult.user.userId,
			},
		},
		include: {
			company: {
				select: {
					id: true,
					name: true,
					slug: true,
					claimStatus: true,
					verificationTier: true,
				},
			},
		},
	});

	if (!membership || !allowedMemberRoles.includes(membership.role)) {
		return {
			ok: false as const,
			response: {
				success: false,
				message:
					'You are not authorized to act on behalf of this company.',
			} satisfies ActionResponse<never>,
		};
	}

	if (membership.company.claimStatus !== ClaimStatus.CLAIMED) {
		return {
			ok: false as const,
			response: {
				success: false,
				message:
					'Company profile claim must be approved before performing vendor actions.',
			} satisfies ActionResponse<never>,
		};
	}

	if (
		options?.requireVerifiedTier &&
		membership.company.verificationTier === VerificationTier.UNVERIFIED
	) {
		return {
			ok: false as const,
			response: {
				success: false,
				message:
					'This RFQ is restricted to Verified suppliers. Complete company verification first.',
			} satisfies ActionResponse<never>,
		};
	}

	return {
		ok: true as const,
		user: authResult.user,
		membership,
	};
}

