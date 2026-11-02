import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { auth } from '@/lib/auth/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
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

		if (!ALLOWED_TYPES.includes(file.type)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
				},
				{ status: 400 }
			);
		}

		const bytes = await file.arrayBuffer();
		const originalBuffer = Buffer.from(bytes);

		const compressedBuffer = await sharp(originalBuffer)
			.webp({ quality: 85 })
			.toBuffer();

		if (compressedBuffer.length > MAX_FILE_SIZE) {
			return NextResponse.json(
				{
					success: false,
					message: 'Compressed file too large. Maximum size: 5MB',
				},
				{ status: 400 }
			);
		}

		const timestamp = Date.now();
		const slugPart = slug
			? slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
			: 'asset';
		const filename = `${slugPart}-${timestamp}.webp`;
		const key = `${FOLDER_NAME}/${filename}`;

		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			Body: compressedBuffer,
			ContentType: 'image/webp',
			ACL: 'public-read',
		});

		await s3Client.send(command);

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
