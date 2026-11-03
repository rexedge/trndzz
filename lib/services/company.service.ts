import 'server-only';
import {
	BusinessRole,
	ClaimStatus,
	StreamPosition,
	VerificationTier,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { refreshPlatformStatsCache } from '@/lib/services/stats.service';
import type {
	CreateCompanyProductInput,
	SeedCompanyInput,
	UpdateVendorProfileInput,
} from '@/lib/validators/company.validator';
import {
	parseCsvToObjects,
	parsedBulkSupplierRowSchema,
} from '@/lib/validators/bulk-seed.validator';

export interface SearchVerticalCompaniesParams {
	verticalId: string;
	query?: string;
	role?: BusinessRole;
	stream?: StreamPosition;
	categorySlug?: string;
	state?: string;
	verifiedOnly?: boolean;
}

export async function searchVerticalCompanies(
	params: SearchVerticalCompaniesParams
) {
	const {
		verticalId,
		query,
		role,
		stream,
		categorySlug,
		state,
		verifiedOnly,
	} = params;

	return prisma.company.findMany({
		where: {
			isPublished: true,
			verticals: {
				some: {
					verticalId,
					...(stream
						? { streamPositions: { has: stream } }
						: {}),
				},
			},
			...(role ? { businessRoles: { has: role } } : {}),
			...(categorySlug
				? { categories: { some: { category: { slug: categorySlug } } } }
				: {}),
			...(state
				? {
						OR: [
							{
								headquartersState: {
									equals: state,
									mode: 'insensitive',
								},
							},
							{ coverageStates: { has: state } },
						],
					}
				: {}),
			...(verifiedOnly
				? { verificationTier: { not: VerificationTier.UNVERIFIED } }
				: {}),
			...(query
				? {
						OR: [
							{ name: { contains: query, mode: 'insensitive' } },
							{
								tagline: {
									contains: query,
									mode: 'insensitive',
								},
							},
							{
								description: {
									contains: query,
									mode: 'insensitive',
								},
							},
						],
					}
				: {}),
		},
		orderBy: [
			{ verificationTier: 'desc' },
			{ claimStatus: 'desc' },
			{ name: 'asc' },
		],
		include: {
			certifications: {
				where: { isVerified: true },
				orderBy: { createdAt: 'desc' },
			},
			verticals: {
				where: { verticalId },
				select: { streamPositions: true },
			},
			categories: {
				where: { category: { verticalId } },
				include: {
					category: { select: { id: true, name: true, slug: true } },
				},
			},
			_count: {
				select: {
					products: true,
					rfqMatches: true,
				},
			},
		},
	});
}

export async function getVerticalCompanyProfile(
	verticalId: string,
	companySlug: string
) {
	const company = await prisma.company.findFirst({
		where: {
			slug: companySlug,
			isPublished: true,
			verticals: { some: { verticalId } },
		},
		include: {
			certifications: {
				orderBy: { isVerified: 'desc' },
			},
			verticals: {
				where: { verticalId },
				select: { streamPositions: true },
			},
			categories: {
				where: { category: { verticalId } },
				include: {
					category: { select: { id: true, name: true, slug: true } },
				},
			},
			products: {
				where: { verticalId, isActive: true },
				orderBy: { createdAt: 'desc' },
				include: {
					category: { select: { id: true, name: true, slug: true } },
				},
			},
			articleMentions: {
				take: 4,
				orderBy: { createdAt: 'desc' },
				include: {
					article: {
						select: {
							id: true,
							title: true,
							slug: true,
							publishedAt: true,
						},
					},
				},
			},
			_count: {
				select: {
					rfqMatches: true,
					rfqQuotes: true,
				},
			},
		},
	});

	if (!company) return null;

	return {
		...company,
		products: company.products.map((p) => ({
			id: p.id,
			name: p.name,
			slug: p.slug,
			description: p.description,
			specifications: (p.specifications as Record<string, string>) ?? {},
			unit: p.unit,
			minOrderQty: p.minOrderQty !== null ? Number(p.minOrderQty) : null,
			indicativeMin:
				p.indicativeMin !== null ? Number(p.indicativeMin) : null,
			indicativeMax:
				p.indicativeMax !== null ? Number(p.indicativeMax) : null,
			currency: p.currency,
			datasheetUrl: p.datasheetUrl,
			category: p.category,
		})),
	};
}

export async function listVerticalCatalogProducts(params: {
	verticalId: string;
	categorySlug?: string;
	query?: string;
	specKey?: string;
	specValue?: string;
}) {
	const rows = await prisma.companyProduct.findMany({
		where: {
			verticalId: params.verticalId,
			isActive: true,
			company: { isPublished: true },
			...(params.categorySlug
				? { category: { slug: params.categorySlug } }
				: {}),
		},
		orderBy: [
			{ company: { verificationTier: 'desc' } },
			{ createdAt: 'desc' },
		],
		include: {
			category: { select: { id: true, name: true, slug: true } },
			company: {
				select: {
					id: true,
					name: true,
					slug: true,
					verificationTier: true,
					claimStatus: true,
					headquartersState: true,
				},
			},
		},
	});

	const qLower = params.query?.trim().toLowerCase();
	const sKey = params.specKey?.trim();
	const sVal = params.specValue?.trim().toLowerCase();

	return rows
		.map((p) => ({
			id: p.id,
			name: p.name,
			slug: p.slug,
			description: p.description,
			specifications: (p.specifications as Record<string, string>) ?? {},
			unit: p.unit,
			minOrderQty: p.minOrderQty !== null ? Number(p.minOrderQty) : null,
			indicativeMin:
				p.indicativeMin !== null ? Number(p.indicativeMin) : null,
			indicativeMax:
				p.indicativeMax !== null ? Number(p.indicativeMax) : null,
			currency: p.currency,
			datasheetUrl: p.datasheetUrl,
			category: p.category,
			company: p.company,
		}))
		.filter((item) => {
			if (sKey && sVal) {
				const actual = item.specifications[sKey]?.toLowerCase() ?? '';
				if (!actual.includes(sVal)) return false;
			}
			if (qLower) {
				const specHaystack = Object.entries(item.specifications)
					.map(([k, v]) => `${k} ${v}`)
					.join(' ')
					.toLowerCase();
				const textHaystack =
					`${item.name} ${item.description ?? ''} ${item.category.name} ${item.company.name} ${specHaystack}`.toLowerCase();
				if (!textHaystack.includes(qLower)) return false;
			}
			return true;
		});
}

export async function seedDirectoryCompany(input: SeedCompanyInput) {
	const coverageStates = input.coverageStatesCsv
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	const created = await prisma.$transaction(async (tx) => {
		const company = await tx.company.create({
			data: {
				name: input.name,
				slug: input.slug,
				tagline: input.tagline || null,
				description: input.description || null,
				businessRoles: input.businessRoles,
				claimStatus: ClaimStatus.UNCLAIMED,
				verificationTier: input.verificationTier,
				headquartersState: input.headquartersState,
				city: input.city || null,
				coverageStates,
				productionCapacity: input.productionCapacity || null,
				minimumOrderSummary: input.minimumOrderSummary || null,
				publicEmail: input.publicEmail || null,
				publicPhone: input.publicPhone || null,
				websiteUrl: input.websiteUrl || null,
				rcNumber: input.rcNumber || null,
				verifiedAt:
					input.verificationTier !== VerificationTier.UNVERIFIED
						? new Date()
						: null,
			},
		});

		await tx.companyVertical.create({
			data: {
				companyId: company.id,
				verticalId: input.verticalId,
				streamPositions: input.streamPositions,
				isPrimary: true,
			},
		});

		await tx.companyCategory.createMany({
			data: input.categoryIds.map((categoryId) => ({
				companyId: company.id,
				categoryId,
			})),
			skipDuplicates: true,
		});

		return company;
	});

	await refreshPlatformStatsCache().catch(() => null);
	return created;
}

export interface BulkSeedSummary {
	totalRows: number;
	createdCount: number;
	updatedCount: number;
	rowErrors: string[];
}

function toCompanySlug(raw: string): string {
	return raw
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 140);
}

