import { z } from 'zod';
import {
	BusinessRole,
	StreamPosition,
	VerificationTier,
} from '@prisma/client';
import {
	BUSINESS_ROLE_VALUES,
	STREAM_POSITION_VALUES,
} from './company.validator';

export const SAMPLE_SUPPLIER_CSV_TEMPLATE = `name,slug,verticalSlug,categorySlugs,streamPositions,businessRoles,headquartersState,city,coverageStates,productionCapacity,minimumOrderSummary,publicEmail,publicPhone,websiteUrl,rcNumber,verificationTier,tagline
Ogun Prime Coil & Roofing Mills Ltd,ogun-prime-coil-roofing-mills,aluminium,aluminium-coils|longspan-step-tile-roofing,MIDSTREAM|DOWNSTREAM,MANUFACTURER|FABRICATOR_INSTALLER,Ogun,Ota Industrial Estate,Ogun|Lagos|Oyo|Kwara,22000 MT/yr Slitting & Roll-Forming,3 MT Coils / 250 sqm Sheets,sales@ogunprimecoils.example.ng,+2348031110099,,RC-1048291,UNVERIFIED,AA3003 stucco-embossed coils and commercial longspan roofing profiles.
Kano Structural Rebar & Billet Rolling Ltd,kano-structural-rebar-rolling,steel,tmt-reinforcement-rebar|structural-sections-plates,MIDSTREAM|DOWNSTREAM,MANUFACTURER|DISTRIBUTOR,Kano,Sharada Phase II,Kano|Kaduna|Abuja FCT|Katsina,85000 MT/yr Tempcore TMT,30 MT Trailer Load,tenders@kanorebar.example.ng,+2348032220088,,RC-1290441,UNVERIFIED,BS4449 Grade B500B deformed steel reinforcement bars for Northern civil projects.
Port Harcourt C&I Hybrid Solar & BESS EPC,ph-ci-hybrid-solar-bess-epc,solar,tier1-bifacial-pv-modules|commercial-inverters-lfp-bess,DOWNSTREAM,FABRICATOR_INSTALLER|DISTRIBUTOR,Rivers,Trans-Amadi Industrial Layout,Rivers|Delta|Bayelsa|Akwa Ibom,12 MWp/yr C&I Commissioning,50 kWp Commercial Array,projects@phsolarepc.example.ng,+2348033330077,,RC-1589203,UNVERIFIED,Industrial solar-diesel-BESS microgrids for Niger Delta manufacturing plants.`;

/**
 * RFC-4180 compliant CSV parser supporting quoted commas, escaped quotes (""), and CRLF/LF newlines.
 */
export function parseCsvToObjects(rawCsv: string): Record<string, string>[] {
	const rows: string[][] = [];
	let currentRow: string[] = [];
	let currentField = '';
	let inQuotes = false;

	const text = rawCsv.replace(/^\uFEFF/, '').trim();
	if (!text) return [];

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const next = text[i + 1];

		if (inQuotes) {
			if (ch === '"' && next === '"') {
				currentField += '"';
				i++;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				currentField += ch;
			}
		} else {
			if (ch === '"') {
				inQuotes = true;
			} else if (ch === ',') {
				currentRow.push(currentField.trim());
				currentField = '';
			} else if (ch === '\r' && next === '\n') {
				currentRow.push(currentField.trim());
				rows.push(currentRow);
				currentRow = [];
				currentField = '';
				i++;
			} else if (ch === '\n' || ch === '\r') {
				currentRow.push(currentField.trim());
				rows.push(currentRow);
				currentRow = [];
				currentField = '';
			} else {
				currentField += ch;
			}
		}
	}

	if (currentField.length > 0 || currentRow.length > 0) {
		currentRow.push(currentField.trim());
		rows.push(currentRow);
	}

	if (rows.length < 2) return [];

	const headers = rows[0].map((h) => h.trim());
	return rows
		.slice(1)
		.filter((r) => r.some((cell) => cell.length > 0))
		.map((cells) => {
			const obj: Record<string, string> = {};
			headers.forEach((h, idx) => {
				if (h) {
					obj[h] = cells[idx] ?? '';
				}
			});
			return obj;
		});
}

function splitPipeList(raw: string | undefined): string[] {
	if (!raw) return [];
	return raw
		.split('|')
		.map((s) => s.trim())
		.filter(Boolean);
}

export const bulkSeedCsvPayloadSchema = z.object({
	csvText: z
		.string()
		.trim()
		.min(20, 'Paste or upload a CSV with header and at least 1 supplier row')
		.max(500_000, 'CSV exceeds maximum batch size'),
});

export const parsedBulkSupplierRowSchema = z.object({
	name: z.string().trim().min(2, 'Missing company name').max(160),
	slug: z.string().trim().max(160).optional(),
	verticalSlug: z.string().trim().min(2, 'Missing verticalSlug'),
	categorySlugs: z
		.string()
		.transform(splitPipeList)
		.pipe(z.array(z.string()).min(1, 'Provide at least 1 categorySlug')),
	streamPositions: z
		.string()
		.transform((v) =>
			splitPipeList(v).map((s) => s.toUpperCase() as StreamPosition)
		)
		.pipe(
			z
				.array(z.enum(STREAM_POSITION_VALUES))
				.min(1, 'Invalid streamPositions (use UPSTREAM|MIDSTREAM|DOWNSTREAM|CROSS_STREAM)')
		),
	businessRoles: z
		.string()
		.transform((v) =>
			splitPipeList(v).map((s) => s.toUpperCase() as BusinessRole)
		)
		.pipe(
			z
				.array(z.enum(BUSINESS_ROLE_VALUES))
				.min(1, 'Invalid businessRoles')
		),
	headquartersState: z.string().trim().min(2, 'Missing headquartersState'),
	city: z.string().trim().optional().or(z.literal('')),
	coverageStates: z
		.string()
		.optional()
		.transform((v) => splitPipeList(v)),
	productionCapacity: z.string().trim().optional().or(z.literal('')),
	minimumOrderSummary: z.string().trim().optional().or(z.literal('')),
	publicEmail: z
		.string()
		.trim()
		.email('Invalid publicEmail')
		.optional()
		.or(z.literal('')),
	publicPhone: z.string().trim().optional().or(z.literal('')),
	websiteUrl: z
		.string()
		.trim()
		.url('Invalid websiteUrl')
		.optional()
		.or(z.literal('')),
	rcNumber: z.string().trim().optional().or(z.literal('')),
	verificationTier: z
		.string()
		.optional()
		.transform((v) =>
			v && v.trim()
				? (v.trim().toUpperCase() as VerificationTier)
				: VerificationTier.UNVERIFIED
		)
		.pipe(
			z.enum([
				VerificationTier.UNVERIFIED,
				VerificationTier.VERIFIED,
				VerificationTier.VERIFIED_PRO,
				VerificationTier.ENTERPRISE_SPONSOR,
			])
		),
	tagline: z.string().trim().optional().or(z.literal('')),
	description: z.string().trim().optional().or(z.literal('')),
});

export type ParsedBulkSupplierRow = z.infer<typeof parsedBulkSupplierRowSchema>;

