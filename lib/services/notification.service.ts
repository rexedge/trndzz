import 'server-only';
import {
	ClaimRequestStatus,
	ClaimStatus,
	NotificationStatus,
	NotificationType,
} from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { buildMacroUrl, buildVerticalUrl } from '@/lib/tenancy/host';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

interface DispatchPayload {
	type: NotificationType;
	recipientEmail: string;
	recipientPhone?: string | null;
	subject: string;
	textBody: string;
	htmlBody: string;
	actionUrl: string;
	companyId?: string | null;
	rfqId?: string | null;
}

function escapeHtml(raw: string): string {
	return raw
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function wrapIndustrialEmailHtml(params: {
	eyebrow: string;
	heading: string;
	paragraphs: string[];
	ctaLabel: string;
	ctaUrl: string;
	footerNote?: string;
}): string {
	const safeBody = params.paragraphs
		.map(
			(p) =>
				`<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(p)}</p>`
		)
		.join('');

	return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
    <div style="font-family:monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#d97706;margin-bottom:8px;">
      ${escapeHtml(params.eyebrow)}
    </div>
    <h1 style="margin:0 0 16px;font-size:20px;line-height:1.35;color:#0f172a;">
      ${escapeHtml(params.heading)}
    </h1>
    ${safeBody}
    <div style="margin:24px 0;">
      <a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:8px;">
        ${escapeHtml(params.ctaLabel)}
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
    <p style="margin:0;font-size:12px;color:#64748b;">
      ${escapeHtml(params.footerNote ?? 'TRNDZZ Industrial Trade Intelligence & Verified Procurement Desk')}
    </p>
  </div>
</body>
</html>`;
}

async function deliverNotificationViaProviders(payload: {
	type: NotificationType;
	recipientEmail: string;
	recipientPhone?: string | null;
	subject: string;
	textBody: string;
	htmlBody: string;
	actionUrl: string;
}): Promise<{
	status: NotificationStatus;
	providerMessageId: string | null;
	errorMessage: string | null;
}> {
	const resendKey = process.env.RESEND_API_KEY?.trim();
	const fromAddress =
		process.env.EMAIL_FROM?.trim() ||
		'Trndzz Trade Desk <onboarding@resend.dev>';
	const whatsappWebhook = process.env.WHATSAPP_ALERT_WEBHOOK_URL?.trim();

	let status: NotificationStatus = NotificationStatus.DRY_RUN_LOGGED;
	let providerMessageId: string | null = null;
	let errorMessage: string | null = null;

	if (resendKey) {
		try {
			const res = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${resendKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: fromAddress,
					to: [payload.recipientEmail],
					subject: payload.subject,
					text: payload.textBody,
					html: payload.htmlBody,
				}),
				signal: AbortSignal.timeout(6000),
			});

			if (res.ok) {
				const json = (await res.json()) as { id?: string };
				status = NotificationStatus.SENT;
				providerMessageId = json.id ?? null;
			} else {
				const errText = await res.text();
				status = NotificationStatus.FAILED;
				errorMessage = `Resend HTTP ${res.status}: ${errText.slice(0, 300)}`;
			}
		} catch (err) {
			status = NotificationStatus.FAILED;
			errorMessage =
				err instanceof Error
					? err.message
					: 'Resend network dispatch error';
		}
	}

	if (whatsappWebhook && payload.recipientPhone) {
		await fetch(whatsappWebhook, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: payload.type,
				phone: payload.recipientPhone,
				subject: payload.subject,
				message: payload.textBody,
				actionUrl: payload.actionUrl,
			}),
			signal: AbortSignal.timeout(3500),
		}).catch(() => null);
	}

	return { status, providerMessageId, errorMessage };
}

export async function sendTransactionalNotification(
	payload: DispatchPayload
): Promise<void> {
	const { status, providerMessageId, errorMessage } =
		await deliverNotificationViaProviders(payload);

	if (prisma.notificationDispatch) {
		await prisma.notificationDispatch
			.create({
				data: {
					type: payload.type,
					status,
					recipientEmail: payload.recipientEmail,
					recipientPhone: payload.recipientPhone ?? null,
					subject: payload.subject,
					bodyPreview: payload.textBody.slice(0, 1200),
					textBody: payload.textBody,
					htmlBody: payload.htmlBody,
					actionUrl: payload.actionUrl,
					companyId: payload.companyId ?? null,
					rfqId: payload.rfqId ?? null,
					providerMessageId,
					errorMessage,
					attemptCount: 1,
					lastAttemptAt: new Date(),
				},
			})
			.catch(() => null);
	}
}

export const MAX_NOTIFICATION_RETRY_ATTEMPTS = 5;

export async function retryNotificationDispatchById(dispatchId: string): Promise<{
	id: string;
	status: NotificationStatus;
	attemptCount: number;
	errorMessage: string | null;
}> {
	const existing = await prisma.notificationDispatch.findUnique({
		where: { id: dispatchId },
	});

	if (!existing) {
		throw new Error('Notification record not found.');
	}

	if (existing.status === NotificationStatus.SENT) {
		throw new Error('This notification has already been delivered.');
	}

	if (existing.attemptCount >= MAX_NOTIFICATION_RETRY_ATTEMPTS) {
		throw new Error(
			`Maximum retry limit (${MAX_NOTIFICATION_RETRY_ATTEMPTS} attempts) reached for this alert.`
		);
	}

	const textBody = existing.textBody || existing.bodyPreview;
	const htmlBody =
		existing.htmlBody ||
		wrapIndustrialEmailHtml({
			eyebrow: existing.type.replace(/_/g, ' '),
			heading: existing.subject,
			paragraphs: textBody.split('\n\n').filter(Boolean),
			ctaLabel: 'Open in Trndzz →',
			ctaUrl: existing.actionUrl,
		});

	const delivery = await deliverNotificationViaProviders({
		type: existing.type,
		recipientEmail: existing.recipientEmail,
		recipientPhone: existing.recipientPhone,
		subject: existing.subject,
		textBody,
		htmlBody,
		actionUrl: existing.actionUrl,
	});

	const updated = await prisma.notificationDispatch.update({
		where: { id: existing.id },
		data: {
			status: delivery.status,
			providerMessageId: delivery.providerMessageId,
			errorMessage: delivery.errorMessage,
			attemptCount: { increment: 1 },
			lastAttemptAt: new Date(),
		},
	});

	return {
		id: updated.id,
		status: updated.status,
		attemptCount: updated.attemptCount,
		errorMessage: updated.errorMessage,
	};
}

export async function dispatchRfqBroadcastAlerts(params: {
	rfqId: string;
	referenceNumber: string;
	title: string;
	verticalSlug: string;
	verticalName: string;
	categoryName: string;
	quantity: number;
	unit: string;
	deliveryState: string;
	specifications: Record<string, string>;
	buyerCompanyName: string;
	buyerContactEmail: string;
	matchedVendors: {
		companyId: string;
		companyName: string;
		companySlug: string;
		claimStatus: ClaimStatus;
		publicEmail: string | null;
		whatsappNumber: string | null;
		publicPhone: string | null;
	}[];
}): Promise<void> {
	const specLine = Object.entries(params.specifications)
		.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
		.join(' | ');

	const rfqPortalUrl = buildVerticalUrl(
		params.verticalSlug,
		`/rfq/${params.referenceNumber}`
	);
	const buyerDashboardUrl = buildMacroUrl('/dashboard/rfqs');

	const tasks: Promise<void>[] = [];

	// 1. Buyer Broadcast Receipt
	tasks.push(
		sendTransactionalNotification({
			type: NotificationType.RFQ_BUYER_RECEIPT,
			recipientEmail: params.buyerContactEmail,
			subject: `[${params.referenceNumber}] ${params.verticalName} RFQ Broadcast Active (${params.matchedVendors.length} Matched Suppliers)`,
			textBody: `Your structured tender "${params.title}" (${formatNumber(params.quantity)} ${params.unit}, delivery to ${params.deliveryState}) is now live and matched with ${params.matchedVendors.length} pre-qualified ${params.verticalName} suppliers.\n\nTrack incoming standardized quotes: ${buyerDashboardUrl}`,
			htmlBody: wrapIndustrialEmailHtml({
				eyebrow: `${params.referenceNumber} · Buyer Confirmation`,
				heading: `Your ${params.verticalName} RFQ Broadcast Is Active`,
				paragraphs: [
					`Tender: ${params.title} (${formatNumber(params.quantity)} ${params.unit} — Delivery: ${params.deliveryState}).`,
					specLine
						? `Locked Technical Parameters: ${specLine}`
						: `Category: ${params.categoryName}`,
					`Matched against ${params.matchedVendors.length} pre-qualified supplier profile(s). Standardized quotes will appear side-by-side in your Buyer Workspace.`,
				],
				ctaLabel: 'Monitor Incoming Quotes →',
				ctaUrl: buyerDashboardUrl,
			}),
			actionUrl: buyerDashboardUrl,
			rfqId: params.rfqId,
		})
	);

	// 2. Vendor Invites (Direct for CLAIMED vs Masked Conversion Teaser for UNCLAIMED)
	for (const vendor of params.matchedVendors) {
		if (!vendor.publicEmail) continue;

		if (vendor.claimStatus === ClaimStatus.CLAIMED) {
			tasks.push(
				sendTransactionalNotification({
					type: NotificationType.RFQ_VERIFIED_VENDOR_INVITE,
					recipientEmail: vendor.publicEmail,
					recipientPhone: vendor.whatsappNumber ?? vendor.publicPhone,
					subject: `New ${params.verticalName} Tender [${params.referenceNumber}]: ${formatNumber(params.quantity)} ${params.unit} (${params.deliveryState})`,
					textBody: `Buyer ${params.buyerCompanyName} broadcasted a structured RFQ matching ${vendor.companyName}:\n\n• Reference: ${params.referenceNumber}\n• Scope: ${params.title}\n• Volume: ${formatNumber(params.quantity)} ${params.unit}\n• Delivery State: ${params.deliveryState}\n${specLine ? `• Specs: ${specLine}\n` : ''}\nSubmit your standardized quote: ${rfqPortalUrl}`,
					htmlBody: wrapIndustrialEmailHtml({
						eyebrow: `Matched Verified Supplier Alert · ${params.referenceNumber}`,
						heading: `${formatNumber(params.quantity)} ${params.unit} ${params.categoryName} Required in ${params.deliveryState}`,
						paragraphs: [
							`Commercial buyer "${params.buyerCompanyName}" broadcasted a tender matching ${vendor.companyName}'s verified capabilities.`,
							`Scope: ${params.title}`,
							specLine
								? `Technical Specifications: ${specLine}`
								: `Category: ${params.categoryName}`,
						],
						ctaLabel: 'Inspect Specs & Submit Quote →',
						ctaUrl: rfqPortalUrl,
					}),
					actionUrl: rfqPortalUrl,
					companyId: vendor.companyId,
					rfqId: params.rfqId,
				})
			);
		} else if (vendor.claimStatus === ClaimStatus.UNCLAIMED) {
			const claimUrl = buildVerticalUrl(
				params.verticalSlug,
				`/directory/${vendor.companySlug}/claim`
			);
			tasks.push(
				sendTransactionalNotification({
					type: NotificationType.RFQ_UNCLAIMED_CLAIM_TEASER,
					recipientEmail: vendor.publicEmail,
					recipientPhone: vendor.publicPhone,
					subject: `Buyer RFQ Waiting for ${vendor.companyName}: ${formatNumber(params.quantity)} ${params.unit} ${params.categoryName} (${params.deliveryState})`,
					textBody: `A commercial buyer in ${params.deliveryState} just broadcasted a structured tender (${params.referenceNumber}) for ${formatNumber(params.quantity)} ${params.unit} of ${params.categoryName}${specLine ? ` [${specLine}]` : ''} matching ${vendor.companyName}'s directory listing.\n\nBuyer contact details are masked for unclaimed profiles. Claim and CAC-verify your company profile to view full tender documents and submit a competitive quote:\n${claimUrl}`,
					htmlBody: wrapIndustrialEmailHtml({
						eyebrow: `Unclaimed Supplier Lead Alert · ${params.verticalName}`,
						heading: `A Commercial Buyer in ${params.deliveryState} Matched With ${vendor.companyName}`,
						paragraphs: [
							`Active Tender (${params.referenceNumber}): ${formatNumber(params.quantity)} ${params.unit} of ${params.categoryName}.`,
							specLine
								? `Requested Specifications: ${specLine}`
								: `Delivery Location: ${params.deliveryState}`,
							`Buyer identity and tender attachments are masked until an authorized representative claims and verifies ${vendor.companyName}'s directory profile.`,
						],
						ctaLabel: 'Claim Profile to View & Quote →',
						ctaUrl: claimUrl,
					}),
					actionUrl: claimUrl,
					companyId: vendor.companyId,
					rfqId: params.rfqId,
				})
			);
		}
	}

	await Promise.allSettled(tasks);
}