export async function bulkSeedDirectoryCompanies(
	csvText: string
): Promise<BulkSeedSummary> {
	const rawRows = parseCsvToObjects(csvText);
	if (rawRows.length === 0) {
		throw new Error(
			'No valid CSV data rows found. Ensure the first line contains the column headers.'
		);
	}
	if (rawRows.length > 250) {
		throw new Error(
			`Batch has ${rawRows.length} rows; maximum allowed per import is 250 rows.`
		);
	}

	const verticals = await prisma.vertical.findMany({
		select: {
			id: true,
			slug: true,
			categories: {
				select: { id: true, slug: true },
			},
		},
	});
	const verticalBySlug = new Map(
		verticals.map((v) => [v.slug.toLowerCase(), v])
	);

	let createdCount = 0;
	let updatedCount = 0;
	const rowErrors: string[] = [];

	for (let i = 0; i < rawRows.length; i++) {
		const rowNumber = i + 2;
		const raw = rawRows[i];
		const parsed = parsedBulkSupplierRowSchema.safeParse(raw);

		if (!parsed.success) {
			const issue = parsed.error.issues[0];
			rowErrors.push(
				`Row ${rowNumber} (${raw.name || 'Unnamed'}): ${issue?.message ?? 'Validation error'}`
			);
			continue;
		}

		const data = parsed.data;
		const vertical = verticalBySlug.get(data.verticalSlug.toLowerCase());
		if (!vertical) {
			rowErrors.push(
				`Row ${rowNumber} (${data.name}): Unknown verticalSlug "${data.verticalSlug}"`
			);
			continue;
		}

		const catMap = new Map(
			vertical.categories.map((c) => [c.slug.toLowerCase(), c.id])
		);
		const resolvedCategoryIds: string[] = [];
		let missingCatSlug: string | null = null;
		for (const cs of data.categorySlugs) {
			const foundId = catMap.get(cs.toLowerCase());
			if (!foundId) {
				missingCatSlug = cs;
				break;
			}
			resolvedCategoryIds.push(foundId);
		}

		if (missingCatSlug) {
			rowErrors.push(
				`Row ${rowNumber} (${data.name}): Unknown categorySlug "${missingCatSlug}" in "${vertical.slug}"`
			);
			continue;
		}

		const slug = toCompanySlug(
			data.slug && data.slug.trim() ? data.slug : data.name
		);
		if (slug.length < 3) {
			rowErrors.push(
				`Row ${rowNumber} (${data.name}): Generated slug "${slug}" is too short`
			);
			continue;
		}

		const coverageStates =
			data.coverageStates.length > 0
				? data.coverageStates
				: [data.headquartersState];

		try {
			await prisma.$transaction(async (tx) => {
				const existing = await tx.company.findUnique({
					where: { slug },
					select: { id: true, claimStatus: true },
				});

				let companyId: string;
				if (existing) {
					await tx.company.update({
						where: { id: existing.id },
						data: {
							name: data.name,
							tagline: data.tagline || undefined,
							description: data.description || undefined,
							businessRoles: data.businessRoles,
							headquartersState: data.headquartersState,
							city: data.city || undefined,
							coverageStates,
							productionCapacity:
								data.productionCapacity || undefined,
							minimumOrderSummary:
								data.minimumOrderSummary || undefined,
							publicEmail: data.publicEmail || undefined,
							publicPhone: data.publicPhone || undefined,
							websiteUrl: data.websiteUrl || undefined,
							rcNumber: data.rcNumber || undefined,
						},
					});
					companyId = existing.id;
					updatedCount++;
				} else {
					const created = await tx.company.create({
						data: {
							name: data.name,
							slug,
							tagline: data.tagline || null,
							description: data.description || null,
							businessRoles: data.businessRoles,
							claimStatus: ClaimStatus.UNCLAIMED,
							verificationTier: data.verificationTier,
							headquartersState: data.headquartersState,
							city: data.city || null,
							coverageStates,
							productionCapacity:
								data.productionCapacity || null,
							minimumOrderSummary:
								data.minimumOrderSummary || null,
							publicEmail: data.publicEmail || null,
							publicPhone: data.publicPhone || null,
							websiteUrl: data.websiteUrl || null,
							rcNumber: data.rcNumber || null,
							verifiedAt:
								data.verificationTier !==
								VerificationTier.UNVERIFIED
									? new Date()
									: null,
						},
					});
					companyId = created.id;
					createdCount++;
				}

				await tx.companyVertical.upsert({
					where: {
						companyId_verticalId: {
							companyId,
							verticalId: vertical.id,
						},
					},
					update: {
						streamPositions: data.streamPositions,
					},
					create: {
						companyId,
						verticalId: vertical.id,
						streamPositions: data.streamPositions,
						isPrimary: true,
					},
				});

				await tx.companyCategory.createMany({
					data: resolvedCategoryIds.map((categoryId) => ({
						companyId,
						categoryId,
					})),
					skipDuplicates: true,
				});
			});
		} catch (err) {
			rowErrors.push(
				`Row ${rowNumber} (${data.name}): ${err instanceof Error ? err.message : 'Database upsert failed'}`
			);
		}
	}

	if (createdCount > 0 || updatedCount > 0) {
		await refreshPlatformStatsCache().catch(() => null);
	}

	return {
		totalRows: rawRows.length,
		createdCount,
		updatedCount,
		rowErrors,
	};
}

