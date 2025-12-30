import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
	process.env.ADMIN_SECRET ?? 'default-secret-change-in-production'
);

const COOKIE_NAME = 'admin_session';

export async function createSessionToken(payload: Record<string, unknown> = {}) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(SECRET);
}

/**
 * Verify JWT session token - MUST be called with await
 * Returns true if token is valid and not expired
 */
export async function verifySessionToken(token?: string): Promise<boolean> {
	if (!token) return false;
	try {
		const { payload } = await jwtVerify(token, SECRET);
		// Check if token has admin role
		return payload.role === 'admin';
	} catch {
		// Token is invalid, expired, or tampered with
		return false;
	}
}

export async function getTokenFromCookies(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setSessionCookie(token: string) {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7, // 7 days
		path: '/',
	});
}

export async function clearSessionCookie() {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_NAME);
}
