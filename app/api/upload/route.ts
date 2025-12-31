import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { verifySessionToken, getTokenFromCookies } from '@/lib/auth/session';
import sharp from 'sharp';

export const runtime = 'nodejs';

// Max file size after compression: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Initialize S3 client for DigitalOcean Spaces (S3-compatible)
const s3Client = new S3Client({
	region: process.env.AWS_REGION || 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'isce-image-uploader';
const FOLDER_NAME = 'trndzz';

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
		const slug = formData.get('slug') as string | null;

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

		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const originalBuffer = Buffer.from(bytes);

		// Compress and convert to WebP
		const compressedBuffer = await sharp(originalBuffer)
			.webp({ quality: 85 }) // High quality WebP compression
			.toBuffer();

		// Validate compressed file size
		if (compressedBuffer.length > MAX_FILE_SIZE) {
			return NextResponse.json(
				{
					success: false,
					message: 'Compressed file too large. Maximum size: 5MB',
				},
				{ status: 400 }
			);
		}

		// Generate unique filename using slug + timestamp (always .webp)
		const timestamp = Date.now();
		const slugPart = slug
			? slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
			: 'image';
		const filename = `${slugPart}-${timestamp}.webp`;
		const key = `${FOLDER_NAME}/${filename}`;

		// Upload to S3/DigitalOcean Spaces
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			Body: compressedBuffer,
			ContentType: 'image/webp',
			ACL: 'public-read',
		});

		await s3Client.send(command);

		// Generate public URL
		const url = `https://${BUCKET_NAME}.s3.${
			process.env.AWS_REGION || 'us-east-1'
		}.amazonaws.com/${key}`;

		return NextResponse.json({
			success: true,
			message: 'Image uploaded successfully',
			data: {
				url,
				filename,
				size: compressedBuffer.length,
				type: 'image/webp',
				originalSize: file.size,
				compressionRatio:
					((1 - compressedBuffer.length / file.size) * 100).toFixed(
						2
					) + '%',
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
