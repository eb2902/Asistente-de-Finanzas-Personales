import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import logger from '../utils/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'asistente_finanzas_db',
  entities: [User, Transaction],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
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