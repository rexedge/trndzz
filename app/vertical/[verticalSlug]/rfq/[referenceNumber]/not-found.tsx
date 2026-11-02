import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='RFQ Reference Number Not Found'
			backHref='/rfq'
			backLabel='Browse Live RFQ Board'
		/>
	);
}

