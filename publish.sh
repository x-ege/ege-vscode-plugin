#!/usr/bin/env bash
# Wrapper script for backward compatibility
# Use tasks.sh directly for more options: ./tasks.sh --help

cd "$(dirname "$0")"
exec ./tasks.sh --publish "$@"
