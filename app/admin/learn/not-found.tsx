import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Admin Learn Resource Not Found'
			backHref='/admin/learn'
		/>
	);
}
