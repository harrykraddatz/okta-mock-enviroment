#!/bin/bash
# Script para executar testes do SDK sem docker-compose

echo "🧪 Executando testes do Okta SDK..."

# Garantir que o servidor está rodando
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Okta Mock Server não está rodando"
    echo "Execute: ./start-docker.sh"
    exit 1
fi

# Entrar no diretório de teste
cd test-client

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Configurar variáveis de ambiente para teste local
export OKTA_CLIENT_ORGURL=http://localhost:8080
export OKTA_CLIENT_TOKEN=test-api-token-12345

# Executar testes
echo "▶️  Executando testes..."
node test-sdk.js

cd ..