export async function dispatchQuoteSubmittedAlert(params: {
	rfqId: string;
	referenceNumber: string;
	rfqTitle: string;
	buyerContactEmail: string;
	supplierName: string;
	supplierId: string;
	unitPrice: number;
	totalPrice: number;
	currency: string;
	unit: string;
	leadTimeDays: number;
}): Promise<void> {
	const compareUrl = buildMacroUrl('/dashboard/rfqs');
	await sendTransactionalNotification({
		type: NotificationType.RFQ_QUOTE_RECEIVED,
		recipientEmail: params.buyerContactEmail,
		subject: `New Quote on [${params.referenceNumber}] from ${params.supplierName}`,
		textBody: `${params.supplierName} submitted a formal quote on ${params.referenceNumber} (${params.rfqTitle}):\n\n• Unit Price: ${formatCurrency(params.unitPrice, params.currency)} / ${params.unit}\n• Total Lot: ${formatCurrency(params.totalPrice, params.currency)}\n• Lead Time: ${params.leadTimeDays} days\n\nCompare quotes side-by-side: ${compareUrl}`,
		htmlBody: wrapIndustrialEmailHtml({
			eyebrow: `${params.referenceNumber} · Standardized Quote Received`,
			heading: `${params.supplierName} Quoted ${formatCurrency(params.unitPrice, params.currency)} / ${params.unit}`,
			paragraphs: [
				`Tender: ${params.rfqTitle}`,
				`Total Quoted Lot: ${formatCurrency(params.totalPrice, params.currency)} · Estimated Lead Time: ${params.leadTimeDays} days.`,
				`Open your Buyer Comparison Matrix to benchmark unit rates, MOQs, payment terms, and compliance notes.`,
			],
			ctaLabel: 'Compare Quotes in Workspace →',
			ctaUrl: compareUrl,
		}),
		actionUrl: compareUrl,
		companyId: params.supplierId,
		rfqId: params.rfqId,
	});
}

