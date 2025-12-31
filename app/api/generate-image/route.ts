import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifySessionToken, getTokenFromCookies } from '@/lib/auth/session';
import { getOpenAIClient } from '@/lib/openai-client';

export const runtime = 'nodejs';

const openai = getOpenAIClient();

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

		const body = await request.json();
		const { prompt, size = '1792x1024', quality = 'standard' } = body;

		if (!prompt || typeof prompt !== 'string') {
			return NextResponse.json(
				{ success: false, message: 'Prompt is required' },
				{ status: 400 }
			);
		}

		if (prompt.length > 4000) {
			return NextResponse.json(
				{ success: false, message: 'Prompt too long (max 4000 chars)' },
				{ status: 400 }
			);
		}

		// Generate image with DALL-E 3
		const response = await openai.images.generate({
			model: 'dall-e-3',
			prompt: prompt,
			n: 1,
			size: size as '1024x1024' | '1792x1024' | '1024x1792',
			quality: quality as 'standard' | 'hd',
			response_format: 'b64_json',
		});

		const imageData = response.data?.[0];

		if (!imageData?.b64_json) {
			return NextResponse.json(
				{ success: false, message: 'Failed to generate image' },
				{ status: 500 }
			);
		}

		// Create uploads directory if it doesn't exist
		const uploadsDir = join(process.cwd(), 'public', 'uploads');
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		// Save the image to disk
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(2, 8);
		const filename = `ai-${timestamp}-${randomStr}.png`;
		const filepath = join(uploadsDir, filename);

		const buffer = Buffer.from(imageData.b64_json, 'base64');
		await writeFile(filepath, buffer);

		// Return the public URL
		const url = `/uploads/${filename}`;

		return NextResponse.json({
			success: true,
			message: 'Image generated successfully',
			data: {
				url,
				filename,
				revisedPrompt: imageData.revised_prompt,
			},
		});
	} catch (error) {
		console.error('Image generation error:', error);

		// Handle specific OpenAI errors
		if (error instanceof OpenAI.APIError) {
			if (error.status === 400) {
				return NextResponse.json(
					{
						success: false,
						message:
							'Invalid prompt. Please try a different description.',
					},
					{ status: 400 }
				);
			}
			if (error.status === 429) {
				return NextResponse.json(
					{
						success: false,
						message: 'Rate limit exceeded. Please try again later.',
					},
					{ status: 429 }
				);
			}
		}

		return NextResponse.json(
			{ success: false, message: 'Failed to generate image' },
			{ status: 500 }
		);
	}
}
