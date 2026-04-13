/**
 * GLM Labs — Module 6: Lab: The 45 GLTs
 * Write all General Linear Tests with correct weights.
 */

import Callout from '@src/components/Callout'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'

export default function ProcLabGlts(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 6 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: The 45 GLTs
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          General Linear Tests &mdash; weighted combinations of betas that answer specific
          questions about the data. You will write all 45.
        </p>
      </div>

      <div className="prose-container">
        <h2>What Is a GLT?</h2>
        <p>
          A GLT is a linear combination of betas with specific weights. For example, averaging
          4 betas: give each a weight of 0.25 (= 1/4). Comparing two betas: weight one as +1
          and the other as -1.
        </p>
        <p>
          The syntax is{' '}
          <code className="code-inline">SYM: +0.25*Label1 +0.25*Label2 ...</code>. AFNI
          computes the weighted combination and produces a coefficient + t-statistic for each
          GLT.
        </p>

        <Callout variant="tip">
          <strong>Weight formula:</strong> averaging N things = each gets weight 1/N.
          So averaging 4 items = 0.25 each. Averaging 8 items = 0.125 each. Averaging 16 items
          = 0.0625 each.
        </Callout>

        <h2>The 7 Hierarchical Categories</h2>
        <p>
          Our 45 GLTs fall into 7 groups. You will write them all, continuing the afni_proc.py
          call. Here is the structure:
        </p>

        <h3>Category 1: Grand Averages (7 GLTs)</h3>
        <p>
          Average over all runs for each feedback condition. Weight = 0.25 (1/4 runs):
        </p>

        <InsertCode language="tcsh" description="GLTs: Grand averages — one per feedback condition + grand overall">
{`        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBM.Mean60.r2 +0.25*FBM.Mean60.r3 +0.25*FBM.Mean60.r4' -glt_label 1 Grand_FBM.Mean60 \\
        -gltsym 'SYM: +0.25*FBN.Mean60.r1 +0.25*FBN.Mean60.r2 +0.25*FBN.Mean60.r3 +0.25*FBN.Mean60.r4' -glt_label 2 Grand_FBN.Mean60 \\
        -gltsym 'SYM: +0.25*FBM.Mean80.r1 +0.25*FBM.Mean80.r2 +0.25*FBM.Mean80.r3 +0.25*FBM.Mean80.r4' -glt_label 3 Grand_FBM.Mean80 \\
        -gltsym 'SYM: +0.25*FBN.Mean80.r1 +0.25*FBN.Mean80.r2 +0.25*FBN.Mean80.r3 +0.25*FBN.Mean80.r4' -glt_label 4 Grand_FBN.Mean80 \\
        -gltsym 'SYM: +0.25*FBM.Nice60.r1 +0.25*FBM.Nice60.r2 +0.25*FBM.Nice60.r3 +0.25*FBM.Nice60.r4' -glt_label 5 Grand_FBM.Nice60 \\
        -gltsym 'SYM: +0.25*FBN.Nice60.r1 +0.25*FBN.Nice60.r2 +0.25*FBN.Nice60.r3 +0.25*FBN.Nice60.r4' -glt_label 6 Grand_FBN.Nice60 \\
        -gltsym 'SYM: +0.25*FBM.Nice80.r1 +0.25*FBM.Nice80.r2 +0.25*FBM.Nice80.r3 +0.25*FBM.Nice80.r4' -glt_label 7 Grand_FBN.Nice80 \\`}
        </InsertCode>

        <h3>Category 2: Per-Run Peer Averages (16 GLTs)</h3>
        <p>
          For each run, average the two feedback types (fdkm + fdkn) per peer. Weight = 0.5
          (1/2):
        </p>

        <InsertCode language="tcsh" description="GLTs: Per-run peer averages — 4 peers x 4 runs = 16">
{`        -gltsym 'SYM: +0.5*FBM.Mean60.r1 +0.5*FBN.Mean60.r1' -glt_label 8 Mean60.r1 \\
        -gltsym 'SYM: +0.5*FBM.Mean60.r2 +0.5*FBN.Mean60.r2' -glt_label 9 Mean60.r2 \\
        -gltsym 'SYM: +0.5*FBM.Mean60.r3 +0.5*FBN.Mean60.r3' -glt_label 10 Mean60.r3 \\
        -gltsym 'SYM: +0.5*FBM.Mean60.r4 +0.5*FBN.Mean60.r4' -glt_label 11 Mean60.r4 \\
        -gltsym 'SYM: +0.5*FBM.Mean80.r1 +0.5*FBN.Mean80.r1' -glt_label 12 Mean80.r1 \\
        -gltsym 'SYM: +0.5*FBM.Mean80.r2 +0.5*FBN.Mean80.r2' -glt_label 13 Mean80.r2 \\
        -gltsym 'SYM: +0.5*FBM.Mean80.r3 +0.5*FBN.Mean80.r3' -glt_label 14 Mean80.r3 \\
        -gltsym 'SYM: +0.5*FBM.Mean80.r4 +0.5*FBN.Mean80.r4' -glt_label 15 Mean80.r4 \\
        -gltsym 'SYM: +0.5*FBM.Nice60.r1 +0.5*FBN.Nice60.r1' -glt_label 16 Nice60.r1 \\
        -gltsym 'SYM: +0.5*FBM.Nice60.r2 +0.5*FBN.Nice60.r2' -glt_label 17 Nice60.r2 \\
        -gltsym 'SYM: +0.5*FBM.Nice60.r3 +0.5*FBN.Nice60.r3' -glt_label 18 Nice60.r3 \\
        -gltsym 'SYM: +0.5*FBM.Nice60.r4 +0.5*FBN.Nice60.r4' -glt_label 19 Nice60.r4 \\
        -gltsym 'SYM: +0.5*FBM.Nice80.r1 +0.5*FBN.Nice80.r1' -glt_label 20 Nice80.r1 \\
        -gltsym 'SYM: +0.5*FBM.Nice80.r2 +0.5*FBN.Nice80.r2' -glt_label 21 Nice80.r2 \\
        -gltsym 'SYM: +0.5*FBM.Nice80.r3 +0.5*FBN.Nice80.r3' -glt_label 22 Nice80.r3 \\
        -gltsym 'SYM: +0.5*FBM.Nice80.r4 +0.5*FBN.Nice80.r4' -glt_label 23 Nice80.r4 \\`}
        </InsertCode>

        <h3>Category 3: Per-Run Mean/Nice (8 GLTs)</h3>
        <p>
          Average all feedback for Mean vs Nice in each run. Weight = 0.25 (4 conditions per
          personality):
        </p>

        <InsertCode language="tcsh" description="GLTs: Per-run Mean vs Nice averages">
{`        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBN.Mean60.r1 +0.25*FBM.Mean80.r1 +0.25*FBN.Mean80.r1' -glt_label 24 Mean.r1 \\
        -gltsym 'SYM: +0.25*FBM.Mean60.r2 +0.25*FBN.Mean60.r2 +0.25*FBM.Mean80.r2 +0.25*FBN.Mean80.r2' -glt_label 25 Mean.r2 \\
        -gltsym 'SYM: +0.25*FBM.Mean60.r3 +0.25*FBN.Mean60.r3 +0.25*FBM.Mean80.r3 +0.25*FBN.Mean80.r3' -glt_label 26 Mean.r3 \\
        -gltsym 'SYM: +0.25*FBM.Mean60.r4 +0.25*FBN.Mean60.r4 +0.25*FBM.Mean80.r4 +0.25*FBN.Mean80.r4' -glt_label 27 Mean.r4 \\
        -gltsym 'SYM: +0.25*FBM.Nice60.r1 +0.25*FBN.Nice60.r1 +0.25*FBM.Nice80.r1 +0.25*FBN.Nice80.r1' -glt_label 28 Nice.r1 \\
        -gltsym 'SYM: +0.25*FBM.Nice60.r2 +0.25*FBN.Nice60.r2 +0.25*FBM.Nice80.r2 +0.25*FBN.Nice80.r2' -glt_label 29 Nice.r2 \\
        -gltsym 'SYM: +0.25*FBM.Nice60.r3 +0.25*FBN.Nice60.r3 +0.25*FBM.Nice80.r3 +0.25*FBN.Nice80.r3' -glt_label 30 Nice.r3 \\
        -gltsym 'SYM: +0.25*FBM.Nice60.r4 +0.25*FBN.Nice60.r4 +0.25*FBM.Nice80.r4 +0.25*FBN.Nice80.r4' -glt_label 31 Nice.r4 \\`}
        </InsertCode>

        <h3>Categories 4-7: Cross-Run Averages (14 GLTs)</h3>
        <p>
          These average across runs for condition-level, peer-level, and grand mean/nice
          contrasts. Weight = 0.0625 (1/16) for grand averages. I will show representative
          examples &mdash; use Danny&rsquo;s script for the full set:
        </p>

        <InsertCode language="tcsh" description="GLTs: Example cross-run averages (see PeekScript for all)">
{`        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBM.Mean60.r2 +0.25*FBM.Mean60.r3 +0.25*FBM.Mean60.r4' -glt_label 32 FBM.Mean60_avg \\
        -gltsym 'SYM: +0.25*FBN.Mean60.r1 +0.25*FBN.Mean60.r2 +0.25*FBN.Mean60.r3 +0.25*FBN.Mean60.r4' -glt_label 33 FBN.Mean60_avg \\`}
        </InsertCode>

        <Callout variant="tip">
          The full set of 45 GLTs is long. The critical thing is the <strong>weight
          arithmetic</strong>: to average N regressors, each gets weight 1/N. To compare two
          averages, weight one positively and the other negatively. Use Danny&rsquo;s complete
          version as your reference:
        </Callout>

        <PeekScript
          script="3a_afni_proc_template.sh"
          lines="279-450"
          label="See Danny's full 45 GLTs"
        />

        <h2>Close the Command and Loop</h2>
        <p>
          After all GLTs, add the output options and close:
        </p>

        <InsertCode language="tcsh" description="Output options + close the foreach loop">
{`        -regress_compute_fitts \\
        -regress_opts_3dD \\
            -cbucket cbucket.$subj.$GLM \\
            -jobs $jobs

    cd $results

end`}
        </InsertCode>

        <p>
          The <code className="code-inline">-cbucket</code> creates a separate file with only
          the beta coefficients (no t-stats), which is convenient for RSA extraction.{' '}
          <code className="code-inline">end</code> closes the{' '}
          <code className="code-inline">foreach</code> loop.
        </p>

        <h2>Your Proc Template Is Complete!</h2>
        <p>
          The full afni_proc.py call should be roughly 280 lines. It specifies:
        </p>
        <ul>
          <li>Input data (4 BOLD runs per subject)</li>
          <li>8 processing blocks (no blur)</li>
          <li>Anatomy, template, alignment, and motion correction</li>
          <li>41 regressors with timing files, labels, types, and basis functions</li>
          <li>45 GLTs for statistical contrasts</li>
          <li>Output options</li>
        </ul>

        <PeekScript
          script="3a_afni_proc_template.sh"
          label="See the complete production proc template"
        />

        <Callout variant="exercise" title="Verify Your Template">
          <p>Compare your file against Danny&rsquo;s. Check:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>41 entries in each of the four regressor lists</li>
            <li>45 GLT lines</li>
            <li>No blur block</li>
            <li>The foreach loop opens with <code className="code-inline">foreach</code> and
              closes with <code className="code-inline">end</code></li>
          </ul>
        </Callout>
      </div>
    </div>
  )
}
