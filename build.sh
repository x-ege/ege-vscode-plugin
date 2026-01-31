#!/usr/bin/env bash
# Wrapper script for backward compatibility
# Use tasks.sh directly for more options: ./tasks.sh --help

cd "$(dirname "$0")" || exit 1
exec ./tasks.sh --build "$@"
