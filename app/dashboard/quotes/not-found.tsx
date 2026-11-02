import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound title='Supplier Quotes Not Found' backHref='/dashboard' />
	);
}

