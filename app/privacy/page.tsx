import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description:
		'Learn how Trend Pulse collects, uses, and protects your personal information. Read our comprehensive privacy policy.',
};

export default function PrivacyPage() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
				<h1 className='text-4xl md:text-5xl font-bold mb-8'>
					Privacy Policy
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: December 31, 2025
				</p>

				<div className='prose prose-neutral dark:prose-invert max-w-none'>
					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							1. Introduction
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							Welcome to Trend Pulse (&quot;we,&quot;
							&quot;our,&quot; or &quot;us&quot;). We are
							committed to protecting your privacy and ensuring
							the security of your personal information. This
							Privacy Policy explains how we collect, use,
							disclose, and safeguard your information when you
							visit our website.
						</p>
						<p className='text-muted-foreground leading-relaxed'>
							By using our website, you agree to the collection
							and use of information in accordance with this
							policy.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							2. Information We Collect
						</h2>

						<h3 className='text-xl font-semibold mb-3'>
							2.1 Information You Provide
						</h3>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2 mb-4'>
							<li>
								Contact information (name, email address) when
								you contact us
							</li>
							<li>Newsletter subscription information</li>
							<li>
								Any other information you voluntarily provide
							</li>
						</ul>

						<h3 className='text-xl font-semibold mb-3'>
							2.2 Automatically Collected Information
						</h3>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>
								Device information (browser type, operating
								system)
							</li>
							<li>IP address and approximate location</li>
							<li>Pages visited and time spent on our site</li>
							<li>Referring website or source</li>
							<li>Cookies and similar tracking technologies</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							3. How We Use Your Information
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							We use the information we collect to:
						</p>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>Provide, operate, and maintain our website</li>
							<li>
								Improve, personalize, and expand our website
							</li>
							<li>
								Understand and analyze how you use our website
							</li>
							<li>
								Develop new products, services, features, and
								functionality
							</li>
							<li>
								Send you newsletters and marketing
								communications (with your consent)
							</li>
							<li>
								Respond to your comments, questions, and provide
								customer service
							</li>
							<li>Detect and prevent fraud and abuse</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							4. Cookies and Tracking
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							We use cookies and similar tracking technologies to
							track activity on our website and hold certain
							information. Cookies are files with a small amount
							of data which may include an anonymous unique
							identifier.
						</p>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							Types of cookies we use:
						</p>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>
								<strong>Essential cookies:</strong> Required for
								the website to function properly
							</li>
							<li>
								<strong>Analytics cookies:</strong> Help us
								understand how visitors interact with our
								website
							</li>
							<li>
								<strong>Advertising cookies:</strong> Used to
								deliver relevant advertisements
							</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							5. Third-Party Services
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							We may employ third-party companies and individuals
							to facilitate our website, provide services on our
							behalf, or assist us in analyzing how our website is
							used. These third parties include:
						</p>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>
								<strong>Google Analytics:</strong> For website
								analytics
							</li>
							<li>
								<strong>Google AdSense:</strong> For displaying
								advertisements
							</li>
							<li>
								<strong>PostHog:</strong> For product analytics
							</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							6. Data Security
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							We implement appropriate technical and
							organizational security measures to protect your
							personal information against unauthorized access,
							alteration, disclosure, or destruction. However, no
							method of transmission over the Internet or method
							of electronic storage is 100% secure.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							7. Your Rights
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							You have the right to:
						</p>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>
								Access the personal information we hold about
								you
							</li>
							<li>
								Request correction of inaccurate information
							</li>
							<li>
								Request deletion of your personal information
							</li>
							<li>Opt-out of marketing communications</li>
							<li>Withdraw consent where applicable</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							8. Children&apos;s Privacy
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							Our website is not intended for children under 13
							years of age. We do not knowingly collect personal
							information from children under 13. If you are a
							parent or guardian and believe your child has
							provided us with personal information, please
							contact us.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							9. Changes to This Policy
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							We may update our Privacy Policy from time to time.
							We will notify you of any changes by posting the new
							Privacy Policy on this page and updating the
							&quot;Last updated&quot; date. We encourage you to
							review this Privacy Policy periodically.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							10. Contact Us
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							If you have any questions about this Privacy Policy,
							please contact us at:{' '}
							<a
								href='mailto:privacy@trendpulse.ng'
								className='text-primary hover:underline'
							>
								privacy@trendpulse.ng
							</a>
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}
