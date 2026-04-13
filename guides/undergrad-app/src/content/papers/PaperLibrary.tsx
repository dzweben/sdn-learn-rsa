/**
 * Paper Library — card grid listing all available paper walkthroughs.
 */

interface PaperCardData {
  id: string
  title: string
  authors: string
  year: number
  journal: string
  thumbnail: string
  tagline: string
  modulePrefix: string
}

const PAPERS: PaperCardData[] = [
  {
    id: 'finn-2020',
    title: 'Idiosynchrony',
    authors: 'Finn, Glerean, Khojandi, Nielson, Molfese, Handwerker & Bandettini',
    year: 2020,
    journal: 'Perspectives on Psychological Science',
    thumbnail: '🧬',
    tagline:
      'From shared responses to individual differences during naturalistic brain imaging — the IS-RSA framework that anchors our analysis.',
    modulePrefix: 'finn'
  }
]

interface PaperLibraryProps {
  onSelectPaper: (firstModuleId: string) => void
}

export default function PaperLibrary({ onSelectPaper }: PaperLibraryProps): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)] tracking-tight mb-2">
        Papers
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
        Deep, interactive walkthroughs of the key papers behind the LEARN RSA project. Each
        walkthrough connects the paper's ideas directly to our analysis.
      </p>

      <div className="grid gap-4">
        {PAPERS.map((paper) => (
          <button
            key={paper.id}
            onClick={() => onSelectPaper(`${paper.modulePrefix}-big-question`)}
            className="group text-left bg-[var(--color-bg-surface)] border border-[var(--color-border)]
                       rounded-xl p-6 transition-all hover:border-[var(--color-accent)]/30
                       hover:shadow-[var(--shadow-lg)] hover:translate-y-[-2px]"
          >
            <div className="flex items-start gap-5">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl bg-[var(--color-accent-subtle)] border border-[rgba(99,102,241,0.12)]
                              flex items-center justify-center text-3xl shrink-0 group-hover:shadow-[var(--shadow-glow)] transition-all">
                {paper.thumbnail}
              </div>

              <div className="min-w-0">
                {/* Title */}
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-heading)] group-hover:text-[var(--color-accent-bright)] transition-colors">
                  {paper.title}
                </h2>

                {/* Authors + year */}
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {paper.authors} ({paper.year}) · <em>{paper.journal}</em>
                </p>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                  {paper.tagline}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1 mt-3 text-xs text-[var(--color-accent-bright)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Start walkthrough</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Coming soon */}
      <div className="mt-6 bg-[var(--color-bg-surface)] border border-dashed border-[var(--color-border)] rounded-xl p-5 text-center">
        <p className="text-sm text-[var(--color-text-dim)]">
          More papers coming soon — Greco 2024, Baek 2023, Shen 2025, Lamba 2020
        </p>
      </div>
    </div>
  )
}
