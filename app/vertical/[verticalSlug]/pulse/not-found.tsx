import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Market Intelligence Feed Not Found'
			backHref='/'
		/>
	);
}

