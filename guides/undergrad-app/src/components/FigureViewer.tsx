/**
 * FigureViewer — displays a figure image with caption.
 * Web version: simple img element (no Electron file:// protocol needed).
 */

interface FigureViewerProps {
  number: number
  src: string
  alt: string
  caption?: string
  source?: string
  explanation?: React.ReactNode
}

export default function FigureViewer({
  number,
  src,
  alt,
  caption,
  source,
  explanation
}: FigureViewerProps): React.JSX.Element {
  return (
    <figure className="my-8">
      <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <img
          src={src}
          alt={alt}
          className="w-full"
          loading="lazy"
        />
      </div>
      {(caption || source || explanation) && (
        <figcaption className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
          <span className="font-bold text-[var(--color-accent-bright)]">Figure {number}.</span>{' '}
          {caption}
          {source && (
            <span className="block text-[11px] text-[var(--color-text-dim)] mt-1">
              Source: {source}
            </span>
          )}
          {explanation && (
            <div className="mt-2 text-[var(--color-text-secondary)]">{explanation}</div>
          )}
        </figcaption>
      )}
    </figure>
  )
}
