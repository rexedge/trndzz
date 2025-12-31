'use client';

import { useState } from 'react';
import {
	Mail,
	MapPin,
	Phone,
	MessageSquare,
	Send,
	CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate form submission
		await new Promise((resolve) => setTimeout(resolve, 1500));

		setIsSubmitting(false);
		setIsSubmitted(true);
		toast.success("Message sent successfully! We'll get back to you soon.");
	}

	return (
		<main className='min-h-screen bg-background'>
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
						Contact Us
					</h1>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
						Have a question, feedback, or story tip? We&apos;d love
						to hear from you. Our team typically responds within
						24-48 hours.
					</p>
				</div>

				<div className='grid lg:grid-cols-3 gap-12'>
					{/* Contact Info */}
					<div className='lg:col-span-1'>
						<h2 className='text-2xl font-bold mb-6'>
							Get in Touch
						</h2>
						<div className='space-y-6'>
							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
									<Mail className='h-6 w-6 text-primary' />
								</div>
								<div>
									<h3 className='font-semibold mb-1'>
										Email
									</h3>
									<p className='text-muted-foreground text-sm'>
										General inquiries
									</p>
									<a
										href='mailto:hello@trendpulse.ng'
										className='text-primary hover:underline'
									>
										hello@trendpulse.ng
									</a>
								</div>
							</div>

							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
									<MessageSquare className='h-6 w-6 text-primary' />
								</div>
								<div>
									<h3 className='font-semibold mb-1'>
										Press & Media
									</h3>
									<p className='text-muted-foreground text-sm'>
										For press inquiries
									</p>
									<a
										href='mailto:press@trendpulse.ng'
										className='text-primary hover:underline'
									>
										press@trendpulse.ng
									</a>
								</div>
							</div>

							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
									<MapPin className='h-6 w-6 text-primary' />
								</div>
								<div>
									<h3 className='font-semibold mb-1'>
										Location
									</h3>
									<p className='text-muted-foreground text-sm'>
										Lagos, Nigeria
									</p>
									<p className='text-muted-foreground text-sm'>
										Working remotely worldwide
									</p>
								</div>
							</div>

							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
									<Phone className='h-6 w-6 text-primary' />
								</div>
								<div>
									<h3 className='font-semibold mb-1'>
										Response Time
									</h3>
									<p className='text-muted-foreground text-sm'>
										We typically respond within 24-48 hours
										during business days.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Contact Form */}
					<div className='lg:col-span-2'>
						<div className='bg-muted/30 rounded-2xl p-8'>
							{isSubmitted ? (
								<div className='text-center py-12'>
									<CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
									<h3 className='text-2xl font-bold mb-2'>
										Message Sent!
									</h3>
									<p className='text-muted-foreground mb-6'>
										Thank you for reaching out. We&apos;ll
										get back to you as soon as possible.
									</p>
									<button
										onClick={() => setIsSubmitted(false)}
										className='text-primary hover:underline'
									>
										Send another message
									</button>
								</div>
							) : (
								<form
									onSubmit={handleSubmit}
									className='space-y-6'
								>
									<div className='grid md:grid-cols-2 gap-6'>
										<div>
											<label
												htmlFor='name'
												className='block text-sm font-medium mb-2'
											>
												Full Name *
											</label>
											<input
												type='text'
												id='name'
												name='name'
												required
												className='w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
												placeholder='John Doe'
											/>
										</div>
										<div>
											<label
												htmlFor='email'
												className='block text-sm font-medium mb-2'
											>
												Email Address *
											</label>
											<input
												type='email'
												id='email'
												name='email'
												required
												className='w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
												placeholder='john@example.com'
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor='subject'
											className='block text-sm font-medium mb-2'
										>
											Subject *
										</label>
										<select
											id='subject'
											name='subject'
											required
											className='w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
										>
											<option value=''>
												Select a subject
											</option>
											<option value='general'>
												General Inquiry
											</option>
											<option value='feedback'>
												Feedback
											</option>
											<option value='story-tip'>
												Story Tip
											</option>
											<option value='correction'>
												Correction Request
											</option>
											<option value='partnership'>
												Partnership
											</option>
											<option value='advertising'>
												Advertising
											</option>
											<option value='other'>Other</option>
										</select>
									</div>

									<div>
										<label
											htmlFor='message'
											className='block text-sm font-medium mb-2'
										>
											Message *
										</label>
										<textarea
											id='message'
											name='message'
											required
											rows={6}
											className='w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none'
											placeholder='Tell us more about your inquiry...'
										/>
									</div>

									<button
										type='submit'
										disabled={isSubmitting}
										className='w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
									>
										{isSubmitting ? (
											<>
												<span className='animate-spin'>
													⏳
												</span>
												Sending...
											</>
										) : (
											<>
												<Send className='h-4 w-4' />
												Send Message
											</>
										)}
									</button>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
