#!/bin/bash
# Script para inicializar dados de teste no Okta Mock Server

echo "🔧 Inicializando dados de teste no Okta Mock Server..."

# Esperar o servidor estar disponível
until curl -s http://okta-mock:8080/health > /dev/null; do
  echo "⏳ Aguardando servidor Okta Mock estar disponível..."
  sleep 2
done

echo "✅ Servidor disponível!"

# Configurar variáveis
OKTA_URL="http://okta-mock:8080"
API_TOKEN="test-api-token-12345"

# Criar usuários de teste
echo "👥 Criando usuários de teste..."

curl -X POST "${OKTA_URL}/api/v1/users" \
  -H "Authorization: SSWS ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "login": "john.doe@example.com"
    }
  }'

curl -X POST "${OKTA_URL}/api/v1/users" \
  -H "Authorization: SSWS ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "login": "jane.smith@example.com"
    }
  }'

# Criar grupos de teste
echo "👥 Criando grupos de teste..."

curl -X POST "${OKTA_URL}/api/v1/groups" \
  -H "Authorization: SSWS ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "name": "Developers",
      "description": "Development team group"
    }
  }'

curl -X POST "${OKTA_URL}/api/v1/groups" \
  -H "Authorization: SSWS ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "name": "Administrators",
      "description": "Admin group"
    }
  }'

# Criar aplicação de teste
echo "📱 Criando aplicação de teste..."

curl -X POST "${OKTA_URL}/api/v1/apps" \
  -H "Authorization: SSWS ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "oidc_client",
    "label": "Test Application",
    "signOnMode": "OPENID_CONNECT",
    "settings": {
      "oauthClient": {
        "redirect_uris": ["http://localhost:3000/callback"],
        "response_types": ["code"],
        "grant_types": ["authorization_code", "refresh_token"]
      }
    }
  }'

echo "✅ Dados de teste criados com sucesso!"
