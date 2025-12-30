'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from '@/components/ui/carousel';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

type CarouselApi = UseEmblaCarouselType[1];

interface PostImage {
	id: string;
	url: string;
	alt: string | null;
	caption: string | null;
	credit: string | null;
	order: number;
}

interface PostSlideshowProps {
	images: PostImage[];
	featuredImageUrl?: string | null;
	featuredImageAlt?: string | null;
	featuredImageCredit?: string | null;
	title: string;
}

export function PostSlideshow({
	images,
	featuredImageUrl,
	featuredImageAlt,
	featuredImageCredit,
	title,
}: PostSlideshowProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);
	const [count, setCount] = React.useState(0);

	// Combine featured image with additional images
	const allImages = React.useMemo(() => {
		const combined: Array<{
			id: string;
			url: string;
			alt: string | null;
			caption: string | null;
			credit: string | null;
		}> = [];

		// Add featured image first if it exists
		if (featuredImageUrl) {
			combined.push({
				id: 'featured',
				url: featuredImageUrl,
				alt: featuredImageAlt || title,
				caption: null,
				credit: featuredImageCredit || null,
			});
		}

		// Add additional images, sorted by order
		const sortedImages = [...images].sort((a, b) => a.order - b.order);
		sortedImages.forEach((img) => {
			// Avoid duplicates if featured image is also in images array
			if (img.url !== featuredImageUrl) {
				combined.push({
					id: img.id,
					url: img.url,
					alt: img.alt || title,
					caption: img.caption,
					credit: img.credit,
				});
			}
		});

		return combined;
	}, [
		images,
		featuredImageUrl,
		featuredImageAlt,
		featuredImageCredit,
		title,
	]);

	React.useEffect(() => {
		if (!api) return;

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap());

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	// If only one image or no images, render simple image
	if (allImages.length <= 1) {
		const image = allImages[0];
		if (!image) return null;

		return (
			<div className='my-8 space-y-3'>
				<div className='relative aspect-video w-full overflow-hidden rounded-lg bg-muted'>
					<Image
						src={image.url}
						alt={image.alt || title}
						fill
						className='object-cover'
						priority
						sizes='(max-width: 896px) 100vw, 896px'
					/>
				</div>
				{(image.credit || image.caption) && (
					<p className='text-xs text-muted-foreground'>
						{image.caption && <span>{image.caption}</span>}
						{image.caption && image.credit && <span> · </span>}
						{image.credit && <span>{image.credit}</span>}
					</p>
				)}
			</div>
		);
	}

	// Multiple images - render carousel
	return (
		<div className='my-8 space-y-4'>
			<Carousel
				setApi={setApi}
				className='w-full'
				opts={{
					loop: true,
					align: 'start',
				}}
			>
				<CarouselContent className='ml-0'>
					{allImages.map((image, index) => (
						<CarouselItem
							key={image.id}
							className='pl-0'
						>
							<div className='space-y-3'>
								<div className='relative aspect-video w-full overflow-hidden rounded-lg bg-muted'>
									<Image
										src={image.url}
										alt={
											image.alt ||
											`${title} - Image ${index + 1}`
										}
										fill
										className='object-cover'
										priority={index === 0}
										sizes='(max-width: 896px) 100vw, 896px'
									/>
								</div>
								{(image.credit || image.caption) && (
									<p className='text-xs text-muted-foreground'>
										{image.caption && (
											<span>{image.caption}</span>
										)}
										{image.caption && image.credit && (
											<span> · </span>
										)}
										{image.credit && (
											<span>{image.credit}</span>
										)}
									</p>
								)}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Navigation Arrows */}
				<CarouselPrevious className='left-3 size-10 bg-background/80 backdrop-blur-sm hover:bg-background/90' />
				<CarouselNext className='right-3 size-10 bg-background/80 backdrop-blur-sm hover:bg-background/90' />
			</Carousel>

			{/* Dot Indicators */}
			<div className='flex items-center justify-center gap-2'>
				{allImages.map((_, index) => (
					<button
						key={index}
						type='button'
						onClick={() => api?.scrollTo(index)}
						className={cn(
							'size-2 rounded-full transition-all duration-200',
							current === index
								? 'bg-foreground scale-125'
								: 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
						)}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>

			{/* Slide Counter */}
			<p className='text-center text-sm text-muted-foreground'>
				{current + 1} / {count}
			</p>
		</div>
	);
}
