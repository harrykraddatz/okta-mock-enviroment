#!/bin/bash
# Script para parar o Okta Mock Server

echo "🛑 Parando Okta Mock Server..."

docker stop okta-mock-server
docker rm okta-mock-server

echo "✅ Container parado e removido"
