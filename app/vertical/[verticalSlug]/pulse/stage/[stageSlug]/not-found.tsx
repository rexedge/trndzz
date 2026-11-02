import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Value-Chain Stage Not Found'
			backHref='/pulse'
			backLabel='All Pulse Briefs'
		/>
	);
}

