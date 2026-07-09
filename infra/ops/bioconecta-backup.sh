#!/usr/bin/env sh
set -eu

BACKUP_ROOT="${BACKUP_ROOT:-/root/backups/bioconecta-automated}"
CONTAINER_NAME="${CONTAINER_NAME:-bioconecta-postgres}"
DATABASE_NAME="${DATABASE_NAME:-bioconecta_prod}"
DATABASE_USER="${DATABASE_USER:-bioconecta}"
ENV_FILE="${ENV_FILE:-/opt/bioconecta/infra/.env.production}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

timestamp="$(date +%Y%m%d-%H%M%S)"
target_dir="$BACKUP_ROOT/$timestamp"
dump_tmp="$target_dir/${DATABASE_NAME}.dump.tmp"
dump_file="$target_dir/${DATABASE_NAME}.dump"

mkdir -p "$target_dir"
chmod 700 "$BACKUP_ROOT" "$target_dir"

docker exec "$CONTAINER_NAME" pg_dump -U "$DATABASE_USER" -d "$DATABASE_NAME" -Fc > "$dump_tmp"
mv "$dump_tmp" "$dump_file"

if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$target_dir/.env.production"
  chmod 600 "$target_dir/.env.production"
fi

sha256sum "$dump_file" > "$target_dir/SHA256SUMS"
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} +

echo "backup_dir=$target_dir"
echo "dump_file=$dump_file"