export async function updateClaimedVendorProfile(
	input: UpdateVendorProfileInput
) {
	const coverageStates = input.coverageStatesCsv
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	return prisma.company.update({
		where: { id: input.companyId },
		data: {
			tagline: input.tagline || null,
			description: input.description || null,
			city: input.city || null,
			address: input.address || null,
			coverageStates,
			productionCapacity: input.productionCapacity || null,
			minimumOrderSummary: input.minimumOrderSummary || null,
			publicEmail: input.publicEmail || null,
			publicPhone: input.publicPhone || null,
			whatsappNumber: input.whatsappNumber || null,
			websiteUrl: input.websiteUrl || null,
		},
	});
}

export async function createVendorProduct(input: CreateCompanyProductInput) {
	const baseSlug = input.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80);
	const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

	return prisma.companyProduct.create({
		data: {
			companyId: input.companyId,
			verticalId: input.verticalId,
			categoryId: input.categoryId,
			name: input.name,
			slug,
			description: input.description || null,
			specifications: input.specifications,
			unit: input.unit,
			minOrderQty: input.minOrderQty?.toFixed(3),
			indicativeMin: input.indicativeMin?.toFixed(4),
			indicativeMax: input.indicativeMax?.toFixed(4),
			currency: input.currency.toUpperCase(),
			datasheetUrl: input.datasheetUrl || null,
		},
	});
}

export async function listAdminDirectoryCompanies() {
	return prisma.company.findMany({
		orderBy: { createdAt: 'desc' },
		take: 100,
		include: {
			verticals: {
				include: { vertical: { select: { name: true, slug: true } } },
			},
			_count: {
				select: {
					products: true,
					rfqMatches: true,
					rfqQuotes: true,
					claimRequests: true,
				},
			},
		},
	});
}

