import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { getPlatformStats } from '@/lib/services/stats.service';
import { buildVerticalUrl } from '@/lib/tenancy/host';
import { formatNumber } from '@/lib/utils/format';

export async function MacroFooter() {
	const stats = await getPlatformStats();

	return (
		<footer className='border-t border-border bg-card'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Live Ecosystem Social Proof Bar */}
				<div className='mb-10 grid grid-cols-2 gap-4 rounded-xl border border-border bg-background p-5 sm:grid-cols-4'>
					<div>
						<p className='font-tabular text-2xl font-semibold text-foreground'>
							{formatNumber(stats.activeVerticals)}
						</p>
						<p className='text-xs text-muted-foreground'>
							Active Trade Verticals
						</p>
					</div>
					<div>
						<p className='font-tabular text-2xl font-semibold text-foreground'>
							{formatNumber(stats.indexedCompanies)}
						</p>
						<p className='text-xs text-muted-foreground'>
							Indexed Industrial Companies
						</p>
					</div>
					<div>
						<p className='font-tabular text-2xl font-semibold text-verified'>
							{formatNumber(stats.verifiedSuppliers)}
						</p>
						<p className='text-xs text-muted-foreground'>
							SON / CAC Verified Suppliers
						</p>
					</div>
					<div>
						<p className='font-tabular text-2xl font-semibold text-amber'>
							{formatNumber(stats.openRfqsCount)}
						</p>
						<p className='text-xs text-muted-foreground'>
							Live Open Buyer RFQs
						</p>
					</div>
				</div>

				<div className='grid gap-8 md:grid-cols-4'>
					<div className='md:col-span-2'>
						<div className='flex items-center gap-2'>
							<Building2 className='h-5 w-5 text-primary' />
							<span className='text-lg font-extrabold tracking-tight'>
								TRNDZZ
							</span>
						</div>
						<p className='mt-3 max-w-md text-sm text-muted-foreground leading-relaxed'>
							Digital infrastructure for industrial trade
							intelligence, specification-indexed vendor
							registries, and structured B2B procurement across
							West Africa and emerging markets.
						</p>
					</div>

					<div>
						<h3 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
							Industry Portals
						</h3>
						<ul className='mt-3 space-y-2 text-sm text-muted-foreground'>
							<li>
								<a
									href={buildVerticalUrl('aluminium', '/')}
									className='hover:text-foreground transition-colors'
								>
									Aluminium & Roofing (Live)
								</a>
							</li>
							<li>
								<Link
									href='/verticals'
									className='hover:text-foreground transition-colors'
								>
									Steel & Rebar (Seeded)
								</Link>
							</li>
							<li>
								<Link
									href='/verticals'
									className='hover:text-foreground transition-colors'
								>
									Solar & Clean Energy (Seeded)
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
							Corporate & Legal
						</h3>
						<ul className='mt-3 space-y-2 text-sm text-muted-foreground'>
							<li>
								<Link
									href='/about'
									className='hover:text-foreground transition-colors'
								>
									About Trndzz
								</Link>
							</li>
							<li>
								<Link
									href='/advertise'
									className='hover:text-foreground transition-colors'
								>
									Enterprise Sponsorships
								</Link>
							</li>
							<li>
								<Link
									href='/contact'
									className='hover:text-foreground transition-colors'
								>
									Contact Desk
								</Link>
							</li>
							<li>
								<Link
									href='/privacy'
									className='hover:text-foreground transition-colors'
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href='/terms'
									className='hover:text-foreground transition-colors'
								>
									Terms of Trade
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className='mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row'>
					<p>
						© {new Date().getFullYear()} TRNDZZ (`trndzz.com`). All
						rights reserved.
					</p>
					<p className='font-tabular'>
						Default Commercial Currency: Nigerian Naira (₦ / NGN)
					</p>
				</div>
			</div>
		</footer>
	);
}

