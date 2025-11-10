const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Armazenamento em memória (simulação)
const mockData = {
  users: new Map(),
  groups: new Map(),
  applications: new Map(),
  tokens: new Map()
};

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      errorCode: 'E0000011',
      errorSummary: 'Invalid token provided' 
    });
  }

  if (token !== process.env.OKTA_API_TOKEN) {
    return res.status(403).json({ 
      errorCode: 'E0000011',
      errorSummary: 'Invalid token provided' 
    });
  }

  next();
};

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'okta-mock-server'
  });
});

// API v1 - Users
app.get('/api/v1/users', authenticateToken, (req, res) => {
  const users = Array.from(mockData.users.values());
  res.json(users);
});

app.get('/api/v1/users/:id', authenticateToken, (req, res) => {
  const user = mockData.users.get(req.params.id);
  if (!user) {
    return res.status(404).json({
      errorCode: 'E0000007',
      errorSummary: `Not found: Resource not found: ${req.params.id} (User)`
    });
  }
  res.json(user);
});

app.post('/api/v1/users', authenticateToken, (req, res) => {
  const userId = uuidv4();
  const user = {
    id: userId,
    status: 'ACTIVE',
    created: new Date().toISOString(),
    activated: new Date().toISOString(),
    lastLogin: null,
    lastUpdated: new Date().toISOString(),
    profile: {
      firstName: req.body.profile?.firstName || '',
      lastName: req.body.profile?.lastName || '',
      email: req.body.profile?.email || '',
      login: req.body.profile?.login || req.body.profile?.email || '',
      mobilePhone: req.body.profile?.mobilePhone || null
    },
    credentials: {
      provider: {
        type: 'OKTA',
        name: 'OKTA'
      }
    },
    _links: {
      self: {
        href: `http://${process.env.OKTA_DOMAIN}/api/v1/users/${userId}`
      }
    }
  };
  
  mockData.users.set(userId, user);
  res.status(201).json(user);
});

app.put('/api/v1/users/:id', authenticateToken, (req, res) => {
  const user = mockData.users.get(req.params.id);
  if (!user) {
    return res.status(404).json({
      errorCode: 'E0000007',
      errorSummary: `Not found: Resource not found: ${req.params.id} (User)`
    });
  }

  const updatedUser = {
    ...user,
    profile: {
      ...user.profile,
      ...req.body.profile
    },
    lastUpdated: new Date().toISOString()
  };

  mockData.users.set(req.params.id, updatedUser);
  res.json(updatedUser);
});

app.delete('/api/v1/users/:id', authenticateToken, (req, res) => {
  const user = mockData.users.get(req.params.id);
  if (!user) {
    return res.status(404).json({
      errorCode: 'E0000007',
      errorSummary: `Not found: Resource not found: ${req.params.id} (User)`
    });
  }

  mockData.users.delete(req.params.id);
  res.status(204).send();
});

// API v1 - Groups
app.get('/api/v1/groups', authenticateToken, (req, res) => {
  const groups = Array.from(mockData.groups.values());
  res.json(groups);
});

app.post('/api/v1/groups', authenticateToken, (req, res) => {
  const groupId = uuidv4();
  const group = {
    id: groupId,
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    lastMembershipUpdated: new Date().toISOString(),
    objectClass: ['okta:user_group'],
    type: 'OKTA_GROUP',
    profile: {
      name: req.body.profile?.name || '',
      description: req.body.profile?.description || ''
    },
    _links: {
      self: {
        href: `http://${process.env.OKTA_DOMAIN}/api/v1/groups/${groupId}`
      }
    }
  };

  mockData.groups.set(groupId, group);
  res.status(201).json(group);
});

// API v1 - Applications
app.get('/api/v1/apps', authenticateToken, (req, res) => {
  const apps = Array.from(mockData.applications.values());
  res.json(apps);
});

app.post('/api/v1/apps', authenticateToken, (req, res) => {
  const appId = uuidv4();
  const app = {
    id: appId,
    name: req.body.name || 'oidc_client',
    label: req.body.label || 'Test Application',
    status: 'ACTIVE',
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    signOnMode: req.body.signOnMode || 'OPENID_CONNECT',
    credentials: {
      oauthClient: {
        client_id: uuidv4(),
        client_secret: uuidv4(),
        autoKeyRotation: true
      }
    },
    settings: req.body.settings || {},
    _links: {
      self: {
        href: `http://${process.env.OKTA_DOMAIN}/api/v1/apps/${appId}`
      }
    }
  };

  mockData.applications.set(appId, app);
  res.status(201).json(app);
});

// OAuth 2.0 Token Endpoint
app.post('/oauth2/default/v1/token', (req, res) => {
  const token = jwt.sign(
    { 
      sub: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    },
    JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRATION || '3600s' }
  );

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: parseInt(process.env.TOKEN_EXPIRATION) || 3600,
    scope: 'openid profile email'
  });
});

// OIDC Configuration
app.get('/.well-known/openid-configuration', (req, res) => {
  res.json({
    issuer: `http://${process.env.OKTA_DOMAIN}/oauth2/default`,
    authorization_endpoint: `http://${process.env.OKTA_DOMAIN}/oauth2/default/v1/authorize`,
    token_endpoint: `http://${process.env.OKTA_DOMAIN}/oauth2/default/v1/token`,
    userinfo_endpoint: `http://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`,
    jwks_uri: `http://${process.env.OKTA_DOMAIN}/oauth2/default/v1/keys`,
    response_types_supported: ['code', 'token', 'id_token'],
    grant_types_supported: ['authorization_code', 'implicit', 'refresh_token', 'client_credentials'],
    subject_types_supported: ['public']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    errorCode: 'E0000009',
    errorSummary: 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    errorCode: 'E0000007',
    errorSummary: 'Not found: Resource not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Okta Mock Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Token: ${process.env.OKTA_API_TOKEN}`);
  console.log(`🌐 Domain: ${process.env.OKTA_DOMAIN}`);
});

module.exports = app;
