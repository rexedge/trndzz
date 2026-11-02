import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Brief Not Found'
			backHref='/news'
			backLabel='All Macro Briefs'
		/>
	);
}

