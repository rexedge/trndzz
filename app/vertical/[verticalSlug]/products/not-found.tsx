import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return <RouteNotFound title='Product Catalog Not Found' backHref='/' />;
}

