/**
 * PeekScript — collapsible reference to a production script.
 * Used in labs so the RA can peek at the final version for guidance.
 */

import { useState, useMemo } from 'react'
import { useApp } from '@src/context/AppContext'

interface PeekScriptProps {
  script: string
  lines?: string
  label?: string
}

export default function PeekScript({
  script,
  lines,
  label
}: PeekScriptProps): React.JSX.Element {
  const { getScriptContent } = useApp()
  const [open, setOpen] = useState(false)

  const buttonLabel = label || "Peek at Danny\u2019s version"

  const displayContent = useMemo(() => {
    const full = getScriptContent(script)
    if (!full) return null
    if (!lines) return full

    const match = lines.match(/^(\d+)\s*-\s*(\d+)$/)
    if (!match) return full

    const start = parseInt(match[1], 10)
    const end = parseInt(match[2], 10)
    return full.split('\n').slice(start - 1, end).join('\n')
  }, [script, lines, getScriptContent])

  if (!displayContent) {
    return (
      <div className="my-4 text-xs text-[var(--color-text-dim)] italic">
        Script &ldquo;{script}&rdquo; not found.
      </div>
    )
  }

  return (
    <div className="my-6 border border-[var(--color-border)] rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] transition-colors text-left"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(251,191,36,0.1)] shrink-0">
          <span className="text-base">{open ? '📖' : '👀'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#fbbf24]">
            {buttonLabel}
          </span>
          {lines && (
            <span className="ml-2 text-[10px] text-[var(--color-text-dim)] font-mono">
              lines {lines}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--color-text-dim)] shrink-0 transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
          ▶
        </span>
        <code className="text-[10px] text-[var(--color-text-dim)] bg-[var(--color-bg-elevated)] px-2 py-1 rounded font-mono shrink-0 hidden sm:block">
          {script}
        </code>
      </button>

      {open && (
        <div className="border-t border-[var(--color-border)]">
          <div className="px-4 py-2 bg-[rgba(251,191,36,0.06)] border-b border-[rgba(251,191,36,0.15)]">
            <p className="text-[10px] text-[#fbbf24]/80 leading-relaxed">
              This is the production version for reference. Try writing your own first!
            </p>
          </div>
          <pre className="px-4 py-3 bg-[#0c1021] text-[13px] font-mono text-[#e8ecf4] leading-[20px] overflow-x-auto max-h-[500px] overflow-y-auto">
            <code>{displayContent}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
