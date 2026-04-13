/**
 * BIDS Data — Module 5: Across Subjects
 */

import Callout from '@src/components/Callout'

export default function AcrossSubjects(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 5 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Across Subjects
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Understanding the 38 participants in our dataset — their variability, their
          differences, and why that variability is a feature, not a bug.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Sample</h2>
        <p>
          Our dataset includes <strong>38 participants</strong> who completed the LEARN task
          inside the MRI scanner. These are adolescents — the study is developmental in nature,
          focused on how young people learn about and form impressions of peers. This age group
          is especially interesting because adolescence is a period of heightened sensitivity to
          social feedback, making it an ideal window for studying the neural mechanisms of
          social learning.
        </p>
        <p>
          Each participant has a BIDS-style subject ID that looks like{' '}
          <code className="code-inline">sub-958</code>,{' '}
          <code className="code-inline">sub-1267</code>, or{' '}
          <code className="code-inline">sub-1301</code>. These are not sequential numbers —
          they are study-specific identifiers assigned during enrollment. Do not be surprised
          that the IDs jump around; this is completely normal in longitudinal research studies.
        </p>

        <h2>Variable Run Counts</h2>
        <p>
          Most participants completed all <strong>4 functional runs</strong> of the LEARN task.
          However, some participants have only <strong>2 or 3 usable runs</strong>. This happens
          for several reasons:
        </p>
        <ul>
          <li>
            <strong>Excessive motion:</strong> If a participant moved too much during a run, that
            run's data may be unusable. Head motion as small as a few millimeters can smear the
            fMRI signal across voxels.
          </li>
          <li>
            <strong>Technical issues:</strong> Scanner malfunctions, stimulus delivery problems,
            or interrupted sessions can result in missing runs.
          </li>
          <li>
            <strong>Participant comfort:</strong> Some participants may have asked to stop the
            scan early, especially adolescents who found the scanner uncomfortable.
          </li>
        </ul>
        <p>
          This variability in run counts is <strong>completely normal</strong> in fMRI research.
          Our pipeline handles it gracefully — this is exactly what the fallback patch
          (<code className="code-inline">3b_fallback_patch.py</code>) is for. It adjusts the
          AFNI processing script for subjects with fewer than 4 runs so that the GLM runs
          correctly regardless.
        </p>

        <Callout variant="tip">
          Do not worry if you see that some subjects have fewer runs than others. This is
          expected, not a sign that something went wrong with the pipeline. The important
          thing is that the pipeline processes each subject according to how many usable runs
          they actually have. A subject with 3 clean runs gives us better data than a subject
          with 4 runs where one is corrupted by motion.
        </Callout>

        <h2>How to Explore the Subjects</h2>
        <p>
          You can quickly get a sense of your dataset with a few terminal commands:
        </p>
        <pre className="code-block"><code>{`# Count total subjects
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/ | wc -l

# List all subject IDs
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/

# See how many runs sub-958 has (expect 4)
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/sub-958/func/*bold.nii.gz

# Compare with another subject — some may have fewer
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/sub-1267/func/*bold.nii.gz`}</code></pre>
        <p>
          The subject list is also available in a canonical text file used by all pipeline
          scripts:{' '}
          <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt</code>.
          This file contains one subject ID per line and is the single source of truth for which
          subjects to process.
        </p>

        <Callout variant="exercise">
          <p><strong>Map out your dataset:</strong></p>
          <p className="mt-2">
            Open a terminal and try these commands:
          </p>
          <pre className="code-block mt-2"><code>{`# Count subjects
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/ | wc -l

# For each subject, count how many BOLD runs they have
for subj in /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/sub-*/; do
  nruns=$(ls "$subj"/func/*bold.nii.gz 2>/dev/null | wc -l)
  echo "$(basename $subj): $nruns runs"
done`}</code></pre>
          <p className="mt-2">
            How many subjects have 4 runs? How many have fewer? Pick one subject with fewer
            than 4 runs and look at their{' '}
            <code className="code-inline">func/</code> directory — what files are present?
          </p>
        </Callout>

        <h2>Clinical Measures</h2>
        <p>
          This is not just a neuroimaging study — it is a study about <strong>individual
          differences</strong>. Each participant completed a battery of questionnaires, and the
          most important measure for our analysis is the <strong>SCARED social anxiety
          subscale</strong>. SCARED stands for Screen for Child Anxiety Related Disorders, and
          the social anxiety subscale specifically measures how anxious a young person feels in
          social situations.
        </p>
        <p>
          Other clinical measures in the dataset include broader anxiety scales, depression
          measures, and behavioral performance metrics from the task itself (like prediction
          accuracy). These are stored in a subject table that maps each subject ID to their
          clinical scores.
        </p>
        <p>
          The clinical data is available in{' '}
          <code className="code-inline">analysis/</code> in the repository, which contains a
          subject-level table with these measures.
        </p>

        <Callout variant="learn">
          <p>
            Individual differences in social anxiety are the core of our research question. We
            are not just asking "how does the brain process social feedback?" — we are asking
            "does the brain process social feedback <em>differently</em> depending on a person's
            level of social anxiety?"
          </p>
          <p className="mt-2">
            This is where inter-subject RSA (IS-RSA) comes in. IS-RSA compares neural
            similarity patterns between participants and asks whether participants with similar
            anxiety levels also have similar neural representations. The clinical measures turn
            our 38 participants from anonymous brain scans into individuals with meaningful
            psychological differences.
          </p>
        </Callout>

        <h2>Data Quality Considerations</h2>
        <p>
          Beyond variable run counts, there are other data quality factors to be aware of:
        </p>
        <ul>
          <li>
            <strong>Motion within runs:</strong> Even runs that are "kept" may have time points
            with elevated motion. The GLM includes motion parameters as confound regressors
            (from{' '}
            <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/</code>)
            to account for this.
          </li>
          <li>
            <strong>Anatomy quality:</strong> Each subject has a skull-stripped, warped anatomy
            file (from the SSWarper pipeline at{' '}
            <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/</code>)
            that aligns their brain to a standard template. The quality of this alignment
            matters for group-level analyses.
          </li>
          <li>
            <strong>Behavioral engagement:</strong> Some participants may have missed more
            predictions than others. High rates of missed predictions might indicate a less
            engaged participant.
          </li>
        </ul>

        <h2>The Subject List File</h2>
        <p>
          Every pipeline script references a single subject list file:
        </p>
        <pre className="code-block"><code>{`/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`}</code></pre>
        <p>
          This file contains one subject ID per line (without the{' '}
          <code className="code-inline">sub-</code> prefix). When the pipeline runs, it reads
          this file to know which subjects to process. If a subject needs to be excluded from
          analysis, they are removed from this list — the raw data stays untouched.
        </p>
        <p>
          This single-source-of-truth approach prevents the dangerous situation where different
          scripts process different subsets of subjects. Everyone agrees on who is in the study.
        </p>

        <h2>Key Takeaways</h2>
        <ul>
          <li>
            38 adolescent participants completed the LEARN task.
          </li>
          <li>
            Subject IDs are non-sequential (e.g., <code className="code-inline">sub-958</code>,{' '}
            <code className="code-inline">sub-1267</code>) — this is normal.
          </li>
          <li>
            Most subjects have 4 runs; some have 2-3 due to motion or technical issues. The
            pipeline handles this automatically.
          </li>
          <li>
            Clinical measures (especially social anxiety scores) are key — they connect brain
            data to individual differences.
          </li>
          <li>
            A single subject list file controls which subjects the pipeline processes.
          </li>
        </ul>
      </div>
    </div>
  )
}
