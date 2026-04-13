/**
 * Section navigation — prev/next buttons at the bottom of each
 * walkthrough section for linear reading.
 */

interface SectionNavProps {
  /** Previous section info (null if first section) */
  prev?: { id: string; title: string } | null
  /** Next section info (null if last section) */
  next?: { id: string; title: string } | null
  /** Callback to navigate to a section */
  onNavigate: (moduleId: string) => void
}

export default function SectionNav({ prev, next, onNavigate }: SectionNavProps): React.JSX.Element {
  return (
    <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between gap-4">
        {/* Previous */}
        {prev ? (
          <button
            onClick={() => onNavigate(prev.id)}
            className="group flex items-center gap-3 text-left px-4 py-3 rounded-xl
                       bg-[var(--color-bg-surface)] border border-[var(--color-border)]
                       hover:border-[var(--color-accent)]/30 hover:shadow-[var(--shadow-md)]
                       transition-all max-w-[45%]"
          >
            <span className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent-bright)] transition-colors text-lg shrink-0">
              ←
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider block">
                Previous
              </span>
              <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate block">
                {prev.title}
              </span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {/* Next */}
        {next ? (
          <button
            onClick={() => onNavigate(next.id)}
            className="group flex items-center gap-3 text-right px-4 py-3 rounded-xl
                       bg-[var(--color-bg-surface)] border border-[var(--color-border)]
                       hover:border-[var(--color-accent)]/30 hover:shadow-[var(--shadow-md)]
                       transition-all max-w-[45%] ml-auto"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider block">
                Next
              </span>
              <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate block">
                {next.title}
              </span>
            </div>
            <span className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent-bright)] transition-colors text-lg shrink-0">
              →
            </span>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
