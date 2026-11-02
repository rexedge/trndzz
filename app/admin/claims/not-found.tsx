import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return <RouteNotFound title='Claim Queue Not Found' backHref='/admin' />;
}

