#!/usr/bin/env python3
"""
Extract figures from Finn et al. (2020) PDF at high resolution.
Each figure is clipped from the page render using precise bounding boxes.

Bounding boxes determined by rendering pages at 1x (72 DPI) and measuring
pixel coordinates, then converting to fractions of page dimensions.
Page dimensions: 595.3 x 793.7 points (A4).
"""

import fitz  # PyMuPDF
import os

PDF_PATH = "/Users/dannyzweben/Desktop/SDN/Y1_project/literature/papers/Finn et al. - 2020 - Idiosynchrony From shared responses to individual.pdf"
OUT_DIR = "/Users/dannyzweben/Desktop/SDN/Y1_project/guides/undergrad-app/src/renderer/src/assets/papers/finn-2020"

# DPI for rendering (3x = 216 DPI for crisp retina images)
ZOOM = 3.0

# Figure locations: (page_index_0based, x0_frac, y0_frac, x1_frac, y1_frac, filename)
# Fractions of page width/height — TIGHT crops of just the visual content
FIGURES = [
    # Figure 1 - IS-RSA schematic (page 4, 0-indexed = 3)
    # Schematic is LEFT side only; exclude "E.S. Finn et al." header and body text below
    (3, 0.03, 0.035, 0.48, 0.41, "fig1_isrsa_schematic.png"),

    # Figure 2 - Four model structures: NN, mean, min, combined (page 5, 0-indexed = 4)
    # Panels a-d; tighter right edge to exclude caption text
    (4, 0.02, 0.025, 0.67, 0.84, "fig2_four_models.png"),

    # Figure 3 - Working memory IS-RSA results (page 7, 0-indexed = 6)
    # Scatter plots + brain maps only; exclude header, journal info, and "Fig. 3" caption
    (6, 0.03, 0.03, 0.92, 0.335, "fig3_working_memory.png"),

    # Figure 4 - Personality IS-RSA results (page 8, 0-indexed = 7)
    # Part a (Itemwise) + Part b (Trait scores); exclude header and "Fig. 4" caption
    (7, 0.03, 0.025, 0.97, 0.585, "fig4_personality.png"),

    # Figure 5 - Synchrony / tuning curves diagram (page 9, 0-indexed = 8)
    # Just the plot axes + curves; exclude left column text and caption below
    (8, 0.52, 0.645, 0.93, 0.82, "fig5_tuning_curves.png"),
]

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = fitz.open(PDF_PATH)

    for page_idx, x0f, y0f, x1f, y1f, filename in FIGURES:
        page = doc[page_idx]
        pw, ph = page.rect.width, page.rect.height

        # Compute clip rectangle in page coordinates
        clip = fitz.Rect(x0f * pw, y0f * ph, x1f * pw, y1f * ph)

        # Render at high DPI with clip
        mat = fitz.Matrix(ZOOM, ZOOM)
        pix = page.get_pixmap(matrix=mat, clip=clip)

        out_path = os.path.join(OUT_DIR, filename)
        pix.save(out_path)
        print(f"  Saved {filename} ({pix.width}x{pix.height})")

    doc.close()
    print(f"\nAll {len(FIGURES)} figures extracted to {OUT_DIR}")

if __name__ == "__main__":
    main()
