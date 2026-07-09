#!/usr/bin/env sh
set -eu

CONTAINER_NAME="${CONTAINER_NAME:-bioconecta-postgres}"
DATABASE_USER="${DATABASE_USER:-bioconecta}"
SOURCE_DUMP="${1:-}"

if [ -z "$SOURCE_DUMP" ]; then
  echo "usage: $0 /path/to/bioconecta_prod.dump" >&2
  exit 2
fi

if [ ! -f "$SOURCE_DUMP" ]; then
  echo "dump_not_found=$SOURCE_DUMP" >&2
  exit 2
fi

restore_db="bioconecta_restore_check_$(date +%Y%m%d_%H%M%S)"
container_dump="/tmp/${restore_db}.dump"

cleanup() {
  docker exec "$CONTAINER_NAME" dropdb -U "$DATABASE_USER" --if-exists "$restore_db" >/dev/null 2>&1 || true
  docker exec "$CONTAINER_NAME" sh -c "rm -f '$container_dump'" >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker cp "$SOURCE_DUMP" "$CONTAINER_NAME:$container_dump"
docker exec "$CONTAINER_NAME" createdb -U "$DATABASE_USER" "$restore_db"
docker exec "$CONTAINER_NAME" pg_restore -U "$DATABASE_USER" -d "$restore_db" "$container_dump"

users_count="$(docker exec "$CONTAINER_NAME" psql -U "$DATABASE_USER" -d "$restore_db" -tAc "select count(*) from users;")"
tables_count="$(docker exec "$CONTAINER_NAME" psql -U "$DATABASE_USER" -d "$restore_db" -tAc "select count(*) from information_schema.tables where table_schema = 'public';")"

echo "restore_db=$restore_db"
echo "tables_count=$tables_count"
echo "users_count=$users_count"
echo "restore_check=OK"
