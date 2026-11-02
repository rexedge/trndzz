import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return <RouteNotFound title='RFQ Monitor Not Found' backHref='/admin' />;
}

