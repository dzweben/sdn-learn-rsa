# PI Walkthrough Site (HTML)

This folder contains a static single-page HTML site built from `docs/pi-walkthrough.md` with a sticky left navigation.

## Build

```bash
python3 -m venv guides/pi-walkthrough/.venv
guides/pi-walkthrough/.venv/bin/pip install markdown
guides/pi-walkthrough/.venv/bin/python guides/pi-walkthrough/build.py --out guides/pi-walkthrough
```

## Open

Open `guides/pi-walkthrough/index.html` in a browser. The left nav links jump to sections on the same page.

## Notes
- The build script generates a single-page walkthrough with sticky left nav anchors.
- The nav is sticky on desktop and collapses to the top on mobile.
