#!/bin/bash

#######################################################
# my_timing.sh — Generate .1D timing files from BIDS events
#
# Reads events.tsv from bids_fixed/ and produces
# non-parametric (onset:duration) timing files for
# AFNI's GLM. One file per condition per run per subject.
#
# Includes anticipation regressor (prediction→feedback ISI).
#######################################################

############################################################################################
# GENERAL SETUP
############################################################################################


