# Method

## Participants

Participants were 33 adolescents (15 female; M_age = 12.73 years, SD = 1.35, range 10 to 15 years) drawn from
the larger LEARN study (Clarkson et al., 2024), recruited from the community and from the Child and Adolescent
Anxiety Disorders Clinic at Temple University. The sample was 66.7% White, 18.2% multiracial, 9.1% Black or
African American, and 6.1% Asian, with a median household income of $55,000. Adolescents provided assent and a
parent or guardian provided written consent under procedures approved by the Temple University Institutional
Review Board. All 33 adolescents had usable functional MRI data and complete data on the measures reported below.

## Social Anxiety Symptom Severity

Social anxiety was indexed dimensionally by the social phobia subscale of the child-report Screen for Child
Anxiety Related Emotional Disorders (SCARED; Birmaher et al., 1997, 1999), a seven-item scale (range 0 to 14;
M = 5.00, SD = 4.18). Using the recommended subscale cutoff (≥ 8; Birmaher et al., 1999), 27% of the sample
(9 of 33) screened positive for clinically elevated social anxiety. Screening status converged with clinical
diagnosis: 27% also met criteria for a social anxiety disorder on the Anxiety Disorders Interview Schedule for
DSM-IV (ADIS-C/P; Silverman & Albano, 1996; clinician severity rating ≥ 4), and 42% met criteria for any
anxiety disorder. Self-reported social phobia scores tracked diagnostic status (point-biserial r = .72;
diagnosed M = 9.89, non-diagnosed M = 3.17). This continuous score was used in all analyses.

## The LEARN Task

Adolescents completed the Learning from Evaluation And Recall of iNteractions (LEARN) task, an adaptation of the
virtual-school paradigm (Jarcho et al., 2013, 2016) programmed in Presentation (Version 23.0; Neurobehavioral
Systems). During an initial remote visit, each adolescent built a personalized avatar and profile and was told
that their responses would be shared with gender-matched peers they would meet at a later visit. At the scanning
visit, adolescents were told they would enter four classrooms and interact with four peers (Figure 1). On each
trial, the adolescent predicted whether a given peer would deliver nice or mean feedback (4 s), received the
peer's feedback, which confirmed or disconfirmed the prediction (3 s), and then made a response ("You're Right,"
"You're Wrong," "You're Nice," or "You're Mean"; 4 s), followed by a 0.5-s intertrial interval. Prediction and
response reaction times were used to model epoch durations and to introduce jitter. Each of the four classrooms
constituted one functional run (6 min 30 s). Each peer appeared eight times per run, yielding 32 trials per peer
and 128 trials total; trial order was fixed across participants.

The four peers differed in reputation, defined by the disposition (nice or mean) and predictability of their
feedback and operationalized as each peer's probability of delivering nice feedback: a predictable nice peer
(80% nice), an unpredictable nice peer (60% nice), an unpredictable mean peer (40% nice), and a predictable mean
peer (20% nice).

## fMRI Data Acquisition

Before scanning, participants completed a mock session to acclimate to the scanner environment and practice
remaining still. Images were acquired on a 3-T Siemens MAGNETOM Prisma scanner with a 20-channel head coil.
Functional images were acquired with a T2*-weighted multiband echo-planar imaging (EPI) sequence (multiband
factor 2; 217 volumes; 52 axial slices; 3-mm isotropic voxels; TR/TE = 1750/29 ms; flip angle = 74 degrees;
FOV = 240 mm; matrix = 80 x 80). A high-resolution T1-weighted MPRAGE structural image was acquired for
anatomical localization and coregistration (sagittal; 1-mm isotropic; flip angle = 8 degrees; FOV = 224 mm;
matrix = 224 x 224). The task was viewed through a head-coil-mounted mirror, and responses were recorded with an
MRI-compatible four-button response box.

## fMRI Preprocessing and First-Level Modeling

