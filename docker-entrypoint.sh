#!/bin/sh
set -e

DB_FILE="/app/data/prod.db"

echo ""
echo "================================================"
echo "   NextWave CRM - Iniciando..."
echo "================================================"

# Sincronizar schema (garante que as tabelas existam)
echo ""
echo "[1/2] Sincronizando schema do banco de dados..."
npx prisma db push --skip-generate

echo ""
echo "[2/2] Iniciando servidor em producao..."
echo ""
echo "      Acesse: $NEXTAUTH_URL"
echo "================================================"
echo ""

echo ""
echo "[3/3] Iniciando servidor em producao..."
echo ""
echo "      Acesse: $NEXTAUTH_URL"
echo "================================================"
echo ""

exec node server.js
