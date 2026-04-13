/**
 * Foundations — Module 3: SSH & Remote Access
 * Connecting to the lab server via SSH and understanding local vs. remote.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function Ssh(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Foundations
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 3 of 5</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          SSH &amp; Remote Access
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          How to teleport your terminal to the lab server &mdash; and what changes when you do.
        </p>
      </div>

      {/* Content */}
      <div className="prose-container">
        <h2>What Is SSH?</h2>

        <Callout variant="definition">
          <strong>SSH (Secure Shell):</strong> A network protocol that lets you open a terminal
          session on a remote computer over an encrypted connection. When you &ldquo;SSH into the
          server,&rdquo; your terminal stops running commands on your laptop and starts running
          them on the server &mdash; as if you had walked into the server room, sat down at the
          machine, and opened a terminal there.
        </Callout>

        <p>
          Think of SSH as teleportation for your terminal. Before you connect, every command you
          type runs on your Mac, using your Mac&rsquo;s files and software. After you connect,
          every command runs on the server, using the server&rsquo;s files and software. The
          window on your screen looks the same, but the machine doing the work has changed.
        </p>
        <p>
          SSH connections are <strong>encrypted</strong>, meaning nobody eavesdropping on the
          network can see what you type or what the server sends back. This is why it is called
          <em>Secure</em> Shell.
        </p>

        <h2>Connecting</h2>
        <p>
          The basic SSH command has a simple form:
        </p>
        <TryCommand
          command="ssh username@hostname"
          description="Replace username and hostname with your actual credentials"
          execute={false}
        />
        <p>
          Replace <code className="code-inline">username</code> with your server account name
          and <code className="code-inline">hostname</code> with the server&rsquo;s address.
          Your lab lead will provide both of these. A real connection might look like:
        </p>
        <TryCommand
          command="ssh -XY tur50045@155.247.67.31"
          description="Connect to the lab server with X11 forwarding"
          execute={false}
        />
        <p>
          The <code className="code-inline">-XY</code> flags enable <strong>X11 forwarding</strong>,
          which lets you display graphical programs from the server (like AFNI&rsquo;s GUI) in
          windows on your local Mac. Without these flags, you can only use text-based commands over
          SSH.
        </p>
        <p>
          When you run this command for the first time, you may see a message about the
          server&rsquo;s &ldquo;fingerprint&rdquo; asking you to confirm the connection. This is
          normal &mdash; type <code className="code-inline">yes</code> and press Enter. You will
          then be prompted for your password. As you type the password, nothing appears on the
          screen (no dots, no asterisks). This is a security feature, not a bug. Type the
          password and press Enter.
        </p>

        <h2>What Happens When You Connect</h2>
        <p>
          After authenticating, several things change:
        </p>
        <ul>
          <li>
            <strong>Your prompt changes.</strong> Instead of showing your Mac&rsquo;s hostname
            (something
            like <code className="code-inline">yourname@MacBook-Pro</code>), the prompt now
            shows the server&rsquo;s hostname (something
            like <code className="code-inline">tur50045@155.247.67.31</code>). This is your most
            reliable visual cue for where you are.
          </li>
          <li>
            <strong>Your working directory changes.</strong> You land in your <em>home
            directory on the server</em> &mdash;
            typically <code className="code-inline">/home/tur50045/</code> or similar. This is
            not the same as <code className="code-inline">/Users/yourname/</code> on your Mac.
          </li>
          <li>
            <strong>Available software changes.</strong> Commands like{' '}
            <code className="code-inline">afni</code>,{' '}
            <code className="code-inline">3dDeconvolve</code>, and{' '}
            <code className="code-inline">module load</code> now work because they are
            installed on the server. Meanwhile, Mac-specific tools
            like <code className="code-inline">open</code> (to open Finder) will not work.
          </li>
          <li>
            <strong>File paths change.</strong> The project data lives
            at <code className="code-inline">/data/projects/STUDIES/LEARN/fMRI/</code> on the
            server &mdash; not
            at <code className="code-inline">/Volumes/Jarcho_DataShare/</code> (that is the
            Samba mount path on your Mac).
          </li>
        </ul>

        <h2>How to Tell Where You Are</h2>
        <p>
          This is the single most important skill for working with SSH. At any moment, you need
          to know: <strong>am I running commands on my Mac, or on the server?</strong> Here are
          three ways to check:
        </p>
        <p>
          <strong>Method 1:</strong> Look at your prompt. Local
          shows <code className="code-inline">yourname@MacBook-Pro ~ %</code>; server
          shows <code className="code-inline">tur50045@155.247.67.31 ~ $</code>.
        </p>
        <p>
          <strong>Method 2:</strong> Run the hostname command:
        </p>
        <TryCommand
          command="hostname"
          description="Prints your Mac's name locally, or the server's name if SSHed in"
          execute={true}
        />
        <p>
          <strong>Method 3:</strong> Check what OS you are on:
        </p>
        <TryCommand
          command="uname -s"
          description={`Prints "Darwin" on macOS or "Linux" on the server`}
          execute={true}
        />

        <Callout variant="warning" title="Know Which Machine You Are On">
          <p>
            One of the most common mistakes new users make is forgetting which machine they are
            connected to. You might try to run an AFNI command on your Mac (where AFNI is not
            installed) and get &ldquo;command not found.&rdquo; Or you might try to edit a file
            at <code className="code-inline">/Volumes/Jarcho_DataShare/</code> while SSHed into
            the server (where that path does not exist).
          </p>
          <p className="mt-2">
            When something unexpected happens, the first question to ask yourself is:{' '}
            <strong>&ldquo;Am I on my Mac or on the server right now?&rdquo;</strong> Run{' '}
            <code className="code-inline">hostname</code> to find out.
          </p>
        </Callout>

        <h2>Your Home Directory vs. the Project Directory</h2>
        <p>
          When you SSH in, you start in your home directory on the server
          (e.g., <code className="code-inline">/home/tur50045/</code>). This is your personal
          space on the server &mdash; a place for your own config files, notes, and scratch work.
        </p>
        <p>
          The project data is elsewhere. Your first command after connecting will almost always be:
        </p>
        <TryCommand
          command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/"
          description="Navigate to the project directory on the server"
          execute={true}
        />
        <p>
          This takes you to our project&rsquo;s home directory, where all the scripts, data, and
          results live. You can verify you are in the right place with:
        </p>
        <TryCommand
          command="pwd"
          description="Should print: /data/projects/STUDIES/LEARN/fMRI/RSA-learn"
          execute={true}
        />
        <TryCommand
          command="ls"
          description="Should show: scripts/  docs/  bids_fixed/  TimingFiles/  derivatives/  ..."
          execute={true}
        />

        <Callout variant="tip" title="Make It Automatic">
          If you find yourself typing that long <code className="code-inline">cd</code> command
          every time you log in, you can add it to your shell config file on the server. Ask
          your lab lead about adding a line
          to <code className="code-inline">~/.bashrc</code> that changes to the project
          directory automatically. For now, just type the command manually &mdash; it is good
          practice.
        </Callout>

        <h2>Password Authentication</h2>
        <p>
          For now, you will authenticate with a password each time you connect. This is the
          simplest method and works well to start. Later, you may set
          up <strong>SSH keys</strong>, which let you connect without typing a password. We will
          not cover that here &mdash; passwords are fine for now.
        </p>
        <p>
          A few notes about passwords on the server:
        </p>
        <ul>
          <li>
            Your server password is separate from your Mac login password. Your lab lead will
            set up your account and give you initial credentials.
          </li>
          <li>
            If your password expires or you forget it, contact your lab lead or the system
            administrator &mdash; you cannot reset it yourself.
          </li>
          <li>
            Never share your server password with anyone, even other lab members. Each person
            has their own account.
          </li>
        </ul>

        <h2>Common Gotchas</h2>

        <h3>&ldquo;Command not found&rdquo;</h3>
        <p>
          If you see this error, it usually means one of two things:
        </p>
        <ul>
          <li>
            <strong>You are on the wrong machine.</strong> You tried to
            run <code className="code-inline">3dDeconvolve</code> on your Mac (where AFNI is not
            installed), or you tried to run <code className="code-inline">open .</code> on the
            server (where macOS commands do not exist).
            Run <code className="code-inline">hostname</code> to check.
          </li>
          <li>
            <strong>The software is not in your PATH.</strong> On some servers, you need to load
            software modules before using them. Ask your lab lead if the server
            uses <code className="code-inline">module load</code> for AFNI.
          </li>
        </ul>

        <h3>Latency and Timeouts</h3>
        <p>
          SSH sessions depend on a network connection. If your internet is slow, there may be a
          slight delay between typing and seeing output. If the connection drops (e.g., your
          laptop goes to sleep or you change Wi-Fi networks), the SSH session will hang and
          eventually time out. You will know this has happened when the terminal stops
          responding. Just close the terminal window and open a new SSH session.
        </p>

        <h3>The Tilde (~) Shortcut</h3>
        <p>
          On the server, <code className="code-inline">~</code> always refers to your home
          directory. So <code className="code-inline">cd ~</code> takes you home,
          and <code className="code-inline">~/notes.txt</code> refers to a file in your home
          directory. This is useful but remember: the project data is
          under <code className="code-inline">/data/projects/</code>, not under{' '}
          <code className="code-inline">~</code>.
        </p>

        <h2>Disconnecting</h2>
        <p>
          When you are done working on the server, disconnect cleanly:
        </p>
        <TryCommand
          command="exit"
          description="Closes your SSH session and returns to your local Mac terminal"
          execute={true}
        />
        <p>
          You can also press <strong>Ctrl+D</strong> (sends end-of-file) to close the session.
        </p>
        <p>
          After disconnecting, your prompt switches back to your Mac&rsquo;s prompt, and
          commands once again run locally. Any processes you left running on the server will
          continue running (or will be terminated, depending on how they were started &mdash; more
          on that in later modules).
        </p>

        <h2>The Mental Model</h2>
        <p>
          Here is the core idea to carry with you:
        </p>
        <pre className="code-block"><code>{`BEFORE SSH:
  Terminal → runs on YOUR MAC
  Files at /Users/yourname/ and /Volumes/Jarcho_DataShare/
  Software: Mac apps, Python (local), git, etc.

AFTER "ssh -XY tur50045@155.247.67.31":
  Terminal → runs on THE SERVER (155.247.67.31)
  Files at /home/tur50045/ and /data/projects/STUDIES/LEARN/
  Software: AFNI, FreeSurfer, server Python, etc.
  X11 forwarding ON → can display AFNI GUI on your Mac`}</code></pre>
        <p>
          The terminal window looks identical. The machine behind it has changed. Always check
          your prompt or run <code className="code-inline">hostname</code> if you are unsure.
        </p>

        <Callout variant="exercise" title="SSH Into the Server">
          <p>Open the app&rsquo;s built-in terminal and connect to the server:</p>
          <TryCommand
            command="ssh -XY tur50045@155.247.67.31"
            description="Connect to the lab server with X11 forwarding"
            execute={false}
          />
          <p className="mt-2">
            Once connected:
          </p>
          <ol className="mt-2 list-decimal list-inside">
            <li>
              Run <code className="code-inline">hostname</code> to confirm you are on the server.
            </li>
            <li>
              Run <code className="code-inline">pwd</code> to see your home directory.
            </li>
            <li>
              Navigate to the
              project: <code className="code-inline">cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/</code>
            </li>
            <li>
              List the contents: <code className="code-inline">ls -la</code>
            </li>
            <li>
              Confirm the scripts are
              there: <code className="code-inline">ls scripts/</code>
            </li>
          </ol>
          <p className="mt-2">
            If everything worked, you are now running commands on the server and looking at the
            same files that our pipeline processes. Type{' '}
            <code className="code-inline">exit</code> when you are done.
          </p>
        </Callout>

        <Callout variant="exercise" title="Confirm Access to the Data">
          <p>While SSHed into the server, verify that you can see the project data:</p>
          <TryCommand
            command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/"
            description="Lists our pipeline scripts"
            execute={true}
          />
          <TryCommand
            command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/ | head"
            description="Shows the first few subject folders in the fixed events directory"
            execute={true}
          />
          <TryCommand
            command="cat /data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt"
            description="Prints the master subject list"
            execute={true}
          />
          <p className="mt-2">
            The first command lists our pipeline scripts. The second shows the first few subject
            folders in the fixed events directory. The third prints the master subject list. If
            all three commands produce output (not &ldquo;permission denied&rdquo; or &ldquo;no
            such file&rdquo;), your access is correctly configured.
          </p>
        </Callout>

        <Callout variant="exercise" title="Find a Subject's Brain Data">
          <p>
            The raw imaging data lives in the BIDS directory. While SSHed into the server,
            navigate to one subject&rsquo;s functional data and examine the BOLD files &mdash;
            these are the brain scans that the pipeline processes.
          </p>
          <TryCommand
            command="ls /data/projects/STUDIES/LEARN/fMRI/bids/sub-LEARN958/func/"
            description="List the functional files for subject 958"
            execute={true}
          />
          <p className="mt-2">
            You should see <code className="code-inline">.nii.gz</code> files (the compressed
            brain images) and <code className="code-inline">events.tsv</code> files (the
            behavioral logs). Now check how large a single BOLD file is:
          </p>
          <TryCommand
            command="ls -lh /data/projects/STUDIES/LEARN/fMRI/bids/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_bold.nii.gz"
            description="Check file size of one BOLD scan — should be hundreds of MB"
            execute={true}
          />
          <p className="mt-2">
            That&rsquo;s one run for one subject. Now you understand why this data only lives on
            the server &mdash; it is far too large for git or your laptop. Count how many runs
            this subject has:
          </p>
          <TryCommand
            command="ls /data/projects/STUDIES/LEARN/fMRI/bids/sub-LEARN958/func/*bold.nii.gz | wc -l"
            description="Count BOLD runs for subject 958 — should be 4"
            execute={true}
          />
        </Callout>

        <Callout variant="tip" title="Multiple Terminal Tabs">
          You can open multiple terminal tabs (or windows) simultaneously. A common setup is one
          tab SSHed into the server (for running scripts) and another tab on your local Mac (for
          git operations or reading documentation). The two tabs are independent &mdash; being
          connected to the server in one does not affect the other.
        </Callout>
      </div>
    </div>
  )
}
