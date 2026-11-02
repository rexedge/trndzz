'use server';

import { revalidatePath } from 'next/cache';
import { CompanyMemberRole, UserRole } from '@prisma/client';
import { guardCompanyAccess, guardPlatformRole } from '@/lib/auth/guards';
import {
	createVendorProduct,
	seedDirectoryCompany,
	updateClaimedVendorProfile,
} from '@/lib/services/company.service';
import {
	createCompanyProductSchema,
	seedCompanySchema,
	updateVendorProfileSchema,
	type CreateCompanyProductInput,
	type SeedCompanyInput,
	type UpdateVendorProfileInput,
} from '@/lib/validators/company.validator';
import type { ActionResponse } from '@/types/actions';

export async function seedDirectoryCompanyAction(
	rawInput: SeedCompanyInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
	try {
		const guard = await guardPlatformRole([
			UserRole.SUPER_ADMIN,
			UserRole.EDITOR,
			UserRole.ANALYST,
		]);
		if (!guard.ok) return guard.response;

		const parsed = seedCompanySchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please review the directory seeding fields.',
			};
		}

		const company = await seedDirectoryCompany(parsed.data);

		revalidatePath('/');
		revalidatePath('/admin/directory');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `Indexed "${company.name}" into supplier directory.`,
			data: { id: company.id, slug: company.slug },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Could not seed directory company (slug may already exist).',
		};
	}
}

export async function updateVendorProfileAction(
	rawInput: UpdateVendorProfileInput
): Promise<ActionResponse<{ id: string }>> {
	try {
		const parsed = updateVendorProfileSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please review your company profile details.',
			};
		}

		const access = await guardCompanyAccess(parsed.data.companyId, [
			CompanyMemberRole.OWNER,
			CompanyMemberRole.ADMIN,
		]);
		if (!access.ok) return access.response;

		const updated = await updateClaimedVendorProfile(parsed.data);

		revalidatePath('/dashboard/company');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: 'Supplier profile updated successfully.',
			data: { id: updated.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Unable to update company profile.',
		};
	}
}

export async function createCompanyProductAction(
	rawInput: CreateCompanyProductInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
	try {
		const parsed = createCompanyProductSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				message:
					parsed.error.issues[0]?.message ??
					'Please complete the product catalog fields.',
			};
		}

		const access = await guardCompanyAccess(parsed.data.companyId, [
			CompanyMemberRole.OWNER,
			CompanyMemberRole.ADMIN,
		]);
		if (!access.ok) return access.response;

		const product = await createVendorProduct(parsed.data);

		revalidatePath('/dashboard/company');
		revalidatePath('/vertical/[verticalSlug]', 'layout');

		return {
			success: true,
			message: `Added "${product.name}" to catalog.`,
			data: { id: product.id, slug: product.slug },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Could not publish catalog item.',
		};
	}
}

