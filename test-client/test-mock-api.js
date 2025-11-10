#!/usr/bin/env node

const http = require('http');

const OKTA_URL = process.env.OKTA_CLIENT_ORGURL || 'http://localhost:8080';
const API_TOKEN = process.env.OKTA_CLIENT_TOKEN || 'test-api-token-12345';

// Função auxiliar para fazer requisições
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, OKTA_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Authorization': `SSWS ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } else {
          reject({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testOktaMockServer() {
  console.log('🧪 Testando Okta Mock Server...\n');

  try {
    // Teste 1: Health Check
    console.log('💚 Teste 1: Health Check');
    const health = await makeRequest('GET', '/health');
    console.log(`  ✓ Status: ${health.data.status}`);
    console.log(`  ✓ Service: ${health.data.service}\n`);

    // Teste 2: Listar usuários
    console.log('📋 Teste 2: Listar usuários');
    const usersListBefore = await makeRequest('GET', '/api/v1/users');
    console.log(`  ✓ Usuários encontrados: ${usersListBefore.data.length}\n`);

    // Teste 3: Criar novo usuário
    console.log('👤 Teste 3: Criar novo usuário');
    const newUser = {
      profile: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        login: 'test.user@example.com',
        mobilePhone: '+55 11 98765-4321'
      }
    };
    
    const createResponse = await makeRequest('POST', '/api/v1/users', newUser);
    const createdUser = createResponse.data;
    console.log(`  ✓ Usuário criado: ${createdUser.profile.email}`);
    console.log(`  ✓ ID: ${createdUser.id}`);
    console.log(`  ✓ Status: ${createdUser.status}\n`);

    // Teste 4: Buscar usuário por ID
    console.log('🔍 Teste 4: Buscar usuário por ID');
    const getResponse = await makeRequest('GET', `/api/v1/users/${createdUser.id}`);
    const foundUser = getResponse.data;
    console.log(`  ✓ Usuário encontrado: ${foundUser.profile.firstName} ${foundUser.profile.lastName}`);
    console.log(`  ✓ Email: ${foundUser.profile.email}\n`);

    // Teste 5: Atualizar usuário
    console.log('✏️  Teste 5: Atualizar usuário');
    const updateData = {
      profile: {
        ...foundUser.profile,
        firstName: 'Updated',
        lastName: 'TestUser'
      }
    };
    
    const updateResponse = await makeRequest('PUT', `/api/v1/users/${createdUser.id}`, updateData);
    const updatedUser = updateResponse.data;
    console.log(`  ✓ Usuário atualizado: ${updatedUser.profile.firstName} ${updatedUser.profile.lastName}\n`);

    // Teste 6: Criar grupo
    console.log('👥 Teste 6: Criar grupo');
    const newGroup = {
      profile: {
        name: 'Test Group',
        description: 'Grupo de teste criado via API'
      }
    };
    
    const groupResponse = await makeRequest('POST', '/api/v1/groups', newGroup);
    const createdGroup = groupResponse.data;
    console.log(`  ✓ Grupo criado: ${createdGroup.profile.name}`);
    console.log(`  ✓ ID: ${createdGroup.id}`);
    console.log(`  ✓ Tipo: ${createdGroup.type}\n`);

    // Teste 7: Listar grupos
    console.log('📋 Teste 7: Listar grupos');
    const groupsList = await makeRequest('GET', '/api/v1/groups');
    console.log(`  ✓ Grupos encontrados: ${groupsList.data.length}`);
    groupsList.data.forEach(group => {
      console.log(`    - ${group.profile.name}: ${group.profile.description || 'Sem descrição'}`);
    });
    console.log();

    // Teste 8: Criar aplicação
    console.log('📱 Teste 8: Criar aplicação');
    const newApp = {
      name: 'oidc_client',
      label: 'Test Application',
      signOnMode: 'OPENID_CONNECT',
      settings: {
        oauthClient: {
          redirect_uris: ['http://localhost:3000/callback'],
          response_types: ['code'],
          grant_types: ['authorization_code']
        }
      }
    };
    
    const appResponse = await makeRequest('POST', '/api/v1/apps', newApp);
    const createdApp = appResponse.data;
    console.log(`  ✓ Aplicação criada: ${createdApp.label}`);
    console.log(`  ✓ ID: ${createdApp.id}`);
    console.log(`  ✓ SignOnMode: ${createdApp.signOnMode}\n`);

    // Teste 9: Listar aplicações
    console.log('📋 Teste 9: Listar aplicações');
    const appsList = await makeRequest('GET', '/api/v1/apps');
    console.log(`  ✓ Aplicações encontradas: ${appsList.data.length}\n`);

    // Teste 10: Obter token OAuth
    console.log('🔑 Teste 10: Obter token OAuth');
    const tokenResponse = await makeRequest('POST', '/oauth2/default/v1/token', {
      grant_type: 'client_credentials'
    });
    console.log(`  ✓ Token obtido: ${tokenResponse.data.access_token.substring(0, 50)}...`);
    console.log(`  ✓ Tipo: ${tokenResponse.data.token_type}`);
    console.log(`  ✓ Expira em: ${tokenResponse.data.expires_in}s\n`);

    // Teste 11: Deletar usuário
    console.log('🗑️  Teste 11: Deletar usuário de teste');
    await makeRequest('DELETE', `/api/v1/users/${createdUser.id}`);
    console.log(`  ✓ Usuário deletado com sucesso\n`);

    // Teste 12: Verificar OIDC Configuration
    console.log('🔧 Teste 12: OIDC Configuration');
    const oidcConfig = await makeRequest('GET', '/.well-known/openid-configuration');
    console.log(`  ✓ Issuer: ${oidcConfig.data.issuer}`);
    console.log(`  ✓ Authorization endpoint: ${oidcConfig.data.authorization_endpoint}`);
    console.log(`  ✓ Token endpoint: ${oidcConfig.data.token_endpoint}\n`);

    console.log('✅ Todos os testes passaram com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`  - Usuários criados e testados: ✓`);
    console.log(`  - Grupos criados e testados: ✓`);
    console.log(`  - Aplicações criadas e testadas: ✓`);
    console.log(`  - OAuth/OIDC funcionando: ✓`);
    console.log(`  - Operações CRUD: ✓\n`);

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message || error);
    if (error.status) {
      console.error('  Status HTTP:', error.status);
    }
    if (error.data) {
      console.error('  Dados:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

// Executar testes
testOktaMockServer();