export async function dispatchQuoteAwardedAlert(params: {
	rfqId: string;
	referenceNumber: string;
	rfqTitle: string;
	buyerCompanyName: string;
	buyerContactName: string;
	buyerContactEmail: string;
	buyerContactPhone: string;
	supplierId: string;
	supplierName: string;
	supplierEmail: string;
	totalPrice: number;
	currency: string;
}): Promise<void> {
	const vendorQuotesUrl = buildMacroUrl('/dashboard/quotes');
	await sendTransactionalNotification({
		type: NotificationType.RFQ_QUOTE_AWARDED,
		recipientEmail: params.supplierEmail,
		subject: `Tender Awarded [${params.referenceNumber}]: ${params.buyerCompanyName} Accepted Your Quote`,
		textBody: `Congratulations — ${params.buyerCompanyName} has accepted ${params.supplierName}'s quote (${formatCurrency(params.totalPrice, params.currency)}) on ${params.referenceNumber} (${params.rfqTitle}).\n\nBuyer Procurement Contact:\n• ${params.buyerContactName}\n• Email: ${params.buyerContactEmail}\n• Phone: ${params.buyerContactPhone}\n\nView awarded tender in Vendor Workspace: ${vendorQuotesUrl}`,
		htmlBody: wrapIndustrialEmailHtml({
			eyebrow: `${params.referenceNumber} · Tender Award Notice`,
			heading: `${params.buyerCompanyName} Awarded ${params.referenceNumber} to ${params.supplierName}`,
			paragraphs: [
				`Awarded Quote Value: ${formatCurrency(params.totalPrice, params.currency)} for "${params.rfqTitle}".`,
				`Direct Buyer Contact: ${params.buyerContactName} (${params.buyerContactEmail} · ${params.buyerContactPhone}).`,
			],
			ctaLabel: 'Open Vendor Quotes Desk →',
			ctaUrl: vendorQuotesUrl,
		}),
		actionUrl: vendorQuotesUrl,
		companyId: params.supplierId,
		rfqId: params.rfqId,
	});
}

