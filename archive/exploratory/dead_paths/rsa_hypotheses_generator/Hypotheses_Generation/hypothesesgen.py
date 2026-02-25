##This script generates a list of hypothesis comparisons for RSA analysis, parison acorss different experimental conditions

import pandas as pd

# -------------------------------
# Base conditions
# -------------------------------
PN_N = "Nice feedback from Predictable Nice"
PN_M = "Mean feedback from Predictable Nice"
PM_N = "Nice feedback from Predictable Mean"
PM_M = "Mean feedback from Predictable Mean"
U_N  = "Nice feedback from Unpredictable"
U_M  = "Mean feedback from Unpredictable"

# Totals
PRED_TOTAL_NICE = "Total Nice (Predictable: PN+PM)"
PRED_TOTAL_MEAN = "Total Mean (Predictable: PN+PM)"
ALL_TOTAL_NICE  = "Total Nice (All peers)"
ALL_TOTAL_MEAN  = "Total Mean (All peers)"

# Predictability totals
TOTAL_PREDICTABLE   = "Total Predictable (All feedback)"
TOTAL_UNPREDICTABLE = "Total Unpredictable (All feedback)"

comparisons = []

def add(comp_type, a, b, comparison=None, sa_note=None):
    """Helper to add rows consistently."""
    comparisons.append({
        "Concept family": comp_type,
        "Condition A": a,
        "Condition B": b,
        "Comparison": comparison if comparison else f"{a} vs. {b}",
        "SA vs. Non-SA": sa_note if sa_note else f"Compare pattern similarity for {a} vs. {b} between SA and Non-SA"
    })

# -------------------------------
# Concept families
# -------------------------------

# FAMILY 1: Within-peer valence
add("Within-peer valence", PN_N, PN_M)
add("Within-peer valence", PM_N, PM_M)
add("Within-peer valence", U_N,  U_M)

# FAMILY 2: Predictable reputation (valence-controlled)
add("Predictable reputation (valence-controlled)", PN_N, PM_N)
add("Predictable reputation (valence-controlled)", PN_M, PM_M)

# FAMILY 3: Predictable valence totals
add("Predictable valence totals", PRED_TOTAL_NICE, PRED_TOTAL_MEAN)

# FAMILY 4: Global valence totals
add("Global valence totals", ALL_TOTAL_NICE, ALL_TOTAL_MEAN)

# FAMILY 5: Global predictability totals
add("Global predictability totals", TOTAL_PREDICTABLE, TOTAL_UNPREDICTABLE)

# -------------------------------
# FAMILY 6: Peer-level RSA (expanded explanation)
# -------------------------------

peer_conditions = [
    "Nice-Predictable (peer-averaged)",
    "Mean-Predictable (peer-averaged)",
    "Nice-Unpredictable (peer-averaged)",
    "Mean-Unpredictable (peer-averaged)"
]

# Disposition model
add(
    "Peer-level RSA",
    "Peer-averaged neural patterns for 4 peers (Nice-Predictable, Mean-Predictable, Nice-Unpredictable, Mean-Unpredictable). Averaged across 32 trials each -> Brain RDM (4x4 dissimilarities).",
    "Disposition model RDM (clusters peers by valence: Nice peers more similar, Mean peers more similar).",
    comparison="Brain RDM vs. Disposition model — tests whether neural similarity reflects valence grouping.",
    sa_note="Compare alignment (Brain–Disposition correlation) between SA and Non-SA groups."
)

# Predictability model
add(
    "Peer-level RSA",
    "Peer-averaged neural patterns for 4 peers (Nice-Predictable, Mean-Predictable, Nice-Unpredictable, Mean-Unpredictable). Averaged across 32 trials each -> Brain RDM (4x4 dissimilarities).",
    "Predictability model RDM (clusters peers by predictability: Predictable peers more similar, Unpredictable peers more similar).",
    comparison="Brain RDM vs. Predictability model — tests whether neural similarity reflects predictability grouping.",
    sa_note="Compare alignment (Brain–Predictability correlation) between SA and Non-SA groups."
)

# Negativity model
add(
    "Peer-level RSA",
    "Peer-averaged neural patterns for 4 peers (Nice-Predictable, Mean-Predictable, Nice-Unpredictable, Mean-Unpredictable). Averaged across 32 trials each -> Brain RDM (4x4 dissimilarities).",
    "Negativity model RDM (asymmetric weighting: Mean peers more dissimilar from Nice peers, reflecting negativity bias).",
    comparison="Brain RDM vs. Negativity model — tests whether neural similarity reflects stronger separation for Mean peers.",
    sa_note="Compare alignment (Brain–Negativity correlation) between SA and Non-SA groups."
)

# -------------------------------
# Build DataFrame
# -------------------------------
df_final = pd.DataFrame(comparisons)

# Show result
print(df_final.to_string(index=False))

# Save to CSV
df_final.to_csv("rsa-hypothesis_comparisons.csv", index=False, encoding='utf-8-sig')