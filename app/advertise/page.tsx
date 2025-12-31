import { Metadata } from 'next';
import Link from 'next/link';
import {
	BarChart3,
	Users,
	Target,
	Zap,
	CheckCircle,
	ArrowRight,
} from 'lucide-react';
import { Ad } from '@/components/ads';

export const metadata: Metadata = {
	title: 'Advertise With Us',
	description:
		'Reach thousands of engaged readers through Trend Pulse advertising. Explore our ad formats, pricing, and partnership opportunities.',
};

export default function AdvertisePage() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
						Advertise With Trend Pulse
					</h1>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
						Connect with thousands of engaged readers who trust
						Trend Pulse for quality content. Our advertising
						solutions help you reach your target audience
						effectively.
					</p>
				</div>

				{/* Stats Section */}
				<section className='mb-20'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
						<div className='bg-muted/30 rounded-xl p-6 text-center'>
							<p className='text-3xl md:text-4xl font-bold text-primary'>
								50K+
							</p>
							<p className='text-sm text-muted-foreground mt-2'>
								Monthly Pageviews
							</p>
						</div>
						<div className='bg-muted/30 rounded-xl p-6 text-center'>
							<p className='text-3xl md:text-4xl font-bold text-primary'>
								25K+
							</p>
							<p className='text-sm text-muted-foreground mt-2'>
								Unique Visitors
							</p>
						</div>
						<div className='bg-muted/30 rounded-xl p-6 text-center'>
							<p className='text-3xl md:text-4xl font-bold text-primary'>
								4:30
							</p>
							<p className='text-sm text-muted-foreground mt-2'>
								Avg. Time on Site
							</p>
						</div>
						<div className='bg-muted/30 rounded-xl p-6 text-center'>
							<p className='text-3xl md:text-4xl font-bold text-primary'>
								65%
							</p>
							<p className='text-sm text-muted-foreground mt-2'>
								Mobile Traffic
							</p>
						</div>
					</div>
				</section>

				{/* Ad Formats */}
				<section className='mb-20'>
					<h2 className='text-3xl font-bold text-center mb-12'>
						Available Ad Formats
					</h2>
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						<div className='border border-border rounded-xl p-6'>
							<h3 className='text-xl font-bold mb-3'>
								Display Banner
							</h3>
							<Ad
								format='horizontal'
								className='mb-4'
							/>
							<p className='text-muted-foreground text-sm mb-4'>
								Standard banner ads displayed in high-visibility
								positions throughout the site.
							</p>
							<ul className='text-sm space-y-2'>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span>728×90, 320×50 responsive</span>
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span>Header & footer placement</span>
								</li>
							</ul>
						</div>

						<div className='border border-border rounded-xl p-6'>
							<h3 className='text-xl font-bold mb-3'>
								In-Article Ads
							</h3>
							<Ad
								format='in-article'
								className='mb-4'
							/>
							<p className='text-muted-foreground text-sm mb-4'>
								Native ads that blend seamlessly within article
								content for higher engagement.
							</p>
							<ul className='text-sm space-y-2'>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span>Responsive sizing</span>
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span>High viewability</span>
								</li>
							</ul>
						</div>

						<div className='border border-border rounded-xl p-6'>
							<h3 className='text-xl font-bold mb-3'>
								Sidebar Ads
							</h3>
							<Ad
								format='square'
								className='mb-4'
							/>
							<p className='text-muted-foreground text-sm mb-4'>
								Medium rectangle ads in the sidebar for desktop
								users.
							</p>
							<ul className='text-sm space-y-2'>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span>300×250 standard</span>
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span>Sticky positioning available</span>
								</li>
							</ul>
						</div>
					</div>
				</section>

				{/* Why Advertise */}
				<section className='mb-20'>
					<h2 className='text-3xl font-bold text-center mb-12'>
						Why Advertise With Us?
					</h2>
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4'>
								<Users className='h-7 w-7' />
							</div>
							<h3 className='font-semibold mb-2'>
								Engaged Audience
							</h3>
							<p className='text-sm text-muted-foreground'>
								Our readers are actively engaged with
								high-quality content.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4'>
								<Target className='h-7 w-7' />
							</div>
							<h3 className='font-semibold mb-2'>
								Targeted Reach
							</h3>
							<p className='text-sm text-muted-foreground'>
								Category-specific placements for precise
								targeting.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4'>
								<BarChart3 className='h-7 w-7' />
							</div>
							<h3 className='font-semibold mb-2'>
								Detailed Analytics
							</h3>
							<p className='text-sm text-muted-foreground'>
								Comprehensive reporting on ad performance.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4'>
								<Zap className='h-7 w-7' />
							</div>
							<h3 className='font-semibold mb-2'>Fast Loading</h3>
							<p className='text-sm text-muted-foreground'>
								Optimized ad delivery for best user experience.
							</p>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className='bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center'>
					<h2 className='text-2xl md:text-3xl font-bold mb-4'>
						Ready to Get Started?
					</h2>
					<p className='opacity-90 mb-8 max-w-2xl mx-auto'>
						Contact our advertising team to discuss your needs and
						get a customized proposal for your campaign.
					</p>
					<div className='flex flex-wrap justify-center gap-4'>
						<Link
							href='/contact?subject=advertising'
							className='inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors'
						>
							Contact Sales
							<ArrowRight className='h-4 w-4' />
						</Link>
						<a
							href='mailto:ads@trendpulse.ng'
							className='inline-flex items-center px-6 py-3 border border-primary-foreground/30 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors'
						>
							ads@trendpulse.ng
						</a>
					</div>
				</section>
			</div>
		</main>
	);
}
