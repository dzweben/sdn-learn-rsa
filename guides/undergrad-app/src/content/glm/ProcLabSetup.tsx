/**
 * GLM Labs — Module 3: Lab: Create Your Proc Template
 * CreateFile → write setup section: variables, locations, data inputs, script options.
 */

import Callout from '@src/components/Callout'
import CreateFile from '@src/components/CreateFile'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'

export default function ProcLabSetup(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 3 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: Create Your Proc Template
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Start from an empty file. Write the setup section: variables, paths, data inputs,
          and the beginning of the afni_proc.py call.
        </p>
      </div>

      <div className="prose-container">
        <Callout variant="learn">
          <strong>Important:</strong> This script is in <code className="code-inline">tcsh</code>,
          not <code className="code-inline">bash</code>. AFNI&rsquo;s afni_proc.py generates
          tcsh scripts, so the template uses tcsh syntax. The main differences: variables use{' '}
          <code className="code-inline">set var = value</code> (not{' '}
          <code className="code-inline">var=value</code>), and loops use{' '}
          <code className="code-inline">foreach</code> (not{' '}
          <code className="code-inline">for</code>).
        </Callout>

        <h2>Step 1: Create the File</h2>
        <CreateFile
          filename="my_proc_template.sh"
          language="shell"
          description="Opens a blank tcsh script for your afni_proc.py template."
        />

        <h2>Step 2: Shebang and Header</h2>
        <InsertCode language="tcsh" description="Shebang + header — note #!/bin/tcsh, not #!/bin/bash">
{`#!/bin/tcsh

#######################################################
# my_proc_template.sh — afni_proc.py generator for RSA-learn
#
# Generates a subject-specific processing + GLM script.
# Run-wise betas for RSA. No smoothing. +Anticipation regressor.
#######################################################`}
        </InsertCode>

        <h2>Step 3: General Setup Variables</h2>
        <p>
          Define the subject list, GLM name, motion threshold, and parallelism:
        </p>

        <InsertCode language="tcsh" description="General setup — subjects, GLM name, motion threshold">
{`
############################################################################################
# GENERAL SETUP
############################################################################################

# Subject numbers (no sub- prefix)
set subjects = ( 958 1158 1267 1380 )

# GLM name (used in output folder names)
set GLM = LEARN_RSA_runwise_AFNI

# Motion censor threshold (mm)
set motion_max = 1

# Number of parallel jobs for 3dDeconvolve
set jobs = 30`}
        </InsertCode>

        <h2>Step 4: Location Variables</h2>
        <p>
          Every path the script needs &mdash; BIDS data, timing files, output, anatomy:
        </p>

        <InsertCode language="tcsh" description="Locations — all directory paths">
{`
############################################################################################
# LOCATIONS
############################################################################################

set topdir = /data/projects/STUDIES/LEARN/fMRI

# Raw BIDS inputs (functional + anatomical)
set subjbids = $topdir/bids

# Timing files from Stage 2
set subjecttiming = $topdir/RSA-learn/TimingFiles/Fixed2

# Output root for GLM results
set results = $topdir/RSA-learn/derivatives/afni/IndvlLvlAnalyses

# SSWarper anatomy outputs
set anat_dir = $topdir/derivatives/afni/ssw

# Optional overrides (for testing with different paths)
if ( $?BIDS_DIR_OVERRIDE ) then
    set subjbids = "$BIDS_DIR_OVERRIDE"
endif
if ( $?TIMING_ROOT_OVERRIDE ) then
    set subjecttiming = "$TIMING_ROOT_OVERRIDE"
endif`}
        </InsertCode>

        <Callout variant="tip">
          <strong>Key paths to know:</strong>{' '}
          <code className="code-inline">$subjbids</code> = raw BIDS (BOLD .nii.gz files).{' '}
          <code className="code-inline">$subjecttiming</code> = your .1D files from Stage 2.{' '}
          <code className="code-inline">$anat_dir</code> = skull-stripped anatomy from SSWarper
          (already done by the lab&rsquo;s standard pipeline).
        </Callout>

        <h2>Step 5: Begin the Subject Loop and afni_proc.py Call</h2>
        <p>
          Now start the loop and the afni_proc.py call. This is the beginning of a very long
          command that continues through the next three labs:
        </p>

        <InsertCode language="tcsh" description="Subject loop + beginning of afni_proc.py call">
{`
############################################################################################
# BEGIN
############################################################################################

cd $results

foreach subj ( $subjects )

    mkdir -p $subj
    cd $subj

    set subj_dir = $subjbids/sub-$subj
    set stimdir = $subjecttiming/sub-$subj

    afni_proc.py -subj_id $subj \\
        -dsets \\
            $subj_dir/func/sub-\${subj}_task-learn_run-01_bold.nii.gz \\
            $subj_dir/func/sub-\${subj}_task-learn_run-02_bold.nii.gz \\
            $subj_dir/func/sub-\${subj}_task-learn_run-03_bold.nii.gz \\
            $subj_dir/func/sub-\${subj}_task-learn_run-04_bold.nii.gz \\
        -scr_overwrite \\
        -script $results/$subj/proc.$subj.$GLM \\
        -out_dir $subj.results.$GLM \\`}
        </InsertCode>

        <p>
          Note the <code className="code-inline">\\</code> at the end of each line &mdash;
          this entire afni_proc.py call is one command that spans hundreds of lines. The
          backslash tells tcsh &ldquo;this continues on the next line.&rdquo;
        </p>

        <Callout variant="warning">
          Do NOT close the <code className="code-inline">foreach</code> loop with{' '}
          <code className="code-inline">end</code> yet! The next three labs will add blocks,
          regressors, GLTs, and output options before closing.
        </Callout>

        <h2>Peek at Danny&rsquo;s Version</h2>
        <PeekScript
          script="3a_afni_proc_template.sh"
          lines="1-72"
          label="See Danny's setup section (lines 1-72)"
        />

        <h2>Checkpoint</h2>
        <p>
          Your editor should have: a tcsh shebang, setup variables, location paths, and the
          beginning of an afni_proc.py call that specifies the subject ID, input datasets,
          script name, and output directory. The call is still open (trailing backslash).
        </p>
      </div>
    </div>
  )
}
