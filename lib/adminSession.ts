import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

function base64url(input: string) {
	return Buffer.from(input)
		.toString('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

function fromBase64url(input: string) {
	// pad
	const pad =
		input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
	const u = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
	return Buffer.from(u, 'base64').toString();
}

export function createSessionToken(expirySeconds = 3600) {
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + expirySeconds;
	const payload = JSON.stringify({ iat, exp });
	const payloadB = base64url(payload);
	const secret = process.env.ADMIN_PASSWORD || '';
	const sig = crypto
		.createHmac('sha256', secret)
		.update(payloadB)
		.digest('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
	return `${payloadB}.${sig}`;
}

export function verifySessionToken(token: string | null) {
	if (!token) return false;
	const parts = token.split('.');
	if (parts.length !== 2) return false;
	const [payloadB, sig] = parts;
	const secret = process.env.ADMIN_PASSWORD || '';
	const expected = crypto
		.createHmac('sha256', secret)
		.update(payloadB)
		.digest('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
	if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
		return false;
	try {
		const payload = JSON.parse(fromBase64url(payloadB));
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp > now) return true;
	} catch (e) {
		return false;
	}
	return false;
}

export function makeSetCookieHeader(token: string, maxAge = 3600) {
	const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
	return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearCookieHeader() {
	const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
	return `${COOKIE_NAME}=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export async function setSessionCookie(token: string, maxAge = 3600) {
	const store = await cookies();
	store.set({
		name: COOKIE_NAME,
		value: token,
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge,
		path: '/',
	});
}

export async function clearSessionCookie() {
	const store = await cookies();
	store.set({
		name: COOKIE_NAME,
		value: '',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 0,
		path: '/',
	});
}

// Helpers to attach cookie headers directly to a NextResponse
export function attachSessionCookie(
	res: NextResponse,
	token: string,
	maxAge = 3600
) {
	res.headers.set('Set-Cookie', makeSetCookieHeader(token, maxAge));
	return res;
}

export function attachClearCookie(res: NextResponse) {
	res.headers.set('Set-Cookie', clearCookieHeader());
	return res;
}

export function getTokenFromRequest(req: Request) {
	const cookie = req.headers.get('cookie') || '';
	const parts = cookie.split(';').map((s) => s.trim());
	for (const p of parts) {
		if (p.startsWith(COOKIE_NAME + '='))
			return p.slice((COOKIE_NAME + '=').length);
	}
	return null;
}

export async function getTokenFromCookies() {
	const store = await cookies();
	return store.get(COOKIE_NAME)?.value ?? null;
}
