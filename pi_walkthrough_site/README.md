# PI Walkthrough Site (HTML)

This folder contains a static single‑page HTML site built from `LEARN_RSA_PI_WALKTHROUGH.md` with a sticky left navigation.

## Build

```bash
python3 -m venv pi_walkthrough_site/.venv
pi_walkthrough_site/.venv/bin/pip install markdown
pi_walkthrough_site/.venv/bin/python pi_walkthrough_site/build.py --out pi_walkthrough_site
```

## Open

Open `pi_walkthrough_site/index.html` in a browser. The left nav links jump to sections on the same page.

## Notes
- The build script splits the walkthrough into separate pages (one per section) and generates a left‑nav index.
- The nav is sticky on desktop and collapses to the top on mobile.
