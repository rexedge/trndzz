import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import {
	getTokenFromRequest,
	verifySessionToken,
} from '../../../../lib/adminSession';

export async function GET(req: Request) {
	const token = getTokenFromRequest(req);
	if (!verifySessionToken(token))
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

	const drafts = await prisma.post.findMany({
		where: { status: 'draft' },
		orderBy: { createdAt: 'desc' },
	});
	return NextResponse.json({ ok: true, drafts });
}
