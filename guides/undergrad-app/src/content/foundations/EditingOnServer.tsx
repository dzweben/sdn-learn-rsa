/**
 * Foundations — Module 5: Editing on the Server
 * Two workflows for editing files (Samba mount vs. SSH+nano) and best practices.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'
import OpenInEditor from '@src/components/OpenInEditor'

export default function EditingOnServer(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Foundations
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 5 of 5</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Editing on the Server
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Two ways to edit files that live on the server &mdash; and when to use each one.
        </p>
      </div>

      {/* Content */}
      <div className="prose-container">
        <h2>The Two Workflows</h2>
        <p>
          You will frequently need to edit scripts, configuration files, or documentation that
          lives on the server. There are two ways to do this, and understanding both will make
          your work much smoother.
        </p>

        <h2>Workflow 1: Samba Mount + Local Editor</h2>
        <p>
          When the Samba share is mounted (as described in Module 1), the server&rsquo;s files
          appear on your Mac
          at <code className="code-inline">/Volumes/Jarcho_DataShare/</code>. You can open them
          in any Mac application &mdash; this app&rsquo;s built-in editor, VS Code, Sublime
          Text, or even TextEdit.
        </p>
        <p>
          For example, to open the timing generation script in this app&rsquo;s editor, navigate
          the file browser to:
        </p>
        <pre className="code-block"><code>/Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh</code></pre>

        <OpenInEditor script="2_generate_timing.sh" description="The timing file generator" />

        <p>
          Or, to open the same file in VS Code from a terminal on your Mac:
        </p>
        <TryCommand
          command="code /Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh"
          description="Open the timing generation script in VS Code"
          execute={true}
        />
        <p>
          When you save the file, the changes are written directly to the server&rsquo;s
          storage. There is no &ldquo;upload&rdquo; step &mdash; saving <em>is</em> writing to
          the server. This is the beauty of the Samba mount: the server&rsquo;s filesystem looks
          and behaves like a local disk.
        </p>
        <p>
          <strong>Advantages of this workflow:</strong>
        </p>
        <ul>
          <li>
            Full syntax highlighting, code folding, and other editor features.
          </li>
          <li>
            Easy to work with multiple files at once (e.g., open several scripts side by side).
          </li>
          <li>
            Familiar editing experience &mdash; same as editing any local file.
          </li>
          <li>
            Can use find-and-replace, linting, and other editor tools.
          </li>
        </ul>

        <h2>Workflow 2: SSH + nano (or vim)</h2>
        <p>
          Sometimes the Samba share is not mounted, or you are already SSHed into the server and
          need to make a quick change. In those cases, you can edit files directly on the server
          using a terminal-based text editor.
        </p>
        <p>
          The simplest option is <code className="code-inline">nano</code>:
        </p>
        <TryCommand
          command={`cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/ && nano scripts/2_generate_timing.sh`}
          description="SSH into the server first, then navigate to the project directory and open the script in nano"
          execute={true}
        />
        <p>
          This opens the file in a text editor that runs inside your terminal. The interface is
          straightforward:
        </p>
        <ul>
          <li>
            Use arrow keys to navigate.
          </li>
          <li>
            Type normally to insert text.
          </li>
          <li>
            <code className="code-inline">Ctrl+O</code> to save (&ldquo;Write Out&rdquo;).
          </li>
          <li>
            <code className="code-inline">Ctrl+X</code> to exit.
          </li>
          <li>
            <code className="code-inline">Ctrl+K</code> to cut a line,{' '}
            <code className="code-inline">Ctrl+U</code> to paste it.
          </li>
          <li>
            <code className="code-inline">Ctrl+W</code> to search for text.
          </li>
        </ul>
        <p>
          The bottom of the nano window always shows the available keyboard shortcuts (with{' '}
          <code className="code-inline">^</code> meaning Ctrl), so you do not need to memorize
          them.
        </p>
        <p>
          For more experienced users, <code className="code-inline">vim</code> is another
          option. Vim is far more powerful but has a steep learning curve. If you are new to
          terminal editors, stick with nano for now.
        </p>
        <p>
          <strong>Advantages of this workflow:</strong>
        </p>
        <ul>
          <li>
            Works even when the Samba share is not mounted.
          </li>
          <li>
            No context-switching &mdash; you are already in the terminal on the server.
          </li>
          <li>
            Ideal for quick, targeted changes (adding a comment, fixing a typo, changing a
            variable value).
          </li>
          <li>
            Available on every Linux server, no setup required.
          </li>
        </ul>

        <h2>When to Use Which</h2>
        <p>
          Here is a simple decision rule:
        </p>
        <ul>
          <li>
            <strong>Serious editing</strong> (writing new code, refactoring a script, reading
            through a long file): use the <strong>Samba mount + local editor</strong>. The
            syntax highlighting, multi-file support, and familiar interface make sustained
            editing much more productive.
          </li>
          <li>
            <strong>Quick fixes</strong> (adding a comment, changing a path, fixing a typo):
            use <strong>SSH + nano</strong>. It is faster than switching to an editor when you
            just need to change one or two lines.
          </li>
        </ul>

        <Callout variant="tip" title="The Most Common Workflow">
          <p>
            In practice, the most common pattern is:
          </p>
          <ol className="mt-2 list-decimal list-inside">
            <li>Edit a script via the Samba mount in your local editor.</li>
            <li>Save the file (changes are immediately on the server).</li>
            <li>Switch to your SSH terminal.</li>
            <li>Run the script on the server.</li>
          </ol>
          <p className="mt-2">
            This gives you the best of both worlds: a rich editing experience for writing code,
            and the server&rsquo;s computing power for running it.
          </p>
        </Callout>

        <h2>The Edit-Run-Verify Cycle</h2>
        <p>
          Whenever you edit a script, follow this cycle to make sure your changes took effect:
        </p>
        <p>
          <strong>Step 1:</strong> Edit the script (via Samba mount or nano), make your changes, and save.
        </p>
        <p>
          <strong>Step 2:</strong> Verify the changes on the server (via SSH):
        </p>
        <TryCommand
          command="cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh | head -30"
          description="View the first 30 lines of the script to confirm your changes"
          execute={true}
        />
        <p>
          <strong>Step 3:</strong> Run the script:
        </p>
        <TryCommand
          command="bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh"
          description="Run the timing generation script"
          execute={true}
        />
        <p>
          <strong>Step 4:</strong> Check the output:
        </p>
        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-LEARN001/run01/"
          description="List timing files for the first subject's first run to verify output"
          execute={true}
        />
        <p>
          The <strong>verify</strong> step (Step 2) is especially important when using the Samba
          mount. It confirms that your save actually propagated to the server. Occasionally,
          network glitches can cause the save to appear successful on your Mac while not
          actually writing to the server. A quick <code className="code-inline">cat</code> or{' '}
          <code className="code-inline">head</code> on the server side catches this.
        </p>

        <Callout variant="exercise" title="Edit, Save, Verify">
          <p>Try the full edit-verify cycle:</p>
          <ol className="mt-2 list-decimal list-inside">
            <li>
              Open this app&rsquo;s file browser and navigate
              to <code className="code-inline">/Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server.sh</code>.
            </li>
            <li>
              Open the file in the app&rsquo;s editor.
            </li>
            <li>
              Add a comment at the top of the file, something like:{' '}
              <code className="code-inline"># Verified by [your name] on [today&rsquo;s date]</code>
            </li>
            <li>
              Save the file.
            </li>
            <li>
              In a terminal SSHed to the server,
              run: <code className="code-inline">head -5 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server.sh</code>
            </li>
            <li>
              Confirm your comment appears. If it does, the Samba workflow is working correctly.
            </li>
            <li>
              Remove the comment (we do not want to modify production scripts permanently for
              practice) and save again.
            </li>
          </ol>
          <OpenInEditor script="audit_server.sh" description="Open the audit script to try the exercise above" />
        </Callout>

        <h2>Editing with nano: A Quick Practice</h2>
        <p>
          Let&rsquo;s practice using nano for a quick edit. SSH into the server and try:
        </p>
        <TryCommand
          command={`cd ~ && nano practice.txt`}
          description="Create a temporary practice file in your home directory using nano"
          execute={true}
        />
        <p>
          Inside nano:
        </p>
        <ol>
          <li>
            Type: <code className="code-inline">Hello from the server!</code>
          </li>
          <li>
            Press <code className="code-inline">Ctrl+O</code>, then Enter to save.
          </li>
          <li>
            Press <code className="code-inline">Ctrl+X</code> to exit.
          </li>
        </ol>
        <p>
          Now verify:
        </p>
        <TryCommand
          command={`cat practice.txt && rm practice.txt`}
          description="Print the file contents, then clean up the practice file"
          execute={true}
        />

        <Callout variant="exercise" title="nano Practice">
          <p>
            Follow the nano practice steps above. Once comfortable, try a slightly more
            realistic exercise:
          </p>
          <ol className="mt-2 list-decimal list-inside">
            <li>
              SSH to the server and navigate to your home
              directory: <code className="code-inline">cd ~</code>
            </li>
            <li>
              Create a test
              script: <code className="code-inline">nano hello.sh</code>
            </li>
            <li>
              Type these two lines:
              <pre className="code-block"><code>{`#!/bin/bash
echo "Hello from $(hostname) at $(date)"`}</code></pre>
            </li>
            <li>Save with <code className="code-inline">Ctrl+O</code>, exit
              with <code className="code-inline">Ctrl+X</code>.</li>
            <li>
              Make it
              executable: <code className="code-inline">chmod +x hello.sh</code>
            </li>
            <li>
              Run it: <code className="code-inline">bash hello.sh</code>
            </li>
            <li>
              Clean up: <code className="code-inline">rm hello.sh</code>
            </li>
          </ol>
        </Callout>

        <h2>Line Endings: Mac vs. Linux</h2>
        <p>
          Macs and Linux use slightly different conventions for line endings in text files.
          Mac/Linux use <code className="code-inline">LF</code> (line feed), while older
          Windows systems use <code className="code-inline">CRLF</code> (carriage return + line
          feed). Since both Mac and Linux use <code className="code-inline">LF</code>, this
          is <em>usually</em> not an issue in our workflow.
        </p>
        <p>
          However, if you ever copy a script from a Windows machine, or if a text file was
          edited in a Windows editor, you might encounter problems. The symptom is usually a
          cryptic error when running a script, like:
        </p>
        <pre className="code-block"><code>{`/bin/bash^M: bad interpreter: No such file or directory`}</code></pre>
        <p>
          That <code className="code-inline">^M</code> is the carriage return character
          sneaking in. The fix is straightforward:
        </p>
        <TryCommand
          command="dos2unix scripts/problem_script.sh"
          description="Convert Windows line endings to Unix (or use the sed alternative below if dos2unix is not installed)"
          execute={false}
        />
        <TryCommand
          command={`sed -i 's/\\r$//' scripts/problem_script.sh`}
          description="Alternative: strip carriage returns with sed if dos2unix is not available"
          execute={false}
        />
        <p>
          You may never encounter this, but now you will recognize it if you do.
        </p>

        <h2>File Permissions</h2>
        <p>
          Files created via the Samba mount may have different permissions than files created
          directly on the server. This matters for scripts, which need to be
          &ldquo;executable&rdquo; to run directly.
        </p>
        <p>
          If you create or modify a script via the Samba mount and then try to run it on the
          server, you might see:
        </p>
        <pre className="code-block"><code>{`bash: ./my_script.sh: Permission denied`}</code></pre>
        <p>
          The fix is to mark the script as executable on the server:
        </p>
        <TryCommand
          command="chmod +x /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/my_script.sh"
          description="Make the script executable so it can be run on the server"
          execute={true}
        />
        <p>
          For our pipeline scripts, permissions are already set correctly. But if you ever
          create a new script via the Samba mount, remember
          to <code className="code-inline">chmod +x</code> it on the server before running it.
        </p>

        <Callout variant="exercise" title="Write a Mini Pipeline Script">
          <p>
            Practice the full edit-run-verify cycle with a script that does something useful
            with the project data. SSH into the server and create a script:
          </p>
          <TryCommand
            command="nano ~/count_subjects.sh"
            description="Create a small script in your home directory using nano"
            execute={true}
          />
          <p className="mt-2">Type this into nano:</p>
          <pre className="code-block"><code>{`#!/bin/bash
# count_subjects.sh — Quick inventory of subjects in the pipeline

PROJ="/data/projects/STUDIES/LEARN/fMRI/RSA-learn"

echo "=== Pipeline Subject Inventory ==="
echo "Subjects in bids_fixed: $(ls $PROJ/bids_fixed/ | grep sub- | wc -l)"
echo "Subjects with timing:   $(ls $PROJ/TimingFiles/Fixed2/ | grep sub- | wc -l)"
echo "Subjects with GLM:      $(ls $PROJ/derivatives/afni/IndvlLvlAnalyses/ | wc -l)"
echo "=== Done ==="
`}</code></pre>
          <p className="mt-2">
            Save with <code className="code-inline">Ctrl+O</code>, exit
            with <code className="code-inline">Ctrl+X</code>, then run it:
          </p>
          <TryCommand
            command="bash ~/count_subjects.sh"
            description="Run your script — you should see counts for each pipeline stage"
            execute={true}
          />
          <p className="mt-2">
            You just wrote a script that inspects the pipeline. This is exactly the kind of
            thing you will do constantly &mdash; write small Bash scripts to check, count, and
            verify things on the server. Clean up when done:
          </p>
          <TryCommand
            command="rm ~/count_subjects.sh"
            description="Remove the practice script from your home directory"
            execute={true}
          />
        </Callout>

        <Callout variant="warning" title="Never Edit Data Files">
          <p>
            The scripts in <code className="code-inline">scripts/</code> are meant to be edited.
            The data files in <code className="code-inline">bids_fixed/</code>,{' '}
            <code className="code-inline">TimingFiles/</code>, and{' '}
            <code className="code-inline">derivatives/</code> are <strong>not</strong>. These are
            generated outputs produced by the pipeline. If something looks wrong in a data file,
            the fix is to correct the script that produced it and re-run that stage &mdash; never
            to manually edit the data file.
          </p>
          <p className="mt-2">
            Similarly, never edit files in the raw BIDS
            directory (<code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/bids/</code>).
            That is the original scanner data and must remain untouched.
          </p>
        </Callout>

        <h2>Summary: The Complete Workflow</h2>
        <p>
          Putting together everything from Modules 1 through 5, here is the end-to-end workflow
          you will use on this project:
        </p>
        <ol>
          <li>
            <strong>Mount the Samba share</strong> on your Mac (Module 1).
          </li>
          <li>
            <strong>Open a script</strong> in your editor via the Samba path (this module).
          </li>
          <li>
            <strong>Edit and save</strong> the script.
          </li>
          <li>
            <strong>SSH into the server</strong> (Module 3).
          </li>
          <li>
            <strong>Navigate to the project directory</strong> (Module 4).
          </li>
          <li>
            <strong>Verify</strong> the change
            with <code className="code-inline">cat</code> or{' '}
            <code className="code-inline">head</code> (this module).
          </li>
          <li>
            <strong>Run the script</strong> on the server.
          </li>
          <li>
            <strong>Check the output</strong> using terminal commands (Module 2).
          </li>
        </ol>
        <p>
          If the script is under git version control (which all of ours are), there is an
          additional step: commit your changes and push to GitHub, then{' '}
          <code className="code-inline">git pull</code> on the server to keep everything in
          sync (Module 4).
        </p>

        <Callout variant="tip" title="Git vs. Samba for Getting Code to the Server">
          <p>
            You might wonder: if the Samba mount lets me edit files directly on the server, why
            do we also use git? The answer is <strong>version control</strong>. The Samba mount
            gets your changes onto the server instantly, but it does not track what changed, when,
            or why. Git provides that history, lets multiple people collaborate without
            overwriting each other&rsquo;s work, and makes it possible to undo mistakes.
          </p>
          <p className="mt-2">
            The practical rule: use the Samba mount for real-time editing, and use git for
            committing and sharing your work.
          </p>
        </Callout>
      </div>
    </div>
  )
}