export async function dispatchClaimReviewDecisionAlert(params: {
	companyId: string;
	companyName: string;
	workEmail: string;
	phone: string;
	decision: ClaimRequestStatus;
	verificationTier: string;
	reviewNote?: string | null;
	unlockedRfqCount: number;
}): Promise<void> {
	const workspaceUrl = buildMacroUrl('/dashboard/company');
	const isApproved = params.decision === ClaimRequestStatus.APPROVED;

	await sendTransactionalNotification({
		type: isApproved
			? NotificationType.COMPANY_CLAIM_APPROVED
			: NotificationType.COMPANY_CLAIM_REJECTED,
		recipientEmail: params.workEmail,
		recipientPhone: params.phone,
		subject: isApproved
			? `Approved: ${params.companyName} Is Now Claimed & Verified on Trndzz`
			: `Update on Your Claim Request for ${params.companyName}`,
		textBody: isApproved
			? `Your corporate ownership claim for ${params.companyName} has been approved (${params.verificationTier.replace(/_/g, ' ')}).\n\n${params.unlockedRfqCount > 0 ? `You have ${params.unlockedRfqCount} matched buyer RFQ(s) unlocked and ready for quoting.\n\n` : ''}Manage your verified storefront & catalogs: ${workspaceUrl}`
			: `Your claim request for ${params.companyName} could not be approved at this time.${params.reviewNote ? `\n\nReviewer Note: ${params.reviewNote}` : ''}\n\nYou may submit updated CAC/authorization proof from your workspace: ${buildMacroUrl('/dashboard/claims')}`,
		htmlBody: wrapIndustrialEmailHtml({
			eyebrow: isApproved
				? 'Corporate Claim Approved'
				: 'Verification Follow-Up Required',
			heading: isApproved
				? `${params.companyName} Is Now Active in Your Vendor Workspace`
				: `Additional Proof Needed for ${params.companyName}`,
			paragraphs: isApproved
				? [
						`Assigned Trust Tier: ${params.verificationTier.replace(/_/g, ' ')}.`,
						params.unlockedRfqCount > 0
							? `${params.unlockedRfqCount} previously queued buyer RFQ match(es) have been unlocked for immediate quoting.`
							: `You can now publish technical SKUs, upload datasheets, and receive instant buyer RFQ alerts.`,
					]
				: [
						params.reviewNote ||
							'Please provide an official corporate email or clear CAC registration proof.',
					],
			ctaLabel: isApproved
				? 'Open Vendor Storefront Workspace →'
				: 'Review Claim Status →',
			ctaUrl: isApproved ? workspaceUrl : buildMacroUrl('/dashboard/claims'),
		}),
		actionUrl: isApproved ? workspaceUrl : buildMacroUrl('/dashboard/claims'),
		companyId: params.companyId,
	});
}

