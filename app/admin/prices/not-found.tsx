import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return <RouteNotFound title='Price Desk Not Found' backHref='/admin' />;
}

