/**
 * Foundations — Module 4: The RSA-learn Directory
 * Guided tour of the project directory structure, scripts, and data flow.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'
import OpenInEditor from '@src/components/OpenInEditor'

export default function RsaLearnTour(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Foundations
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 4 of 5</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The RSA-learn Directory
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          A guided tour of the project home &mdash; every folder, every script, and how they
          connect in the pipeline.
        </p>
      </div>

      {/* Content */}
      <div className="prose-container">
        <h2>The Project Home</h2>
        <p>
          Everything related to our RSA analysis lives under one directory on the server:
        </p>
        <TryCommand
          command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/"
          description="Navigate to the project root on the server"
          execute={true}
        />
        <p>
          This is the single source of truth for the project. Scripts, documentation, intermediate
          outputs, and final results all live here. When you clone the git repository to your
          laptop, you get the code and docs; the large data directories
          (<code className="code-inline">bids_fixed/</code>,{' '}
          <code className="code-inline">TimingFiles/</code>,{' '}
          <code className="code-inline">derivatives/</code>) only exist on the server because
          they are too large for git.
        </p>
        <p>
          Here is the full layout:
        </p>
        <pre className="code-block"><code>{`RSA-learn/
├── scripts/                       # Pipeline scripts (the brain of the operation)
│   ├── 1_fix_events.py            # Stage 1: fix event labels
│   ├── 2_generate_timing.sh       # Stage 2: create timing files
│   ├── 3a_afni_proc_template.sh   # Stage 3a: AFNI proc generator template
│   ├── 3b_fallback_patch.py       # Stage 3b: adjust for fewer-run subjects
│   ├── 3_run_glm.sh              # Stage 3c: orchestrate the whole GLM
│   └── audit_server.sh            # Health check for server structure
│
├── docs/                          # Documentation
│   ├── masterplan.md              # Full project plan
│   ├── decisions.md               # Design decisions and rationale
│   └── run-status.md              # Which subjects have been processed
│
├── bids_fixed/                    # Stage 1 OUTPUT (fixed event files)
│   ├── sub-LEARN001/
│   ├── sub-LEARN002/
│   └── ...
│
├── TimingFiles/
│   └── Fixed2/                    # Stage 2 OUTPUT (AFNI timing files)
│       ├── sub-LEARN001/
│       │   ├── run01/
│       │   │   ├── feedback_positive.1D
│       │   │   ├── feedback_negative.1D
│       │   │   ├── anticipation.1D
│       │   │   └── ...
│       │   ├── run02/
│       │   └── ...
│       └── ...
│
├── derivatives/
│   └── afni/
│       └── IndvlLvlAnalyses/      # Stage 3 OUTPUT (GLM results)
│           ├── sub-LEARN001/
│           ├── sub-LEARN002/
│           └── ...
│
├── guides/                        # PI walkthrough and this tutorial app
├── literature/                    # Papers, presentations, reference code
├── analysis/                      # Subject table with clinical measures
├── proposals/                     # Project proposal and meeting notes
└── archive/                       # Dead ends and legacy docs (ignore)`}</code></pre>

        <Callout variant="learn" title="Why Organization Matters">
          <p>
            This directory structure is not arbitrary. It mirrors the flow of data through the
            pipeline: raw inputs enter at the top (<code className="code-inline">bids_fixed/</code>),
            intermediate products land in the middle
            (<code className="code-inline">TimingFiles/</code>), and final results come out at
            the bottom (<code className="code-inline">derivatives/</code>). When you understand
            the layout, you understand the pipeline.
          </p>
          <p className="mt-2">
            This organization also makes debugging straightforward. If a GLM result looks
            wrong, you can trace backward: check the timing files that fed it, then check the
            event files that produced those timing files, then check the raw events. Each stage
            has a clear input and output directory.
          </p>
        </Callout>

        <h2>The Scripts Directory</h2>
        <p>
          The <code className="code-inline">scripts/</code> folder contains every script in the
          pipeline. The numbered prefixes tell you the execution order:
        </p>

        <h3>1_fix_events.py &mdash; Stage 1</h3>
        <p>
          A Python script that reads the original BIDS event files from the raw data directory
          and standardizes event labels. It writes the cleaned files
          to <code className="code-inline">bids_fixed/</code>. This script has already been
          run &mdash; you do not need to run it yourself.
        </p>
        <OpenInEditor script="1_fix_events.py" description="Stage 1: fix mislabeled feedback events" />
        <pre className="code-block"><code>{`# Input:  /data/projects/STUDIES/LEARN/fMRI/bids/sub-*/func/*events.tsv
# Output: RSA-learn/bids_fixed/sub-*/func/*events.tsv`}</code></pre>

        <h3>2_generate_timing.sh &mdash; Stage 2</h3>
        <p>
          A Bash script that reads the fixed event files and converts them into AFNI-format
          timing files (<code className="code-inline">.1D</code> files). Each event type gets
          its own timing file per run, listing the onset times. This stage also creates
          <strong>anticipation regressors</strong> &mdash; timing files for the period between
          when a participant sees a cue and when they receive feedback.
        </p>
        <OpenInEditor script="2_generate_timing.sh" description="Stage 2: convert fixed events to AFNI timing files" />
        <pre className="code-block"><code>{`# Input:  RSA-learn/bids_fixed/sub-*/func/*events.tsv
# Output: RSA-learn/TimingFiles/Fixed2/sub-*/run*/*.1D`}</code></pre>

        <h3>3a_afni_proc_template.sh &mdash; Stage 3a</h3>
        <p>
          A template script that generates AFNI&rsquo;s{' '}
          <code className="code-inline">afni_proc.py</code> command for a given subject. This
          template specifies all the GLM parameters: no spatial smoothing, which timing files to
          use, which confound regressors to include, and how to model the hemodynamic response.
          It does not run the GLM itself &mdash; it produces a subject-specific proc script.
        </p>
        <OpenInEditor script="3a_afni_proc_template.sh" description="Stage 3a: AFNI proc generator template" />

        <h3>3b_fallback_patch.py &mdash; Stage 3b</h3>
        <p>
          Most subjects completed 4 runs of the task, but some have only 3 (or fewer) due to
          scan issues. This Python script reads the generated proc script and adjusts it for
          subjects with missing runs &mdash; removing references to runs that do not exist.
          Without this patch, AFNI would error out on those subjects.
        </p>

        <h3>3_run_glm.sh &mdash; Stage 3c</h3>
        <p>
          The orchestrator. This script loops over every subject in the subject list, calls the
          template (3a) to generate a proc script, applies the fallback patch (3b) if needed,
          and then executes the proc script to run the actual GLM. It is the script you run when
          you want to process all subjects.
        </p>
        <OpenInEditor script="3_run_glm.sh" description="Stage 3c: orchestrate proc generation and GLM execution" />
        <pre className="code-block"><code>{`# Input:  TimingFiles, subject list, anatomy, confounds
# Output: RSA-learn/derivatives/afni/IndvlLvlAnalyses/sub-*/`}</code></pre>

        <h3>audit_server.sh</h3>
        <p>
          A diagnostic script that checks the server directory structure for problems: missing
          files, unexpected directories, or drift between what the pipeline expects and what
          actually exists on disk. Run this after any major operation to verify that everything
          is in order.
        </p>
        <OpenInEditor script="audit_server.sh" description="Health check for server directory structure" />

        <Callout variant="tip" title="The 3-Stage Pipeline Flow">
          <p>
            The pipeline flows in a strict order, and each stage consumes the output of the
            previous one:
          </p>
          <pre className="code-block"><code>{`Stage 1: Fix events     →  bids_fixed/
Stage 2: Generate timing →  TimingFiles/Fixed2/
Stage 3: Run GLM         →  derivatives/afni/IndvlLvlAnalyses/`}</code></pre>
          <p className="mt-2">
            If you change something in Stage 1 (e.g., fix a label differently), you must re-run
            Stage 2 and then Stage 3 for that change to propagate to the final results. The
            stages are not independent &mdash; they form a chain.
          </p>
        </Callout>

        <h2>The Data Directories</h2>

        <h3>bids_fixed/ &mdash; Stage 1 Output</h3>
        <p>
          This directory mirrors the BIDS structure of the raw data, but with corrected event
          files. Each subject has their own folder containing functional run event TSV files.
          You can compare a file here to the original
          in <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/bids/</code> to
          see exactly what was changed.
        </p>

        <h3>TimingFiles/Fixed2/ &mdash; Stage 2 Output</h3>
        <p>
          Each subject gets a folder, and within that, each run gets a sub-folder. Inside each
          run folder are <code className="code-inline">.1D</code> files &mdash; one per event
          type. These are simple text files listing onset times in seconds:
        </p>
        <pre className="code-block"><code>{`# Example: feedback_positive.1D for sub-LEARN001, run01
# Each number is an onset time (seconds from start of run)
12.5 45.0 78.3 112.1 ...`}</code></pre>
        <p>
          AFNI reads these timing files to know when each event type occurred, which is how it
          builds the GLM design matrix.
        </p>

        <h3>derivatives/afni/IndvlLvlAnalyses/ &mdash; Stage 3 Output</h3>
        <p>
          This is where the GLM results land. Each subject gets a directory containing:
        </p>
        <ul>
          <li>
            <strong>Beta maps</strong> &mdash; 3D brain images where each voxel&rsquo;s value
            represents how strongly that voxel responded to a particular event type in a
            particular run. These are the core data for RSA.
          </li>
          <li>
            <strong>Statistical maps</strong> &mdash; t-statistics, F-statistics, and other
            measures of statistical significance.
          </li>
          <li>
            <strong>Diagnostic files</strong> &mdash; motion plots, regression matrices, and
            other quality-control outputs.
          </li>
        </ul>

        <h2>The Documentation Directory</h2>
        <p>
          The <code className="code-inline">docs/</code> folder contains three key documents:
        </p>
        <ul>
          <li>
            <code className="code-inline">masterplan.md</code> &mdash; the full project plan,
            covering the scientific questions, analysis strategy, and implementation details.
          </li>
          <li>
            <code className="code-inline">decisions.md</code> &mdash; a log of every design
            decision made during the project, with rationale. This is critical for
            reproducibility &mdash; it records <em>why</em> things are the way they are.
          </li>
          <li>
            <code className="code-inline">run-status.md</code> &mdash; tracks which subjects
            have been processed at each stage and notes any issues encountered.
          </li>
        </ul>

        <h2>Git and Server Sync</h2>
        <p>
          The git repository and the server directory have the <strong>same layout</strong>. The
          scripts and documentation are tracked in git; the large data directories are listed
          in <code className="code-inline">.gitignore</code> and only exist on the server.
        </p>
        <p>
          The workflow for getting code changes onto the server:
        </p>
        <TryCommand
          command={`git add scripts/1_fix_events.py`}
          description="Stage the changed script"
          execute={false}
        />
        <TryCommand
          command={`git commit -m "Fix edge case in label correction"`}
          description="Commit with a descriptive message"
          execute={false}
        />
        <TryCommand
          command="git push"
          description="Push changes to GitHub"
          execute={false}
        />
        <TryCommand
          command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/ && git pull"
          description="On the server (via SSH): pull the latest changes"
          execute={false}
        />
        <p>
          After <code className="code-inline">git pull</code>, the server has the updated
          script. You can then run it immediately. This keeps the server and the repository
          perfectly in sync without manually copying files.
        </p>

        <Callout variant="exercise" title="Explore the Directory Tree">
          <p>SSH into the server and navigate to the project root:</p>
          <TryCommand
            command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/ && ls -la"
            description="Navigate to the project root and list contents"
            execute={true}
          />
          <p className="mt-2">Now explore each major area:</p>
          <ol className="mt-2 list-decimal list-inside">
            <li>
              List the pipeline scripts:
              <TryCommand command="ls scripts/" description="Show all pipeline scripts" execute={true} />
            </li>
            <li>
              Count the subjects in bids_fixed:
              <TryCommand command="ls bids_fixed/ | wc -l" description="Count subject directories" execute={true} />
            </li>
            <li>
              Look at one subject&rsquo;s timing files:
              <TryCommand command="ls TimingFiles/Fixed2/sub-LEARN001/run01/" description="List timing files for one run" execute={true} />
            </li>
            <li>
              Peek at a timing file:
              <TryCommand command="cat TimingFiles/Fixed2/sub-LEARN001/run01/feedback_positive.1D" description="View onset times for positive feedback" execute={true} />
            </li>
            <li>
              Check the GLM output exists:
              <TryCommand command="ls derivatives/afni/IndvlLvlAnalyses/ | head" description="Preview GLM output directories" execute={true} />
            </li>
          </ol>
        </Callout>

        <Callout variant="exercise" title="Compare Views: SSH vs. File Browser">
          <p>
            With the Samba share mounted, open this app&rsquo;s file browser and navigate to:
          </p>
          <p className="mt-2">
            <code className="code-inline">
              /Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/
            </code>
          </p>
          <p className="mt-2">
            Simultaneously, in a terminal SSHed to the server, navigate to:
          </p>
          <TryCommand
            command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/"
            description="Navigate to the project root on the server"
            execute={true}
          />
          <p className="mt-2">
            Compare the contents. They should be identical &mdash; same folders, same files,
            same structure. This is because the Samba share is just a network window into the
            same server storage. The paths look different, but the files are the same.
          </p>
        </Callout>

        <h2>Stage Symlinks</h2>
        <p>
          To make the pipeline stages easy to find, the project root contains symlinks (shortcuts)
          that point to the output directories for each stage:
        </p>
        <pre className="code-block"><code>{`stage_1_fixed_events  →  bids_fixed/
stage_2_timing        →  TimingFiles/Fixed2/
stage_3_glm           →  derivatives/afni/IndvlLvlAnalyses/`}</code></pre>
        <p>
          These are just convenience pointers. You can use either the symlink name or the real
          path &mdash; they refer to the same directory. The symlinks make it easier to remember
          which directory corresponds to which pipeline stage.
        </p>

        <Callout variant="exercise" title="Trace One Subject Through the Pipeline">
          <p>
            Pick subject 958 and follow their data through all three pipeline stages. This is
            exactly what you will be building in the Timing and GLM labs.
          </p>
          <p className="mt-2"><strong>Stage 1 &mdash; Fixed events:</strong></p>
          <TryCommand
            command="head -5 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv"
            description="View the first 5 lines of the corrected events file — onset, duration, trial_type columns"
            execute={true}
          />
          <p className="mt-2"><strong>Stage 2 &mdash; Timing files:</strong></p>
          <TryCommand
            command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-958/"
            description="List all timing files for subject 958 — each .1D file is one condition"
            execute={true}
          />
          <TryCommand
            command="cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-958/NonPM_Mean60_fdkm_run1.1D"
            description="View a timing file — onset:duration pairs for feedback-mean 60% in run 1"
            execute={true}
          />
          <p className="mt-2"><strong>Stage 3 &mdash; GLM output:</strong></p>
          <TryCommand
            command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958/"
            description="List the GLM output directory for subject 958"
            execute={true}
          />
          <p className="mt-2">
            You have just traced one subject from raw events to timing files to GLM output.
            In the Timing and GLM lab sections, you will write the scripts that perform each
            of these transformations.
          </p>
        </Callout>

        <Callout variant="tip" title="Tracing the Data Flow">
          When you are trying to understand what the pipeline does for a particular subject,
          follow the data through the three stage directories in order. Start
          with <code className="code-inline">bids_fixed/sub-LEARN001/</code> (input events),
          then <code className="code-inline">TimingFiles/Fixed2/sub-LEARN001/</code> (AFNI
          timing files), then{' '}
          <code className="code-inline">derivatives/afni/IndvlLvlAnalyses/sub-LEARN001/</code>{' '}
          (GLM results). Seeing the same subject&rsquo;s data transform through each stage
          builds a concrete understanding of the pipeline.
        </Callout>
      </div>
    </div>
  )
}
