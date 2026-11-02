import 'server-only';
import { ResourceType } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import type {
	CreateKnowledgeResourceInput,
	UnlockResourceLeadInput,
} from '@/lib/validators/learn.validator';

export async function listVerticalResources(params: {
	verticalId: string;
	type?: ResourceType;
	query?: string;
}) {
	if (!prisma.knowledgeResource) {
		return [];
	}
	return prisma.knowledgeResource.findMany({
		where: {
			isPublished: true,
			OR: [{ verticalId: params.verticalId }, { verticalId: null }],
			...(params.type ? { type: params.type } : {}),
			...(params.query
				? {
						AND: [
							{
								OR: [
									{
										title: {
											contains: params.query,
											mode: 'insensitive',
										},
									},
									{
										summary: {
											contains: params.query,
											mode: 'insensitive',
										},
									},
								],
							},
						],
					}
				: {}),
		},
		orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
		include: {
			vertical: { select: { id: true, name: true, slug: true } },
			category: { select: { id: true, name: true, slug: true } },
			sponsorCompany: {
				select: {
					id: true,
					name: true,
					slug: true,
					verificationTier: true,
				},
			},
			_count: { select: { leads: true } },
		},
	});
}

export async function listMacroResources(params?: {
	verticalSlug?: string;
	type?: ResourceType;
	query?: string;
}) {
	if (!prisma.knowledgeResource) {
		return [];
	}
	return prisma.knowledgeResource.findMany({
		where: {
			isPublished: true,
			...(params?.verticalSlug
				? { vertical: { slug: params.verticalSlug } }
				: {}),
			...(params?.type ? { type: params.type } : {}),
			...(params?.query
				? {
						OR: [
							{
								title: {
									contains: params.query,
									mode: 'insensitive',
								},
							},
							{
								summary: {
									contains: params.query,
									mode: 'insensitive',
								},
							},
						],
					}
				: {}),
		},
		orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
		include: {
			vertical: {
				select: { id: true, name: true, slug: true, themeColor: true },
			},
			category: { select: { id: true, name: true, slug: true } },
			sponsorCompany: {
				select: {
					id: true,
					name: true,
					slug: true,
					verificationTier: true,
				},
			},
			_count: { select: { leads: true } },
		},
	});
}

export async function getResourceForReader(params: {
	slug: string;
	verticalId?: string;
	userId?: string;
	unlockedResourceIds?: string[];
}) {
	if (!prisma.knowledgeResource) {
		return null;
	}
	const resource = await prisma.knowledgeResource.findFirst({
		where: {
			slug: params.slug,
			isPublished: true,
			...(params.verticalId
				? {
						OR: [
							{ verticalId: params.verticalId },
							{ verticalId: null },
						],
					}
				: {}),
		},
		include: {
			vertical: { select: { id: true, name: true, slug: true } },
			category: {
				select: { id: true, name: true, slug: true, defaultUnit: true },
			},
			sponsorCompany: {
				select: {
					id: true,
					name: true,
					slug: true,
					verificationTier: true,
					headquartersState: true,
				},
			},
			_count: { select: { leads: true } },
		},
	});

	if (!resource) return null;

	let isUnlocked = !resource.isGated;

	if (!isUnlocked && params.unlockedResourceIds?.includes(resource.id)) {
		isUnlocked = true;
	}

	if (!isUnlocked && params.userId) {
		const existingLead = await prisma.resourceLead.findFirst({
			where: {
				resourceId: resource.id,
				userId: params.userId,
			},
			select: { id: true },
		});
		if (existingLead) {
			isUnlocked = true;
		}
	}

	return {
		id: resource.id,
		title: resource.title,
		slug: resource.slug,
		summary: resource.summary,
		contentPreview: resource.contentPreview,
		fullContentMarkdown: isUnlocked ? resource.fullContentMarkdown : null,
		fileUrl: isUnlocked ? resource.fileUrl : null,
		hasDownloadableFile: Boolean(resource.fileUrl),
		type: resource.type,
		isGated: resource.isGated,
		isFeatured: resource.isFeatured,
		isUnlocked,
		pageCount: resource.pageCount,
		downloadCount: resource.downloadCount,
		publishedAt: resource.publishedAt,
		vertical: resource.vertical,
		category: resource.category,
		sponsorCompany: resource.sponsorCompany,
		leadsCount: resource._count.leads,
	};
}

export async function captureLeadAndUnlockResource(
	input: UnlockResourceLeadInput,
	userId?: string
) {
	const resource = await prisma.knowledgeResource.findUnique({
		where: { id: input.resourceId },
	});

	if (!resource || !resource.isPublished) {
		throw new Error('Knowledge resource not found.');
	}

	await prisma.$transaction([
		prisma.resourceLead.create({
			data: {
				resourceId: resource.id,
				userId: userId ?? null,
				fullName: input.fullName,
				workEmail: input.workEmail.toLowerCase(),
				phone: input.phone,
				companyName: input.companyName,
				jobTitle: input.jobTitle,
				businessRole: input.businessRole ?? null,
				procurementTimeline: input.procurementTimeline || null,
				estimatedBudgetBand: input.estimatedBudgetBand || null,
				deliveryState: input.deliveryState || null,
			},
		}),
		prisma.knowledgeResource.update({
			where: { id: resource.id },
			data: { downloadCount: { increment: 1 } },
		}),
	]);

	return {
		resourceId: resource.id,
		slug: resource.slug,
		verticalId: resource.verticalId,
		fullContentMarkdown: resource.fullContentMarkdown,
		fileUrl: resource.fileUrl,
	};
}

export async function listAdminResourcesAndLeads() {
	if (!prisma.knowledgeResource || !prisma.resourceLead) {
		return { resources: [], leads: [] };
	}
	const [resources, leads] = await Promise.all([
		prisma.knowledgeResource.findMany({
			orderBy: { createdAt: 'desc' },
			take: 50,
			include: {
				vertical: { select: { name: true, slug: true } },
				category: { select: { name: true } },
				sponsorCompany: { select: { name: true } },
				_count: { select: { leads: true } },
			},
		}),
		prisma.resourceLead.findMany({
			orderBy: { createdAt: 'desc' },
			take: 60,
			include: {
				resource: {
					select: {
						title: true,
						slug: true,
						type: true,
						vertical: { select: { name: true, slug: true } },
					},
				},
			},
		}),
	]);

	return { resources, leads };
}

export async function createKnowledgeResource(
	input: CreateKnowledgeResourceInput
) {
	return prisma.knowledgeResource.create({
		data: {
			verticalId: input.verticalId || null,
			categoryId: input.categoryId || null,
			sponsorCompanyId: input.sponsorCompanyId || null,
			title: input.title,
			slug: input.slug,
			summary: input.summary,
			contentPreview: input.contentPreview,
			fullContentMarkdown: input.fullContentMarkdown,
			fileUrl: input.fileUrl || null,
			type: input.type,
			isGated: input.isGated,
			isFeatured: input.isFeatured,
			pageCount: input.pageCount ?? null,
			isPublished: true,
			publishedAt: new Date(),
		},
	});
}

