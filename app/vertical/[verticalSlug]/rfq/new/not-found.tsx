import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return <RouteNotFound title='RFQ Form Not Found' backHref='/rfq' />;
}

