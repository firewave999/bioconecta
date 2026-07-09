# BioConecta Operations

Production helper scripts for the BioConecta VPS.

## Automated backup

`bioconecta-backup.sh` creates a PostgreSQL custom-format dump and stores a copy of the production env file in:

```txt
/root/backups/bioconecta-automated/YYYYMMDD-HHMMSS
```

Default retention is 14 days.

## Restore verification

Use `bioconecta-verify-backup.sh` to test a dump without touching the production database:

```sh
/opt/bioconecta/infra/ops/bioconecta-verify-backup.sh /root/backups/bioconecta-automated/YYYYMMDD-HHMMSS/bioconecta_prod.dump
```

The script creates a temporary database, restores the dump, checks basic table/user counts, then drops the temporary database.

For an actual emergency restore, stop the application first, create a fresh dump of the current database, then restore intentionally:

```sh
docker compose -f /opt/bioconecta/infra/docker-compose.production.yml --env-file /opt/bioconecta/infra/.env.production stop bioconecta-api bioconecta-web
docker exec bioconecta-postgres pg_dump -U bioconecta -d bioconecta_prod -Fc > /root/backups/bioconecta-before-emergency-restore.dump
docker exec bioconecta-postgres dropdb -U bioconecta bioconecta_prod
docker exec bioconecta-postgres createdb -U bioconecta bioconecta_prod
docker cp /root/backups/bioconecta-automated/YYYYMMDD-HHMMSS/bioconecta_prod.dump bioconecta-postgres:/tmp/bioconecta_prod.dump
docker exec bioconecta-postgres pg_restore -U bioconecta -d bioconecta_prod /tmp/bioconecta_prod.dump
docker compose -f /opt/bioconecta/infra/docker-compose.production.yml --env-file /opt/bioconecta/infra/.env.production up -d bioconecta-api bioconecta-web
```

## Health check

`bioconecta-healthcheck.sh` checks the public API and web URLs and appends results to:

```txt
/var/log/bioconecta-health.log
```

Systemd timers under `infra/ops/systemd` install the backup daily at 03:20 and health checks every 5 minutes.
