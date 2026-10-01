#!/bin/bash
set -euo pipefail

# Use URL parsing so escaped passwords, IPv6 and the default PostgreSQL port
# are handled correctly without ever logging the connection string.
database_connection="$(node - <<'JS'
try {
  const url = new URL(process.env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) throw new Error();
  console.log(`${url.hostname.replace(/^\[|\]$/g, '')} ${url.port || '5432'}`);
} catch {
  console.error('DATABASE_URL must be a valid PostgreSQL connection URL');
  process.exit(1);
}
JS
)"
read -r database_host database_port <<< "$database_connection"

echo "Waiting for PostgreSQL at $database_host:$database_port..."
until nc -z -v -w30 "$database_host" "$database_port"
do
  echo "Still waiting for PostgreSQL at $database_host:$database_port..."
  sleep 3
done

echo "Database is up. Running Prisma migrations..."
npx --no-install prisma migrate deploy

echo "Starting Node app..."
exec npm start
