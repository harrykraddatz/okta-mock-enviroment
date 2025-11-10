# 🚀 Okta Mock Server - Ambiente de Teste

Ambiente containerizado do Okta para testes locais do SDK Node.js.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+

## 🏗️ Estrutura do Projeto

```
okta/
├── docker-compose.yml        # Orquestração dos containers
├── Dockerfile                # Imagem do Okta Mock Server
├── package.json              # Dependências do servidor
├── .env.example              # Exemplo de variáveis de ambiente
├── src/
│   └── server.js            # Servidor mock da API Okta
├── config/
│   └── default.json         # Configurações do servidor
├── scripts/
│   └── init-data.sh         # Script de inicialização de dados
└── test-client/             # Cliente de teste do SDK
    ├── package.json
    ├── test-sdk.js
    └── .env
```

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário. As configurações padrão funcionam out-of-the-box.

### 2. Construir e Iniciar o Container

```bash
# Construir a imagem
docker-compose build

# Iniciar o servidor
docker-compose up -d

# Verificar logs
docker-compose logs -f okta-mock
```

### 3. Verificar Saúde do Servidor

```bash
curl http://localhost:8080/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T...",
  "service": "okta-mock-server"
}
```

## 🧪 Testando o SDK Node.js

### Executar Testes do SDK

```bash
# Executar container de teste
docker-compose --profile test up okta-sdk-test

# Ou executar manualmente
cd test-client
npm install
npm test
```

### Exemplo de Uso do SDK

```javascript
const okta = require('@okta/okta-sdk-nodejs');

const client = new okta.Client({
  orgUrl: 'http://localhost:8080',
  token: 'test-api-token-12345'
});

// Listar usuários
await client.userApi.listUsers().each(user => {
  console.log(user.profile.email);
});

// Criar usuário
const newUser = await client.userApi.createUser({
  body: {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      login: 'john@example.com'
    }
  }
});
```

## 📡 API Endpoints Disponíveis

### Health Check
- `GET /health` - Verificar status do servidor

### Users API
- `GET /api/v1/users` - Listar todos os usuários
- `GET /api/v1/users/:id` - Buscar usuário por ID
- `POST /api/v1/users` - Criar novo usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário

### Groups API
- `GET /api/v1/groups` - Listar todos os grupos
- `POST /api/v1/groups` - Criar novo grupo

### Applications API
- `GET /api/v1/apps` - Listar todas as aplicações
- `POST /api/v1/apps` - Criar nova aplicação

### OAuth 2.0
- `POST /oauth2/default/v1/token` - Obter token de acesso
- `GET /.well-known/openid-configuration` - Configuração OIDC

## 🔑 Autenticação

Todas as requisições à API (exceto health check) requerem autenticação via header:

```bash
Authorization: SSWS test-api-token-12345
```

Exemplo com curl:
```bash
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: SSWS test-api-token-12345"
```

## 🛠️ Comandos Úteis

```bash
# Iniciar containers
npm run docker:up

# Parar containers
npm run docker:down

# Ver logs
npm run docker:logs

# Reiniciar servidor
npm run docker:restart

# Reconstruir imagem
docker-compose build --no-cache
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OKTA_DOMAIN` | Domínio do Okta | `localhost:8080` |
| `OKTA_API_TOKEN` | Token de API | `test-api-token-12345` |
| `PORT` | Porta do servidor | `8080` |
| `NODE_ENV` | Ambiente | `development` |
| `LOG_LEVEL` | Nível de log | `debug` |
| `JWT_SECRET` | Segredo para JWT | `your-secret-key` |
| `TOKEN_EXPIRATION` | Expiração do token (s) | `3600` |

### Persistência de Dados

Por padrão, os dados são armazenados em memória. Para persistir dados:

1. Descomentar volume no `docker-compose.yml`
2. Modificar `src/server.js` para usar sistema de arquivo

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs okta-mock

# Verificar portas em uso
lsof -i :8080
```

### Erro de autenticação

Verifique se o token está correto no header:
```bash
Authorization: SSWS test-api-token-12345
```

### Timeout ao conectar

Verifique se o container está rodando:
```bash
docker-compose ps
```

## 📚 Recursos

- [Okta SDK Node.js](https://github.com/okta/okta-sdk-nodejs)
- [Okta API Reference](https://developer.okta.com/docs/reference/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Integração com Outros Serviços

Para usar este mock server em outros containers Docker:

```yaml
services:
  your-service:
    environment:
      - OKTA_CLIENT_ORGURL=http://okta-mock:8080
      - OKTA_CLIENT_TOKEN=test-api-token-12345
    networks:
      - okta-network
    depends_on:
      okta-mock:
        condition: service_healthy
```

## 📝 Notas

- Este é um servidor MOCK apenas para testes
- Não use em produção
- Os dados são perdidos quando o container é reiniciado (a menos que configure persistência)
- As respostas simulam a API real do Okta, mas podem não incluir todos os campos

## 🔐 Segurança

⚠️ **IMPORTANTE**: Este ambiente é apenas para testes locais. Não exponha na internet e não use credenciais reais.

---

**Desenvolvido para testes locais do Okta SDK Node.js**
