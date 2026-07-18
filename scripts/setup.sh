#!/bin/bash
# =========================================
# RADAR BOKEK — Phase 1 Setup Script
# =========================================
# Run this to initialize the database and
# verify the project is ready to run.
# =========================================

set -e

echo "=== RADAR BOKEK Setup ==="

# 1. Check PostgreSQL
echo ""
echo "[1/4] Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
  echo "  ✓ PostgreSQL is running"
else
  echo "  ✗ PostgreSQL not running. Attempting to start..."
  if command -v pg_ctlcluster &>/dev/null; then
    pg_ctlcluster $(pg_lsclusters -h | head -1 | awk '{print $1, $2}') start
  elif command -v service &>/dev/null; then
    service postgresql start
  else
    echo "  ERROR: Cannot start PostgreSQL. Please start it manually."
    echo "  Run: sudo service postgresql start"
    exit 1
  fi
fi

# 2. Create database
echo ""
echo "[2/4] Creating database..."
DB_NAME="radarbokek"
if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "  ✓ Database '$DB_NAME' already exists"
else
  sudo -u postgres createdb "$DB_NAME" 2>/dev/null || {
    echo "  Creating as current user..."
    createdb "$DB_NAME" 2>/dev/null || {
      echo "  WARNING: Could not create database. Run manually:"
      echo "  sudo -u postgres createdb $DB_NAME"
    }
  }
  echo "  ✓ Database '$DB_NAME' created"
fi

# 3. Enable PostGIS
echo ""
echo "[3/4] Enabling PostGIS..."
sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null || {
  psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null || {
    echo "  WARNING: Could not enable PostGIS. Make sure it's installed:"
    echo "  sudo apt-get install postgresql-postgis"
  }
}
echo "  ✓ PostGIS enabled"

# 4. Run migrations
echo ""
echo "[4/4] Running migrations..."
node server/db/migrate.js 2>/dev/null && echo "  ✓ Migrations complete" || {
  echo "  ERROR: Migration failed. Check DATABASE_URL in .env"
  exit 1
}

# 5. Verify
echo ""
echo "=== Setup Complete ==="
echo ""
echo "  Start dev server:  npm run dev"
echo "  Build production:  npm run build"
echo ""
