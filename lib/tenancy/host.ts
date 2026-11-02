export type TenantResolution =
	| {
			kind: 'macro';
			verticalSlug: null;
			hostname: string;
	  }
	| {
			kind: 'vertical';
			verticalSlug: string;
			hostname: string;
	  };

const RESERVED_SUBDOMAINS = new Set([
	'www',
	'app',
	'api',
	'admin',
	'auth',
	'dashboard',
	'cdn',
	'mail',
	'static',
]);

const SHARED_PATH_PREFIXES = [
	'/api',
	'/auth',
	'/dashboard',
	'/admin',
	'/vertical',
	'/_next',
];

/**
 * Normalizes a raw Host header by lowercasing and stripping any port suffix.
 */
export function normalizeHostname(rawHost: string | null | undefined): string {
	if (!rawHost) return 'localhost';
	const firstHost = rawHost.split(',')[0]?.trim().toLowerCase() ?? 'localhost';
	return firstHost.replace(/:\d+$/, '');
}

/**
 * Resolves whether an incoming Host header belongs to the root Macro Hub
 * (trndzz.com / localhost) or a standalone industry vertical ([slug].trndzz.com / [slug].localhost).
 */
export function resolveTenantFromHost(
	rawHost: string | null | undefined
): TenantResolution {
	const hostname = normalizeHostname(rawHost);
	const rootDomain = (
		process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'trndzz.com'
	).toLowerCase();

	// 1. Local subdomain development: e.g., aluminium.localhost
	if (hostname.endsWith('.localhost')) {
		const sub = hostname.slice(0, -'.localhost'.length);
		if (sub && !sub.includes('.') && !RESERVED_SUBDOMAINS.has(sub)) {
			return {
				kind: 'vertical',
				verticalSlug: sub,
				hostname,
			};
		}
		return { kind: 'macro', verticalSlug: null, hostname };
	}

	// 2. Production / staging wildcard domain: e.g., aluminium.trndzz.com
	if (hostname.endsWith(`.${rootDomain}`)) {
		const sub = hostname.slice(0, -(rootDomain.length + 1));
		if (sub && !sub.includes('.') && !RESERVED_SUBDOMAINS.has(sub)) {
			return {
				kind: 'vertical',
				verticalSlug: sub,
				hostname,
			};
		}
		return { kind: 'macro', verticalSlug: null, hostname };
	}

	// 3. Default macro hub (trndzz.com, localhost, 127.0.0.1, preview URLs)
	return { kind: 'macro', verticalSlug: null, hostname };
}

/**
 * Checks whether a URL pathname is a shared platform route (/auth, /dashboard, /admin, /api)
 * that should NOT be rewritten into /vertical/[verticalSlug].
 */
export function isSharedPlatformPath(pathname: string): boolean {
	return SHARED_PATH_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

/**
 * Builds an absolute URL to a specific vertical subdomain (aluminium.trndzz.com or aluminium.localhost:3000).
 */
export function buildVerticalUrl(
	verticalSlug: string,
	pathWithQuery = '/'
): string {
	const normalizedPath = pathWithQuery.startsWith('/')
		? pathWithQuery
		: `/${pathWithQuery}`;
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

	try {
		const base = new URL(appUrl);
		const hostNoWww = base.hostname.replace(/^www\./, '');
		base.hostname = `${verticalSlug}.${hostNoWww}`;
		base.pathname = '/';
		base.search = '';
		base.hash = '';
		const target = new URL(normalizedPath, base);
		const str = target.toString();
		return normalizedPath === '/' ? str.replace(/\/$/, '') : str;
	} catch {
		return `/vertical/${verticalSlug}${normalizedPath === '/' ? '' : normalizedPath}`;
	}
}

/**
 * Builds an absolute URL back to the root Macro Hub (trndzz.com or localhost:3000).
 */
export function buildMacroUrl(pathname = '/'): string {
	const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const appUrl = (
		process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	).replace(/\/$/, '');
	return normalizedPath === '/' ? appUrl : `${appUrl}${normalizedPath}`;
}

