import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';

const subscriptionSchema = z.object({
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string(),
		auth: z.string(),
	}),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = subscriptionSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: 'Invalid subscription data' },
				{ status: 400 }
			);
		}

		const { endpoint, keys } = result.data;

		// Upsert subscription (update if exists, create if not)
		await prisma.pushSubscription.upsert({
			where: { endpoint },
			update: {
				p256dh: keys.p256dh,
				auth: keys.auth,
				updatedAt: new Date(),
			},
			create: {
				endpoint,
				p256dh: keys.p256dh,
				auth: keys.auth,
			},
		});

		return NextResponse.json({
			success: true,
			message: 'Subscription saved successfully',
		});
	} catch (error) {
		console.error('Push subscription error:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to save subscription' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();
		const { endpoint } = body;

		if (!endpoint) {
			return NextResponse.json(
				{ success: false, error: 'Endpoint required' },
				{ status: 400 }
			);
		}

		await prisma.pushSubscription.delete({
			where: { endpoint },
		});

		return NextResponse.json({
			success: true,
			message: 'Subscription removed successfully',
		});
	} catch (error) {
		console.error('Push unsubscribe error:', error);
		return NextResponse.json({
			success: true,
			message: 'Subscription removed',
		});
	}
}

export async function GET() {
	// Return the VAPID public key for clients
	return NextResponse.json({
		publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
	});
}
