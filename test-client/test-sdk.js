const okta = require('@okta/okta-sdk-nodejs');
require('dotenv').config();

// Configurar cliente Okta
const client = new okta.Client({
  orgUrl: process.env.OKTA_CLIENT_ORGURL || 'http://okta-mock:8080',
  token: process.env.OKTA_CLIENT_TOKEN || 'test-api-token-12345'
});

async function testOktaSDK() {
  console.log('🧪 Testando Okta SDK Node.js...\n');

  try {
    // Teste 1: Listar usuários
    console.log('📋 Teste 1: Listar usuários');
    const usersResponse = await client.userApi.listUsers();
    const users = usersResponse.users || [];
    users.forEach(user => {
      console.log(`  ✓ Usuário encontrado: ${user.profile.email}`);
    });
    console.log(`  Total: ${users.length} usuário(s)\n`);

    // Teste 2: Criar novo usuário
    console.log('👤 Teste 2: Criar novo usuário');
    const newUser = {
      profile: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        login: 'test.user@example.com'
      }
    };
    
    const createdUser = await client.userApi.createUser({ body: newUser });
    console.log(`  ✓ Usuário criado: ${createdUser.profile.email}`);
    console.log(`  ID: ${createdUser.id}\n`);

    // Teste 3: Buscar usuário por ID
    console.log('🔍 Teste 3: Buscar usuário por ID');
    const foundUser = await client.userApi.getUser({ userId: createdUser.id });
    console.log(`  ✓ Usuário encontrado: ${foundUser.profile.email}\n`);

    // Teste 4: Atualizar usuário
    console.log('✏️  Teste 4: Atualizar usuário');
    foundUser.profile.firstName = 'Updated';
    const updatedUser = await client.userApi.updateUser({
      userId: foundUser.id,
      user: foundUser
    });
    console.log(`  ✓ Usuário atualizado: ${updatedUser.profile.firstName} ${updatedUser.profile.lastName}\n`);

    // Teste 5: Listar grupos
    console.log('👥 Teste 5: Listar grupos');
    const groupsResponse = await client.groupApi.listGroups();
    const groups = groupsResponse.groups || [];
    groups.forEach(group => {
      console.log(`  ✓ Grupo encontrado: ${group.profile.name}`);
    });
    console.log(`  Total: ${groups.length} grupo(s)\n`);

    // Teste 6: Criar novo grupo
    console.log('➕ Teste 6: Criar novo grupo');
    const newGroup = {
      profile: {
        name: 'Test Group',
        description: 'Test group created by SDK'
      }
    };
    
    const createdGroup = await client.groupApi.createGroup({ group: newGroup });
    console.log(`  ✓ Grupo criado: ${createdGroup.profile.name}`);
    console.log(`  ID: ${createdGroup.id}\n`);

    // Teste 7: Deletar usuário
    console.log('🗑️  Teste 7: Deletar usuário de teste');
    await client.userApi.deactivateUser({ userId: createdUser.id });
    await client.userApi.deleteUser({ userId: createdUser.id });
    console.log(`  ✓ Usuário deletado com sucesso\n`);

    console.log('✅ Todos os testes passaram!\n');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
    process.exit(1);
  }
}

// Executar testes
testOktaSDK();
