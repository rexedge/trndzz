import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return <RouteNotFound title='Pulse CMS Not Found' backHref='/admin' />;
}

