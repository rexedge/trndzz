import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound title='Claims History Not Found' backHref='/dashboard' />
	);
}

