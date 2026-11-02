import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound title='Buyer RFQs Not Found' backHref='/dashboard' />
	);
}

