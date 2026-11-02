import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound title='Directory Console Not Found' backHref='/admin' />
	);
}

