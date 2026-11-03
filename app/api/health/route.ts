import { NextResponse } from 'next/server';
import { VerticalStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const activeVerticals = await prisma.vertical.count({
			where: { status: VerticalStatus.ACTIVE },
		});

		const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const isLocal =
			appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

		return NextResponse.json(
			{
				status: 'ok',
				environment: process.env.NODE_ENV ?? 'development',
				deploymentStage: isLocal ? 'local-prelaunch' : 'remote',
				activeVerticals,
				emailProvider: process.env.RESEND_API_KEY?.trim()
					? 'resend-live'
					: 'dry-run-outbox',
				timestamp: new Date().toISOString(),
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				status: 'degraded',
				error:
					error instanceof Error
						? error.message
						: 'Database connectivity check failed',
				timestamp: new Date().toISOString(),
			},
			{ status: 503 }
		);
	}
}

