import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BusinessRole, VerificationTier } from '@prisma/client';
import {
	computeNextRateWindow,
	evaluateBotSubmission,
} from '@/lib/security/bot-check';
import {
	buildMacroUrl,
	buildVerticalUrl,
	isSharedPlatformPath,
	normalizeHostname,
	resolveTenantFromHost,
} from '@/lib/tenancy/host';
import {
	formatRfqReference,
	parseRfqSequence,
	rfqPrefixFromVerticalSlug,
} from '@/lib/utils/rfq-reference';
import { scoreSupplierMatch } from '@/lib/utils/rfq-matching';
import {
	parseCsvToObjects,
	parsedBulkSupplierRowSchema,
	SAMPLE_SUPPLIER_CSV_TEMPLATE,
} from '@/lib/validators/bulk-seed.validator';
import { validateDynamicSpecs } from '@/lib/validators/rfq.validator';

describe('RFQ Reference Sequence Helpers', () => {
	it('derives a 3-letter uppercase prefix from vertical slugs', () => {
		assert.equal(rfqPrefixFromVerticalSlug('aluminium'), 'ALU');
		assert.equal(rfqPrefixFromVerticalSlug('steel'), 'STE');
		assert.equal(rfqPrefixFromVerticalSlug('solar'), 'SOL');
		assert.equal(rfqPrefixFromVerticalSlug('ai'), 'AIX');
	});

	it('formats and parses 5-digit padded RFQ references', () => {
		const ref = formatRfqReference('ALU', 2026, 19);
		assert.equal(ref, 'RFQ-ALU-2026-00019');
		assert.equal(parseRfqSequence(ref), 19);
		assert.equal(parseRfqSequence('invalid-ref'), 0);
	});
});

describe('RFC-4180 Bulk CSV Supplier Parser & Zod Schema', () => {
	it('parses the sample 3-vertical CSV template cleanly', () => {
		const rows = parseCsvToObjects(SAMPLE_SUPPLIER_CSV_TEMPLATE);
		assert.equal(rows.length, 3);
		for (const raw of rows) {
			const parsed = parsedBulkSupplierRowSchema.safeParse(raw);
			assert.equal(parsed.success, true);
		}
	});

	it('handles quoted commas, escaped quotes, and CRLF line endings', () => {
		const csv =
			'name,verticalSlug,categorySlugs,streamPositions,businessRoles,headquartersState\r\n' +
			'"Apex ""Prime"" Coils, Ltd",aluminium,aluminium-coils,MIDSTREAM|DOWNSTREAM,MANUFACTURER,Lagos\r\n';
		const rows = parseCsvToObjects(csv);
		assert.equal(rows.length, 1);
		assert.equal(rows[0].name, 'Apex "Prime" Coils, Ltd');

		const validated = parsedBulkSupplierRowSchema.safeParse(rows[0]);
		assert.equal(validated.success, true);
		if (validated.success) {
			assert.deepEqual(validated.data.streamPositions, [
				'MIDSTREAM',
				'DOWNSTREAM',
			]);
		}
	});

	it('rejects rows with invalid enum values or missing categories', () => {
		const bad = parsedBulkSupplierRowSchema.safeParse({
			name: 'Test Co',
			verticalSlug: 'aluminium',
			categorySlugs: '',
			streamPositions: 'INVALID_STREAM',
			businessRoles: 'MANUFACTURER',
			headquartersState: 'Lagos',
		});
		assert.equal(bad.success, false);
	});
});

