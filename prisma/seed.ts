import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
	ArticleStatus,
	ArticleType,
	BusinessRole,
	ClaimStatus,
	PrismaClient,
	RfqMatchStatus,
	RfqStatus,
	RfqVisibility,
	SpecInputType,
	StreamPosition,
	UserRole,
	VerificationTier,
	VerticalStatus,
} from '@prisma/client';

const pool = new Pool({
	connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
	adapter: new PrismaPg(pool),
});

async function main() {
	console.log('🌱 Seeding TRNDZZ Multi-Tenant B2B Ecosystem...');

	// 1. Core System Users
	const editorialAdmin = await prisma.user.upsert({
		where: { email: 'editorial@trndzz.com' },
		update: { role: UserRole.SUPER_ADMIN },
		create: {
			email: 'editorial@trndzz.com',
			name: 'Trndzz Market Intelligence Desk',
			emailVerified: true,
			jobTitle: 'Managing Editor, Industrial Markets',
			companyName: 'Trndzz Media & Trade Intelligence',
			role: UserRole.SUPER_ADMIN,
		},
	});

	const sampleBuyer = await prisma.user.upsert({
		where: { email: 'procurement@ekodevelopments.ng' },
		update: {},
		create: {
			email: 'procurement@ekodevelopments.ng',
			name: 'Engr. Tunde Adeyemi',
			emailVerified: true,
			phone: '+2348030001122',
			jobTitle: 'Head of Procurement',
			companyName: 'Eko Commercial Developments Ltd',
			role: UserRole.USER,
		},
	});

	// 2. Multi-Tenant Industry Verticals
	const aluminiumVertical = await prisma.vertical.upsert({
		where: { slug: 'aluminium' },
		update: {
			status: VerticalStatus.ACTIVE,
			themeColor: '#0284C7',
		},
		create: {
			name: 'Aluminium',
			slug: 'aluminium',
			tagline:
				'West Africa’s Aluminium, Extrusion & Roofing Value-Chain Portal',
			description:
				'End-to-end trade intelligence, LME & regional coil pricing, SON-verified mills, extruders, importers, and specification-driven RFQ sourcing for the aluminium industry.',
			status: VerticalStatus.ACTIVE,
			themeColor: '#0284C7',
			iconName: 'Layers',
			displayOrder: 1,
			metaTitle:
				'Aluminium Trade Intelligence, Suppliers & RFQ Marketplace | Trndzz Aluminium',
			metaDescription:
				'Source verified aluminium coils, extrusions, billets, and roofing contractors across Nigeria & West Africa. Track live LME and regional Naira benchmarks.',
		},
	});

	await prisma.vertical.upsert({
		where: { slug: 'steel' },
		update: {},
		create: {
			name: 'Steel',
			slug: 'steel',
			tagline:
				'Structural Steel, TMT Rebar, Flat Coils & Heavy Fabrication Hub',
			description:
				'Verified steel mills, rebar importers, structural fabricators, and wholesale tonnage benchmarks across West Africa.',
			status: VerticalStatus.DRAFT,
			themeColor: '#4F46E5',
			iconName: 'Hammer',
			displayOrder: 2,
		},
	});

	await prisma.vertical.upsert({
		where: { slug: 'solar' },
		update: {},
		create: {
			name: 'Solar & Clean Energy',
			slug: 'solar',
			tagline:
				'Commercial Tier-1 PV Modules, Hybrid Inverters, BESS & C&I EPCs',
			description:
				'B2B procurement portal for commercial solar developers, mini-grid operators, Tier-1 distributors, and mounting structure manufacturers.',
			status: VerticalStatus.DRAFT,
			themeColor: '#D97706',
			iconName: 'Sun',
			displayOrder: 3,
		},
	});

	// 3. Value-Chain Stages for Aluminium
	const stageUpstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'upstream',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			name: 'Upstream: Bauxite, Alumina & Primary Ingots',
			slug: 'upstream',
			streamPosition: StreamPosition.UPSTREAM,
			description:
				'Bauxite mining corridors, alumina refining, primary ingot imports, and remelt scrap recovery.',
			displayOrder: 1,
		},
	});

	const stageMidstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'midstream',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			name: 'Midstream: Rolling Mills, Coils & Extrusion Plants',
			slug: 'midstream',
			streamPosition: StreamPosition.MIDSTREAM,
			description:
				'Cold-rolling, colour-coating lines, coil slitting, homogenized billets, and architectural/industrial extrusion presses.',
			displayOrder: 2,
		},
	});

	const stageDownstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'downstream',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			name: 'Downstream: Roofing, Fenestration & Facade EPCs',
			slug: 'downstream',
			streamPosition: StreamPosition.DOWNSTREAM,
			description:
				'Longspan & step-tile roll-forming, curtain wall fabrication, window/door systems, and commercial roofing installation.',
			displayOrder: 3,
		},
	});

	await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'cross-stream',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			name: 'Cross-Stream: Machinery, Coatings, Testing & Logistics',
			slug: 'cross-stream',
			streamPosition: StreamPosition.CROSS_STREAM,
			description:
				'Roll-forming machinery, PVDF/polyester coil coatings, powder coating chemicals, SON conformity testing, and heavy haulage.',
			displayOrder: 4,
		},
	});

	// 4. Categories & Technical Spec Definitions
	const catCoils = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'aluminium-coils',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageMidstream.id,
			name: 'Aluminium Coils & Flat Rolled Sheets',
			slug: 'aluminium-coils',
			description:
				'Mill-finish, stucco-embossed, and colour-coated aluminium coils for roofing, cladding, and industrial insulation.',
			defaultUnit: 'MT',
			displayOrder: 1,
		},
	});

	const catRoofing = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'longspan-roofing-sheets',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageDownstream.id,
			name: 'Longspan & Step-Tile Roofing Sheets',
			slug: 'longspan-roofing-sheets',
			description:
				'Custom-corrugated longspan, step-tile, Metcoppo, and standing-seam roofing sheets with flashing accessories.',
			defaultUnit: 'sqm',
			displayOrder: 2,
		},
	});

	const catExtrusions = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'architectural-extrusions',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageMidstream.id,
			name: 'Architectural & Solar Extrusion Profiles',
			slug: 'architectural-extrusions',
			description:
				'Anodized and powder-coated AA6063/AA6061 profiles for casement windows, curtain walls, partitioning, and solar PV racking.',
			defaultUnit: 'MT',
			displayOrder: 3,
		},
	});

	await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: aluminiumVertical.id,
				slug: 'primary-ingots-billets',
			},
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageUpstream.id,
			name: 'Primary Ingots, Billets & Master Alloys',
			slug: 'primary-ingots-billets',
			description:
				'P1020 primary aluminium ingots, homogenized 6063 extrusion billets, and secondary foundry alloys.',
			defaultUnit: 'MT',
			displayOrder: 4,
		},
	});

	// Spec Definitions for Aluminium Coils
	const coilSpecs = [
		{
			key: 'gauge_mm',
			label: 'Gauge / Thickness',
			unit: 'mm',
			options: ['0.40', '0.45', '0.50', '0.55', '0.70', '0.90', '1.20'],
			isRequired: true,
			displayOrder: 1,
		},
		{
			key: 'alloy',
			label: 'Alloy Grade',
			unit: null,
			options: ['AA1100', 'AA1200', 'AA3003', 'AA3105', 'AA5052'],
			isRequired: true,
			displayOrder: 2,
		},
		{
			key: 'surface_finish',
			label: 'Surface Finish & Coating',
			unit: null,
			options: [
				'Stucco Embossed (Pre-Painted)',
				'Smooth Pre-Painted (PE)',
				'PVDF Architectural Grade',
				'Mill Finish (Plain)',
			],
			isRequired: true,
			displayOrder: 3,
		},
		{
			key: 'coil_width_mm',
			label: 'Coil Width',
			unit: 'mm',
			options: ['600', '914', '1000', '1200', '1220'],
			isRequired: false,
			displayOrder: 4,
		},
	];

	for (const spec of coilSpecs) {
		await prisma.specAttributeDefinition.upsert({
			where: {
				verticalId_categoryId_key: {
					verticalId: aluminiumVertical.id,
					categoryId: catCoils.id,
					key: spec.key,
				},
			},
			update: {
				label: spec.label,
				unit: spec.unit,
				options: spec.options,
				isRequired: spec.isRequired,
			},
			create: {
				verticalId: aluminiumVertical.id,
				categoryId: catCoils.id,
				key: spec.key,
				label: spec.label,
				unit: spec.unit,
				inputType: SpecInputType.SELECT,
				options: spec.options,
				isRequired: spec.isRequired,
				displayOrder: spec.displayOrder,
			},
		});
	}

	// Spec Definitions for Extrusions
	const extrusionSpecs = [
		{
			key: 'alloy_temper',
			label: 'Alloy & Temper',
			unit: null,
			options: ['AA6063-T5', 'AA6063-T6', 'AA6061-T6'],
			isRequired: true,
			displayOrder: 1,
		},
		{
			key: 'surface_treatment',
			label: 'Surface Treatment',
			unit: null,
			options: [
				'Powder Coated (RAL Colour)',
				'Anodized Matt Silver',
				'Anodized Champagne / Bronze',
				'PVDF Exterior Grade',
				'Mill Finish',
			],
			isRequired: true,
			displayOrder: 2,
		},
		{
			key: 'wall_thickness_mm',
			label: 'Nominal Wall Thickness',
			unit: 'mm',
			options: ['1.1', '1.2', '1.5', '2.0', '2.5', '3.0'],
			isRequired: true,
			displayOrder: 3,
		},
	];

	for (const spec of extrusionSpecs) {
		await prisma.specAttributeDefinition.upsert({
			where: {
				verticalId_categoryId_key: {
					verticalId: aluminiumVertical.id,
					categoryId: catExtrusions.id,
					key: spec.key,
				},
			},
			update: { options: spec.options },
			create: {
				verticalId: aluminiumVertical.id,
				categoryId: catExtrusions.id,
				key: spec.key,
				label: spec.label,
				unit: spec.unit,
				inputType: SpecInputType.SELECT,
				options: spec.options,
				isRequired: spec.isRequired,
				displayOrder: spec.displayOrder,
			},
		});
	}

	// 5. Commodity & Regional Price Indicators
	const indicatorsData = [
		{
			verticalId: null, // Macro FX Indicator
			code: 'MACRO_USD_NGN_NFEM',
			name: 'USD / NGN Official NFEM',
			unit: 'USD',
			currency: 'NGN',
			latestPrice: '1585.0000',
			previousPrice: '1592.5000',
			changePercent: '-0.4700',
			sourceLabel: 'CBN NFEM Closing',
			displayOrder: 1,
		},
		{
			verticalId: aluminiumVertical.id,
			code: 'LME_ALU_CASH',
			name: 'LME Aluminium (Cash)',
			unit: 'MT',
			currency: 'USD',
			latestPrice: '2648.5000',
			previousPrice: '2612.0000',
			changePercent: '1.3974',
			sourceLabel: 'LME Official',
			displayOrder: 1,
		},
		{
			verticalId: aluminiumVertical.id,
			code: 'NG_ALU_COIL_055',
			name: '0.55mm Stucco Pre-Painted Coil (Ex-Lagos)',
			unit: 'MT',
			currency: 'NGN',
			latestPrice: '4980000.0000',
			previousPrice: '4920000.0000',
			changePercent: '1.2195',
			sourceLabel: 'Trndzz Mill Survey',
			displayOrder: 2,
		},
		{
			verticalId: aluminiumVertical.id,
			code: 'NG_LONGSPAN_055',
			name: '0.55mm Longspan Sheet (SW Wholesale)',
			unit: 'sqm',
			currency: 'NGN',
			latestPrice: '11450.0000',
			previousPrice: '11600.0000',
			changePercent: '-1.2931',
			sourceLabel: 'Trndzz Distributor Index',
			displayOrder: 3,
		},
		{
			verticalId: aluminiumVertical.id,
			code: 'NG_EXTRUSION_6063',
			name: 'AA6063-T5 Powder-Coated Profile (Ex-Ogun)',
			unit: 'MT',
			currency: 'NGN',
			latestPrice: '5450000.0000',
			previousPrice: '5400000.0000',
			changePercent: '0.9259',
			sourceLabel: 'Trndzz Extruder Survey',
			displayOrder: 4,
		},
	];

	for (const ind of indicatorsData) {
		const saved = await prisma.commodityIndicator.upsert({
			where: { code: ind.code },
			update: {
				latestPrice: ind.latestPrice,
				previousPrice: ind.previousPrice,
				changePercent: ind.changePercent,
			},
			create: ind,
		});

		const existingPoints = await prisma.commodityPricePoint.count({
			where: { indicatorId: saved.id },
		});

		if (existingPoints === 0) {
			const base = Number(ind.previousPrice);
			const latest = Number(ind.latestPrice);
			const now = Date.now();
			const dayMs = 86_400_000;
			await prisma.commodityPricePoint.createMany({
				data: [
					{
						indicatorId: saved.id,
						price: (base * 0.985).toFixed(4),
						recordedAt: new Date(now - 14 * dayMs),
					},
					{
						indicatorId: saved.id,
						price: (base * 0.992).toFixed(4),
						recordedAt: new Date(now - 7 * dayMs),
					},
					{
						indicatorId: saved.id,
						price: base.toFixed(4),
						recordedAt: new Date(now - 2 * dayMs),
					},
					{
						indicatorId: saved.id,
						price: latest.toFixed(4),
						recordedAt: new Date(now),
					},
				],
			});
		}
	}

	// 6. Supplier Directory Profiles (Mix of VERIFIED + UNCLAIMED for Claim & Convert)
	const warmCompany = await prisma.company.upsert({
		where: { slug: 'west-african-rolling-mills-ogun' },
		update: {},
		create: {
			name: 'West African Rolling & Coating Mills Ltd',
			slug: 'west-african-rolling-mills-ogun',
			tagline:
				'Continuous colour-coating, cold-rolling, and coil slitting plant serving ECOWAS construction & industrial buyers.',
			description:
				'Operating an automated continuous coil-coating and tension-levelling line in Agbara Industrial Estate, supplying AA1100 and AA3003 stucco-embossed and PVDF coils with full Mill Test Certificates (MTC).',
			businessRoles: [
				BusinessRole.MANUFACTURER,
				BusinessRole.PROCESSOR_EXTRUDER,
			],
			claimStatus: ClaimStatus.CLAIMED,
			verificationTier: VerificationTier.VERIFIED_PRO,
			headquartersState: 'Ogun',
			city: 'Agbara',
			coverageStates: [
				'Lagos',
				'Ogun',
				'Oyo',
				'Abuja FCT',
				'Rivers',
				'Anambra',
			],
			yearEstablished: 2008,
			employeeCountRange: '200-500',
			productionCapacity: '36,000 MT/yr Colour Coating & Slitting',
			minimumOrderSummary: '5 MT per colour/gauge specification',
			rcNumber: 'RC-748291',
			publicEmail: 'sales@warm-aluminium.example.ng',
			publicPhone: '+2348091112200',
			verifiedAt: new Date(),
		},
	});

	const lagosExtrusions = await prisma.company.upsert({
		where: { slug: 'lagos-architectural-extrusions' },
		update: {},
		create: {
			name: 'Lagos Architectural Extrusions & Anodizing Plc',
			slug: 'lagos-architectural-extrusions',
			tagline:
				'Precision AA6063-T5/T6 architectural profiles, solar mounting rails, and Qualicoat-grade powder coating.',
			description:
				'Three high-tonnage extrusion presses (1,000T to 2,200T) with vertical powder coating and matt anodizing lines for high-rise curtain walls, commercial fenestration, and utility-scale solar PV racking.',
			businessRoles: [
				BusinessRole.PROCESSOR_EXTRUDER,
				BusinessRole.MANUFACTURER,
			],
			claimStatus: ClaimStatus.CLAIMED,
			verificationTier: VerificationTier.VERIFIED,
			headquartersState: 'Lagos',
			city: 'Ikorodu Industrial Layout',
			coverageStates: ['Lagos', 'Abuja FCT', 'Rivers', 'Delta', 'Kano'],
			yearEstablished: 2014,
			employeeCountRange: '100-250',
			productionCapacity: '14,500 MT/yr Extrusion & Finishing',
			minimumOrderSummary: '1.5 MT per die profile',
			rcNumber: 'RC-1194022',
			publicEmail: 'commercial@lagosextrusions.example.ng',
			verifiedAt: new Date(),
		},
	});

	const atlanticCoilsUnclaimed = await prisma.company.upsert({
		where: { slug: 'atlantic-metals-coil-importers-apapa' },
		update: {},
		create: {
			name: 'Atlantic Metals & Coil Importers Nigeria Ltd',
			slug: 'atlantic-metals-coil-importers-apapa',
			tagline:
				'Bulk bonded-warehouse importer of AA3003/AA3105 mill-finish and pre-painted aluminium coils in Lagos.',
			description:
				'High-volume raw material importer supplying downstream corrugating plants across South-West and South-East Nigeria with prompt ex-warehouse dispatch.',
			businessRoles: [BusinessRole.IMPORTER, BusinessRole.DISTRIBUTOR],
			claimStatus: ClaimStatus.UNCLAIMED,
			verificationTier: VerificationTier.UNVERIFIED,
			headquartersState: 'Lagos',
			city: 'Amuwo-Odofin',
			coverageStates: ['Lagos', 'Ogun', 'Anambra', 'Abia', 'Oyo'],
			yearEstablished: 2016,
			productionCapacity: '18,000 MT/yr Bonded Coil Inventory',
			minimumOrderSummary: '3 MT ex-warehouse',
			publicEmail: 'info@atlanticmetals.example.ng',
		},
	});

	const northernRoofingUnclaimed = await prisma.company.upsert({
		where: { slug: 'arewa-span-roofing-systems-kano' },
		update: {},
		create: {
			name: 'ArewaSpan Roofing & Cladding Systems Ltd',
			slug: 'arewa-span-roofing-systems-kano',
			tagline:
				'Automated longspan and step-tile roll-forming plant serving Kano, Kaduna, Abuja FCT, and the Northern corridor.',
			description:
				'Regional downstream fabricator and commercial roofing contractor specializing in industrial warehouses, institutional buildings, and estate developments.',
			businessRoles: [
				BusinessRole.FABRICATOR_INSTALLER,
				BusinessRole.DISTRIBUTOR,
			],
			claimStatus: ClaimStatus.UNCLAIMED,
			verificationTier: VerificationTier.UNVERIFIED,
			headquartersState: 'Kano',
			city: 'Sharada Industrial Phase II',
			coverageStates: ['Kano', 'Kaduna', 'Abuja FCT', 'Katsina', 'Plateau'],
			yearEstablished: 2019,
			productionCapacity: '450,000 sqm/yr Roll-Forming',
			minimumOrderSummary: '250 sqm cut-to-length',
		},
	});

	// Link companies to Aluminium Vertical, Categories & Certifications
	const companyVerticalLinks = [
		{
			companyId: warmCompany.id,
			streamPositions: [StreamPosition.MIDSTREAM],
			categories: [catCoils.id],
		},
		{
			companyId: lagosExtrusions.id,
			streamPositions: [
				StreamPosition.MIDSTREAM,
				StreamPosition.DOWNSTREAM,
			],
			categories: [catExtrusions.id],
		},
		{
			companyId: atlanticCoilsUnclaimed.id,
			streamPositions: [
				StreamPosition.UPSTREAM,
				StreamPosition.MIDSTREAM,
			],
			categories: [catCoils.id],
		},
		{
			companyId: northernRoofingUnclaimed.id,
			streamPositions: [StreamPosition.DOWNSTREAM],
			categories: [catRoofing.id],
		},
	];

	for (const link of companyVerticalLinks) {
		await prisma.companyVertical.upsert({
			where: {
				companyId_verticalId: {
					companyId: link.companyId,
					verticalId: aluminiumVertical.id,
				},
			},
			update: { streamPositions: link.streamPositions },
			create: {
				companyId: link.companyId,
				verticalId: aluminiumVertical.id,
				streamPositions: link.streamPositions,
				isPrimary: true,
			},
		});

		for (const categoryId of link.categories) {
			await prisma.companyCategory.upsert({
				where: {
					companyId_categoryId: {
						companyId: link.companyId,
						categoryId,
					},
				},
				update: {},
				create: {
					companyId: link.companyId,
					categoryId,
				},
			});
		}
	}

	// Certifications for verified companies
	const warmCertCount = await prisma.companyCertification.count({
		where: { companyId: warmCompany.id },
	});
	if (warmCertCount === 0) {
		await prisma.companyCertification.createMany({
			data: [
				{
					companyId: warmCompany.id,
					name: 'SON MANCAP (NIS 488:2021 Aluminium Roofing Coils)',
					issuer: 'Standards Organisation of Nigeria',
					certificateNumber: 'MANCAP-ALU-09412',
					isVerified: true,
				},
				{
					companyId: warmCompany.id,
					name: 'ISO 9001:2015 Quality Management System',
					issuer: 'Bureau Veritas',
					certificateNumber: 'BV-NG-88210',
					isVerified: true,
				},
			],
		});
	}

	// Sample Structured Catalog Products
	await prisma.companyProduct.upsert({
		where: {
			companyId_slug: {
				companyId: warmCompany.id,
				slug: 'aa3003-055mm-stucco-prepainted-coil',
			},
		},
		update: {},
		create: {
			companyId: warmCompany.id,
			verticalId: aluminiumVertical.id,
			categoryId: catCoils.id,
			name: 'AA3003 0.55mm Stucco-Embossed Pre-Painted Aluminium Coil',
			slug: 'aa3003-055mm-stucco-prepainted-coil',
			description:
				'20-micron high-durability polyester coating over chromate-pretreated AA3003-H14 strip, engineered for coastal humidity and industrial longspan roofing.',
			specifications: {
				gauge_mm: '0.55',
				alloy: 'AA3003',
				surface_finish: 'Stucco Embossed (Pre-Painted)',
				coil_width_mm: '1200',
			},
			unit: 'MT',
			minOrderQty: '5.000',
			indicativeMin: '4920000.0000',
			indicativeMax: '5080000.0000',
			currency: 'NGN',
		},
	});

	// 7. Trndzz Pulse Editorial Articles + Contextual Company Mentions
	const article1 = await prisma.article.upsert({
		where: {
			slug: 'son-intensifies-045mm-gauge-compliance-checks-aluminium-roofing-coils',
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageMidstream.id,
			categoryId: catCoils.id,
			title: 'SON Intensifies Gauge Tolerance & Alloy Compliance Audits Across Southwest Coil Warehouses',
			slug: 'son-intensifies-045mm-gauge-compliance-checks-aluminium-roofing-coils',
			excerpt:
				'Commercial developers and EPC procurement teams shift sourcing toward MANCAP-certified rolling mills as field inspections flag sub-gauge imported coils sold as 0.55mm.',
			body: `## Stricter Enforcement Reshapes Coil Procurement\n\nThe Standards Organisation of Nigeria (SON) has expanded unannounced micrometer thickness and alloy composition checks across bonded terminals and wholesale coil depots in Lagos and Ogun State.\n\nProcurement leads on industrial warehousing and institutional projects report heightened scrutiny on **0.45mm and 0.55mm AA3003 pre-painted stucco coils**, where unverified grey-market lots previously understated coating thickness and tensile strength.\n\n### What Commercial Buyers Should Specify in RFQs\n- Require **Mill Test Certificates (MTC)** stating exact alloy temper (e.g., AA3003-H14 / H24) and net metal thickness excluding paint film.\n- Specify top-coat chemistry (**PE 18–20μm** for inland vs. **PVDF 25μm+** for coastal Lekki/Port Harcourt environments).\n- Request quotes exclusively from **MANCAP-verified rolling mills and vetted bonded importers**.`,
			type: ArticleType.POLICY_REGULATORY,
			status: ArticleStatus.PUBLISHED,
			isMacroFeatured: true,
			isVerticalPinned: true,
			authorId: editorialAdmin.id,
			publishedAt: new Date(Date.now() - 3 * 3600_000),
		},
	});

	const article2 = await prisma.article.upsert({
		where: {
			slug: 'lme-aluminium-crosses-2640-ton-west-african-extruders-adjust-billet-surcharges',
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageUpstream.id,
			categoryId: catExtrusions.id,
			title: 'LME Aluminium Holds Above $2,640/MT as Domestic Extruders Steady Q4 Profile Pricing',
			slug: 'lme-aluminium-crosses-2640-ton-west-african-extruders-adjust-billet-surcharges',
			excerpt:
				'Relative stability at the official NFEM FX window cushions landed 6063 billet costs despite firmer global alumina and LME cash settlements.',
			body: `## Global Alumina Tightness Meets Steadier Local FX\n\nCash settlements on the London Metal Exchange (LME) climbed **1.40% to $2,648.50/MT** this week on tighter global alumina availability. However, Nigerian architectural extruders in Lagos and Ogun kept ex-plant **AA6063-T5 powder-coated profile** benchmarks within a narrow **₦5.40M–₦5.50M/MT** band thanks to steadier NFEM liquidity.\n\nCommercial facade contractors and C&I solar developers locking in Q4 mounting rail and curtain-wall schedules are actively issuing multi-vendor RFQs to secure 30-day price validity.`,
			type: ArticleType.PRICE_ANALYSIS,
			status: ArticleStatus.PUBLISHED,
			isMacroFeatured: true,
			isVerticalPinned: false,
			authorId: editorialAdmin.id,
			publishedAt: new Date(Date.now() - 10 * 3600_000),
		},
	});

	await prisma.article.upsert({
		where: {
			slug: 'commercial-solar-epcs-drive-surge-local-6063-t6-mounting-rail-demand',
		},
		update: {},
		create: {
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageDownstream.id,
			categoryId: catExtrusions.id,
			title: 'C&I Solar Boom Sparks 28% Jump in Domestic AA6063-T6 Roof-Mount Rail Orders',
			slug: 'commercial-solar-epcs-drive-surge-local-6063-t6-mounting-rail-demand',
			excerpt:
				'Local extrusion plants shorten lead times to 10–14 days for anodized PV mounting rails and mid/end clamps, displacing 8-week imported racking containers.',
			body: `## Cross-Sector Demand Between Solar EPCs & Local Extruders\n\nIndustrial manufacturers transitioning from diesel generation to megawatt-scale rooftop solar arrays are increasingly sourcing **AA6063-T6 anodized mounting rails** directly from Nigerian extrusion presses rather than waiting 60 days for imported racking kits.\n\nCustom die tooling for standing-seam clamps and Z-purlin brackets has cut project balance-of-system delays while keeping working capital denominated in Naira.`,
			type: ArticleType.MARKET_BRIEF,
			status: ArticleStatus.PUBLISHED,
			isMacroFeatured: true,
			isVerticalPinned: false,
			authorId: editorialAdmin.id,
			publishedAt: new Date(Date.now() - 22 * 3600_000),
		},
	});

	// Pillar 5: Contextual Mentions linking articles to verified & seeded companies
	await prisma.articleCompanyMention.upsert({
		where: {
			articleId_companyId: {
				articleId: article1.id,
				companyId: warmCompany.id,
			},
		},
		update: {},
		create: {
			articleId: article1.id,
			companyId: warmCompany.id,
			contextLabel: 'SON MANCAP Verified Rolling Mill',
			displayOrder: 1,
		},
	});

	await prisma.articleCompanyMention.upsert({
		where: {
			articleId_companyId: {
				articleId: article1.id,
				companyId: atlanticCoilsUnclaimed.id,
			},
		},
		update: {},
		create: {
			articleId: article1.id,
			companyId: atlanticCoilsUnclaimed.id,
			contextLabel: 'Lagos Bonded Coil Importer',
			displayOrder: 2,
		},
	});

	await prisma.articleCompanyMention.upsert({
		where: {
			articleId_companyId: {
				articleId: article2.id,
				companyId: lagosExtrusions.id,
			},
		},
		update: {},
		create: {
			articleId: article2.id,
			companyId: lagosExtrusions.id,
			contextLabel: 'Featured AA6063 Extruder',
			displayOrder: 1,
		},
	});

	// 8. Sample Structured Buyer RFQs + Pre-Qualified Vendor Matches
	const rfq1 = await prisma.rfq.upsert({
		where: { referenceNumber: 'RFQ-ALU-2026-00018' },
		update: {},
		create: {
			referenceNumber: 'RFQ-ALU-2026-00018',
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageMidstream.id,
			categoryId: catCoils.id,
			buyerId: sampleBuyer.id,
			buyerCompanyName: 'Eko Commercial Developments Ltd',
			buyerContactName: 'Engr. Tunde Adeyemi',
			buyerContactEmail: 'procurement@ekodevelopments.ng',
			buyerContactPhone: '+2348030001122',
			title: '25 MT of 0.55mm AA3003 Stucco-Embossed Coils (Bush Green & Ivory)',
			specifications: {
				gauge_mm: '0.55',
				alloy: 'AA3003',
				surface_finish: 'Stucco Embossed (Pre-Painted)',
				coil_width_mm: '1200',
			},
			additionalNotes:
				'Required for 14,000 sqm logistics park roof in Ibeju-Lekki. Suppliers must attach valid SON MANCAP certificate and Mill Test Certificate.',
			quantity: '25.000',
			unit: 'MT',
			targetUnitPrice: '4950000.0000',
			currency: 'NGN',
			deliveryState: 'Lagos',
			deliveryCity: 'Ibeju-Lekki',
			requiredByDate: new Date(Date.now() + 21 * 86_400_000),
			paymentTermsPreference: '70% Advance / 30% Prior to Dispatch',
			visibility: RfqVisibility.PUBLIC_BOARD,
			status: RfqStatus.OPEN,
			preferredRoles: [BusinessRole.MANUFACTURER, BusinessRole.IMPORTER],
			sourceArticleId: article1.id,
			expiresAt: new Date(Date.now() + 14 * 86_400_000),
		},
	});

	await prisma.rfq.upsert({
		where: { referenceNumber: 'RFQ-ALU-2026-00019' },
		update: {},
		create: {
			referenceNumber: 'RFQ-ALU-2026-00019',
			verticalId: aluminiumVertical.id,
			valueChainStageId: stageMidstream.id,
			categoryId: catExtrusions.id,
			buyerId: sampleBuyer.id,
			buyerCompanyName: 'Meridian Facade & Glazing Contractors',
			buyerContactName: 'Engr. Tunde Adeyemi',
			buyerContactEmail: 'procurement@ekodevelopments.ng',
			buyerContactPhone: '+2348030001122',
			title: '12 MT of AA6063-T6 PVDF Curtain Wall Mullion & Transom Profiles',
			specifications: {
				alloy_temper: 'AA6063-T6',
				surface_treatment: 'PVDF Exterior Grade',
				wall_thickness_mm: '2.5',
			},
			additionalNotes:
				'8-storey commercial office facade in Victoria Island. Custom die drawings available upon NDA/shortlist.',
			quantity: '12.000',
			unit: 'MT',
			currency: 'NGN',
			deliveryState: 'Lagos',
			deliveryCity: 'Victoria Island',
			requiredByDate: new Date(Date.now() + 30 * 86_400_000),
			visibility: RfqVisibility.PUBLIC_BOARD,
			status: RfqStatus.OPEN,
			preferredRoles: [
				BusinessRole.PROCESSOR_EXTRUDER,
				BusinessRole.MANUFACTURER,
			],
			expiresAt: new Date(Date.now() + 14 * 86_400_000),
		},
	});

	// Match RFQ-00018 to both Verified WARM and Unclaimed Atlantic Coils (powering Claim & Convert!)
	await prisma.rfqVendorMatch.upsert({
		where: {
			rfqId_companyId: {
				rfqId: rfq1.id,
				companyId: warmCompany.id,
			},
		},
		update: {},
		create: {
			rfqId: rfq1.id,
			companyId: warmCompany.id,
			status: RfqMatchStatus.NOTIFIED,
			matchScore: 98,
			matchReason:
				'Verified Pro Rolling Mill · Supplies Lagos · SON MANCAP Certified',
			notifiedAt: new Date(),
		},
	});

	await prisma.rfqVendorMatch.upsert({
		where: {
			rfqId_companyId: {
				rfqId: rfq1.id,
				companyId: atlanticCoilsUnclaimed.id,
			},
		},
		update: {},
		create: {
			rfqId: rfq1.id,
			companyId: atlanticCoilsUnclaimed.id,
			status: RfqMatchStatus.MATCHED,
			matchScore: 82,
			matchReason:
				'Matched Coil Importer in Lagos (Unclaimed — Claim teaser queued)',
		},
	});

	// 9. Update PlatformStats Singleton
	const [activeVerticals, indexedCompanies, verifiedSuppliers, openRfqsCount] =
		await Promise.all([
			prisma.vertical.count({ where: { status: VerticalStatus.ACTIVE } }),
			prisma.company.count({ where: { isPublished: true } }),
			prisma.company.count({
				where: {
					isPublished: true,
					verificationTier: { not: VerificationTier.UNVERIFIED },
				},
			}),
			prisma.rfq.count({
				where: { status: { in: [RfqStatus.OPEN, RfqStatus.QUOTING] } },
			}),
		]);

	await prisma.platformStats.upsert({
		where: { id: 'singleton' },
		update: {
			activeVerticals,
			indexedCompanies,
			verifiedSuppliers,
			openRfqsCount,
		},
		create: {
			id: 'singleton',
			activeVerticals,
			indexedCompanies,
			verifiedSuppliers,
			openRfqsCount,
			monthlyReaders: 14200,
		},
	});

	console.log(
		`✅ Seed complete: ${activeVerticals} active vertical, ${indexedCompanies} companies (${verifiedSuppliers} verified), ${openRfqsCount} live RFQs.`
	);
}

main()
	.catch((err) => {
		console.error('❌ Seed failed:', err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});

