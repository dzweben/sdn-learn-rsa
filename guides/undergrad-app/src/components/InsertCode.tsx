/**
 * InsertCode — styled code block with a "Copy" button.
 * Used in write-from-scratch labs. The RA copies the code and pastes
 * it into their own editor (VS Code, nano, etc).
 */

import { useState } from 'react'

interface InsertCodeProps {
  children: string
  language?: string
  description?: string
}

export default function InsertCode({
  children,
  language = 'bash',
  description
}: InsertCodeProps): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const code = children.trim()

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 bg-[#0c1021] border border-[var(--color-border)] rounded-xl overflow-hidden">
      {description && (
        <div className="px-4 py-2 bg-[#080b16] border-b border-[rgba(255,255,255,0.06)]">
          <p className="text-[11px] text-[#5a6580] leading-relaxed">
            {description}
          </p>
        </div>
      )}

      <pre className="px-4 py-3 font-mono text-[13px] text-[#e8ecf4] leading-[20px] whitespace-pre-wrap overflow-x-auto">
        <code>{code}</code>
      </pre>

      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080b16] border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-[10px] text-[#5a6580] font-mono uppercase">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            copied
              ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]'
              : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dim)] shadow-[var(--shadow-sm)]'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
      </div>
    </div>
  )
}
