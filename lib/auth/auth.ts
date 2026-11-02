import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@/lib/prisma/client';

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'trndzz.com';
const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
	appName: 'TRNDZZ B2B Ecosystem',
	secret:
		process.env.BETTER_AUTH_SECRET ||
		process.env.ADMIN_SECRET ||
		'trndzz-dev-only-secret-change-before-production-0123456789',
	baseURL:
		process.env.BETTER_AUTH_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		'http://localhost:3000',
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		autoSignIn: true,
	},
	trustedOrigins: [
		'http://localhost:3000',
		'http://*.localhost:3000',
		`https://${rootDomain}`,
		`https://www.${rootDomain}`,
		`https://*.${rootDomain}`,
	],
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
		crossSubDomainCookies: isProduction
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

