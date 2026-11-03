import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

function escapeHtml(raw: string): string {
	return raw
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderDocumentShell(params: {
	badge: string;
	title: string;
	subtitle: string;
	metaRows: [string, string][];
	bodyHtml: string;
}): string {
	const metaGrid = params.metaRows
		.map(
			([k, v]) =>
				`<div style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;">
					<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;">${escapeHtml(k)}</div>
					<div style="margin-top:4px;font-family:ui-monospace,Consolas,monospace;font-size:13px;font-weight:700;color:#0f172a;">${escapeHtml(v)}</div>
				</div>`
		)
		.join('');

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${escapeHtml(params.title)} — TRNDZZ Technical Document</title>
	<style>
		@media print { .no-print { display: none !important; } body { background: #fff !important; padding: 0 !important; } }
	</style>
</head>
<body style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:Inter,-apple-system,Segoe UI,sans-serif;color:#0f172a;">
	<div style="max-width:820px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;padding:36px;">
		<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid #0f172a;padding-bottom:18px;">
			<div>
				<div style="font-family:ui-monospace,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#d97706;">
					${escapeHtml(params.badge)}
				</div>
				<h1 style="margin:6px 0 6px;font-size:22px;line-height:1.3;">${escapeHtml(params.title)}</h1>
				<p style="margin:0;font-size:13px;color:#475569;">${escapeHtml(params.subtitle)}</p>
			</div>
			<button class="no-print" onclick="window.print()" style="cursor:pointer;background:#1d4ed8;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:12px;font-weight:700;white-space:nowrap;">
				Print / Save PDF
			</button>
		</div>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:10px;margin:22px 0;">
			${metaGrid}
		</div>

		<div style="font-size:14px;line-height:1.65;color:#1e293b;">
			${params.bodyHtml}
		</div>

		<div style="margin-top:32px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;display:flex;justify-content:space-between;">
			<span>TRNDZZ Industrial Trade Intelligence &amp; Verified Supplier Registry</span>
			<span>Generated ${new Date().toISOString().slice(0, 10)}</span>
		</div>
	</div>
</body>
</html>`;
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ kind: string; slug: string }> }
) {
	const { kind, slug } = await params;

	if (kind === 'datasheet') {
		const product = await prisma.companyProduct.findFirst({
			where: { slug, isActive: true },
			include: {
				category: { select: { name: true } },
				vertical: { select: { name: true } },
				company: {
					select: {
						name: true,
						rcNumber: true,
						headquartersState: true,
						verificationTier: true,
						certifications: {
							where: { isVerified: true },
							select: { name: true, certificateNumber: true },
						},
					},
				},
			},
		});

		if (!product) {
			return new NextResponse('Technical Data Sheet not found', {
				status: 404,
			});
		}

		const specs =
			(product.specifications as Record<string, string> | null) ?? {};
		const specRows = Object.entries(specs)
			.map(
				([k, v]) =>
					`<tr>
						<td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;text-transform:capitalize;">${escapeHtml(k.replace(/_/g, ' '))}</td>
						<td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-family:ui-monospace,Consolas,monospace;">${escapeHtml(String(v))}</td>
					</tr>`
			)
			.join('');

		const certList = product.company.certifications
			.map(
				(c) =>
					`<li><strong>${escapeHtml(c.name)}</strong>${c.certificateNumber ? ` — Ref: <code>${escapeHtml(c.certificateNumber)}</code>` : ''}</li>`
			)
			.join('');

		const priceBand =
			product.indicativeMin && product.indicativeMax
				? `${formatCurrency(Number(product.indicativeMin), product.currency)} – ${formatCurrency(Number(product.indicativeMax), product.currency)} / ${product.unit}`
				: 'Request Formal Quote';

		const html = renderDocumentShell({
			badge: `${product.vertical.name} · Technical Data Sheet (TDS)`,
			title: product.name,
			subtitle: `Issued by ${product.company.name} (${product.company.headquartersState}) · Category: ${product.category.name}`,
			metaRows: [
				[
					'Supplier Trust Tier',
					product.company.verificationTier.replace(/_/g, ' '),
				],
				['CAC Reg / RC', product.company.rcNumber || 'On File'],
				[
					'Minimum Order (MOQ)',
					product.minOrderQty
						? `${formatNumber(Number(product.minOrderQty))} ${product.unit}`
						: `Standard ${product.unit}`,
				],
				['Indicative Ex-Works Band', priceBand],
			],
			bodyHtml: `
				${product.description ? `<p>${escapeHtml(product.description)}</p>` : ''}
				<h2 style="font-size:15px;margin:20px 0 8px;"> Certified Technical Parameters</h2>
				<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:13px;">
					<thead>
						<tr style="background:#f8fafc;text-align:left;">
							<th style="padding:9px 12px;border-bottom:1px solid #cbd5e1;">Parameter</th>
							<th style="padding:9px 12px;border-bottom:1px solid #cbd5e1;">Certified Value</th>
						</tr>
					</thead>
					<tbody>${specRows || '<tr><td colspan="2" style="padding:10px;">Standard mill specification</td></tr>'}</tbody>
				</table>
				${certList ? `<h2 style="font-size:15px;margin:20px 0 8px;">Verified Quality Certifications</h2><ul>${certList}</ul>` : ''}
			`,
		});

		return new NextResponse(html, {
			status: 200,
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
	}

	if (kind === 'dossier' && prisma.knowledgeResource) {
		const resource = await prisma.knowledgeResource.findUnique({
			where: { slug },
			include: {
				vertical: { select: { name: true } },
				sponsorCompany: { select: { name: true } },
			},
		});

		if (!resource || !resource.isPublished) {
			return new NextResponse('Technical Dossier not found', {
				status: 404,
			});
		}

		const paragraphs = resource.fullContentMarkdown
			.split('\n\n')
			.map((block) => `<p style="white-space:pre-wrap;">${escapeHtml(block)}</p>`)
			.join('');

		const html = renderDocumentShell({
			badge: `Trndzz Learn · ${resource.type.replace(/_/g, ' ')}`,
			title: resource.title,
			subtitle: resource.summary,
			metaRows: [
				['Sector Hub', resource.vertical?.name ?? 'Cross-Sector'],
				[
					'Document Length',
					resource.pageCount ? `${resource.pageCount} Pages` : 'Full Edition',
				],
				[
					'Technical Sponsor',
					resource.sponsorCompany?.name ?? 'Trndzz Research Desk',
				],
			],
			bodyHtml: paragraphs,
		});

		return new NextResponse(html, {
			status: 200,
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
	}

	return new NextResponse('Document type not supported', { status: 404 });
}