DICOM images were converted to BIDS format and preprocessed in AFNI (Cox, 1996) using afni_proc.py. Processing
included despiking, slice-timing correction, motion correction by realignment to the minimum-outlier volume,
coregistration of the functional and anatomical images, nonlinear normalization to the MNI152 2009c nonlinear
asymmetric template (Fonov et al., 2011) via @SSwarper, and scaling of each voxel to percent signal change. No
spatial smoothing was applied. Volumes were censored when the per-volume Euclidean-norm motion derivative
exceeded 1.0 mm or the outlier fraction exceeded 0.1.

First-level models were estimated with 3dDeconvolve. Feedback was modeled separately for each peer, each feedback
valence, and each run using a duration-modulated block response (AFNI dmBLOCK), together with prediction,
response, and prediction-to-feedback anticipation regressors and the six rigid-body motion parameters. For each
peer and run, the feedback response used in the representational analysis was the average of that peer's
mean-feedback and nice-feedback estimates.

## Regions of Interest

Analyses were conducted in 36 a priori social-brain regions of interest defined from the meta-analytic
social-brain atlas of Alcala-Lopez et al. (2018), which specifies consensus peak coordinates for social-brain
regions across studies. For the 30 cortical regions, a 10-mm-radius sphere was grown around each region's
consensus peak and intersected with a group mask retaining voxels with signal in at least 90% of participants.
The atlas also distributes gray-matter-constrained parcels grown from these peaks; resampled to the 3-mm
functional grid, however, these parcels retained too few voxels to support stable within-region multivoxel
estimates, so fixed-radius spheres were used. For the six subcortical regions (bilateral hippocampus, amygdala,
and nucleus accumbens), whose small, curved anatomy is poorly approximated by a sphere, regions were instead
defined from the Harvard-Oxford subcortical atlas (Frazier et al., 2005; Goldstein et al., 2007; Makris
et al., 2006) thresholded at 25% probability.

## Representational Similarity Analysis

Representational similarity analysis (RSA; Kriegeskorte et al., 2008) compares a region's representational
dissimilarity matrix (RDM) against a model RDM. We used a model-based RSA in which the model RDM encoded the
veridical structure of the social environment.

The model RDM was defined over the four peers as the absolute difference in their probability of nice feedback,
normalized by the maximum possible difference: d(i, j) = |P(nice)_i - P(nice)_j| / 0.60. The neural RDM was
computed separately for each participant, run, and region: the multivoxel feedback pattern for each of the four
peers (defined above) formed a 4 x 4 matrix of pairwise dissimilarities (1 minus the Pearson correlation between
peer patterns). For each participant, run, and region, alignment was the Spearman correlation between the six
unique off-diagonal neural dissimilarities and the corresponding model values, Fisher-z transformed. This
procedure yielded one alignment value per participant per run (Figure 2).

To relate alignment to social anxiety, each region's Fisher-z alignment values (z) were entered into an ordinary
least squares model, z ~ run + SA + run x SA, where SA is social anxiety and run was mean-centered across the
four runs. The main effect indexed mean alignment across runs; the interaction indexed change in alignment across
runs. The main effect was tested by permuting social anxiety scores across participants (10,000 permutations).
The interaction was tested against a joint null in which social anxiety scores were permuted across participants
and each participant's alignment values were independently scrambled across their four runs. The p values were
corrected across the 36 regions using the Benjamini-Hochberg false discovery rate (Benjamini & Hochberg, 1995).

## Temporal Inter-Subject Correlation

We computed leave-one-out inter-subject correlation (ISC; Hasson et al., 2004; Nastase et al., 2019): within
each region, each participant's region-mean time course was Pearson-correlated with the mean of the remaining
participants' region-mean time courses, and the resulting coefficient was Fisher-z transformed. Because
prediction and response were self-paced, feedback onsets drifted across participants over a run. This drift
accumulated across runs, reaching up to 5.86 s (3.3 TR) by the fourth run, with a mean absolute deviation of
0.35 s (0.20 TR) across all feedback events. To align events before computing synchrony, each participant's run
time course was temporally warped to the group-median feedback onsets by piecewise-linear interpolation anchored
at the run boundaries and at each feedback onset (implemented in SciPy), then z-scored. ISC was computed within
each run and averaged across runs, and each region's mean ISC was Spearman-correlated with social anxiety. The
p values were corrected across the 36 regions using the Benjamini-Hochberg false discovery rate.
