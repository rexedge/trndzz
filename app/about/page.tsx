import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Target, TrendingUp, Zap, Shield, Globe } from 'lucide-react';

export const metadata: Metadata = {
	title: 'About Us',
	description:
		'Learn about Trend Pulse - your source for fresh, reader-first trend coverage. Discover our mission, values, and the team behind the stories.',
};

export default function AboutPage() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
						About Trend Pulse
					</h1>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
						We deliver fresh, well-researched stories on trending
						topics. Our mission is to provide thoughtful analysis
						and clear writing that helps you stay informed.
					</p>
				</div>

				{/* Mission Section */}
				<section className='mb-20'>
					<div className='grid md:grid-cols-2 gap-12 items-center'>
						<div>
							<h2 className='text-3xl font-bold mb-6'>
								Our Mission
							</h2>
							<p className='text-muted-foreground leading-relaxed mb-4'>
								At Trend Pulse, we believe that quality
								journalism should be accessible to everyone. We
								cut through the noise to bring you stories that
								matter, presented in a way that respects your
								time and intelligence.
							</p>
							<p className='text-muted-foreground leading-relaxed mb-4'>
								Our team of writers and researchers work around
								the clock to identify emerging trends and
								provide context that helps you understand not
								just what&apos;s happening, but why it matters.
							</p>
							<p className='text-muted-foreground leading-relaxed'>
								We&apos;re committed to accuracy, fairness, and
								transparency in everything we publish.
							</p>
						</div>
						<div className='bg-muted/30 rounded-2xl p-8'>
							<div className='grid grid-cols-2 gap-6'>
								<div className='text-center'>
									<p className='text-4xl font-bold text-primary'>
										1000+
									</p>
									<p className='text-sm text-muted-foreground mt-1'>
										Stories Published
									</p>
								</div>
								<div className='text-center'>
									<p className='text-4xl font-bold text-primary'>
										50K+
									</p>
									<p className='text-sm text-muted-foreground mt-1'>
										Monthly Readers
									</p>
								</div>
								<div className='text-center'>
									<p className='text-4xl font-bold text-primary'>
										24/7
									</p>
									<p className='text-sm text-muted-foreground mt-1'>
										Coverage
									</p>
								</div>
								<div className='text-center'>
									<p className='text-4xl font-bold text-primary'>
										100%
									</p>
									<p className='text-sm text-muted-foreground mt-1'>
										Original Content
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Values Section */}
				<section className='mb-20'>
					<h2 className='text-3xl font-bold text-center mb-12'>
						Our Values
					</h2>
					<div className='grid md:grid-cols-3 gap-8'>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
								<Target className='h-8 w-8' />
							</div>
							<h3 className='text-xl font-semibold mb-3'>
								Accuracy First
							</h3>
							<p className='text-muted-foreground'>
								Every story is fact-checked and verified before
								publication. We correct mistakes promptly and
								transparently.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
								<Users className='h-8 w-8' />
							</div>
							<h3 className='text-xl font-semibold mb-3'>
								Reader Focused
							</h3>
							<p className='text-muted-foreground'>
								Our readers come first. We write to inform and
								enlighten, not to sensationalize or mislead.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
								<TrendingUp className='h-8 w-8' />
							</div>
							<h3 className='text-xl font-semibold mb-3'>
								Trend Intelligence
							</h3>
							<p className='text-muted-foreground'>
								We use advanced tools to identify emerging
								trends and provide timely, relevant coverage.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
								<Zap className='h-8 w-8' />
							</div>
							<h3 className='text-xl font-semibold mb-3'>
								Speed & Quality
							</h3>
							<p className='text-muted-foreground'>
								We deliver breaking news quickly without
								sacrificing the depth and quality our readers
								expect.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
								<Shield className='h-8 w-8' />
							</div>
							<h3 className='text-xl font-semibold mb-3'>
								Editorial Independence
							</h3>
							<p className='text-muted-foreground'>
								Our editorial decisions are made independently,
								free from commercial or political influence.
							</p>
						</div>
						<div className='text-center p-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4'>
								<Globe className='h-8 w-8' />
							</div>
							<h3 className='text-xl font-semibold mb-3'>
								Global Perspective
							</h3>
							<p className='text-muted-foreground'>
								We cover stories from around the world with a
								focus on what matters to our diverse readership.
							</p>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className='bg-muted/30 rounded-2xl p-8 md:p-12 text-center'>
					<h2 className='text-2xl md:text-3xl font-bold mb-4'>
						Want to Work With Us?
					</h2>
					<p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
						We&apos;re always looking for talented writers,
						researchers, and partners who share our passion for
						quality journalism.
					</p>
					<div className='flex flex-wrap justify-center gap-4'>
						<Link
							href='/contact'
							className='inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors'
						>
							Contact Us
						</Link>
						<Link
							href='/advertise'
							className='inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors'
						>
							Advertise With Us
						</Link>
					</div>
				</section>
			</div>
		</main>
	);
}
