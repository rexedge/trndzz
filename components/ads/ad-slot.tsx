'use client';

import { useEffect, useRef } from 'react';

type AdFormat = 'horizontal' | 'vertical' | 'square' | 'in-article' | 'in-feed';

interface AdSlotProps {
	format?: AdFormat;
	className?: string;
}

declare global {
	interface Window {
		adsbygoogle: Array<object>;
	}
}

const formatStyles: Record<AdFormat, { minHeight: string; aspectRatio?: string }> = {
	horizontal: { minHeight: '90px' },
	vertical: { minHeight: '600px' },
	square: { minHeight: '250px', aspectRatio: '1/1' },
	'in-article': { minHeight: '250px' },
	'in-feed': { minHeight: '120px' },
};

export function AdSlot({ format = 'horizontal', className = '' }: AdSlotProps) {
	const adRef = useRef<HTMLModElement>(null);
	const isLoaded = useRef(false);

	useEffect(() => {
		if (isLoaded.current) return;
		
		try {
			if (typeof window !== 'undefined' && adRef.current) {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
				isLoaded.current = true;
			}
		} catch (error) {
			console.error('AdSense error:', error);
		}
	}, []);

	const styles = formatStyles[format];

	return (
		<div
			className={`w-full overflow-hidden ${className}`}
			style={{ minHeight: styles.minHeight }}
		>
			<ins
				ref={adRef}
				className='adsbygoogle block'
				style={{
					display: 'block',
					minHeight: styles.minHeight,
					...(styles.aspectRatio && { aspectRatio: styles.aspectRatio }),
				}}
				data-ad-client='ca-pub-2109983496009042'
				data-ad-slot='auto'
				data-ad-format='auto'
				data-full-width-responsive='true'
			/>
		</div>
	);
}

// Placeholder for development/preview
export function AdPlaceholder({
	format = 'horizontal',
	label = 'Advertisement',
	className = '',
}: {
	format?: AdFormat;
	label?: string;
	className?: string;
}) {
	const styles = formatStyles[format];

	return (
		<div
			className={`w-full border border-dashed border-border rounded-lg bg-muted/30 flex items-center justify-center ${className}`}
			style={{ minHeight: styles.minHeight }}
		>
			<div className='text-center text-muted-foreground'>
				<p className='text-xs uppercase tracking-wider font-medium'>{label}</p>
				<p className='text-xs mt-1 opacity-60'>
					{format === 'horizontal' && '728×90 / Responsive'}
					{format === 'vertical' && '160×600 / Skyscraper'}
					{format === 'square' && '300×250 / Medium Rectangle'}
					{format === 'in-article' && 'In-Article Ad'}
					{format === 'in-feed' && 'In-Feed Ad'}
				</p>
			</div>
		</div>
	);
}

// Smart Ad component that shows placeholder in dev and real ads in prod
export function Ad({
	format = 'horizontal',
	className = '',
	showInDev = false,
}: AdSlotProps & { showInDev?: boolean }) {
	const isDev = process.env.NODE_ENV === 'development';

	if (isDev && !showInDev) {
		return <AdPlaceholder format={format} className={className} />;
	}

	return <AdSlot format={format} className={className} />;
}