describe('Multi-Tenant Host & Pre-DNS Staging URL Routing', () => {
	it('normalizes hostnames and resolves vertical subdomains vs macro hub', () => {
		assert.equal(normalizeHostname('Aluminium.Localhost:3000'), 'aluminium.localhost');
		assert.deepEqual(resolveTenantFromHost('aluminium.localhost:3000'), {
			kind: 'vertical',
			verticalSlug: 'aluminium',
			hostname: 'aluminium.localhost',
		});
		assert.deepEqual(resolveTenantFromHost('localhost:3000'), {
			kind: 'macro',
			verticalSlug: null,
			hostname: 'localhost',
		});
		assert.deepEqual(resolveTenantFromHost('admin.trndzz.com'), {
			kind: 'macro',
			verticalSlug: null,
			hostname: 'admin.trndzz.com',
		});
	});

	it('identifies shared platform paths that bypass vertical rewrites', () => {
		assert.equal(isSharedPlatformPath('/api/health'), true);
		assert.equal(isSharedPlatformPath('/admin/notifications'), true);
		assert.equal(isSharedPlatformPath('/directory'), false);
	});

	it('builds subdomain URLs on localhost/trndzz.com and path fallbacks on *.vercel.app', () => {
		const prev = process.env.NEXT_PUBLIC_APP_URL;

		process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
		assert.equal(
			buildVerticalUrl('aluminium', '/rfq/new'),
			'http://aluminium.localhost:3000/rfq/new'
		);
		assert.equal(
			buildMacroUrl('/dashboard'),
			'http://localhost:3000/dashboard'
		);

		process.env.NEXT_PUBLIC_APP_URL = 'https://trend-pulse-staging.vercel.app';
		assert.equal(
			buildVerticalUrl('steel', '/directory'),
			'https://trend-pulse-staging.vercel.app/vertical/steel/directory'
		);

		process.env.NEXT_PUBLIC_APP_URL = 'https://trndzz.com';
		assert.equal(
			buildVerticalUrl('solar', '/learn'),
			'https://solar.trndzz.com/learn'
		);

		process.env.NEXT_PUBLIC_APP_URL = prev;
	});
});

describe('Supplier Matching & Dynamic Spec Validation', () => {
	it('scores category, role, state, and verification tier accurately', () => {
		const candidate = {
			id: 'comp-1',
			businessRoles: [BusinessRole.MANUFACTURER],
			headquartersState: 'Ogun',
			coverageStates: ['Lagos', 'Oyo'],
			verificationTier: VerificationTier.VERIFIED_PRO,
			categories: [{ categoryId: 'cat-coils' }],
		};

		const scored = scoreSupplierMatch(candidate, {
			categoryId: 'cat-coils',
			deliveryState: 'Lagos',
			preferredRoles: [BusinessRole.MANUFACTURER],
		});

		assert.equal(scored.hasCategory, true);
		assert.equal(scored.score, 100);
	});

	it('validates required and SELECT-constrained technical specifications', () => {
		const defs = [
			{
				key: 'alloy',
				label: 'Alloy Grade',
				isRequired: true,
				inputType: 'SELECT' as const,
				options: ['AA1100', 'AA3003'],
			},
		];

		const okRes = validateDynamicSpecs({ alloy: 'AA3003' }, defs);
		assert.equal(okRes.ok, true);

		const badRes = validateDynamicSpecs({ alloy: 'AA9999' }, defs);
		assert.equal(badRes.ok, false);
		assert.ok(badRes.errors['specifications.alloy']);
	});
});

describe('Bot Defense & Rate Limit Window Evaluation', () => {
	it('blocks filled honeypots and sub-threshold fast submissions', () => {
		const now = 1_700_000_000_000;
		assert.equal(
			evaluateBotSubmission({ honeypot: 'http://spam.example' }, now).ok,
			false
		);
		assert.equal(
			evaluateBotSubmission({ honeypot: '', formRenderedAt: now - 400 }, now)
				.ok,
			false
		);
		assert.equal(
			evaluateBotSubmission({ honeypot: '', formRenderedAt: now - 4500 }, now)
				.ok,
			true
		);
	});

	it('enforces fixed-window rate limits and resets expired windows', () => {
		const now = 1_700_000_000_000;
		const activeExpiry = now + 60_000;

		const within = computeNextRateWindow({
			existingCount: 4,
			existingExpiresAtMs: activeExpiry,
			nowMs: now,
			limit: 5,
			windowSeconds: 3600,
		});
		assert.equal(within.allowed, true);
		assert.equal(within.nextCount, 5);

		const blocked = computeNextRateWindow({
			existingCount: 5,
			existingExpiresAtMs: activeExpiry,
			nowMs: now,
			limit: 5,
			windowSeconds: 3600,
		});
		assert.equal(blocked.allowed, false);
		assert.equal(blocked.retryAfterSeconds, 60);

		const reset = computeNextRateWindow({
			existingCount: 10,
			existingExpiresAtMs: now - 1000,
			nowMs: now,
			limit: 5,
			windowSeconds: 3600,
		});
		assert.equal(reset.allowed, true);
		assert.equal(reset.resetWindow, true);
		assert.equal(reset.nextCount, 1);
	});
});

