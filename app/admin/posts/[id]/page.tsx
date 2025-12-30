import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { getTokenFromCookies, verifySessionToken } from '@/lib/auth/session';
import { PostEditorClient } from './_client';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PageProps) {
	const { id } = await params;

	// Server-side auth check
	const token = await getTokenFromCookies();
	const isValid = await verifySessionToken(token);

	if (!isValid) {
		redirect('/admin');
	}

	// Fetch post with images (published posts only)
	const post = await prisma.post.findFirst({
		where: { id, status: 'published' },
		include: {
			images: {
				orderBy: { order: 'asc' },
			},
		},
	});

	if (!post) {
		redirect('/admin/posts');
	}

	// Transform for client
	const postData = {
		id: post.id,
		title: post.title,
		slug: post.slug,
		content: post.content,
		excerpt: post.excerpt || '',
		tags: post.tags,
		status: post.status,
		metaDescription: post.metaDescription || '',
		relatedQueries: post.relatedQueries || [],
		featuredImageUrl: post.featuredImageUrl,
		featuredImageAlt: post.featuredImageAlt,
		featuredImageCredit: post.featuredImageCredit,
		publishedAt: post.publishedAt?.toISOString() || null,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
		images: post.images.map((img) => ({
			id: img.id,
			url: img.url,
			alt: img.alt || '',
			caption: img.caption || '',
			credit: img.credit || '',
			order: img.order,
		})),
	};

	return <PostEditorClient post={postData} />;
}
