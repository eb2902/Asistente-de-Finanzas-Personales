import 'reflect-metadata';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Mock the database and models BEFORE importing anything else
vi.mock('../../src/config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockReturnValue({})
    }),
    initialize: vi.fn().mockResolvedValue(true)
  }
}));

// Mock the User model to avoid TypeORM decorators
vi.mock('../../src/models/User', () => ({
  User: class User {
    id = 'test-id';
    email = 'test@test.com';
    password = 'hashedpassword';
    name = 'Test User';
    isActive = true;
    createdAt = new Date();
    updatedAt = new Date();
    
    hashPassword = async () => {};
    comparePassword = async () => true;
    toJSON = () => ({
      id: this.id,
      email: this.email,
      name: this.name,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }
}));

// Mock the Transaction model to avoid TypeORM decorators
vi.mock('../../src/models/Transaction', () => ({
  Transaction: class Transaction {
    id = 'test-id';
    userId = 'test-user-id';
    description = 'Test transaction';
    amount = 100;
    category = 'Alimentos';
    date = new Date();
    type = 'expense';
    createdAt = new Date();
    updatedAt = new Date();
    
    toJSON = () => ({
      id: this.id,
      userId: this.userId,
      description: this.description,
      amount: this.amount,
      category: this.category,
      date: this.date,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }
}));

// Mock the NLP service to avoid requiring OPENAI_API_KEY
vi.mock('../../src/services/nlp.service', () => ({
  NLPCategorizationService: class MockNLPCategorizationService {
    async categorizeTransaction() {
      return { category: 'Alimentos', confidence: 0.9 };
    }
  }
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}));

// Set environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '24h';
process.env.NODE_ENV = 'test';

// Import routes after mocks
import authRoutes from '../../src/routes/auth.routes';
import transactionRoutes from '../../src/routes/transactions.routes';

describe('Auth Flow Integration Tests', () => {
  const testApp = express();
  
  beforeAll(() => {
    testApp.use(express.json());
    testApp.use('/api/auth', authRoutes);
    testApp.use('/api/transactions', transactionRoutes);
  });

  describe('POST /api/auth/login', () => {
    it('debería retornar 401 con credenciales inválidas', async () => {
      const response = await request(testApp)
        .post('/api/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 400 con email inválido', async () => {
      const response = await request(testApp)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('debería retornar 400 sin password', async () => {
      const response = await request(testApp)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Protected Routes - /api/transactions', () => {
    const validToken = jwt.sign(
      { userId: '123', email: 'test@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const expiredToken = jwt.sign(
      { userId: '123', email: 'test@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '-1h' }
    );

    it('debería rechazar petición sin token (401)', async () => {
      const response = await request(testApp)
        .get('/api/transactions');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('No se proporcionó token');
    });

    it('debería rechazar petición con token inválido (403)', async () => {
      const response = await request(testApp)
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });

    it('debería rechazar petición con token expirado (403)', async () => {
      const response = await request(testApp)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('inválido o expirado');
    });
  });

  describe('JWT Token Generation', () => {
    it('debería generar un token JWT válido', () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@test.com');
    });

    it('debería fallar al verificar token con secret incorrecto', () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });

  describe('Health Check - Public Route', () => {
    it('debería permitir acceso a ruta pública sin autenticación', async () => {
      const response = await request(testApp)
        .get('/api/transactions/test');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