export async function listAdminNotificationOutbox() {
	if (!prisma.notificationDispatch) {
		return {
			stats: {
				total: 0,
				sentCount: 0,
				dryRunCount: 0,
				failedCount: 0,
				claimTeasersCount: 0,
				convertedTeaserCompanies: 0,
			},
			logs: [],
		};
	}

	const [
		total,
		sentCount,
		dryRunCount,
		failedCount,
		claimTeasersCount,
		convertedTeaserCompanies,
		logs,
	] = await Promise.all([
		prisma.notificationDispatch.count(),
		prisma.notificationDispatch.count({
			where: { status: NotificationStatus.SENT },
		}),
		prisma.notificationDispatch.count({
			where: { status: NotificationStatus.DRY_RUN_LOGGED },
		}),
		prisma.notificationDispatch.count({
			where: { status: NotificationStatus.FAILED },
		}),
		prisma.notificationDispatch.count({
			where: { type: NotificationType.RFQ_UNCLAIMED_CLAIM_TEASER },
		}),
		prisma.company.count({
			where: {
				claimStatus: ClaimStatus.CLAIMED,
				notifications: {
					some: {
						type: NotificationType.RFQ_UNCLAIMED_CLAIM_TEASER,
					},
				},
			},
		}),
		prisma.notificationDispatch.findMany({
			orderBy: { createdAt: 'desc' },
			take: 80,
			include: {
				company: {
					select: { name: true, slug: true, claimStatus: true },
				},
				rfq: { select: { referenceNumber: true, title: true } },
			},
		}),
	]);

	return {
		stats: {
			total,
			sentCount,
			dryRunCount,
			failedCount,
			claimTeasersCount,
			convertedTeaserCompanies,
		},
		logs,
	};
}

