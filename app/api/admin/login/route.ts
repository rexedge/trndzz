import { NextResponse } from 'next/server';
import {
	createSessionToken,
	attachSessionCookie,
} from '../../../../lib/adminSession';

export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const { password } = body as any;
	if (!password)
		return NextResponse.json(
			{ error: 'missing password' },
			{ status: 400 }
		);

	if (password !== process.env.ADMIN_PASSWORD)
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

	const token = createSessionToken(3600);
	const res = NextResponse.json({ ok: true });
	return attachSessionCookie(res, token, 3600);
}
