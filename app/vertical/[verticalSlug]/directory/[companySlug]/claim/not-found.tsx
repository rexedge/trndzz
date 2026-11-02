import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Company Claim Target Not Found'
			backHref='/directory'
		/>
	);
}

