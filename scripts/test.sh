#!/usr/bin/env bash
set -euo pipefail
curl --fail http://localhost/api/health
curl --fail http://localhost/api/employees
echo
echo "Smoke tests passed."
