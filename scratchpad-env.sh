#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ROOT_DIR}/.env.scratchpad"
EXAMPLE_FILE="${ROOT_DIR}/.env.scratchpad.example"

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${EXAMPLE_FILE}" "${ENV_FILE}"
  echo "Created ${ENV_FILE} from template."
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [[ "$#" -gt 0 ]]; then
  if [[ "$1" == "--" ]]; then
    shift
  fi
  exec "$@"
fi

echo "Scratch pad env loaded from ${ENV_FILE}"
echo "Run with a command, e.g. ./scratchpad-env.sh -- env | rg '^SCRATCHPAD_'"
