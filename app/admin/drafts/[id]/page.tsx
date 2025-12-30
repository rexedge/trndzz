import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { getTokenFromCookies, verifySessionToken } from '@/lib/auth/session';
import { DraftEditorClient } from './_client';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function DraftEditPage({ params }: PageProps) {
	// Await params (Next.js 15+ requirement)
	const { id } = await params;

	// Server-side auth check
	const token = await getTokenFromCookies();
	const isValid = await verifySessionToken(token);

	if (!isValid) {
		redirect('/admin');
	}

	// Fetch draft with images
	const draft = await prisma.post.findUnique({
		where: { id },
		include: {
			images: {
				orderBy: { order: 'asc' },
			},
		},
	});

	if (!draft) {
		redirect('/admin/drafts');
	}

	// Transform for client
	const draftData = {
		id: draft.id,
		title: draft.title,
		slug: draft.slug,
		content: draft.content,
		excerpt: draft.excerpt || '',
		tags: draft.tags,
		status: draft.status,
		metaDescription: draft.metaDescription || '',
		featuredImageUrl: draft.featuredImageUrl,
		featuredImageAlt: draft.featuredImageAlt,
		featuredImageCredit: draft.featuredImageCredit,
		createdAt: draft.createdAt.toISOString(),
		updatedAt: draft.updatedAt.toISOString(),
		images: draft.images.map((img) => ({
			id: img.id,
			url: img.url,
			alt: img.alt || '',
			caption: img.caption || '',
			credit: img.credit || '',
			order: img.order,
		})),
	};

	return <DraftEditorClient draft={draftData} />;
}
