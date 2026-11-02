import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Supplier Profile Not Found'
			backHref='/directory'
			backLabel='Browse Supplier Directory'
		/>
	);
}

