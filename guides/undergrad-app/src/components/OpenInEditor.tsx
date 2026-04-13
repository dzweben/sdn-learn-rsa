/**
 * OpenInEditor — shows a script reference with a "View" toggle.
 * Web version: shows the bundled script content inline (no Electron editor).
 */

import { useState, useMemo } from 'react'
import { useApp } from '@src/context/AppContext'

interface OpenInEditorProps {
  script?: string
  filePath?: string
  label?: string
  description?: string
}

export default function OpenInEditor({
  script,
  description
}: OpenInEditorProps): React.JSX.Element {
  const { getScriptContent } = useApp()
  const [open, setOpen] = useState(false)

  const fileName = script || 'file'

  const content = useMemo(() => {
    if (!script) return null
    return getScriptContent(script)
  }, [script, getScriptContent])

  return (
    <div className="my-4 border border-[var(--color-border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] transition-colors text-left"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] shrink-0">
          <span className="text-base">📄</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[var(--color-accent-bright)]">
            {fileName}
          </span>
          {description && (
            <span className="text-[11px] text-[var(--color-text-muted)] block mt-0.5">
              {description}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--color-text-dim)] shrink-0 transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
          ▶
        </span>
      </button>
      {open && content && (
        <pre className="px-4 py-3 bg-[#0c1021] text-[13px] font-mono text-[#e8ecf4] leading-[20px] overflow-x-auto max-h-[400px] overflow-y-auto border-t border-[var(--color-border)]">
          <code>{content}</code>
        </pre>
      )}
    </div>
  )
}
