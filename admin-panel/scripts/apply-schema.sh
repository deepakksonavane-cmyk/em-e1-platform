#!/usr/bin/env bash
# Applies prisma/init.sql to the database pointed at by DATABASE_URL.
# See prisma/init.sql header comment for why this replaces `prisma migrate` here.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set (checked .env)." >&2
  exit 1
fi

PSQL_URL="${DATABASE_URL%%\?*}"
echo "Applying prisma/init.sql to $PSQL_URL ..."
psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f prisma/init.sql
echo "Done."
