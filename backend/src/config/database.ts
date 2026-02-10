import { DataSource } from 'typeorm';
import { Pool } from 'pg';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import logger from '../utils/logger';

// Cargar dotenv para asegurar que las variables de entorno estén disponibles
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/asistente_finanzas_db';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Transaction],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  extra: {
    ssl: false,
    application_name: 'asistente-finanzas-backend'
  }
});

// Create a pg pool for health checks
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
});

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};
