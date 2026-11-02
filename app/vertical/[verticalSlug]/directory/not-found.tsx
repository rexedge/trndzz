import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound title='Supplier Directory Not Found' backHref='/' />
	);
}

