import { NextResponse } from 'next/server';
import { attachClearCookie } from '../../../../lib/adminSession';

export async function POST() {
	const res = NextResponse.json({ ok: true });
	return attachClearCookie(res);
}
