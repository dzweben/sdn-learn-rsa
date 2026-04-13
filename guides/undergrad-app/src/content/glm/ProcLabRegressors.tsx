/**
 * GLM Labs — Module 5: Lab: The 41 Regressors
 * Write all timing file references, labels, types, and basis functions.
 */

import Callout from '@src/components/Callout'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'

export default function ProcLabRegressors(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 5 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: The 41 Regressors
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Wire up every timing file to the GLM. Four parallel lists that must stay in sync:
          stim_times, stim_labels, stim_types, and basis functions.
        </p>
      </div>

      <div className="prose-container">
        <Callout variant="warning">
          <strong>Order matters!</strong> The four lists below must have the same number of
          entries and the same order. Entry #1 in stim_times matches entry #1 in stim_labels,
          stim_types, and basis. If you add or remove a line in one list, you must do the same
          in all four. A mismatch means wrong labels on your betas &mdash; and AFNI will not
          warn you.
        </Callout>

        <h2>The Four Parallel Lists</h2>
        <p>
          Continuing your afni_proc.py call, you need to add four sections, each with 41
          entries:
        </p>

        <h3>1. Stimulus Timing Files</h3>
        <p>
          These are the .1D files you built in the Timing Labs. 32 per-run feedback files +
          8 collapsed pred/rsp files + 1 anticipation file:
        </p>

        <InsertCode language="tcsh" description="All 41 timing files — the .1D files your timing script produced">
{`        -regress_stim_times \\
        $stimdir/NonPM_Mean60_fdkm_run1.1D \\
        $stimdir/NonPM_Mean60_fdkn_run1.1D \\
        $stimdir/NonPM_Mean80_fdkm_run1.1D \\
        $stimdir/NonPM_Mean80_fdkn_run1.1D \\
        $stimdir/NonPM_Nice60_fdkm_run1.1D \\
        $stimdir/NonPM_Nice60_fdkn_run1.1D \\
        $stimdir/NonPM_Nice80_fdkm_run1.1D \\
        $stimdir/NonPM_Nice80_fdkn_run1.1D \\
        $stimdir/NonPM_Mean60_fdkm_run2.1D \\
        $stimdir/NonPM_Mean60_fdkn_run2.1D \\
        $stimdir/NonPM_Mean80_fdkm_run2.1D \\
        $stimdir/NonPM_Mean80_fdkn_run2.1D \\
        $stimdir/NonPM_Nice60_fdkm_run2.1D \\
        $stimdir/NonPM_Nice60_fdkn_run2.1D \\
        $stimdir/NonPM_Nice80_fdkm_run2.1D \\
        $stimdir/NonPM_Nice80_fdkn_run2.1D \\
        $stimdir/NonPM_Mean60_fdkm_run3.1D \\
        $stimdir/NonPM_Mean60_fdkn_run3.1D \\
        $stimdir/NonPM_Mean80_fdkm_run3.1D \\
        $stimdir/NonPM_Mean80_fdkn_run3.1D \\
        $stimdir/NonPM_Nice60_fdkm_run3.1D \\
        $stimdir/NonPM_Nice60_fdkn_run3.1D \\
        $stimdir/NonPM_Nice80_fdkm_run3.1D \\
        $stimdir/NonPM_Nice80_fdkn_run3.1D \\
        $stimdir/NonPM_Mean60_fdkm_run4.1D \\
        $stimdir/NonPM_Mean60_fdkn_run4.1D \\
        $stimdir/NonPM_Mean80_fdkm_run4.1D \\
        $stimdir/NonPM_Mean80_fdkn_run4.1D \\
        $stimdir/NonPM_Nice60_fdkm_run4.1D \\
        $stimdir/NonPM_Nice60_fdkn_run4.1D \\
        $stimdir/NonPM_Nice80_fdkm_run4.1D \\
        $stimdir/NonPM_Nice80_fdkn_run4.1D \\
        $stimdir/Mean60_pred.1D \\
        $stimdir/Mean60_rsp.1D \\
        $stimdir/Mean80_pred.1D \\
        $stimdir/Mean80_rsp.1D \\
        $stimdir/Nice60_pred.1D \\
        $stimdir/Nice60_rsp.1D \\
        $stimdir/Nice80_pred.1D \\
        $stimdir/Nice80_rsp.1D \\
        $stimdir/Anticipation_pred_fdk.1D \\`}
        </InsertCode>

        <h3>2. Stimulus Labels</h3>
        <p>
          Human-readable names for each regressor. These appear in the output stats file. The
          naming convention: <code className="code-inline">FBM</code> = FeedBack Mean,{' '}
          <code className="code-inline">FBN</code> = FeedBack Nice,{' '}
          <code className="code-inline">.r1</code> = run 1.
        </p>

        <InsertCode language="tcsh" description="41 labels — must match stim_times order exactly">
{`        -regress_stim_labels \\
        FBM.Mean60.r1 \\
        FBN.Mean60.r1 \\
        FBM.Mean80.r1 \\
        FBN.Mean80.r1 \\
        FBM.Nice60.r1 \\
        FBN.Nice60.r1 \\
        FBM.Nice80.r1 \\
        FBN.Nice80.r1 \\
        FBM.Mean60.r2 \\
        FBN.Mean60.r2 \\
        FBM.Mean80.r2 \\
        FBN.Mean80.r2 \\
        FBM.Nice60.r2 \\
        FBN.Nice60.r2 \\
        FBM.Nice80.r2 \\
        FBN.Nice80.r2 \\
        FBM.Mean60.r3 \\
        FBN.Mean60.r3 \\
        FBM.Mean80.r3 \\
        FBN.Mean80.r3 \\
        FBM.Nice60.r3 \\
        FBN.Nice60.r3 \\
        FBM.Nice80.r3 \\
        FBN.Nice80.r3 \\
        FBM.Mean60.r4 \\
        FBN.Mean60.r4 \\
        FBM.Mean80.r4 \\
        FBN.Mean80.r4 \\
        FBM.Nice60.r4 \\
        FBN.Nice60.r4 \\
        FBM.Nice80.r4 \\
        FBN.Nice80.r4 \\
        Pred.Mean60 \\
        Resp.Mean60 \\
        Pred.Mean80 \\
        Resp.Mean80 \\
        Pred.Nice60 \\
        Resp.Nice60 \\
        Pred.Nice80 \\
        Resp.Nice80 \\
        Anticipation.PredFdk \\`}
        </InsertCode>

        <h3>3. Stimulus Types</h3>
        <p>
          All 41 regressors use <code className="code-inline">AM1</code> (Amplitude Modulation
          type 1). This tells AFNI that the timing files contain onset:duration pairs, and the
          duration should modulate the response amplitude.
        </p>

        <InsertCode language="tcsh" description="41 types — all AM1 for onset:duration modulation">
{`        -regress_stim_types \\
        AM1 AM1 AM1 AM1 AM1 AM1 AM1 AM1 \\
        AM1 AM1 AM1 AM1 AM1 AM1 AM1 AM1 \\
        AM1 AM1 AM1 AM1 AM1 AM1 AM1 AM1 \\
        AM1 AM1 AM1 AM1 AM1 AM1 AM1 AM1 \\
        AM1 AM1 AM1 AM1 AM1 AM1 AM1 AM1 \\
        AM1 \\`}
        </InsertCode>

        <h3>4. Basis Functions</h3>
        <p>
          All use <code className="code-inline">dmBLOCK(0)</code> &mdash; a duration-modulated
          block response. The <code className="code-inline">(0)</code> means no minimum duration;
          the HRF shape scales with the actual event duration.
        </p>

        <InsertCode language="tcsh" description="41 basis functions — all dmBLOCK(0) for variable-duration events">
{`        -regress_basis_multi \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \\
        'dmBLOCK(0)' \\`}
        </InsertCode>

        <InsertCode language="tcsh" description="Ideal sum output">
{`        -regress_make_ideal_sum IDEAL_sum.1D \\`}
        </InsertCode>

        <Callout variant="learn">
          <strong>Why AM1 + dmBLOCK(0)?</strong> Our timing files have variable-duration events
          (onset:duration format). The <code className="code-inline">AM1</code> type tells AFNI
          the duration is a modulation parameter. The{' '}
          <code className="code-inline">dmBLOCK(0)</code> basis function creates an HRF that
          scales with duration. Together, they produce a predicted signal that matches the actual
          event length.
        </Callout>

        <h2>Count Check</h2>
        <p>
          You should have exactly <strong>41 entries</strong> in each of the four lists:
        </p>
        <ul>
          <li>32 run-wise feedback (8 conditions &times; 4 runs)</li>
          <li>8 collapsed prediction + response (4 pred + 4 rsp)</li>
          <li>1 anticipation</li>
        </ul>
        <p>
          If any list has a different count, the afni_proc.py call will fail. Double-check
          before moving on.
        </p>

        <PeekScript
          script="3a_afni_proc_template.sh"
          lines="111-279"
          label="See Danny's full regressor section"
        />
      </div>
    </div>
  )
}
