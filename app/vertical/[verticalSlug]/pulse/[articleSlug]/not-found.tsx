import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Market Intelligence Brief Not Found'
			backHref='/pulse'
			backLabel='All Pulse Briefs'
		/>
	);
}

