# Dockerfile para Okta Mock Server
# Este container simula a API do Okta para testes locais

FROM node:18-alpine

# Informações do mantenedor
LABEL maintainer="Test Environment"
LABEL description="Okta Mock Server for testing"

# Criar diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache \
    bash \
    curl \
    jq

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências npm
RUN npm install --production

# Copiar código da aplicação
COPY . .

# Expor porta padrão do Okta
EXPOSE 8080

# Criar diretório para dados
RUN mkdir -p /app/data

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]
