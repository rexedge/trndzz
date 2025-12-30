import { AdminClient } from './_client';
import { getTokenFromCookies, verifySessionToken } from '@/lib/auth/session';
import { loadAdminDataAction } from '@/app/actions/admin';

export default async function AdminPage() {
	const token = await getTokenFromCookies();
	const authed = await verifySessionToken(token);

	let initialDrafts:
		| {
				id: string;
				title: string;
				slug: string;
				createdAt: string;
				tags: string[];
		  }[]
		| [] = [];

	if (authed) {
		const res = await loadAdminDataAction();
		if (res.success && res.data) {
			initialDrafts = res.data.drafts;
		}
	}

	return (
		<AdminClient
			initialAuthed={authed}
			initialDrafts={initialDrafts}
		/>
	);
}
