import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
	ArticleStatus,
	ArticleType,
	BusinessRole,
	ClaimStatus,
	NotificationStatus,
	NotificationType,
	PrismaClient,
	ResourceType,
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
	max: 1,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 25_000,
	keepAlive: true,
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

	const steelVertical = await prisma.vertical.upsert({
		where: { slug: 'steel' },
		update: {
			status: VerticalStatus.ACTIVE,
			themeColor: '#4F46E5',
			metaTitle:
				'Steel & TMT Rebar Trade Intelligence, Mills & RFQ Portal | Trndzz Steel',
			metaDescription:
				'Source BS4449 Grade B500B TMT rebar, galvanized coils, and structural H-beams from SON-verified mills and stockists across Nigeria & West Africa.',
		},
		create: {
			name: 'Steel',
			slug: 'steel',
			tagline:
				'Structural Steel, TMT Rebar, Flat Coils & Heavy Fabrication Hub',
			description:
				'Verified steel mills, rebar importers, structural fabricators, and wholesale tonnage benchmarks across West Africa.',
			status: VerticalStatus.ACTIVE,
			themeColor: '#4F46E5',
			iconName: 'Hammer',
			displayOrder: 2,
			metaTitle:
				'Steel & TMT Rebar Trade Intelligence, Mills & RFQ Portal | Trndzz Steel',
			metaDescription:
				'Source BS4449 Grade B500B TMT rebar, galvanized coils, and structural H-beams from SON-verified mills and stockists across Nigeria & West Africa.',
		},
	});

	const solarVertical = await prisma.vertical.upsert({
		where: { slug: 'solar' },
		update: {
			status: VerticalStatus.ACTIVE,
			themeColor: '#D97706',
			metaTitle:
				'Commercial Solar PV, Inverters, BESS & EPC Procurement Hub | Trndzz Solar',
			metaDescription:
				'Source Tier-1 N-Type TOPCon bifacial modules, C&I hybrid inverters, LFP battery storage, and verified solar EPC contractors across West Africa.',
		},
		create: {
			name: 'Solar & Clean Energy',
			slug: 'solar',
			tagline:
				'Commercial Tier-1 PV Modules, Hybrid Inverters, BESS & C&I EPCs',
			description:
				'B2B procurement portal for commercial solar developers, mini-grid operators, Tier-1 distributors, and mounting structure manufacturers.',
			status: VerticalStatus.ACTIVE,
			themeColor: '#D97706',
			iconName: 'Sun',
			displayOrder: 3,
			metaTitle:
				'Commercial Solar PV, Inverters, BESS & EPC Procurement Hub | Trndzz Solar',
			metaDescription:
				'Source Tier-1 N-Type TOPCon bifacial modules, C&I hybrid inverters, LFP battery storage, and verified solar EPC contractors across West Africa.',
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
		update: {
			datasheetUrl:
				'/api/documents/datasheet/aa3003-055mm-stucco-prepainted-coil',
		},
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
			datasheetUrl:
				'/api/documents/datasheet/aa3003-055mm-stucco-prepainted-coil',
		},
	});

	await prisma.companyProduct.upsert({
		where: {
			companyId_slug: {
				companyId: lagosExtrusions.id,
				slug: 'aa6063-t6-anodized-solar-mounting-rail-4200mm',
			},
		},
		update: {
			datasheetUrl:
				'/api/documents/datasheet/aa6063-t6-anodized-solar-mounting-rail-4200mm',
		},
		create: {
			companyId: lagosExtrusions.id,
			verticalId: aluminiumVertical.id,
			categoryId: catExtrusions.id,
			name: 'AA6063-T6 Matt-Anodized Solar PV Roof-Mount Rail (4.2m)',
			slug: 'aa6063-t6-anodized-solar-mounting-rail-4200mm',
			description:
				'High-tensile structural extrusion profile with 15-micron clear anodic film for industrial standing-seam and trapezoidal roof solar arrays.',
			specifications: {
				alloy_temper: 'AA6063-T6',
				surface_treatment: 'Matt Silver Anodized (15μm)',
				wall_thickness_mm: '2.0',
			},
			unit: 'MT',
			minOrderQty: '1.500',
			indicativeMin: '5450000.0000',
			indicativeMax: '5720000.0000',
			currency: 'NGN',
			datasheetUrl:
				'/api/documents/datasheet/aa6063-t6-anodized-solar-mounting-rail-4200mm',
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

	// =========================================================================
	// 8B. Vertical #2: Steel (steel.trndzz.com) — Zero-Overhead Replication
	// =========================================================================
	const steelUpstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: { verticalId: steelVertical.id, slug: 'upstream' },
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			name: 'Upstream: Scrap Recovery, Sponge Iron & Billets',
			slug: 'upstream',
			streamPosition: StreamPosition.UPSTREAM,
			description:
				'Ferrous scrap aggregation, DRI/sponge iron, and imported prime continuous-cast steel billets.',
			displayOrder: 1,
		},
	});

	const steelMidstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: steelVertical.id,
				slug: 'midstream',
			},
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			name: 'Midstream: TMT Rolling Mills, HRC/CRC & Galvanizing',
			slug: 'midstream',
			streamPosition: StreamPosition.MIDSTREAM,
			description:
				'Thermo-mechanically treated (TMT) reinforcement bar rolling, hot/cold rolled coils, and hot-dip galvanizing lines.',
			displayOrder: 2,
		},
	});

	const steelDownstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: steelVertical.id,
				slug: 'downstream',
			},
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			name: 'Downstream: Structural Steelwork, Cut-and-Bend & EPCs',
			slug: 'downstream',
			streamPosition: StreamPosition.DOWNSTREAM,
			description:
				'Portal frame warehouse fabrication, automated rebar cut-and-bend service centers, and heavy civil steel erection.',
			displayOrder: 3,
		},
	});

	await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: steelVertical.id,
				slug: 'cross-stream',
			},
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			name: 'Cross-Stream: NDT Tensile Labs, Welding & Heavy Haulage',
			slug: 'cross-stream',
			streamPosition: StreamPosition.CROSS_STREAM,
			description:
				'SON tensile verification labs, submerged-arc welding consumables, and flatbed trailer logistics.',
			displayOrder: 4,
		},
	});

	const catRebar = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: steelVertical.id,
				slug: 'tmt-reinforcement-rebar',
			},
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			valueChainStageId: steelMidstream.id,
			name: 'TMT Reinforcement Bars (Rebar)',
			slug: 'tmt-reinforcement-rebar',
			description:
				'BS4449 / NIS 117 high-yield thermo-mechanically treated deformed bars (8mm–32mm) in 12m lengths.',
			defaultUnit: 'MT',
			displayOrder: 1,
		},
	});

	const catStructuralSteel = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: steelVertical.id,
				slug: 'structural-sections-plates',
			},
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			valueChainStageId: steelDownstream.id,
			name: 'Structural H-Beams, IPE Sections & Mild Steel Plates',
			slug: 'structural-sections-plates',
			description:
				'S275JR / S355JR universal beams, columns, channels, hollow sections, and chequered plates.',
			defaultUnit: 'MT',
			displayOrder: 2,
		},
	});

	const catGalvSteel = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: steelVertical.id,
				slug: 'galvanized-hot-rolled-coils',
			},
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			valueChainStageId: steelUpstream.id,
			name: 'Hot-Rolled, Cold-Rolled & Galvanized Steel Coils',
			slug: 'galvanized-hot-rolled-coils',
			description:
				'Z120–Z275 hot-dip galvanized coils, Z-purlin strip, and pickled/oiled hot-rolled coils.',
			defaultUnit: 'MT',
			displayOrder: 3,
		},
	});

	for (const def of [
		{
			categoryId: catRebar.id,
			key: 'rebar_diameter_mm',
			label: 'Bar Diameter',
			unit: 'mm',
			options: ['10', '12', '16', '20', '25', '32'],
			isRequired: true,
			displayOrder: 1,
		},
		{
			categoryId: catRebar.id,
			key: 'steel_grade',
			label: 'Standard & Yield Grade',
			unit: null,
			options: [
				'BS4449 Grade B500B (500 MPa)',
				'NIS 117 Fe500D',
				'ASTM A615 Grade 60',
			],
			isRequired: true,
			displayOrder: 2,
		},
		{
			categoryId: catStructuralSteel.id,
			key: 'structural_grade',
			label: 'Structural Steel Grade',
			unit: null,
			options: ['EN 10025 S275JR', 'EN 10025 S355JR', 'ASTM A36'],
			isRequired: true,
			displayOrder: 1,
		},
	]) {
		await prisma.specAttributeDefinition.upsert({
			where: {
				verticalId_categoryId_key: {
					verticalId: steelVertical.id,
					categoryId: def.categoryId,
					key: def.key,
				},
			},
			update: { options: def.options },
			create: {
				verticalId: steelVertical.id,
				categoryId: def.categoryId,
				key: def.key,
				label: def.label,
				unit: def.unit,
				inputType: SpecInputType.SELECT,
				options: def.options,
				isRequired: def.isRequired,
				isFilterable: true,
				displayOrder: def.displayOrder,
			},
		});
	}

	const indSteelRebarNg = await prisma.commodityIndicator.upsert({
		where: { code: 'NG_TMT_REBAR_16MM' },
		update: {
			latestPrice: '1345000.0000',
			previousPrice: '1315000.0000',
			changePercent: '2.2814',
		},
		create: {
			verticalId: steelVertical.id,
			code: 'NG_TMT_REBAR_16MM',
			name: 'BS4449 B500B 16mm TMT Rebar (Ogun Ex-Mill)',
			unit: 'MT',
			currency: 'NGN',
			latestPrice: '1345000.0000',
			previousPrice: '1315000.0000',
			changePercent: '2.2814',
			sourceLabel: 'Trndzz Mill Desk',
			displayOrder: 1,
		},
	});

	const indLmeRebar = await prisma.commodityIndicator.upsert({
		where: { code: 'LME_STEEL_REBAR' },
		update: {
			latestPrice: '584.0000',
			previousPrice: '578.5000',
			changePercent: '0.9507',
		},
		create: {
			verticalId: steelVertical.id,
			code: 'LME_STEEL_REBAR',
			name: 'LME Steel Rebar FOB Benchmark',
			unit: 'MT',
			currency: 'USD',
			latestPrice: '584.0000',
			previousPrice: '578.5000',
			changePercent: '0.9507',
			sourceLabel: 'LME',
			displayOrder: 2,
		},
	});

	for (const ind of [
		{ id: indSteelRebarNg.id, base: 1295000, step: 8200 },
		{ id: indLmeRebar.id, base: 568, step: 2.6 },
	]) {
		const pts = await prisma.commodityPricePoint.count({
			where: { indicatorId: ind.id },
		});
		if (pts === 0) {
			await prisma.commodityPricePoint.createMany({
				data: Array.from({ length: 7 }, (_, idx) => ({
					indicatorId: ind.id,
					price: (ind.base + idx * ind.step).toFixed(4),
					recordedAt: new Date(Date.now() - (6 - idx) * 2 * 86_400_000),
				})),
			});
		}
	}

	const nigerDeltaSteel = await prisma.company.upsert({
		where: { slug: 'nigerdelta-integrated-steel-mills' },
		update: {},
		create: {
			name: 'NigerDelta Integrated Steel & Rolling Mills Plc',
			slug: 'nigerdelta-integrated-steel-mills',
			tagline:
				'Continuous billet casting and automated Tempcore BS4449 Grade B500B TMT rebar mill in Sagamu.',
			description:
				'SON NIS-117 certified integrated rolling facility operating a 40-ton EAF/LRF furnace and high-speed Tempcore quenching line producing full-length 12m high-yield deformed reinforcement bars (10mm–32mm) with batch spectrometer MTCs.',
			businessRoles: [BusinessRole.MANUFACTURER],
			claimStatus: ClaimStatus.CLAIMED,
			verificationTier: VerificationTier.VERIFIED_PRO,
			headquartersState: 'Ogun',
			city: 'Sagamu Interchange Industrial Corridor',
			coverageStates: [
				'Ogun',
				'Lagos',
				'Abuja FCT',
				'Oyo',
				'Rivers',
				'Edo',
			],
			yearEstablished: 2011,
			employeeCountRange: '500+',
			productionCapacity: '180,000 MT/yr TMT Rolling & Billet Casting',
			minimumOrderSummary: '30 MT (1 trailer load)',
			rcNumber: 'RC-918304',
			publicEmail: 'tenders@nigerdeltasteel.example.ng',
			publicPhone: '+2348094443300',
			verifiedAt: new Date(),
		},
	});

	const apapaStructuralUnclaimed = await prisma.company.upsert({
		where: { slug: 'apapa-structural-beams-plate-stockists' },
		update: {},
		create: {
			name: 'Apapa Structural Beams & Heavy Plate Stockists Ltd',
			slug: 'apapa-structural-beams-plate-stockists',
			tagline:
				'Importer and stockist of EN 10025 S355JR universal H-beams, IPE sections, and mild steel plates.',
			description:
				'Heavy steel stockyard supplying EPC warehouse fabricators, bridge contractors, and oilfield marine yards across Lagos, Ogun, and Rivers State.',
			businessRoles: [BusinessRole.IMPORTER, BusinessRole.DISTRIBUTOR],
			claimStatus: ClaimStatus.UNCLAIMED,
			verificationTier: VerificationTier.UNVERIFIED,
			headquartersState: 'Lagos',
			city: 'Iganmu / Apapa',
			coverageStates: ['Lagos', 'Ogun', 'Rivers', 'Delta', 'Abuja FCT'],
			yearEstablished: 2015,
			productionCapacity: '12,000 MT Yard Stock Capacity',
			minimumOrderSummary: '10 MT mixed sections',
			publicEmail: 'sales@apapasteelstockists.example.ng',
		},
	});

	for (const sLink of [
		{
			companyId: nigerDeltaSteel.id,
			streams: [StreamPosition.UPSTREAM, StreamPosition.MIDSTREAM],
			cats: [catRebar.id, catGalvSteel.id],
		},
		{
			companyId: apapaStructuralUnclaimed.id,
			streams: [StreamPosition.DOWNSTREAM],
			cats: [catStructuralSteel.id, catGalvSteel.id],
		},
	]) {
		await prisma.companyVertical.upsert({
			where: {
				companyId_verticalId: {
					companyId: sLink.companyId,
					verticalId: steelVertical.id,
				},
			},
			update: { streamPositions: sLink.streams },
			create: {
				companyId: sLink.companyId,
				verticalId: steelVertical.id,
				streamPositions: sLink.streams,
				isPrimary: true,
			},
		});
		for (const cid of sLink.cats) {
			await prisma.companyCategory.upsert({
				where: {
					companyId_categoryId: {
						companyId: sLink.companyId,
						categoryId: cid,
					},
				},
				update: {},
				create: { companyId: sLink.companyId, categoryId: cid },
			});
		}
	}

	const ndCertCount = await prisma.companyCertification.count({
		where: { companyId: nigerDeltaSteel.id },
	});
	if (ndCertCount === 0) {
		await prisma.companyCertification.create({
			data: {
				companyId: nigerDeltaSteel.id,
				name: 'SON MANCAP NIS 117:2022 High-Yield Steel Bars',
				issuer: 'Standards Organisation of Nigeria',
				certificateNumber: 'MANCAP-STL-44219',
				isVerified: true,
			},
		});
	}

	await prisma.companyProduct.upsert({
		where: {
			companyId_slug: {
				companyId: nigerDeltaSteel.id,
				slug: 'bs4449-b500b-16mm-tempcore-tmt-rebar-12m',
			},
		},
		update: {
			datasheetUrl:
				'/api/documents/datasheet/bs4449-b500b-16mm-tempcore-tmt-rebar-12m',
		},
		create: {
			companyId: nigerDeltaSteel.id,
			verticalId: steelVertical.id,
			categoryId: catRebar.id,
			name: 'BS4449 Grade B500B 16mm Tempcore TMT Rebar (Full 12m)',
			slug: 'bs4449-b500b-16mm-tempcore-tmt-rebar-12m',
			description:
				'Guaranteed 500 MPa minimum yield strength and full nominal cross-sectional mass (+/- 4.5% BS4449 tolerance) with spectrometer Mill Test Certificate.',
			specifications: {
				rebar_diameter_mm: '16',
				steel_grade: 'BS4449 Grade B500B (500 MPa)',
			},
			unit: 'MT',
			minOrderQty: '30.000',
			indicativeMin: '1335000.0000',
			indicativeMax: '1365000.0000',
			currency: 'NGN',
			datasheetUrl:
				'/api/documents/datasheet/bs4449-b500b-16mm-tempcore-tmt-rebar-12m',
		},
	});

	const steelArticle = await prisma.article.upsert({
		where: {
			slug: 'son-enforces-strict-nominal-diameter-audits-tmt-rebar-high-rise-sites',
		},
		update: {},
		create: {
			verticalId: steelVertical.id,
			valueChainStageId: steelMidstream.id,
			categoryId: catRebar.id,
			title: 'SON Intensifies Unannounced Tensile & Nominal-Mass Audits on 16mm–25mm TMT Rebar Deliveries',
			slug: 'son-enforces-strict-nominal-diameter-audits-tmt-rebar-high-rise-sites',
			excerpt:
				'Tier-1 civil contractors in Lagos and Abuja shift exclusively to spectrometer-certified BS4449 Grade B500B mills as undersized commercial rods face site impoundment.',
			body: `## Zero Tolerance on Sub-Gauge Reinforcement Steel\n\nStructural engineers and commercial developers across Victoria Island, Ikoyi, and Eko Atlantic have tightened incoming rebar inspection protocols, requiring batch-matched **Mill Test Certificates (MTCs)** and independent vernier mass-per-meter verification prior to offloading.\n\nSON-certified Tempcore rolling mills along the Ogun industrial corridor report a 22% surge in direct mill-gate RFQ inquiries as buyers bypass unverified open-market middlemen.`,
			type: ArticleType.POLICY_REGULATORY,
			status: ArticleStatus.PUBLISHED,
			isMacroFeatured: true,
			isVerticalPinned: true,
			authorId: editorialAdmin.id,
			publishedAt: new Date(Date.now() - 8 * 3600_000),
		},
	});

	await prisma.articleCompanyMention.upsert({
		where: {
			articleId_companyId: {
				articleId: steelArticle.id,
				companyId: nigerDeltaSteel.id,
			},
		},
		update: {},
		create: {
			articleId: steelArticle.id,
			companyId: nigerDeltaSteel.id,
			contextLabel: 'NIS 117 Certified Tempcore Mill',
			displayOrder: 1,
		},
	});

	const steelRfq = await prisma.rfq.upsert({
		where: { referenceNumber: 'RFQ-STE-2026-00007' },
		update: {},
		create: {
			referenceNumber: 'RFQ-STE-2026-00007',
			verticalId: steelVertical.id,
			valueChainStageId: steelMidstream.id,
			categoryId: catRebar.id,
			buyerId: sampleBuyer.id,
			buyerCompanyName: 'Eko Commercial Developments Ltd',
			buyerContactName: 'Engr. Tunde Adeyemi',
			buyerContactEmail: 'procurement@ekodevelopments.ng',
			buyerContactPhone: '+2348030001122',
			title: '120 MT BS4449 Grade B500B TMT Rebar (60 MT 16mm + 60 MT 20mm)',
			specifications: {
				rebar_diameter_mm: '16',
				steel_grade: 'BS4449 Grade B500B (500 MPa)',
			},
			additionalNotes:
				'Podium slab & pile-cap reinforcement for commercial tower in Ikoyi. Strict 12.0m full lengths and NIS 117 / BS4449 MTC mandatory.',
			quantity: '120.000',
			unit: 'MT',
			targetUnitPrice: '1330000.0000',
			currency: 'NGN',
			deliveryState: 'Lagos',
			deliveryCity: 'Ikoyi',
			requiredByDate: new Date(Date.now() + 18 * 86_400_000),
			visibility: RfqVisibility.PUBLIC_BOARD,
			status: RfqStatus.OPEN,
			preferredRoles: [BusinessRole.MANUFACTURER],
			sourceArticleId: steelArticle.id,
			expiresAt: new Date(Date.now() + 14 * 86_400_000),
		},
	});

	await prisma.rfqVendorMatch.upsert({
		where: {
			rfqId_companyId: {
				rfqId: steelRfq.id,
				companyId: nigerDeltaSteel.id,
			},
		},
		update: {},
		create: {
			rfqId: steelRfq.id,
			companyId: nigerDeltaSteel.id,
			status: RfqMatchStatus.NOTIFIED,
			matchScore: 99,
			matchReason:
				'Verified Pro Tempcore Mill · Supplies Lagos · NIS 117 Certified',
			notifiedAt: new Date(),
		},
	});

	// =========================================================================
	// 8C. Vertical #3: Solar & Clean Energy (solar.trndzz.com)
	// =========================================================================
	const solarUpstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: { verticalId: solarVertical.id, slug: 'upstream' },
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			name: 'Upstream: Polysilicon, N-Type Cells & Lithium Carbonate',
			slug: 'upstream',
			streamPosition: StreamPosition.UPSTREAM,
			description:
				'Global polysilicon indices, N-Type TOPCon wafer pricing, and LFP battery cell supply chains.',
			displayOrder: 1,
		},
	});

	const solarMidstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: solarVertical.id,
				slug: 'midstream',
			},
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			name: 'Midstream: Tier-1 PV Modules, C&I Inverters & BESS OEMs',
			slug: 'midstream',
			streamPosition: StreamPosition.MIDSTREAM,
			description:
				'Authorized Tier-1 module importers, three-phase hybrid/string inverters, and containerized LFP storage.',
			displayOrder: 2,
		},
	});

	const solarDownstream = await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: solarVertical.id,
				slug: 'downstream',
			},
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			name: 'Downstream: C&I Solar EPCs, Mini-Grids & PPA Developers',
			slug: 'downstream',
			streamPosition: StreamPosition.DOWNSTREAM,
			description:
				'Commercial & industrial rooftop/carport EPC contractors, rural mini-grid operators, and energy-as-a-service developers.',
			displayOrder: 3,
		},
	});

	await prisma.valueChainStage.upsert({
		where: {
			verticalId_slug: {
				verticalId: solarVertical.id,
				slug: 'cross-stream',
			},
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			name: 'Cross-Stream: Aluminium Racking, Bos Switchgear & Green Finance',
			slug: 'cross-stream',
			streamPosition: StreamPosition.CROSS_STREAM,
			description:
				'Anodized mounting rails, DC combiners, MV transformers, and DFI clean-energy credit lines.',
			displayOrder: 4,
		},
	});

	const catPvModules = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: solarVertical.id,
				slug: 'tier1-bifacial-pv-modules',
			},
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			valueChainStageId: solarMidstream.id,
			name: 'Tier-1 Bifacial N-Type PV Modules',
			slug: 'tier1-bifacial-pv-modules',
			description:
				'550Wp–620Wp N-Type TOPCon & Mono-PERC dual-glass bifacial modules in pallet and container quantities.',
			defaultUnit: 'Panels',
			displayOrder: 1,
		},
	});

	const catInvertersBess = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: solarVertical.id,
				slug: 'commercial-inverters-lfp-bess',
			},
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			valueChainStageId: solarMidstream.id,
			name: 'C&I Hybrid Inverters & LFP Battery Storage (BESS)',
			slug: 'commercial-inverters-lfp-bess',
			description:
				'50kW–250kW 3-phase hybrid inverters and 100kWh–2MWh liquid-cooled LFP battery cabinets.',
			defaultUnit: 'Units',
			displayOrder: 2,
		},
	});

	const catSolarEpc = await prisma.category.upsert({
		where: {
			verticalId_slug: {
				verticalId: solarVertical.id,
				slug: 'ci-solar-epc-racking',
			},
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			valueChainStageId: solarDownstream.id,
			name: 'C&I Solar Turnkey EPC & Aluminium Racking Systems',
			slug: 'ci-solar-epc-racking',
			description:
				'Turnkey engineering, procurement, roof-mount racking, and diesel-genset synchronization.',
			defaultUnit: 'kWp',
			displayOrder: 3,
		},
	});

	for (const def of [
		{
			categoryId: catPvModules.id,
			key: 'wattage_wp',
			label: 'Module Rated Power',
			unit: 'Wp',
			options: ['550Wp', '580Wp', '590Wp', '615Wp', '625Wp'],
			isRequired: true,
			displayOrder: 1,
		},
		{
			categoryId: catPvModules.id,
			key: 'cell_technology',
			label: 'Cell Architecture',
			unit: null,
			options: [
				'N-Type TOPCon Bifacial Dual-Glass',
				'Mono PERC Half-Cut',
				'N-Type Back-Contact (BC)',
			],
			isRequired: true,
			displayOrder: 2,
		},
		{
			categoryId: catInvertersBess.id,
			key: 'bess_capacity_kwh',
			label: 'Storage / Inverter Rating',
			unit: null,
			options: [
				'50kW / 100kWh C&I Cabinet',
				'100kW / 215kWh Outdoor Liquid-Cooled',
				'250kW / 500kWh Industrial Skid',
				'100kW 3-Phase String Inverter Only',
			],
			isRequired: true,
			displayOrder: 1,
		},
	]) {
		await prisma.specAttributeDefinition.upsert({
			where: {
				verticalId_categoryId_key: {
					verticalId: solarVertical.id,
					categoryId: def.categoryId,
					key: def.key,
				},
			},
			update: { options: def.options },
			create: {
				verticalId: solarVertical.id,
				categoryId: def.categoryId,
				key: def.key,
				label: def.label,
				unit: def.unit,
				inputType: SpecInputType.SELECT,
				options: def.options,
				isRequired: def.isRequired,
				isFilterable: true,
				displayOrder: def.displayOrder,
			},
		});
	}

	const indSolarPanelNg = await prisma.commodityIndicator.upsert({
		where: { code: 'NG_TOPCON_580W_PANEL' },
		update: {
			latestPrice: '168500.0000',
			previousPrice: '174000.0000',
			changePercent: '-3.1609',
		},
		create: {
			verticalId: solarVertical.id,
			code: 'NG_TOPCON_580W_PANEL',
			name: 'Tier-1 580Wp N-Type Bifacial (Lagos Pallet Ex-Whse)',
			unit: 'Panel',
			currency: 'NGN',
			latestPrice: '168500.0000',
			previousPrice: '174000.0000',
			changePercent: '-3.1609',
			sourceLabel: 'Trndzz Solar Desk',
			displayOrder: 1,
		},
	});

	const indGlobalTopcon = await prisma.commodityIndicator.upsert({
		where: { code: 'GLOBAL_TOPCON_FOB_WP' },
		update: {
			latestPrice: '0.0920',
			previousPrice: '0.0950',
			changePercent: '-3.1579',
		},
		create: {
			verticalId: solarVertical.id,
			code: 'GLOBAL_TOPCON_FOB_WP',
			name: 'Global N-Type TOPCon Module Spot FOB',
			unit: 'Wp',
			currency: 'USD',
			latestPrice: '0.0920',
			previousPrice: '0.0950',
			changePercent: '-3.1579',
			sourceLabel: 'PV Spot Index',
			displayOrder: 2,
		},
	});

	for (const ind of [
		{ id: indSolarPanelNg.id, base: 179000, step: -1750 },
		{ id: indGlobalTopcon.id, base: 0.098, step: -0.001 },
	]) {
		const pts = await prisma.commodityPricePoint.count({
			where: { indicatorId: ind.id },
		});
		if (pts === 0) {
			await prisma.commodityPricePoint.createMany({
				data: Array.from({ length: 7 }, (_, idx) => ({
					indicatorId: ind.id,
					price: Math.max(0.05, ind.base + idx * ind.step).toFixed(4),
					recordedAt: new Date(Date.now() - (6 - idx) * 2 * 86_400_000),
				})),
			});
		}
	}

	const heliosSolar = await prisma.company.upsert({
		where: { slug: 'helioswest-commercial-solar-bess-distribution' },
		update: {},
		create: {
			name: 'HeliosWest Commercial Solar & BESS Distribution Ltd',
			slug: 'helioswest-commercial-solar-bess-distribution',
			tagline:
				'Authorized West African bonded distributor of Tier-1 580Wp–620Wp TOPCon modules and 215kWh LFP BESS.',
			description:
				'Direct OEM distribution partner maintaining 18 MW of bonded PV module inventory and liquid-cooled commercial battery cabinets in Ikeja and Lekki Free Zone with flash-test serial traceability.',
			businessRoles: [BusinessRole.IMPORTER, BusinessRole.DISTRIBUTOR],
			claimStatus: ClaimStatus.CLAIMED,
			verificationTier: VerificationTier.VERIFIED_PRO,
			headquartersState: 'Lagos',
			city: 'Lekki Free Zone / Ikeja',
			coverageStates: [
				'Lagos',
				'Abuja FCT',
				'Kano',
				'Ogun',
				'Rivers',
				'Oyo',
			],
			yearEstablished: 2017,
			employeeCountRange: '50-200',
			productionCapacity: '65 MW/yr Module & BESS Throughput',
			minimumOrderSummary: '1 Pallet (36 Panels) / 1 BESS Skid',
			rcNumber: 'RC-1409821',
			publicEmail: 'b2b@helioswest.example.ng',
			publicPhone: '+2348097776600',
			verifiedAt: new Date(),
		},
	});

	const sunBridgeUnclaimed = await prisma.company.upsert({
		where: { slug: 'sunbridge-industrial-epc-minigrids-abuja' },
		update: {},
		create: {
			name: 'SunBridge Industrial Solar EPC & Mini-Grids Ltd',
			slug: 'sunbridge-industrial-epc-minigrids-abuja',
			tagline:
				'COREN/NEMSA-licensed C&I rooftop solar EPC serving agro-processing plants, hospitals, and cold chains.',
			description:
				'Engineering, procurement, and commissioning contractor delivering 250kWp to 3.5MWp hybrid solar-diesel-BESS microgrids across Abuja FCT, Kaduna, Kano, and Plateau.',
			businessRoles: [
				BusinessRole.FABRICATOR_INSTALLER,
				BusinessRole.SERVICE_PROVIDER,
			],
			claimStatus: ClaimStatus.UNCLAIMED,
			verificationTier: VerificationTier.UNVERIFIED,
			headquartersState: 'Abuja FCT',
			city: 'Idu Industrial District',
			coverageStates: ['Abuja FCT', 'Kaduna', 'Kano', 'Niger', 'Nasarawa'],
			yearEstablished: 2019,
			productionCapacity: '15 MWp/yr Commissioned C&I Capacity',
			minimumOrderSummary: '100 kWp Turnkey EPC',
			publicEmail: 'projects@sunbridge-epc.example.ng',
		},
	});

	for (const solLink of [
		{
			companyId: heliosSolar.id,
			streams: [StreamPosition.UPSTREAM, StreamPosition.MIDSTREAM],
			cats: [catPvModules.id, catInvertersBess.id],
			isPrimary: true,
		},
		{
			companyId: sunBridgeUnclaimed.id,
			streams: [StreamPosition.DOWNSTREAM],
			cats: [catSolarEpc.id, catInvertersBess.id],
			isPrimary: true,
		},
		{
			// Cross-sector manufacturer! Lagos Architectural Extrusions supplies Solar Cross-Stream racking
			companyId: lagosExtrusions.id,
			streams: [StreamPosition.CROSS_STREAM],
			cats: [catSolarEpc.id],
			isPrimary: false,
		},
	]) {
		await prisma.companyVertical.upsert({
			where: {
				companyId_verticalId: {
					companyId: solLink.companyId,
					verticalId: solarVertical.id,
				},
			},
			update: { streamPositions: solLink.streams },
			create: {
				companyId: solLink.companyId,
				verticalId: solarVertical.id,
				streamPositions: solLink.streams,
				isPrimary: solLink.isPrimary,
			},
		});
		for (const cid of solLink.cats) {
			await prisma.companyCategory.upsert({
				where: {
					companyId_categoryId: {
						companyId: solLink.companyId,
						categoryId: cid,
					},
				},
				update: {},
				create: { companyId: solLink.companyId, categoryId: cid },
			});
		}
	}

	const heliosCertCount = await prisma.companyCertification.count({
		where: { companyId: heliosSolar.id },
	});
	if (heliosCertCount === 0) {
		await prisma.companyCertification.create({
			data: {
				companyId: heliosSolar.id,
				name: 'SONCAP & IEC 61215 / IEC 61730 Tier-1 PV Compliance',
				issuer: 'SON / TÜV Rheinland',
				certificateNumber: 'SONCAP-PV-77410',
				isVerified: true,
			},
		});
	}

	await prisma.companyProduct.upsert({
		where: {
			companyId_slug: {
				companyId: heliosSolar.id,
				slug: '580wp-ntype-topcon-bifacial-dual-glass-pallet',
			},
		},
		update: {
			datasheetUrl:
				'/api/documents/datasheet/580wp-ntype-topcon-bifacial-dual-glass-pallet',
		},
		create: {
			companyId: heliosSolar.id,
			verticalId: solarVertical.id,
			categoryId: catPvModules.id,
			name: '580Wp N-Type TOPCon Bifacial Dual-Glass PV Module (36-pc Pallet)',
			slug: '580wp-ntype-topcon-bifacial-dual-glass-pallet',
			description:
				'22.5% module efficiency, <1% first-year LID degradation, 30-year linear power warranty, with factory EL + flash-test report per container.',
			specifications: {
				wattage_wp: '580Wp',
				cell_technology: 'N-Type TOPCon Bifacial Dual-Glass',
			},
			unit: 'Panels',
			minOrderQty: '36.000',
			indicativeMin: '166000.0000',
			indicativeMax: '172500.0000',
			currency: 'NGN',
			datasheetUrl:
				'/api/documents/datasheet/580wp-ntype-topcon-bifacial-dual-glass-pallet',
		},
	});

	await prisma.companyProduct.upsert({
		where: {
			companyId_slug: {
				companyId: heliosSolar.id,
				slug: '100kw-215kwh-liquid-cooled-lfp-ci-bess-cabinet',
			},
		},
		update: {
			datasheetUrl:
				'/api/documents/datasheet/100kw-215kwh-liquid-cooled-lfp-ci-bess-cabinet',
		},
		create: {
			companyId: heliosSolar.id,
			verticalId: solarVertical.id,
			categoryId: catInvertersBess.id,
			name: '100kW / 215kWh Outdoor Liquid-Cooled LFP C&I BESS Cabinet',
			slug: '100kw-215kwh-liquid-cooled-lfp-ci-bess-cabinet',
			description:
				'All-in-one IP55 outdoor commercial energy storage cabinet with aerosol fire suppression, EMS diesel-sync controller, and 6,000-cycle LFP cells.',
			specifications: {
				bess_capacity_kwh: '100kW / 215kWh Outdoor Liquid-Cooled',
			},
			unit: 'Units',
			minOrderQty: '1.000',
			indicativeMin: '74500000.0000',
			indicativeMax: '79000000.0000',
			currency: 'NGN',
			datasheetUrl:
				'/api/documents/datasheet/100kw-215kwh-liquid-cooled-lfp-ci-bess-cabinet',
		},
	});

	const solarArticle = await prisma.article.upsert({
		where: {
			slug: 'manufacturers-pair-580w-topcon-arrays-215kwh-lfp-bess-cut-diesel-spend',
		},
		update: {},
		create: {
			verticalId: solarVertical.id,
			valueChainStageId: solarMidstream.id,
			categoryId: catPvModules.id,
			title: 'Sub-USD 0.10/Wp Global TOPCon Pricing Accelerates 1MW+ Factory Solar-BESS Retrofits Across Ogun & Kano',
			slug: 'manufacturers-pair-580w-topcon-arrays-215kwh-lfp-bess-cut-diesel-spend',
			excerpt:
				'Lower landed Naira cost per watt-peak and modular 215kWh liquid-cooled LFP cabinets compress industrial payback horizons below 3.4 years.',
			body: `## Industrial C&I Buyers Lock In Pallet & Container PV Allocations\n\nPlastics extruders, beverage bottlers, and cold-room operators facing Band-A tariff adjustments and volatile AGO diesel logistics are issuing structured multi-lot tenders for **580Wp–615Wp N-Type TOPCon bifacial modules** paired with **215kWh outdoor LFP storage skids**.\n\nProcurement teams increasingly require OEM serial-number verification and local bonded-warehouse warranties prior to releasing advance LC or Naira milestone payments.`,
			type: ArticleType.PRICE_ANALYSIS,
			status: ArticleStatus.PUBLISHED,
			isMacroFeatured: true,
			isVerticalPinned: true,
			authorId: editorialAdmin.id,
			publishedAt: new Date(Date.now() - 5 * 3600_000),
		},
	});

	await prisma.articleCompanyMention.upsert({
		where: {
			articleId_companyId: {
				articleId: solarArticle.id,
				companyId: heliosSolar.id,
			},
		},
		update: {},
		create: {
			articleId: solarArticle.id,
			companyId: heliosSolar.id,
			contextLabel: 'Verified Tier-1 PV & BESS Distributor',
			displayOrder: 1,
		},
	});

	const solarRfq = await prisma.rfq.upsert({
		where: { referenceNumber: 'RFQ-SOL-2026-00011' },
		update: {},
		create: {
			referenceNumber: 'RFQ-SOL-2026-00011',
			verticalId: solarVertical.id,
			valueChainStageId: solarMidstream.id,
			categoryId: catPvModules.id,
			buyerId: sampleBuyer.id,
			buyerCompanyName: 'Eko Commercial Developments Ltd',
			buyerContactName: 'Engr. Tunde Adeyemi',
			buyerContactEmail: 'procurement@ekodevelopments.ng',
			buyerContactPhone: '+2348030001122',
			title: '1,080 Panels (626 kWp) 580Wp N-Type TOPCon Bifacial Modules — Ex-Lagos',
			specifications: {
				wattage_wp: '580Wp',
				cell_technology: 'N-Type TOPCon Bifacial Dual-Glass',
			},
			additionalNotes:
				'30 pallets required for Phase 1 rooftop C&I array in Ikeja. Must supply factory flash-test CSV and SONCAP certificate.',
			quantity: '1080.000',
			unit: 'Panels',
			targetUnitPrice: '167000.0000',
			currency: 'NGN',
			deliveryState: 'Lagos',
			deliveryCity: 'Ikeja Industrial Estate',
			requiredByDate: new Date(Date.now() + 25 * 86_400_000),
			visibility: RfqVisibility.PUBLIC_BOARD,
			status: RfqStatus.OPEN,
			preferredRoles: [BusinessRole.IMPORTER, BusinessRole.DISTRIBUTOR],
			sourceArticleId: solarArticle.id,
			expiresAt: new Date(Date.now() + 14 * 86_400_000),
		},
	});

	await prisma.rfqVendorMatch.upsert({
		where: {
			rfqId_companyId: {
				rfqId: solarRfq.id,
				companyId: heliosSolar.id,
			},
		},
		update: {},
		create: {
			rfqId: solarRfq.id,
			companyId: heliosSolar.id,
			status: RfqMatchStatus.NOTIFIED,
			matchScore: 97,
			matchReason:
				'Verified Pro Tier-1 PV Distributor · Bonded Stock in Lagos',
			notifiedAt: new Date(),
		},
	});

	// =========================================================================
	// 8D. Pillar 4: Trndzz Learn — Gated Whitepapers & Sector Outlook Dossiers
	// =========================================================================
	const aluGuide = await prisma.knowledgeResource.upsert({
		where: {
			slug: 'son-nis-488-aluminium-roofing-coil-specification-corrosion-guide',
		},
		update: {
			fileUrl:
				'/api/documents/dossier/son-nis-488-aluminium-roofing-coil-specification-corrosion-guide',
		},
		create: {
			verticalId: aluminiumVertical.id,
			categoryId: catCoils.id,
			sponsorCompanyId: warmCompany.id,
			title: 'SON NIS 488:2021 Aluminium Roofing Coil Specification & Coastal Corrosion Engineering Guide',
			slug: 'son-nis-488-aluminium-roofing-coil-specification-corrosion-guide',
			summary:
				'Technical procurement handbook comparing AA1100 vs AA3003 vs AA3105 alloys, PVDF vs polyester paint microns, and micrometer tolerance checks for commercial roofing tenders.',
			contentPreview: `### Executive Summary (Ungated Preview)\n\nAcross coastal industrial zones such as Lekki, Port Harcourt, and Warri, premature chalking and pitting of commercial warehouse roofs stems from two preventable procurement errors:\n\n1. **Substituting AA1100 for Mn-alloyed AA3003-H14** on wide-span industrial trusses.\n2. **Accepting nominal gauge invoices without bare-metal micrometer verification** (where 0.48mm total coated thickness is misrepresented as 0.55mm).\n\nUnlock the complete 28-page engineering dossier below for full alloy mechanical tables, paint DFT salt-spray benchmarks, and ready-to-copy RFQ tender clauses.`,
			fullContentMarkdown: `## 1. Alloy Selection Matrix for West African Climates\n\n| Alloy & Temper | Ultimate Tensile Strength | Yield Strength | Recommended Application |\n| :--- | :--- | :--- | :--- |\n| **AA1100-H14** | 110–145 MPa | 95 MPa | Residential flashing & light interior ceiling strips |\n| **AA3003-H14** | 140–180 MPa | 125 MPa | Industrial longspan warehouses, step-tile estates, coastal factories |\n| **AA3105-H16** | 160–205 MPa | 145 MPa | High-wind portal frames & heavy architectural standing-seam |\n\n## 2. Coating Chemistry: RMP Polyester vs. 70% Kynar PVDF\n\n- **Regular Modified Polyester (18–20 microns topcoat / 5–7 microns backer):** Standard commercial specification for inland states (Abuja FCT, Kano, Oyo, Enugu) with 10–12 year colour retention.\n- **PVDF Fluorocarbon (25+ microns):** Recommended within 5 km of Atlantic shoreline or petrochemical corridors due to superior UV and acid-mist resistance.\n\n## 3. Incoming Inspection Checklist for Procurement Managers\n\n1. Require **Mill Test Certificate (MTC)** referencing heat/coil batch numbers.\n2. Verify **Total Coated Thickness (TCT)** vs **Base Metal Thickness (BMT)** using calibrated digital micrometers across three coil edges.\n3. Perform MEK solvent rub test (minimum 100 double rubs for cured polyester/PVDF lines).\n4. Confirm valid **SON MANCAP** certificate number against the rolling mill's corporate RC registration.`,
			fileUrl:
				'/api/documents/dossier/son-nis-488-aluminium-roofing-coil-specification-corrosion-guide',
			type: ResourceType.REGULATORY_GUIDE,
			isGated: true,
			isFeatured: true,
			pageCount: 28,
			downloadCount: 142,
		},
	});

	await prisma.knowledgeResource.upsert({
		where: {
			slug: 'west-africa-aluminium-extrusion-coil-market-outlook-q4-2026',
		},
		update: {
			fileUrl:
				'/api/documents/dossier/west-africa-aluminium-extrusion-coil-market-outlook-q4-2026',
		},
		create: {
			verticalId: aluminiumVertical.id,
			categoryId: catExtrusions.id,
			title: 'West Africa Aluminium Extrusion, Billet & Coil Market Outlook (2026–2027)',
			slug: 'west-africa-aluminium-extrusion-coil-market-outlook-q4-2026',
			summary:
				'Quarterly supply-demand analysis covering LME Cash spreads, Nigerian cold-rolling utilization, scrap-to-billet remelt economics, and solar mounting rail demand.',
			contentPreview: `### Key Intelligence Highlights\n\n- Domestic AA6063 extrusion press utilization rose 19% YoY on surging demand from **commercial curtain-wall facades** and **rooftop PV mounting rails**.\n- Regional Naira coil spreads have stabilized within a tighter corridor as mills adopt shorter 7-day price validity windows.\n\nComplete the corporate verification gate to read full state-by-state capacity tables and 2027 price scenarios.`,
			fullContentMarkdown: `## Regional Capacity & Utilization Breakdown\n\nInstalled extrusion and colour-coating capacity across the **Lagos–Ogun**, **Onitsha–Nnewi**, and **Kano** industrial axes now exceeds **210,000 MT/year**, though effective utilization varies sharply with gas supply reliability and primary ingot/coil working-capital financing.\n\n### Strategic Takeaways for Commercial Buyers\n\n- **Split Frame Contracts:** Lock extrusion conversion fees in Naira while indexing billet/ingot raw material components transparently to LME 3-Month averages.\n- **Local Die Tooling:** Lead times for custom architectural mullions and PV clamps average 12–16 business days domestically vs. 9–11 weeks for Asian FCL shipments.`,
			fileUrl:
				'/api/documents/dossier/west-africa-aluminium-extrusion-coil-market-outlook-q4-2026',
			type: ResourceType.SECTOR_REPORT,
			isGated: true,
			isFeatured: false,
			pageCount: 36,
			downloadCount: 98,
		},
	});

	await prisma.knowledgeResource.upsert({
		where: {
			slug: 'bs4449-grade-b500b-tmt-rebar-quality-audit-playbook',
		},
		update: {
			fileUrl:
				'/api/documents/dossier/bs4449-grade-b500b-tmt-rebar-quality-audit-playbook',
		},
		create: {
			verticalId: steelVertical.id,
			categoryId: catRebar.id,
			sponsorCompanyId: nigerDeltaSteel.id,
			title: 'BS4449 Grade B500B TMT Rebar Verification & Mill Test Audit Playbook for Civil Contractors',
			slug: 'bs4449-grade-b500b-tmt-rebar-quality-audit-playbook',
			summary:
				'Practical site-engineering guide to mass-per-meter tolerances, Tempcore martensitic rim verification, carbon-equivalent weldability, and eliminating sub-gauge rebar risk.',
			contentPreview: `### Why Mass-Per-Meter Beats Visual Caliper Checks\n\nRib geometry manipulation can make an undersized 14.7mm bar read close to 16mm across ribs—yet deliver **15% less steel cross-sectional area** in critical columns and transfer beams.\n\nUnlock the full whitepaper for exact BS4449 / NIS 117 weight-per-12m-bar acceptance tables and mandatory RFQ clauses.`,
			fullContentMarkdown: `## Nominal Mass-Per-Meter Reference Table (BS4449 / NIS 117)\n\n| Nominal Diameter | Standard Mass (kg/m) | Full 12m Bar Weight (kg) | Bars per Metric Ton (Approx.) |\n| :--- | :--- | :--- | :--- |\n| **12 mm** | 0.888 kg/m | 10.66 kg | ~94 bars |\n| **16 mm** | 1.578 kg/m | 18.94 kg | ~53 bars |\n| **20 mm** | 2.466 kg/m | 29.59 kg | ~34 bars |\n| **25 mm** | 3.853 kg/m | 46.24 kg | ~21.6 bars |\n\n## Mandatory Spectrometer & Tensile Clauses\n\n1. **Yield Strength (ReH):** Minimum 500 MPa.\n2. **Tensile/Yield Ratio (Rm/ReH):** Minimum 1.08 (B500B ductility class).\n3. **Carbon Equivalent Value (CEV):** Maximum 0.50% for safe site lap/butt welding.`,
			fileUrl:
				'/api/documents/dossier/bs4449-grade-b500b-tmt-rebar-quality-audit-playbook',
			type: ResourceType.WHITEPAPER,
			isGated: true,
			isFeatured: true,
			pageCount: 22,
			downloadCount: 116,
		},
	});

	await prisma.knowledgeResource.upsert({
		where: {
			slug: 'ci-factory-diesel-to-solar-bess-lcoe-capex-benchmark-2026',
		},
		update: {
			fileUrl:
				'/api/documents/dossier/ci-factory-diesel-to-solar-bess-lcoe-capex-benchmark-2026',
		},
		create: {
			verticalId: solarVertical.id,
			categoryId: catInvertersBess.id,
			sponsorCompanyId: heliosSolar.id,
			title: 'Nigerian Factory Diesel-to-Solar-BESS Capex & LCOE Benchmarking Report (500kWp–5MWp)',
			slug: 'ci-factory-diesel-to-solar-bess-lcoe-capex-benchmark-2026',
			summary:
				'Financial and engineering model comparing Band-A grid + AGO diesel hybrid costs against N-Type TOPCon rooftop arrays paired with liquid-cooled LFP storage.',
			contentPreview: `### Executive Benchmark\n\nAt landed AGO diesel prices above ₦1,250/litre, self-generated diesel power costs industrial facilities **₦385–₦460/kWh**, compared with a 10-year levelized solar PV + BESS cost of **₦145–₦190/kWh**.\n\nUnlock the complete dossier for EPC BoQ cost breakdowns, inverter sizing ratios, and warranty bankability criteria.`,
			fullContentMarkdown: `## Capex Breakdown for a 1.0 MWp + 430 kWh C&I Hybrid System\n\n- **Tier-1 N-Type TOPCon 580Wp Modules:** ~29% of turnkey capex\n- **Liquid-Cooled LFP BESS + Hybrid PCS:** ~36% of turnkey capex\n- **AA6063-T6 Aluminium Roof Racking & Clamps:** ~9% of turnkey capex\n- **MV/LV Switchgear,PV/Genset Sync Controller & Cabling:** ~15% of turnkey capex\n- **Civil, Engineering, NEMSA Testing & Commissioning:** ~11% of turnkey capex\n\n## Procurement Bankability Rules\n\n1. Require container-level OEM serial lists verifiable directly with the module manufacturer.\n2. Specify liquid-cooled IP55 outdoor LFP cabinets over air-cooled indoor racks where ambient factory temperatures exceed 34°C.`,
			fileUrl:
				'/api/documents/dossier/ci-factory-diesel-to-solar-bess-lcoe-capex-benchmark-2026',
			type: ResourceType.SECTOR_REPORT,
			isGated: true,
			isFeatured: true,
			pageCount: 34,
			downloadCount: 184,
		},
	});

	// Sample captured ResourceLead for Admin Learn Analytics demonstration
	const existingLeads = await prisma.resourceLead.count({
		where: { resourceId: aluGuide.id },
	});
	if (existingLeads === 0) {
		await prisma.resourceLead.create({
			data: {
				resourceId: aluGuide.id,
				userId: sampleBuyer.id,
				fullName: 'Engr. Tunde Adeyemi',
				workEmail: 'procurement@ekodevelopments.ng',
				phone: '+2348030001122',
				companyName: 'Eko Commercial Developments Ltd',
				jobTitle: 'Head of Procurement',
				businessRole: BusinessRole.FABRICATOR_INSTALLER,
				procurementTimeline: 'Immediate (0–30 Days)',
				estimatedBudgetBand: '₦100M – ₦500M',
				deliveryState: 'Lagos',
			},
		});
	}

	// Sample DRY_RUN_LOGGED NotificationDispatch entries for /admin/notifications
	const existingDispatches = await prisma.notificationDispatch.count();
	if (existingDispatches === 0) {
		await prisma.notificationDispatch.createMany({
			data: [
				{
					type: NotificationType.RFQ_BUYER_RECEIPT,
					status: NotificationStatus.DRY_RUN_LOGGED,
					recipientEmail: 'procurement@ekodevelopments.ng',
					subject:
						'[RFQ-ALU-2026-00018] Aluminium RFQ Broadcast Active (2 Matched Suppliers)',
					bodyPreview:
						'Your structured tender "25 MT of 0.55mm AA3003 Stucco-Embossed Coils (Bush Green & Ivory)" is now live and matched with 2 pre-qualified Aluminium suppliers.',
					actionUrl: 'http://localhost:3000/dashboard/rfqs',
					rfqId: rfq1.id,
				},
				{
					type: NotificationType.RFQ_VERIFIED_VENDOR_INVITE,
					status: NotificationStatus.DRY_RUN_LOGGED,
					recipientEmail: 'commercial@warm-aluminium.ng',
					recipientPhone: '+2348091112200',
					subject:
						'New Aluminium Tender [RFQ-ALU-2026-00018]: 25 MT (Lagos)',
					bodyPreview:
						'Buyer Eko Commercial Developments Ltd broadcasted a structured RFQ matching West African Rolling Mills Plc (25 MT AA3003 0.55mm Stucco Coils).',
					actionUrl:
						'http://aluminium.localhost:3000/rfq/RFQ-ALU-2026-00018',
					companyId: warmCompany.id,
					rfqId: rfq1.id,
				},
				{
					type: NotificationType.RFQ_UNCLAIMED_CLAIM_TEASER,
					status: NotificationStatus.DRY_RUN_LOGGED,
					recipientEmail: 'info@atlanticcoils-ng.example',
					subject:
						'Buyer RFQ Waiting for Atlantic Coils & Metals Impex Ltd: 25 MT Aluminium Coils & Flat Rolled Sheets (Lagos)',
					bodyPreview:
						'A commercial buyer in Lagos just broadcasted RFQ-ALU-2026-00018 for 25 MT matching your directory listing. Claim and CAC-verify your profile to unlock buyer details and quote.',
					actionUrl:
						'http://aluminium.localhost:3000/directory/atlantic-coils-metals-lagos/claim',
					companyId: atlanticCoilsUnclaimed.id,
					rfqId: rfq1.id,
				},
			],
		});
	}

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

