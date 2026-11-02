import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound title='Company Workspace Not Found' backHref='/dashboard' />
	);
}

