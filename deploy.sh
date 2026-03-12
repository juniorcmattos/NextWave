#!/bin/bash

# Script de Deploy Automatizado do NextWave CRM para ARM64
# Versão 1.1.4

echo "🚀 Iniciando Deploy do NextWave CRM..."

# Tentar detectar o IP local do servidor
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

# 1. Verificar se o Docker está instalado
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Erro: Docker não está instalado. Por favor, instale o Docker primeiro."
  exit 1
fi

# 2. Verificar se o arquivo .env existe, se não, criar do .env.example
if [ ! -f .env ]; then
    echo "📄 Arquivo .env não encontrado. Criando um padrão..."
    if [ -f .env.example ]; then
        cp .env.example .env
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$SERVER_IP:3000|g" .env
        echo "✅ .env criado. ATENÇÃO: Verifique o campo NEXTAUTH_URL no arquivo .env."
    else
        echo "DATABASE_URL=\"file:/app/data/prod.db\"" > .env
        echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env
        echo "NEXTAUTH_URL=\"http://$SERVER_IP:3000\"" >> .env
        echo "✅ .env gerado automaticamente com IP detectado: $SERVER_IP"
    fi
fi

# 3. Construir e subir os containers
echo "🏗️ Construindo containers (isso pode levar alguns minutos em ARM64)..."
docker compose build --pull

echo "⬆️ Subindo o sistema..."
docker compose up -d

echo "📊 Verificando status..."
docker compose ps

echo ""
echo "===================================================="
echo "✨ NextWave CRM está subindo!"
echo "📍 Acesse em: http://seu-ip-ou-localhost:3000"
echo "📂 Banco de dados persistido no volume: crm-data"
echo "===================================================="
