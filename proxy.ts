import { NextRequest, NextResponse } from 'next/server';
import type { ProxyConfig } from 'next/dist/server/web/types';
import {
	isSharedPlatformPath,
	resolveTenantFromHost,
} from '@/lib/tenancy/host';

/**
 * Next.js 16 Multi-Tenant Subdomain Proxy.
 * Routes root requests (trndzz.com / localhost:3000) to the Macro Hub,
 * and vertical subdomains ([slug].trndzz.com / [slug].localhost:3000)
 * to /vertical/[verticalSlug]/* with zero codebase duplication.
 */
export function proxy(request: NextRequest) {
	const rawHost =
		request.headers.get('x-forwarded-host') ?? request.headers.get('host');
	const tenant = resolveTenantFromHost(rawHost);
	const { pathname } = request.nextUrl;

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-trndzz-hostname', tenant.hostname);
	requestHeaders.set('x-trndzz-tenant-kind', tenant.kind);

	if (tenant.kind === 'vertical') {
		requestHeaders.set('x-trndzz-vertical', tenant.verticalSlug);

		if (!isSharedPlatformPath(pathname)) {
			const rewriteUrl = request.nextUrl.clone();
			rewriteUrl.pathname =
				pathname === '/'
					? `/vertical/${tenant.verticalSlug}`
					: `/vertical/${tenant.verticalSlug}${pathname}`;

			return NextResponse.rewrite(rewriteUrl, {
				request: {
					headers: requestHeaders,
				},
			});
		}
	}

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

export const config: ProxyConfig = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|mp3)$).*)',
	],
};

