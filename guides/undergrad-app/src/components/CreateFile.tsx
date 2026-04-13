/**
 * CreateFile — instruction to create a new file in the RA's editor.
 * Displays the filename and tells them to open a blank file.
 */

interface CreateFileProps {
  filename: string
  language?: string
  label?: string
  description?: string
}

export default function CreateFile({
  filename,
  description
}: CreateFileProps): React.JSX.Element {
  return (
    <div className="my-6 bg-[var(--color-bg-surface)] border-2 border-dashed border-[var(--color-accent)]/40 rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] shrink-0">
          <span className="text-2xl">📝</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-[var(--color-accent-bright)]">
            Create <code className="code-inline">{filename}</code>
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
            {description || (
              <>
                Open VS Code (or your editor) and create a new file called{' '}
                <code className="code-inline">{filename}</code>. You&rsquo;ll build this script
                section by section.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
