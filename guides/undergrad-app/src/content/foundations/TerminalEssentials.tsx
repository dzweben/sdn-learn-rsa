/**
 * Foundations — Module 2: Terminal Essentials
 * Practical terminal skills for navigating the project on the server.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'
import OpenInEditor from '@src/components/OpenInEditor'

export default function TerminalEssentials(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Foundations
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 2 of 5</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Terminal Essentials
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          A practical refresher on the terminal commands you will use every day in this project
          &mdash; with real examples from our data.
        </p>
      </div>

      {/* Content */}
      <div className="prose-container">
        <h2>Why This Module</h2>
        <p>
          You already know what a terminal is and have used basic commands. This module is not
          &ldquo;Intro to the Command Line&rdquo; &mdash; it is a focused refresher on the
          specific patterns that come up constantly when working with fMRI data on a Linux
          server. Think of it as sharpening the tools in your toolbox before starting a project.
        </p>
        <p>
          You can practice every example below in this app&rsquo;s built-in terminal. Open it
          from the sidebar and follow along.
        </p>

        <h2>Navigation &amp; Orientation</h2>
        <p>
          These three commands tell you where you are and what is around you:
        </p>
        <TryCommand
          command="pwd"
          description="Print your current directory (where am I?)"
          execute={true}
        />
        <TryCommand
          command="ls -la"
          description="List everything in the current directory with details"
          execute={true}
        />
        <TryCommand
          command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/"
          description="Change directory to the project root"
        />
        <p>
          The <code className="code-inline">ls -la</code> flags
          mean: <code className="code-inline">-l</code> for long format (shows permissions, size,
          date) and <code className="code-inline">-a</code> for all files (including hidden ones
          that start with a dot, like <code className="code-inline">.git/</code>).
        </p>

        <Callout variant="tip" title="Tab Completion">
          You almost never need to type a full path by hand. Press <strong>Tab</strong> after
          typing the first few characters of a file or directory name, and the shell will
          auto-complete it. If there are multiple matches, press Tab twice to see them all. This
          is especially valuable for long paths
          like <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/</code> &mdash;
          type <code className="code-inline">/da</code>, press Tab,
          type <code className="code-inline">pr</code>, press Tab, and so on.
        </Callout>

        <h2>Peeking at Files</h2>
        <p>
          You will frequently need to glance at the contents of a file without opening it in an
          editor. These commands are your go-to tools:
        </p>
        <TryCommand
          command="cat scripts/audit_server.sh"
          description="Show the entire file (best for short files)"
        />
        <OpenInEditor
          script="audit_server.sh"
          description="The server audit script"
        />
        <TryCommand
          command="head -20 bids_fixed/sub-LEARN001/func/sub-LEARN001_task-learn_run-1_events.tsv"
          description="Show just the first 20 lines"
        />
        <TryCommand
          command="tail -5 TimingFiles/Fixed2/sub-LEARN001/run01/feedback_positive.1D"
          description="Show just the last 5 lines"
        />
        <p>
          Use <code className="code-inline">cat</code> for files you expect to be short (a few
          dozen lines). Use <code className="code-inline">head</code>{' '}
          and <code className="code-inline">tail</code> when a file might be long and you only
          need to check the beginning or end.
        </p>

        <h2>Reading TSV Files Neatly</h2>
        <p>
          Our event files are TSV (tab-separated values). If you{' '}
          <code className="code-inline">cat</code> them directly, the columns will not line up
          and the output is hard to read. Use the <code className="code-inline">column</code>{' '}
          command to format them into aligned columns:
        </p>
        <TryCommand
          command={`column -t -s $'\\t' bids_fixed/sub-LEARN001/func/sub-LEARN001_task-learn_run-1_events.tsv | head -15`}
          description="Pretty-print a TSV file (aligned columns), show first 15 lines"
        />
        <p>
          The <code className="code-inline">-t</code> flag tells{' '}
          <code className="code-inline">column</code> to auto-detect and align columns.
          The <code className="code-inline">-s $&apos;\t&apos;</code> flag specifies that the
          delimiter is a tab character. Piping through{' '}
          <code className="code-inline">head</code> keeps the output manageable.
        </p>

        <Callout variant="exercise" title="Peek at an Events File">
          <p>Open the app&rsquo;s built-in terminal and run:</p>
          <TryCommand
            command={`column -t -s $'\\t' /Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/sub-LEARN001/func/sub-LEARN001_task-learn_run-1_events.tsv | head -20`}
            description="Pretty-print first 20 lines of LEARN001 run-1 events"
          />
          <p className="mt-2">
            You should see neatly aligned columns with headers
            like <code className="code-inline">onset</code>,{' '}
            <code className="code-inline">duration</code>,{' '}
            <code className="code-inline">trial_type</code>. These are the event labels that our
            pipeline uses to build timing files.
          </p>
        </Callout>

        <h2>Pipes &amp; Redirection</h2>
        <p>
          The <strong>pipe</strong> (<code className="code-inline">|</code>) takes the output of
          one command and feeds it as input to the next. This lets you chain simple commands into
          powerful one-liners:
        </p>
        <TryCommand
          command={`cat sub-LEARN001_task-learn_run-1_events.tsv | grep "feedback"`}
          description='Find lines containing "feedback" in an events file'
        />
        <TryCommand
          command={`cat sub-LEARN001_task-learn_run-1_events.tsv | grep "feedback" | wc -l`}
          description="Count how many feedback events there are"
        />
        <TryCommand
          command={`cat sub-LEARN001_task-learn_run-1_events.tsv | grep "feedback" > feedback_only.txt`}
          description="Save the filtered output to a new file"
        />
        <p>
          The <code className="code-inline">&gt;</code> operator <strong>redirects</strong> output
          to a file (creating it if it does not exist, overwriting if it does). Use{' '}
          <code className="code-inline">&gt;&gt;</code> to append instead of overwrite.
        </p>

        <Callout variant="tip" title="The Three Musketeers: grep, wc, sort">
          <p>
            You will use these three commands constantly in combination with pipes:
          </p>
          <ul className="mt-2 list-disc list-inside">
            <li>
              <code className="code-inline">grep &ldquo;pattern&rdquo;</code> &mdash; filter lines
              that match a text pattern
            </li>
            <li>
              <code className="code-inline">wc -l</code> &mdash; count lines (i.e., count matches)
            </li>
            <li>
              <code className="code-inline">sort</code> &mdash; sort lines alphabetically or
              numerically (<code className="code-inline">sort -n</code>)
            </li>
          </ul>
        </Callout>

        <h2>Wildcards</h2>
        <p>
          The asterisk <code className="code-inline">*</code> matches any sequence of characters
          in a filename. This is essential when you want to work with many files at once:
        </p>
        <TryCommand
          command="ls *.tsv"
          description="List all .tsv files in a directory"
          execute={true}
        />
        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/bids/sub-*/func/*run-1_events.tsv"
          description="List all event files across all subjects (run-1 only)"
        />
        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/bids/sub-*/func/*run-1_events.tsv | wc -l"
          description="Count how many subjects have run-1 event files"
        />
        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-LEARN001/run*/*.1D"
          description="List all timing files for subject LEARN001"
        />
        <p>
          The pattern <code className="code-inline">sub-*</code> matches every folder starting
          with &ldquo;sub-&rdquo;, so <code className="code-inline">sub-*/func/*events*</code>{' '}
          expands to every subject&rsquo;s event files in one command.
        </p>

        <h2>Finding Files</h2>
        <p>
          When you know the name (or part of the name) of a file but not its location, use{' '}
          <code className="code-inline">find</code>:
        </p>
        <TryCommand
          command={`find /data/projects/STUDIES/LEARN/fMRI/RSA-learn/ -name "*.1D"`}
          description="Find all .1D timing files under the project"
        />
        <TryCommand
          command={`find /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/ -name "*.py"`}
          description="Find all Python scripts"
        />
        <TryCommand
          command="find /data/projects/STUDIES/LEARN/fMRI/RSA-learn/ -mtime -2"
          description="Find files modified in the last 2 days"
        />

        <h2>Searching Inside Files</h2>
        <p>
          <code className="code-inline">grep</code> searches <em>inside</em> files for a text
          pattern. This is invaluable for tracing how scripts reference paths, variables, or
          subject IDs:
        </p>
        <TryCommand
          command={`grep -r "subjList" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/`}
          description='Find which scripts mention "subjList"'
        />
        <TryCommand
          command={`grep "anticipation" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh`}
          description='Find all lines containing "anticipation" in the timing script'
        />
        <OpenInEditor
          script="2_generate_timing.sh"
          description="The timing file generator"
        />
        <TryCommand
          command={`grep -rl "LEARN042" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/`}
          description="Search for a subject ID across all event files"
        />
        <p>
          Flags you will use often: <code className="code-inline">-r</code> (search recursively
          through directories), <code className="code-inline">-l</code> (list only filenames, not
          the matching lines), <code className="code-inline">-i</code> (case-insensitive).
        </p>

        <h2>Counting Things</h2>
        <p>
          Quick counts help you sanity-check data. These patterns come up constantly:
        </p>
        <TryCommand
          command="wc -l /data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt"
          description="How many subjects are in the subject list?"
        />
        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/ | wc -l"
          description="How many files are in a directory?"
        />
        <TryCommand
          command="wc -l bids_fixed/sub-LEARN001/func/sub-LEARN001_task-learn_run-1_events.tsv"
          description="How many lines (events) are in an events file?"
        />
        <TryCommand
          command={`find TimingFiles/Fixed2/sub-LEARN001/ -name "*.1D" | wc -l`}
          description="How many .1D timing files does a subject have?"
        />

        <Callout variant="exercise" title="Navigate and Count">
          <p>Try these in the app&rsquo;s terminal (or after SSHing to the server):</p>
          <ol className="mt-2 list-decimal list-inside">
            <li>
              Navigate to the project
              root: <code className="code-inline">cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/</code>
            </li>
            <li>
              List the scripts directory: <code className="code-inline">ls -la scripts/</code>
            </li>
            <li>
              Count the number of pipeline
              scripts: <code className="code-inline">ls scripts/*.sh scripts/*.py | wc -l</code>
            </li>
            <li>
              Search for &ldquo;anticipation&rdquo; in the timing
              script: <code className="code-inline">grep &ldquo;anticipation&rdquo; scripts/2_generate_timing.sh</code>
            </li>
          </ol>
        </Callout>

        <Callout variant="exercise" title="Peek and Count Events">
          <p>Pick any subject (e.g., sub-LEARN005) and answer these questions using the terminal:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>How many runs does this subject have? (Hint: count folders
              in <code className="code-inline">TimingFiles/Fixed2/sub-LEARN005/</code>)</li>
            <li>How many total events are in their run-1 events
              file? (Hint: <code className="code-inline">wc -l</code>)</li>
            <li>How many of those events are feedback
              events? (Hint: <code className="code-inline">grep &ldquo;feedback&rdquo; | wc -l</code>)</li>
          </ul>
        </Callout>

        <h2>Quick Reference Card</h2>
        <p>
          Keep this table handy as you work through the rest of the Foundations modules:
        </p>
        <pre className="code-block"><code>{`Command              What It Does
─────────────────    ──────────────────────────────────────
pwd                  Print current directory
ls -la               List files with details
cd /path/to/dir      Change directory
cat file             Print entire file
head -N file         Print first N lines
tail -N file         Print last N lines
column -t -s $'\\t'   Pretty-print a TSV
grep "pattern" file  Search for text in a file
grep -r "pat" dir/   Search recursively in a directory
find dir -name "p"   Find files by name pattern
wc -l file           Count lines in a file
ls dir/ | wc -l      Count items in a directory
cmd | grep pattern   Filter command output
cmd > file.txt       Redirect output to a file`}</code></pre>

        <Callout variant="tip" title="Learning by Doing">
          The best way to internalize these commands is to use them while exploring real data.
          Every time you are curious about a file &mdash; how long it is, what it contains,
          whether it exists &mdash; answer the question with a terminal command instead of opening
          Finder. Within a week it will feel natural.
        </Callout>
      </div>
    </div>
  )
}
