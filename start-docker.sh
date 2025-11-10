#!/bin/bash
# Script para iniciar o Okta Mock Server sem docker-compose

echo "🚀 Iniciando Okta Mock Server..."

# Criar network se não existir
docker network create okta-network 2>/dev/null || true

# Criar diretórios necessários
mkdir -p data logs

# Copiar .env se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Arquivo .env criado"
fi

# Construir imagem
echo "🔨 Construindo imagem Docker..."
docker build -t okta-mock-server:latest .

# Parar container existente se houver
docker stop okta-mock-server 2>/dev/null || true
docker rm okta-mock-server 2>/dev/null || true

# Iniciar container
echo "▶️  Iniciando container..."
docker run -d \
    --name okta-mock-server \
    --network okta-network \
    -p 8080:8080 \
    --env-file .env \
    -v "$(pwd)/data:/app/data" \
    -v "$(pwd)/config:/app/config" \
    -v "$(pwd)/logs:/app/logs" \
    --restart unless-stopped \
    okta-mock-server:latest

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 3

# Verificar saúde
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Okta Mock Server está rodando!"
    echo "📍 URL: http://localhost:8080"
    echo "🔑 Token: $(grep OKTA_API_TOKEN .env | cut -d '=' -f2)"
    echo ""
    echo "Ver logs: docker logs -f okta-mock-server"
else
    echo "❌ Erro ao iniciar servidor"
    echo "Verifique os logs: docker logs okta-mock-server"
    exit 1
fi
