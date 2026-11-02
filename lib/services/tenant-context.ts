import 'server-only';
import { notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/guards';
import { getVerticalTenantBySlug } from '@/lib/services/vertical.service';

export async function resolveRequiredVertical(verticalSlug: string) {
	const user = await getCurrentUser();
	const canPreviewDraft =
		user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.EDITOR;

	const vertical = await getVerticalTenantBySlug(verticalSlug, {
		allowDraft: canPreviewDraft,
	});

	if (!vertical) {
		notFound();
	}

	return { vertical, user };
}

