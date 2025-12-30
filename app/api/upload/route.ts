import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifySessionToken, getTokenFromCookies } from '@/lib/auth/session';

export const runtime = 'nodejs';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const token = await getTokenFromCookies();
		if (!(await verifySessionToken(token))) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return NextResponse.json(
				{ success: false, message: 'No file provided' },
				{ status: 400 }
			);
		}

		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
				},
				{ status: 400 }
			);
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{
					success: false,
					message: 'File too large. Maximum size: 5MB',
				},
				{ status: 400 }
			);
		}

		// Create uploads directory if it doesn't exist
		const uploadsDir = join(process.cwd(), 'public', 'uploads');
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(2, 8);
		const extension = file.name.split('.').pop() || 'jpg';
		const filename = `${timestamp}-${randomStr}.${extension}`;
		const filepath = join(uploadsDir, filename);

		// Write file to disk
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		await writeFile(filepath, buffer);

		// Return the public URL
		const url = `/uploads/${filename}`;

		return NextResponse.json({
			success: true,
			message: 'Image uploaded successfully',
			data: {
				url,
				filename,
				size: file.size,
				type: file.type,
			},
		});
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{ success: false, message: 'Failed to upload image' },
			{ status: 500 }
		);
	}
}
