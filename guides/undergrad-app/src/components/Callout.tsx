/**
 * Callout boxes for walkthroughs — "Connection to LEARN",
 * exercise prompts, tips, and warnings.
 */

import clsx from 'clsx'

type CalloutVariant = 'learn' | 'exercise' | 'tip' | 'warning' | 'definition'

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { icon: string; label: string; border: string; bg: string; labelColor: string }
> = {
  learn: {
    icon: '🧠',
    label: 'Connection to LEARN',
    border: 'border-[var(--color-accent)]',
    bg: 'bg-[var(--color-accent-subtle)]',
    labelColor: 'text-[var(--color-accent-bright)]'
  },
  exercise: {
    icon: '🧪',
    label: 'Try This',
    border: 'border-[var(--color-amber)]',
    bg: 'bg-[var(--color-amber-subtle)]',
    labelColor: 'text-[var(--color-amber)]'
  },
  tip: {
    icon: '💡',
    label: 'Key Insight',
    border: 'border-[var(--color-teal)]',
    bg: 'bg-[var(--color-teal-glow)]',
    labelColor: 'text-[var(--color-teal)]'
  },
  warning: {
    icon: '⚠️',
    label: 'Important',
    border: 'border-[var(--color-error)]',
    bg: 'bg-[rgba(248,113,113,0.08)]',
    labelColor: 'text-[var(--color-error)]'
  },
  definition: {
    icon: '📖',
    label: 'Definition',
    border: 'border-[var(--color-text-muted)]',
    bg: 'bg-[var(--color-bg-elevated)]',
    labelColor: 'text-[var(--color-text-secondary)]'
  }
}

interface CalloutProps {
  variant: CalloutVariant
  title?: string
  children: React.ReactNode
}

export default function Callout({ variant, title, children }: CalloutProps): React.JSX.Element {
  const config = VARIANT_CONFIG[variant]

  return (
    <div
      className={clsx(
        'rounded-xl p-5 my-6 border-l-[3px] transition-all',
        config.border,
        config.bg,
        'animate-fade-up'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{config.icon}</span>
        <span className={clsx('text-[11px] font-bold uppercase tracking-[0.08em]', config.labelColor)}>
          {title || config.label}
        </span>
      </div>
      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{children}</div>
    </div>
  )
}
