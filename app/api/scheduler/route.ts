import { NextResponse } from 'next/server';

export async function POST() {
	return NextResponse.json(
		{
			error: 'scheduler removed. Use admin UI to generate drafts manually.',
		},
		{ status: 410 }
	);
}
