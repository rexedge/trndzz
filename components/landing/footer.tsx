import Link from 'next/link';
import {
	Twitter,
	Linkedin,
	Facebook,
	Instagram,
	Youtube,
	Mail,
} from 'lucide-react';

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='border-t border-border bg-muted/30 mt-16'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Main Footer Content */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
					{/* Brand & Description */}
					<div className='space-y-4'>
						<Link
							href='/'
							className='inline-flex items-center gap-3 group'
						>
							<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg transition-transform group-hover:scale-105'>
								TP
							</div>
							<span className='text-xl font-bold'>
								Trend Pulse
							</span>
						</Link>
						<p className='text-sm text-muted-foreground leading-relaxed'>
							Fresh perspectives on trending topics. Thoughtful
							analysis, clear writing, and insights you can use.
						</p>
						{/* Social Links */}
						<div className='flex items-center gap-3'>
							<a
								href='https://twitter.com'
								target='_blank'
								rel='noopener noreferrer'
								className='text-muted-foreground hover:text-foreground transition-colors'
								aria-label='Twitter'
							>
								<Twitter className='h-5 w-5' />
							</a>
							<a
								href='https://linkedin.com'
								target='_blank'
								rel='noopener noreferrer'
								className='text-muted-foreground hover:text-foreground transition-colors'
								aria-label='LinkedIn'
							>
								<Linkedin className='h-5 w-5' />
							</a>
							<a
								href='https://facebook.com'
								target='_blank'
								rel='noopener noreferrer'
								className='text-muted-foreground hover:text-foreground transition-colors'
								aria-label='Facebook'
							>
								<Facebook className='h-5 w-5' />
							</a>
							<a
								href='https://instagram.com'
								target='_blank'
								rel='noopener noreferrer'
								className='text-muted-foreground hover:text-foreground transition-colors'
								aria-label='Instagram'
							>
								<Instagram className='h-5 w-5' />
							</a>
							<a
								href='https://youtube.com'
								target='_blank'
								rel='noopener noreferrer'
								className='text-muted-foreground hover:text-foreground transition-colors'
								aria-label='YouTube'
							>
								<Youtube className='h-5 w-5' />
							</a>
						</div>
					</div>

					{/* Navigation */}
					<div>
						<h3 className='font-semibold mb-4 text-sm uppercase tracking-wider'>
							Navigation
						</h3>
						<ul className='space-y-3 text-sm'>
							<li>
								<Link
									href='/'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href='/topics'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Topics
								</Link>
							</li>
							<li>
								<Link
									href='/tags'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Tags
								</Link>
							</li>
							<li>
								<Link
									href='/posts'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									All Stories
								</Link>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className='font-semibold mb-4 text-sm uppercase tracking-wider'>
							Company
						</h3>
						<ul className='space-y-3 text-sm'>
							<li>
								<Link
									href='/about'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href='/contact'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Contact
								</Link>
							</li>
							<li>
								<Link
									href='/advertise'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Advertise
								</Link>
							</li>
							<li>
								<Link
									href='/admin'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Admin Portal
								</Link>
							</li>
						</ul>
					</div>

					{/* Newsletter */}
					<div>
						<h3 className='font-semibold mb-4 text-sm uppercase tracking-wider'>
							Stay Updated
						</h3>
						<p className='text-sm text-muted-foreground mb-4'>
							Get the latest stories delivered to your inbox.
						</p>
						<div className='flex gap-2'>
							<input
								type='email'
								placeholder='Enter your email'
								className='flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
							/>
							<button
								title='mail'
								className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
							>
								<Mail className='h-4 w-4' />
							</button>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='border-t border-border pt-8'>
					<div className='flex flex-col md:flex-row justify-between items-center gap-4'>
						<p className='text-sm text-muted-foreground'>
							© {currentYear} Trend Pulse. All rights reserved.
						</p>
						<div className='flex items-center gap-6 text-sm text-muted-foreground'>
							<Link
								href='/privacy'
								className='hover:text-foreground transition-colors'
							>
								Privacy Policy
							</Link>
							<Link
								href='/terms'
								className='hover:text-foreground transition-colors'
							>
								Terms of Service
							</Link>
							<Link
								href='/sitemap.xml'
								className='hover:text-foreground transition-colors'
							>
								Sitemap
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
