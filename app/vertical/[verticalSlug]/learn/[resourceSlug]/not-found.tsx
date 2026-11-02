import { RouteNotFound } from '@/components/shared/route-states';

export default function NotFound() {
	return (
		<RouteNotFound
			title='Technical Dossier Not Found'
			backHref='/learn'
			backLabel='Browse Knowledge Hub'
		/>
	);
}

