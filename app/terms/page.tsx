import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Terms of Service',
	description:
		'Read the Terms of Service for Trend Pulse. Understand your rights and responsibilities when using our website.',
};

export default function TermsPage() {
	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
				<h1 className='text-4xl md:text-5xl font-bold mb-8'>
					Terms of Service
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: December 31, 2025
				</p>

				<div className='prose prose-neutral dark:prose-invert max-w-none'>
					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							1. Acceptance of Terms
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							By accessing and using Trend Pulse (&quot;the
							Website&quot;), you accept and agree to be bound by
							these Terms of Service. If you do not agree to these
							terms, please do not use our website.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							2. Use of the Website
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							You agree to use the Website only for lawful
							purposes and in a way that does not infringe the
							rights of, restrict, or inhibit anyone else&apos;s
							use and enjoyment of the Website.
						</p>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							Prohibited behavior includes:
						</p>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>
								Conduct that is unlawful, harassing, or harmful
							</li>
							<li>
								Transmitting obscene, offensive, or
								objectionable content
							</li>
							<li>Disrupting the normal flow of the Website</li>
							<li>
								Attempting to gain unauthorized access to our
								systems
							</li>
							<li>
								Using automated systems to access the Website
								without permission
							</li>
							<li>
								Copying or distributing our content without
								authorization
							</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							3. Intellectual Property
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							All content on Trend Pulse, including but not
							limited to text, graphics, logos, images, audio
							clips, and software, is the property of Trend Pulse
							or its content suppliers and is protected by
							copyright laws.
						</p>
						<p className='text-muted-foreground leading-relaxed'>
							You may not reproduce, distribute, modify, create
							derivative works of, publicly display, or otherwise
							use any content from this Website without our prior
							written permission.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							4. User Content
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							If you submit comments, feedback, or other content
							to us, you grant us a non-exclusive, royalty-free,
							perpetual, and worldwide license to use, reproduce,
							modify, and distribute such content.
						</p>
						<p className='text-muted-foreground leading-relaxed'>
							You represent that you own or have the necessary
							rights to submit such content and that it does not
							violate any third-party rights.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							5. Disclaimer of Warranties
						</h2>
						<p className='text-muted-foreground leading-relaxed mb-4'>
							The Website is provided on an &quot;as is&quot; and
							&quot;as available&quot; basis. We make no
							representations or warranties of any kind, express
							or implied, regarding:
						</p>
						<ul className='list-disc pl-6 text-muted-foreground space-y-2'>
							<li>
								The accuracy, completeness, or reliability of
								any content
							</li>
							<li>
								The availability or uninterrupted access to the
								Website
							</li>
							<li>
								The security or freedom from viruses of the
								Website
							</li>
							<li>
								The fitness of the Website for any particular
								purpose
							</li>
						</ul>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							6. Limitation of Liability
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							To the fullest extent permitted by law, Trend Pulse
							shall not be liable for any indirect, incidental,
							special, consequential, or punitive damages, or any
							loss of profits or revenues, whether incurred
							directly or indirectly, or any loss of data, use,
							goodwill, or other intangible losses resulting from
							your use of the Website.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							7. Third-Party Links
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							The Website may contain links to third-party
							websites or services that are not owned or
							controlled by Trend Pulse. We have no control over
							and assume no responsibility for the content,
							privacy policies, or practices of any third-party
							websites or services. You acknowledge and agree that
							we shall not be responsible or liable for any damage
							or loss caused by the use of such websites or
							services.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							8. Advertising
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							The Website may display advertisements from
							third-party advertisers. Your interactions with
							advertisers are solely between you and the
							advertiser, and we are not responsible for any loss
							or damage resulting from such interactions.
							Advertisements do not imply endorsement by Trend
							Pulse.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							9. Modifications to Terms
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							We reserve the right to modify these Terms of
							Service at any time. Changes will be effective
							immediately upon posting to the Website. Your
							continued use of the Website after any changes
							constitutes acceptance of the new terms. We
							encourage you to review these terms periodically.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							10. Governing Law
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							These Terms of Service shall be governed by and
							construed in accordance with the laws of Nigeria,
							without regard to its conflict of law provisions.
							Any disputes arising from these terms shall be
							subject to the exclusive jurisdiction of the courts
							of Nigeria.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							11. Severability
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							If any provision of these Terms of Service is found
							to be unenforceable or invalid, that provision shall
							be limited or eliminated to the minimum extent
							necessary so that these terms shall otherwise remain
							in full force and effect.
						</p>
					</section>

					<section className='mb-12'>
						<h2 className='text-2xl font-bold mb-4'>
							12. Contact Information
						</h2>
						<p className='text-muted-foreground leading-relaxed'>
							If you have any questions about these Terms of
							Service, please contact us at:{' '}
							<a
								href='mailto:legal@trendpulse.ng'
								className='text-primary hover:underline'
							>
								legal@trendpulse.ng
							</a>
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}
