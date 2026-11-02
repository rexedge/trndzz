import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Knowledge Hub Page Not Found'
			backHref='/learn'
		/>
	);
}

