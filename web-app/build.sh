#!/bin/bash
export CI=false
export DISABLE_ESLINT_PLUGIN=true
export ESLINT_NO_DEV_ERRORS=true
npm run build
