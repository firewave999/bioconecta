#!/usr/bin/env sh
set -eu

API_HEALTH_URL="${API_HEALTH_URL:-https://api-bioconecta.garagemjdm.com.br/api/v1/health}"
WEB_HEALTH_URL="${WEB_HEALTH_URL:-https://bioconecta.garagemjdm.com.br/}"
LOG_FILE="${LOG_FILE:-/var/log/bioconecta-health.log}"

check_url() {
  name="$1"
  url="$2"
  timestamp="$(date -Iseconds)"

  if curl -fsS --max-time 20 "$url" >/dev/null; then
    echo "$timestamp OK $name $url" >> "$LOG_FILE"
    return 0
  fi

  echo "$timestamp FAIL $name $url" >> "$LOG_FILE"
  return 1
}

status=0
check_url "api" "$API_HEALTH_URL" || status=1
check_url "web" "$WEB_HEALTH_URL" || status=1

if [ "$status" -ne 0 ]; then
  docker ps --format '{{.Names}} {{.Status}}' | grep 'bioconecta-' >> "$LOG_FILE" 2>/dev/null || true
fi

exit "$status"
