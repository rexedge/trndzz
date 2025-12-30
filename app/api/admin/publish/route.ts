import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import {
	getTokenFromRequest,
	verifySessionToken,
} from '../../../../lib/adminSession';

export async function POST(req: Request) {
	const token = getTokenFromRequest(req);
	if (!verifySessionToken(token))
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

	const { postId } = await req.json();
	if (!postId)
		return NextResponse.json({ error: 'missing postId' }, { status: 400 });

	const p = await prisma.post.update({
		where: { id: postId },
		data: { status: 'published', publishedAt: new Date() },
	});
	return NextResponse.json({ ok: true, post: p });
}
