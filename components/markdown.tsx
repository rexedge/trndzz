import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
	content: string;
	className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
	return (
		<div className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					// Headings
					h1: ({ children }) => (
						<h1 className='mt-8 mb-4 text-3xl font-bold tracking-tight'>
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className='mt-8 mb-4 text-2xl font-semibold tracking-tight'>
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className='mt-6 mb-3 text-xl font-semibold tracking-tight'>
							{children}
						</h3>
					),
					h4: ({ children }) => (
						<h4 className='mt-6 mb-3 text-lg font-semibold'>
							{children}
						</h4>
					),
					h5: ({ children }) => (
						<h5 className='mt-4 mb-2 text-base font-semibold'>
							{children}
						</h5>
					),
					h6: ({ children }) => (
						<h6 className='mt-4 mb-2 text-sm font-semibold'>
							{children}
						</h6>
					),

					// Paragraphs
					p: ({ children }) => (
						<p className='my-4 leading-7 text-foreground/90'>
							{children}
						</p>
					),

					// Lists
					ul: ({ children }) => (
						<ul className='my-4 ml-6 list-disc space-y-2'>
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className='my-4 ml-6 list-decimal space-y-2'>
							{children}
						</ol>
					),
					li: ({ children }) => (
						<li className='leading-7 text-foreground/90'>
							{children}
						</li>
					),

					// Links
					a: ({ href, children }) => (
						<a
							href={href}
							className='text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground'
							target={
								href?.startsWith('http') ? '_blank' : undefined
							}
							rel={
								href?.startsWith('http')
									? 'noopener noreferrer'
									: undefined
							}
						>
							{children}
						</a>
					),

					// Emphasis
					strong: ({ children }) => (
						<strong className='font-semibold text-foreground'>
							{children}
						</strong>
					),
					em: ({ children }) => (
						<em className='italic'>{children}</em>
					),

					// Blockquote
					blockquote: ({ children }) => (
						<blockquote className='my-6 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground'>
							{children}
						</blockquote>
					),

					// Code
					code: ({ className, children }) => {
						const isInline = !className;
						if (isInline) {
							return (
								<code className='rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground'>
									{children}
								</code>
							);
						}
						return (
							<code className='font-mono text-sm'>
								{children}
							</code>
						);
					},
					pre: ({ children }) => (
						<pre className='my-6 overflow-x-auto rounded-lg bg-muted p-4'>
							{children}
						</pre>
					),

					// Horizontal rule
					hr: () => <hr className='my-8 border-t border-border' />,

					// Tables (GFM)
					table: ({ children }) => (
						<div className='my-6 overflow-x-auto'>
							<table className='w-full border-collapse text-sm'>
								{children}
							</table>
						</div>
					),
					thead: ({ children }) => (
						<thead className='border-b bg-muted/50'>
							{children}
						</thead>
					),
					tbody: ({ children }) => <tbody>{children}</tbody>,
					tr: ({ children }) => (
						<tr className='border-b border-border'>{children}</tr>
					),
					th: ({ children }) => (
						<th className='px-4 py-2 text-left font-semibold'>
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className='px-4 py-2 text-foreground/90'>
							{children}
						</td>
					),

					// Images
					img: ({ src, alt }) => (
						<span className='my-6 block'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={src}
								alt={alt || ''}
								className='rounded-lg'
								loading='lazy'
							/>
							{alt && (
								<span className='mt-2 block text-center text-sm text-muted-foreground'>
									{alt}
								</span>
							)}
						</span>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
