# BioConecta Operations

Production helper scripts for the BioConecta VPS.

## Automated backup

`bioconecta-backup.sh` creates a PostgreSQL custom-format dump and stores a copy of the production env file in:

```txt
/root/backups/bioconecta-automated/YYYYMMDD-HHMMSS
```

Default retention is 14 days.

## Health check

`bioconecta-healthcheck.sh` checks the public API and web URLs and appends results to:

```txt
/var/log/bioconecta-health.log
```

Systemd timers under `infra/ops/systemd` install the backup daily at 03:20 and health checks every 5 minutes.
