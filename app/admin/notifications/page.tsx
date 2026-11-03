import { NotificationStatus, NotificationType } from '@prisma/client';
import { BellRing, CheckCircle2, ExternalLink, Info, MailWarning, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { requirePlatformStaff } from '@/lib/auth/guards';
import { listAdminNotificationOutbox } from '@/lib/services/notification.service';
import { formatDate, formatNumber } from '@/lib/utils/format';

function statusBadgeVariant(
	status: NotificationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
	switch (status) {
		case NotificationStatus.SENT:
			return 'default';
		case NotificationStatus.DRY_RUN_LOGGED:
			return 'secondary';
		case NotificationStatus.FAILED:
			return 'destructive';
		default:
			return 'outline';
	}
}

function formatTypeLabel(type: NotificationType): string {
	switch (type) {
		case NotificationType.RFQ_BUYER_RECEIPT:
			return 'Buyer RFQ Receipt';
		case NotificationType.RFQ_VERIFIED_VENDOR_INVITE:
			return 'Verified Vendor Invite';
		case NotificationType.RFQ_UNCLAIMED_CLAIM_TEASER:
			return 'Claim & Convert Teaser';
		case NotificationType.RFQ_QUOTE_RECEIVED:
			return 'Quote Received Alert';
		case NotificationType.RFQ_QUOTE_AWARDED:
			return 'Tender Award Notice';
		case NotificationType.COMPANY_CLAIM_APPROVED:
			return 'Claim Approved';
		case NotificationType.COMPANY_CLAIM_REJECTED:
			return 'Claim Follow-Up';
	}
}

export default async function AdminNotificationsOutboxPage() {
	await requirePlatformStaff();

	const isResendConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
	const isWhatsappConfigured = Boolean(
		process.env.WHATSAPP_ALERT_WEBHOOK_URL?.trim()
	);
	const { stats, logs } = await listAdminNotificationOutbox();

	return (
		<div className='space-y-8'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Transactional Alert Outbox & Claim Funnel
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Audit buyer RFQ broadcasts, verified vendor invites, and
						unclaimed directory &ldquo;Claim &amp; Convert&rdquo;
						teaser alerts.
					</p>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<Badge
						variant={isResendConfigured ? 'default' : 'secondary'}
						className='gap-1.5 py-1'
					>
						{isResendConfigured ? (
							<CheckCircle2 className='h-3.5 w-3.5' />
						) : (
							<Terminal className='h-3.5 w-3.5' />
						)}
						<span>
							Email:{' '}
							{isResendConfigured
								? 'Resend Live'
								: 'Local Dry-Run Outbox'}
						</span>
					</Badge>
					<Badge
						variant={isWhatsappConfigured ? 'default' : 'outline'}
						className='py-1'
					>
						WhatsApp Webhook:{' '}
						{isWhatsappConfigured ? 'Connected' : 'Optional / Off'}
					</Badge>
				</div>
			</div>

			{!isResendConfigured && (
				<div className='flex items-start gap-3 rounded-xl border border-amber/40 bg-amber/10 p-4 text-xs leading-relaxed text-foreground'>
					<Info className='mt-0.5 h-4 w-4 shrink-0 text-amber' />
					<div>
						<p className='font-semibold'>
							Pre-Launch Local Outbox Mode Active (
							<code className='font-mono'>DRY_RUN_LOGGED</code>)
						</p>
						<p className='mt-0.5 text-muted-foreground'>
							Because no live domain or{' '}
							<code className='font-mono'>RESEND_API_KEY</code> is
							configured yet, every RFQ broadcast, quote alert,
							and &ldquo;Claim This Business&rdquo; conversion
							email is safely captured below with local{' '}
							<code className='font-mono'>*.localhost:3000</code>{' '}
							deep links so you can test the entire conversion
							loop end-to-end before going live.
						</p>
					</div>
				</div>
			)}

			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<div className='rounded-xl border border-border bg-card p-5'>
					<div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
						<span>Total Dispatches</span>
						<BellRing className='h-4 w-4 text-primary' />
					</div>
					<p className='font-tabular mt-2.5 text-3xl font-bold'>
						{formatNumber(stats.total)}
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						{formatNumber(stats.sentCount)} live ·{' '}
						{formatNumber(stats.dryRunCount)} dry-run logged
					</p>
				</div>

				<div className='rounded-xl border border-border bg-card p-5'>
					<div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
						<span>Claim-Teaser Alerts</span>
						<CheckCircle2 className='h-4 w-4 text-amber' />
					</div>
					<p className='font-tabular mt-2.5 text-3xl font-bold'>
						{formatNumber(stats.claimTeasersCount)}
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Masked buyer RFQ invites sent to UNCLAIMED vendors
					</p>
				</div>

				<div className='rounded-xl border border-border bg-card p-5'>
					<div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
						<span>Teaser → Claimed</span>
						<CheckCircle2 className='h-4 w-4 text-verified' />
					</div>
					<p className='font-tabular mt-2.5 text-3xl font-bold text-verified'>
						{formatNumber(stats.convertedTeaserCompanies)}
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Previously unclaimed vendors now CAC-verified
					</p>
				</div>

				<div className='rounded-xl border border-border bg-card p-5'>
					<div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
						<span>Delivery Failures</span>
						<MailWarning className='h-4 w-4 text-destructive' />
					</div>
					<p className='font-tabular mt-2.5 text-3xl font-bold'>
						{formatNumber(stats.failedCount)}
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Non-blocking errors logged for retry/audit
					</p>
				</div>
			</div>

			<section className='space-y-4 rounded-2xl border border-border bg-card p-6'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-bold'>
						Recent Notification Dispatches ({logs.length})
					</h2>
				</div>

				{logs.length === 0 ? (
					<div className='rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
						No notification dispatches recorded yet. Broadcast an
						RFQ, submit a supplier quote, or review a CAC claim to
						populate the outbox.
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Timestamp</TableHead>
								<TableHead>Event Type</TableHead>
								<TableHead>Recipient & Entity</TableHead>
								<TableHead>Subject & Preview</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='text-right'>
									Deep Link
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{logs.map((row) => (
								<TableRow key={row.id}>
									<TableCell className='font-tabular whitespace-nowrap text-xs text-muted-foreground'>
										{formatDate(row.createdAt)}
									</TableCell>
									<TableCell>
										<Badge variant='outline' className='text-xs'>
											{formatTypeLabel(row.type)}
										</Badge>
										{row.rfq && (
											<span className='font-tabular mt-1 block text-[11px] text-muted-foreground'>
												{row.rfq.referenceNumber}
											</span>
										)}
									</TableCell>
									<TableCell className='text-xs'>
										<div className='font-medium'>
											{row.recipientEmail}
										</div>
										{row.company && (
											<div className='text-muted-foreground'>
												{row.company.name} (
												{row.company.claimStatus})
											</div>
										)}
									</TableCell>
									<TableCell className='max-w-md'>
										<p className='truncate text-xs font-semibold'>
											{row.subject}
										</p>
										<p className='line-clamp-2 text-[11px] text-muted-foreground'>
											{row.bodyPreview}
										</p>
										{row.errorMessage && (
											<p className='mt-1 text-[11px] font-medium text-destructive'>
												{row.errorMessage}
											</p>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={statusBadgeVariant(
												row.status
											)}
											className='font-tabular text-[11px]'
										>
											{row.status}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										{row.actionUrl ? (
											<a
												href={row.actionUrl}
												className='inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline'
											>
												<span>Open</span>
												<ExternalLink className='h-3 w-3' />
											</a>
										) : (
											<span className='text-xs text-muted-foreground'>
												—
											</span>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</section>
		</div>
	);
}

