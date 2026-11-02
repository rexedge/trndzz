import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Search Route Not Found'
			backHref='/search'
		/>
	);
}
