/**
 * GLM Labs — Module 4: Lab: Processing Blocks
 * Write the processing block selection. Each block explained as they write it.
 */

import Callout from '@src/components/Callout'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'

export default function ProcLabBlocks(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 4 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: Processing Blocks
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Add the processing blocks, anatomy setup, alignment, motion parameters, and quality
          control options. These define how the data is preprocessed before the GLM runs.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Block Line</h2>
        <p>
          Continuing your afni_proc.py call from the previous lab, add the processing blocks
          and anatomy configuration:
        </p>

        <InsertCode language="tcsh" description="Processing blocks + anatomy + alignment">
{`        -blocks despike tshift align tlrc volreg mask scale regress \\
        -copy_anat $anat_dir/sub-\${subj}/anatSS.$subj.nii \\
        -anat_has_skull no \\
        -anat_follower anat_w_skull anat $anat_dir/sub-\${subj}/anatU.$subj.nii \\
        -mask_epi_anat yes \\`}
        </InsertCode>

        <p>Let&rsquo;s unpack each piece:</p>
        <ul>
          <li>
            <strong><code className="code-inline">-blocks</code></strong> &mdash; the 8
            preprocessing steps in order. <strong>No blur.</strong> This is deliberate for RSA.
          </li>
          <li>
            <strong><code className="code-inline">-copy_anat</code></strong> &mdash; the
            skull-stripped anatomy from SSWarper (<code className="code-inline">anatSS</code>)
          </li>
          <li>
            <strong><code className="code-inline">-anat_has_skull no</code></strong> &mdash;
            tells AFNI the anatomy is already skull-stripped
          </li>
          <li>
            <strong><code className="code-inline">-anat_follower</code></strong> &mdash; carries
            the original anatomy along for QC visualization
          </li>
          <li>
            <strong><code className="code-inline">-mask_epi_anat yes</code></strong> &mdash;
            creates the brain mask from the EPI-anatomy overlap
          </li>
        </ul>

        <Callout variant="warning">
          <strong>No blur block!</strong> If you accidentally add{' '}
          <code className="code-inline">blur</code> to the blocks list, every spatial pattern
          you are trying to measure with RSA will be smeared. Check your blocks list carefully.
        </Callout>

        <h2>Template and Alignment Options</h2>
        <p>Add the MNI template and alignment parameters:</p>

        <InsertCode language="tcsh" description="MNI template + alignment options">
{`        -tlrc_base MNI152_2009_template_SSW.nii.gz \\
        -tshift_align_to -tzero 0 \\
        -align_opts_aea \\
            -giant_move \\
            -cost lpc+ZZ \\
            -AddEdge \\
            -anat_uniform_method unifize \\
        -tlrc_NL_warped_dsets \\
            $anat_dir/sub-\${subj}/anatQQ.\${subj}.nii \\
            $anat_dir/sub-\${subj}/anatQQ.\${subj}.aff12.1D \\
            $anat_dir/sub-\${subj}/anatQQ.\${subj}_WARP.nii \\`}
        </InsertCode>

        <p>Key settings:</p>
        <ul>
          <li>
            <strong><code className="code-inline">MNI152_2009_template_SSW</code></strong> &mdash;
            the MNI template. Standard reference space so all subjects align.
          </li>
          <li>
            <strong><code className="code-inline">-giant_move</code></strong> &mdash; allows
            large alignment corrections. Necessary for our data.
          </li>
          <li>
            <strong><code className="code-inline">lpc+ZZ</code></strong> &mdash; the cost function
            for alignment. Local Pearson correlation with zero-clipping.
          </li>
          <li>
            <strong><code className="code-inline">-tlrc_NL_warped_dsets</code></strong> &mdash;
            the nonlinear warp files from SSWarper (already computed)
          </li>
        </ul>

        <h2>Volume Registration, Masking, and Scaling</h2>

        <InsertCode language="tcsh" description="Motion correction, mask, and scaling options">
{`        -volreg_align_to MIN_OUTLIER \\
        -volreg_align_e2a \\
        -volreg_tlrc_warp \\
        -mask_dilate 1 \\
        -scale_max_val 200 \\`}
        </InsertCode>

        <ul>
          <li>
            <strong><code className="code-inline">MIN_OUTLIER</code></strong> &mdash; aligns all
            volumes to the one with fewest outliers (best quality reference)
          </li>
          <li>
            <strong><code className="code-inline">-volreg_align_e2a</code></strong> and{' '}
            <strong><code className="code-inline">-volreg_tlrc_warp</code></strong> &mdash;
            combine motion correction, EPI-to-anatomy, and MNI warping into one interpolation
            step (reduces blurring)
          </li>
          <li>
            <strong><code className="code-inline">-scale_max_val 200</code></strong> &mdash;
            caps percent signal change at 200 to prevent extreme values
          </li>
        </ul>

        <h2>Regression Options (Motion, Censoring, QC)</h2>

        <InsertCode language="tcsh" description="Motion censoring and quality control options">
{`        -regress_censor_outliers 0.1 \\
        -regress_motion_per_run \\
        -regress_censor_motion $motion_max \\
        -regress_est_blur_epits \\
        -regress_est_blur_errts \\
        -regress_run_clustsim yes \\
        -html_review_style pythonic \\
        -test_stim_files no \\`}
        </InsertCode>

        <ul>
          <li>
            <strong>Motion censoring:</strong> TRs with motion &gt;{' '}
            <code className="code-inline">$motion_max</code> (1mm) are excluded from the GLM
          </li>
          <li>
            <strong>Outlier censoring:</strong> TRs with &gt; 10% outlier voxels are excluded
          </li>
          <li>
            <strong>Blur estimation:</strong> Measures the intrinsic smoothness of the data
            (for cluster-size correction later)
          </li>
          <li>
            <strong><code className="code-inline">-test_stim_files no</code></strong> &mdash;
            skips timing file validation (our padded files have a format AFNI does not expect)
          </li>
        </ul>

        <Callout variant="learn">
          The trailing backslash <code className="code-inline">\\</code> means this is all still
          one afni_proc.py command. In the next lab, you will add the 41 regressors to this
          same command.
        </Callout>

        <PeekScript
          script="3a_afni_proc_template.sh"
          lines="73-110"
          label="See Danny's blocks + alignment section"
        />

        <h2>Checkpoint</h2>
        <p>
          Your afni_proc.py call now specifies: subject ID, input data, processing blocks
          (no blur!), anatomy, template warping, motion correction, masking, scaling, censoring,
          and QC options. Still one continuous command. Next: the 41 regressors.
        </p>
      </div>
    </div>
  )
}
