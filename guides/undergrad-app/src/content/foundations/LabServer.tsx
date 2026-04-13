/**
 * Foundations — Module 1: The Lab Server
 * What the server is, why we use it, where data lives, and the Samba share.
 */

import Callout from '@src/components/Callout'

export default function LabServer(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Foundations
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 1 of 5</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The Lab Server
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          The shared compute node where our data lives and our analyses run &mdash; and how to
          access it from your Mac.
        </p>
      </div>

      {/* Content */}
      <div className="prose-container">
        <h2>What Is the Lab Server?</h2>
        <p>
          Imagine a powerful Linux desktop computer sitting in a server room on campus. It is always
          powered on, always connected to the network, and packed with far more RAM, CPU cores, and
          storage than any laptop. That machine is our <strong>lab server</strong>.
        </p>
        <p>
          Unlike your personal laptop, the server is <em>shared</em>. Multiple lab members can log
          in at the same time, each in their own session, running their own analyses. Think of it
          like a library study room that many people can use simultaneously &mdash; everyone has
          their own desk, but the building and its resources are communal.
        </p>
        <p>
          The server runs <strong>Linux</strong> (specifically a flavor of CentOS or Ubuntu,
          depending on the lab). Everything you do on the server happens through a terminal &mdash;
          there is no desktop with icons to click. This is completely normal for scientific
          computing, and you will get comfortable with it quickly.
        </p>

        <h2>Why We Use a Server</h2>
        <p>
          Three practical reasons make the server indispensable for neuroimaging work:
        </p>
        <ul>
          <li>
            <strong>Software lives there.</strong> AFNI, FreeSurfer, and other neuroimaging tools are
            pre-installed and configured on the server. Installing these packages on every lab
            member's laptop would be fragile and time-consuming. By centralizing them on the server,
            everyone runs the exact same software versions, which keeps results reproducible.
          </li>
          <li>
            <strong>Data lives there.</strong> A single subject's fMRI dataset can be several
            gigabytes. Multiply that by 38 subjects with multiple runs, anatomical scans, and
            derivatives, and you are looking at roughly 500&nbsp;GB of raw and processed data. That
            data stays on the server's fast storage &mdash; downloading it all to a laptop would be
            impractical and slow.
          </li>
          <li>
            <strong>Compute power lives there.</strong> Running a GLM (General Linear Model) on one
            subject can take several minutes. Running it on 38 subjects in a loop can take hours. The
            server has enough CPU cores and memory to handle that load efficiently, and you can start
            a job and walk away without worrying about your laptop going to sleep.
          </li>
        </ul>

        <Callout variant="learn">
          Everything in our RSA pipeline &mdash; from fixing event labels to generating timing
          files to running the GLM &mdash; is designed to run on the server. The scripts reference
          server paths, the data is on server storage, and AFNI is installed on the server. Your
          laptop is the <em>control panel</em>; the server is the <em>engine</em>.
        </Callout>

        <h2>Where Data Is Stored</h2>
        <p>
          The server organizes research data under a hierarchy rooted
          at <code className="code-inline">/data/projects/</code>. Our study lives at:
        </p>
        <pre className="code-block"><code>/data/projects/STUDIES/LEARN/fMRI/</code></pre>
        <p>
          Inside that directory you will find several important sub-paths:
        </p>
        <ul>
          <li>
            <code className="code-inline">bids/</code> &mdash; the original raw BIDS dataset
            (Brain Imaging Data Structure). This is the unmodified scanner output, organized into
            one folder per subject, each containing anatomical and functional scans plus event
            files.
          </li>
          <li>
            <code className="code-inline">RSA-learn/</code> &mdash; our project directory. This
            is where all of our pipeline code, fixed event files, timing files, and GLM outputs
            live. You will spend most of your time here.
          </li>
          <li>
            <code className="code-inline">derivatives/afni/ssw/</code> &mdash; skull-stripped and
            warped anatomical images (one per subject), used as templates during the GLM.
          </li>
          <li>
            <code className="code-inline">derivatives/afni/confounds/</code> &mdash; motion and
            nuisance regressors for each subject, used to clean up the fMRI signal.
          </li>
          <li>
            <code className="code-inline">code/afni/subjList_LEARN.txt</code> &mdash; the master
            list of subject IDs. Every script reads from this list to know which subjects to
            process.
          </li>
        </ul>
        <p>
          When you SSH into the server (covered in Module 3), you can explore all of these paths
          directly. For now, just know the shape of the tree:
        </p>
        <pre className="code-block"><code>{`/data/projects/STUDIES/LEARN/fMRI/
├── bids/                      # Raw scanner data (never modify)
│   ├── sub-LEARN001/
│   ├── sub-LEARN002/
│   └── ...
├── RSA-learn/                 # Our project home
│   ├── scripts/               # Pipeline scripts
│   ├── bids_fixed/            # Stage 1 output
│   ├── TimingFiles/Fixed2/    # Stage 2 output
│   └── derivatives/           # Stage 3 output (GLM results)
├── derivatives/afni/
│   ├── ssw/                   # Skull-stripped anatomy
│   └── confounds/             # Motion regressors
└── code/afni/
    └── subjList_LEARN.txt     # Master subject list`}</code></pre>

        <h2>The Samba Share</h2>

        <Callout variant="definition">
          <strong>Samba share:</strong> A way for a Linux server to share its files over the
          network using the SMB/CIFS protocol &mdash; the same protocol that Windows file sharing
          uses. When you &ldquo;mount&rdquo; a Samba share on your Mac, the server&rsquo;s files
          appear in Finder as if they were on an external drive. You can open, read, and edit them
          with any Mac application, even though the files physically live on the server.
        </Callout>

        <p>
          You do not need to SSH into the server every time you want to look at a file. The lab
          server exposes its data directory as a <strong>Samba share</strong>, which your Mac can
          mount as a network volume. Once mounted, the server&rsquo;s files appear
          at:
        </p>
        <pre className="code-block"><code>/Volumes/Jarcho_DataShare/</code></pre>
        <p>
          From there, you can navigate to our project:
        </p>
        <pre className="code-block"><code>/Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/</code></pre>
        <p>
          This is the same set of files you would see by SSHing in and running{' '}
          <code className="code-inline">ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/</code>.
          The Samba share is just a different window into the same storage.
        </p>

        <h2>How to Mount the Samba Share on Your Mac</h2>
        <p>
          Follow these steps to connect:
        </p>
        <ol>
          <li>
            Open <strong>Finder</strong> on your Mac.
          </li>
          <li>
            In the menu bar, click <strong>Go &rarr; Connect to Server&hellip;</strong> (or
            press <code className="code-inline">Cmd + K</code>).
          </li>
          <li>
            In the server address field, type the Samba URL your lab lead gives you. It will look
            something like:
            <pre className="code-block"><code>smb://server-hostname/Jarcho_DataShare</code></pre>
          </li>
          <li>
            Click <strong>Connect</strong>. You will be prompted for your server username and
            password (the same credentials you use for SSH).
          </li>
          <li>
            Once authenticated, the share appears in Finder&rsquo;s sidebar and is accessible at{' '}
            <code className="code-inline">/Volumes/Jarcho_DataShare/</code>.
          </li>
        </ol>
        <p>
          The connection persists until you eject the share, restart your Mac, or lose network
          connectivity. If it disconnects, just repeat the steps above to remount.
        </p>

        <Callout variant="exercise" title="Mount the Samba Share">
          <p>
            Connect to the Samba share using the steps above. Once mounted, open Finder and
            navigate to:
          </p>
          <p className="mt-2">
            <code className="code-inline">
              /Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/RSA-learn/
            </code>
          </p>
          <p className="mt-2">
            You should see folders like <code className="code-inline">scripts/</code>,{' '}
            <code className="code-inline">docs/</code>, and{' '}
            <code className="code-inline">bids_fixed/</code>. If you see them, the mount worked.
          </p>
        </Callout>

        <Callout variant="exercise" title="Browse in the App's File Browser">
          <p>
            Open this app&rsquo;s built-in file browser (the folder icon in the sidebar). Navigate
            to <code className="code-inline">/Volumes/Jarcho_DataShare/STUDIES/LEARN/fMRI/</code>{' '}
            and explore the directory tree. Try to find:
          </p>
          <ul className="mt-2 list-disc list-inside">
            <li>
              The <code className="code-inline">bids/</code> folder (raw data)
            </li>
            <li>
              The <code className="code-inline">RSA-learn/scripts/</code> folder (our pipeline)
            </li>
            <li>
              The <code className="code-inline">subjList_LEARN.txt</code> file inside{' '}
              <code className="code-inline">code/afni/</code>
            </li>
          </ul>
          <p className="mt-2">
            Getting comfortable navigating this tree will save you time in every later module.
          </p>
        </Callout>

        <h2>The Mental Model</h2>
        <p>
          Here is the simplest way to think about how your Mac and the server relate:
        </p>
        <ul>
          <li>
            <strong>Your Mac</strong> is for <em>writing code, reading documentation, and
            reviewing results</em>. You edit scripts in a code editor, read papers, and look at
            output files.
          </li>
          <li>
            <strong>The server</strong> is for <em>running heavy computation</em>. You execute
            pipeline scripts, run GLMs, and process brain data.
          </li>
          <li>
            <strong>The Samba share</strong> bridges the two. It lets your Mac applications
            directly open and edit files that physically live on the server &mdash; no copying
            required.
          </li>
        </ul>
        <p>
          A typical workflow looks like this: open a script via the Samba share in your editor,
          make changes, save &mdash; then SSH into the server and run the updated script. The
          changes are instantly visible on the server because the Samba share points at the same
          files.
        </p>
        <p>
          You will practice this exact workflow in Module 5 (Editing on the Server). For now, the
          key takeaway is: <strong>one set of files, two ways to access them</strong>.
        </p>

        <Callout variant="tip">
          If you ever find yourself confused about whether a file is &ldquo;on your laptop&rdquo;
          or &ldquo;on the server,&rdquo; check the path. If it starts
          with <code className="code-inline">/Volumes/Jarcho_DataShare/</code>, you are looking
          at the server&rsquo;s files through the Samba share. If it starts with{' '}
          <code className="code-inline">/Users/yourname/</code>, it is a local file on your Mac.
        </Callout>
      </div>
    </div>
  )
}
