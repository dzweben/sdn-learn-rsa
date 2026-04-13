/**
 * TryCommand — shows a terminal command with a "Copy" button.
 * The RA copies the command and pastes it into their own terminal (VS Code, iTerm, etc).
 */

import { useState } from 'react'

interface TryCommandProps {
  command: string
  description?: string
  execute?: boolean
  label?: string
}

export default function TryCommand({
  command,
  description,
  label
}: TryCommandProps): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = command
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
      <div className="px-4 py-3 font-mono text-sm text-[#e8ecf4] leading-relaxed whitespace-pre-wrap overflow-x-auto">
        <span className="text-[#5a6580] select-none mr-2">$</span>
        {command}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080b16] border-t border-[rgba(255,255,255,0.06)]">
        {description && (
          <p className="text-[11px] text-[#5a6580] leading-relaxed flex-1 mr-4">
            {description}
          </p>
        )}
        <button
          onClick={handleCopy}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            copied
              ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]'
              : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dim)] shadow-[var(--shadow-sm)]'
          }`}
        >
          {copied ? '✓ Copied!' : label || '📋 Copy to Clipboard'}
        </button>
      </div>
    </div>
  )
}
