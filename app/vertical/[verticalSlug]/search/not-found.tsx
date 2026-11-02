import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Search Resource Not Found'
			backHref='/search'
		/>
	);
}
