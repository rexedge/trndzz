import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@/lib/prisma/client';

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'trndzz.com';
const isProduction = process.env.NODE_ENV === 'production';

function resolveAuthSecret(): string {
	const configured =
		process.env.BETTER_AUTH_SECRET?.trim() ||
		process.env.ADMIN_SECRET?.trim() ||
		'';

	// Enforce a strong secret when deployed to a real production host
	const appUrl =
		process.env.BETTER_AUTH_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		'http://localhost:3000';
	const isRemoteProduction =
		isProduction &&
		!appUrl.includes('localhost') &&
		!appUrl.includes('127.0.0.1');

	if (isRemoteProduction && configured.length < 32) {
		throw new Error(
			'BETTER_AUTH_SECRET must be set to at least 32 characters in production.'
		);
	}

	return (
		configured || 'trndzz-dev-only-secret-change-before-production-0123456789'
	);
}

function buildTrustedOrigins(): string[] {
	const origins = new Set<string>([
		'http://localhost:3000',
		'http://*.localhost:3000',
		`https://${rootDomain}`,
		`https://www.${rootDomain}`,
		`https://*.${rootDomain}`,
	]);

	for (const candidate of [
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.BETTER_AUTH_URL,
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
	]) {
		if (!candidate) continue;
		try {
			origins.add(new URL(candidate).origin);
		} catch {
			// Ignore malformed optional URL env vars
		}
	}

	return Array.from(origins);
}

const baseURL =
	process.env.BETTER_AUTH_URL ||
	process.env.NEXT_PUBLIC_APP_URL ||
	'http://localhost:3000';
const enableWildcardSubdomainCookie =
	isProduction && baseURL.includes(rootDomain);

export const auth = betterAuth({
	appName: 'TRNDZZ B2B Ecosystem',
	secret: resolveAuthSecret(),
	baseURL,
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		autoSignIn: true,
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 30,
	},
	trustedOrigins: buildTrustedOrigins(),
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'USER',
				input: false, // Never allow client sign-up payloads to escalate role
			},
			phone: {
				type: 'string',
				required: false,
			},
			jobTitle: {
				type: 'string',
				required: false,
			},
			companyName: {
				type: 'string',
				required: false,
			},
		},
	},
	advanced: {
		crossSubDomainCookies: enableWildcardSubdomainCookie
			? {
					enabled: true,
					domain: `.${rootDomain}`,
				}
			: {
					enabled: false,
				},
	},
	plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
