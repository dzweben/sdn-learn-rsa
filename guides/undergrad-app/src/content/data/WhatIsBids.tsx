/**
 * BIDS Data — Module 1: What is BIDS?
 */

import Callout from '@src/components/Callout'

export default function WhatIsBids(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 1 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          What is BIDS?
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          The standard that keeps neuroimaging data organized, shareable, and reproducible.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Problem Before BIDS</h2>
        <p>
          Imagine you join a new lab and your advisor says, "Here's the data from last year's
          study — run the analysis." You open the data folder and find directories named things
          like <code className="code-inline">JohnData_final2/</code>,{' '}
          <code className="code-inline">SUBJ03_corrected/</code>, and{' '}
          <code className="code-inline">old_backup_DO_NOT_DELETE/</code>. Inside, files are
          named <code className="code-inline">run1.nii</code> with no indication of what task
          was performed, which subject it belongs to, or when it was collected.
        </p>
        <p>
          This was the reality of neuroimaging data for decades. Every lab invented their own
          folder structure, their own naming conventions, their own way of storing behavioral
          data. Analysis scripts written for one lab's organization broke instantly when applied
          to another's. Sharing data meant shipping a hard drive along with a long email
          explaining your custom setup.
        </p>
        <p>
          The field needed a universal language for organizing brain imaging data — and in 2016,
          the community created one.
        </p>

        <Callout variant="definition">
          <strong>BIDS (Brain Imaging Data Structure):</strong> A community standard for
          organizing neuroimaging data. BIDS specifies exactly how files should be named, where
          they should be placed, and what metadata should accompany them. Any BIDS-compliant
          dataset can be understood by anyone — and processed by any BIDS-aware tool — without
          additional documentation.
        </Callout>

        <h2>What BIDS Guarantees</h2>
        <p>
          When a dataset follows BIDS, you get three powerful guarantees:
        </p>
        <ul>
          <li>
            <strong>Predictable paths:</strong> You always know where to find a subject's
            functional data, their anatomy, and their behavioral events — because BIDS dictates
            the folder structure.
          </li>
          <li>
            <strong>Machine-readable metadata:</strong> JSON sidecar files describe scan
            parameters (TR, slice timing, etc.) in a format that software can parse
            automatically.
          </li>
          <li>
            <strong>Reproducibility:</strong> Anyone can download your dataset and immediately
            run analyses without needing to decode your personal organizational scheme.
          </li>
        </ul>

        <h2>The BIDS Folder Structure</h2>
        <p>
          At its core, BIDS organizes data by <strong>subject</strong> and then by{' '}
          <strong>data type</strong>. Here is the basic layout:
        </p>
        <pre className="code-block"><code>{`dataset/
  sub-958/
    anat/                    # Anatomical (structural) scans
      sub-958_T1w.nii.gz     # T1-weighted MRI image
    func/                    # Functional (task) scans
      sub-958_task-learn_run-01_bold.nii.gz   # fMRI data, run 1
      sub-958_task-learn_run-01_events.tsv    # Behavioral events, run 1
      sub-958_task-learn_run-02_bold.nii.gz   # fMRI data, run 2
      sub-958_task-learn_run-02_events.tsv    # Behavioral events, run 2
      ...
  sub-1267/
    anat/
      ...
    func/
      ...`}</code></pre>
        <p>
          Every subject gets their own folder. Inside, <code className="code-inline">anat/</code>{' '}
          holds structural brain images and <code className="code-inline">func/</code> holds
          functional (task) data. This pattern is the same for every subject, every study,
          every lab in the world that uses BIDS.
        </p>

        <h2>File Naming: Every Part Means Something</h2>
        <p>
          Let's decode a real filename from our study:
        </p>
        <pre className="code-block"><code>{`sub-958_task-learn_run-01_bold.nii.gz
 │       │          │       │     │
 │       │          │       │     └─ compressed NIfTI format
 │       │          │       └─ BOLD = Blood-Oxygen-Level-Dependent (fMRI signal)
 │       │          └─ first run of the task
 │       └─ the task name is "learn" (our LEARN task)
 └─ subject ID is 958`}</code></pre>
        <p>
          This naming scheme is not optional — it is the BIDS specification. Every piece of
          information is encoded as a <strong>key-value pair</strong> separated by hyphens and
          underscores. Software tools can parse these filenames automatically to extract the
          subject ID, task, run number, and data type without ever opening the file.
        </p>

        <h2>The Events Sidecar</h2>
        <p>
          Alongside each functional run sits an <strong>events file</strong> — a tab-separated
          text file (<code className="code-inline">.tsv</code>) that records exactly what happened
          during that scan. Every prediction the participant made, every piece of feedback they
          received, every button press — all timestamped relative to the start of the scan.
        </p>
        <p>
          For example, <code className="code-inline">sub-958_task-learn_run-01_events.tsv</code>{' '}
          is paired with <code className="code-inline">sub-958_task-learn_run-01_bold.nii.gz</code>.
          The events file tells us <em>when</em> things happened; the BOLD file tells us{' '}
          <em>what the brain was doing</em>. Together, they let us link brain activity to
          specific psychological events.
        </p>

        <Callout variant="tip">
          Events files are the bridge between behavior and brain. Without them, fMRI data is
          just a movie of blood flow with no way to know what the participant was experiencing
          at any given moment. You will become very familiar with these files — they are the
          starting point for our entire analysis pipeline.
        </Callout>

        <h2>Raw Data vs. Derivatives</h2>
        <p>
          BIDS makes a critical distinction between <strong>raw data</strong> and{' '}
          <strong>derivatives</strong>:
        </p>
        <ul>
          <li>
            <strong>Raw data</strong> is sacred. It comes straight from the scanner and is{' '}
            <em>never modified</em>. If you make a mistake in your analysis, you can always go
            back to raw data and start over. In our project, the original BIDS data lives at{' '}
            <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/bids/</code> on the
            server.
          </li>
          <li>
            <strong>Derivatives</strong> are computed outputs — anything produced by processing
            raw data. Preprocessed images, statistical maps, timing files — all derivatives.
            They live in a separate <code className="code-inline">derivatives/</code> folder so
            they never contaminate the raw data.
          </li>
        </ul>

        <h2>Our Data: <code className="code-inline">bids_fixed/</code></h2>
        <p>
          In our project, we work with a special version of the BIDS data called{' '}
          <code className="code-inline">bids_fixed/</code>. This is the output of{' '}
          <strong>Stage 1</strong> of our pipeline, where we corrected event labels in the
          original events files.
        </p>
        <p>
          The event labels in this directory have been cleaned and standardized so that all
          feedback events are consistently labeled. The{' '}
          <code className="code-inline">bids_fixed/</code> folder has the exact same BIDS
          structure as the original — same subjects, same runs, same file names — but with
          corrected event labels.
        </p>
        <p>
          On the server, this lives at:{' '}
          <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/</code>
        </p>

        <Callout variant="learn">
          <p>
            Standardization is not just a bureaucratic exercise — it is what makes
            reproducible science possible. Because our data follows BIDS, anyone on the team
            (including you!) can navigate the dataset, understand its structure, and run the
            pipeline without needing a personal walkthrough. Every script in our pipeline
            assumes BIDS paths. If the data were organized differently, every script would
            break.
          </p>
          <p className="mt-2">
            When you publish research with BIDS-formatted data, other researchers can verify
            your work, reuse your data, and build on your findings. This is the foundation of
            open science.
          </p>
        </Callout>

        <Callout variant="exercise">
          <p><strong>Explore the BIDS structure yourself:</strong></p>
          <p className="mt-2">
            Open a terminal or file browser and navigate to{' '}
            <code className="code-inline">bids_fixed/</code> on the server. Try the following:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              List all subjects: <code className="code-inline">ls bids_fixed/</code> — how many
              subject folders do you see?
            </li>
            <li>
              Look inside one subject: <code className="code-inline">ls bids_fixed/sub-958/func/</code>{' '}
              — what files are there? Can you identify the BOLD files and the events files?
            </li>
            <li>
              Compare two subjects: look at{' '}
              <code className="code-inline">bids_fixed/sub-958/func/</code> and{' '}
              <code className="code-inline">bids_fixed/sub-1267/func/</code>. Do they have the
              same structure? Do they have the same number of runs?
            </li>
            <li>
              Decode a filename: pick any <code className="code-inline">.nii.gz</code> file and
              identify the subject ID, task name, run number, and data type.
            </li>
          </ul>
        </Callout>

        <h2>Key Takeaways</h2>
        <ul>
          <li>
            BIDS is a universal standard for organizing neuroimaging data — predictable paths,
            machine-readable metadata, and built-in reproducibility.
          </li>
          <li>
            Files are named with key-value pairs:{' '}
            <code className="code-inline">sub-</code>, <code className="code-inline">task-</code>,{' '}
            <code className="code-inline">run-</code>, etc.
          </li>
          <li>
            Each functional run has a paired events file that records what happened during the
            scan.
          </li>
          <li>
            Raw data is never modified. Derivatives live separately.
          </li>
          <li>
            Our <code className="code-inline">bids_fixed/</code> folder is BIDS-structured data
            with corrected event labels from Stage 1 of the pipeline.
          </li>
        </ul>
      </div>
    </div>
  )
}
