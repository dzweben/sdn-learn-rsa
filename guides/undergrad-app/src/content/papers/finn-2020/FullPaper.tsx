/**
 * Finn et al. (2020) — Full Paper
 * Web version: links to the DOI instead of opening a local PDF.
 */

const DOI_URL = 'https://doi.org/10.1016/j.neuroimage.2020.116828'

export default function FullPaper(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Full Paper</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Read the Paper
        </h1>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] max-w-2xl">
        <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-teal)] px-6 py-4">
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.12em] mb-1">
            NeuroImage &middot; 2020
          </p>
          <h2 className="text-white text-lg font-bold leading-snug">
            Idiosynchrony: From shared responses to individual differences during naturalistic neuroimaging
          </h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-1">
            Emily S. Finn, Enrico Glerean, Arman Y. Khojandi, Dylan Nielson,
            Peter J. Molfese, Daniel A. Handwerker, Peter A. Bandettini
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mb-5 font-mono">
            DOI: 10.1016/j.neuroimage.2020.116828
          </p>

          <div className="bg-[var(--color-bg-elevated)] rounded-lg px-4 py-3 mb-5 border border-[var(--color-border)]">
            <p className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider mb-1.5">
              What this paper does
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Introduces Inter-Subject RSA (IS-RSA) — a framework for linking individual
              differences in brain responses during naturalistic stimuli to behavioral traits.
              Demonstrates the Anna Karenina model for working memory and explores personality
              effects using HCP movie-watching data.
            </p>
          </div>

          <a
            href={DOI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white
                       bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-dim)]
                       transition-all shadow-[var(--shadow-sm)] active:scale-[0.98]"
          >
            <span className="text-base">📄</span>
            <span>Read on NeuroImage &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}
