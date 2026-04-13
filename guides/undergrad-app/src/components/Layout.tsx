/**
 * App shell — dark high-tech layout with:
 * - Activity bar (left icon rail)
 * - Module sidebar
 * - Content area (center, scrollable)
 */

import clsx from 'clsx'

export type TabId = 'papers' | 'foundations' | 'data' | 'timing' | 'glm' | 'next'

interface LayoutProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  content: React.ReactNode
  moduleNav: React.ReactNode
}

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'papers', icon: '📑', label: 'Papers' },
  { id: 'foundations', icon: '🖥️', label: 'Foundations' },
  { id: 'data', icon: '🧠', label: 'Your Data' },
  { id: 'timing', icon: '⏱️', label: 'Timing Files' },
  { id: 'glm', icon: '📊', label: 'The GLM' },
  { id: 'next', icon: '🚀', label: "What's Next" }
]

export default function Layout({
  activeTab,
  onTabChange,
  content,
  moduleNav
}: LayoutProps): React.JSX.Element {
  return (
    <div className="flex h-screen bg-[var(--color-bg-deep)]">
      {/* ── Activity Bar (left icon rail) ── */}
      <div className="flex flex-col items-center w-[54px] shrink-0 bg-[var(--color-bg-base)] border-r border-[var(--color-border)] py-2">
        <div className="h-[12px] shrink-0" />
        <div className="flex flex-col items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx('activity-icon', activeTab === tab.id && 'active')}
              title={tab.label}
            >
              <span>{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Module Sidebar ── */}
      <div className="w-[220px] shrink-0 bg-[var(--color-bg-base)] border-r border-[var(--color-border)] overflow-y-auto">
        <div className="px-4 pt-[20px] pb-3">
          <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.1em] font-[var(--font-heading)]">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
        </div>
        <div className="px-2 pb-4">{moduleNav}</div>
      </div>

      {/* ── Content Area ── */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-[var(--color-bg-base)]">
        <div className="max-w-[720px] mx-auto px-10 py-10">{content}</div>
      </main>
    </div>
  )
}
