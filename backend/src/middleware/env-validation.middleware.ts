import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to validate required environment variables
 */
export function validateEnvironment(req: Request, res: Response, next: NextFunction): void {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'DATABASE_URL'
  ];

  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars.join(', '));
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
      error: 'Missing required environment variables',
      missing: missingVars
    });
    return;
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long');
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
      error: 'JWT_SECRET must be at least 32 characters long'
    });
    return;
  }

  // Validate OPENAI_API_KEY format (basic check)
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    logger.error('OPENAI_API_KEY format is invalid');
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
      error: 'OPENAI_API_KEY format is invalid'
    });
    return;
  }

  next();
}

/**
 * Function to validate environment variables at startup
 */
export function validateEnvironmentAtStartup(): void {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'DATABASE_URL'
  ];

  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars.join(', '));
    logger.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long');
    logger.error('Please update your .env file with a secure JWT secret.');
    process.exit(1);
  }

  // Validate OPENAI_API_KEY format (basic check)
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    logger.error('OPENAI_API_KEY format is invalid');
    logger.error('Please check your OpenAI API key format.');
    process.exit(1);
  }

  logger.info('Environment variables validation passed');
}