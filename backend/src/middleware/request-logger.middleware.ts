import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

export interface RequestWithStartTime extends Request {
  startTime?: number;
  requestId?: string;
}

/**
 * Sensitive fields that should be sanitized from logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'jwt',
  'secret',
  'apiKey',
  'apikey',
  'creditCard',
  'cardNumber',
  'cvv',
  'pin'
];

/**
 * Sanitize sensitive data from objects
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeObject(item as Record<string, unknown>) 
          : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Extract or generate request ID for correlation tracking
 */
function getRequestId(req: Request): string {
  // Check for existing request ID in headers
  const existingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  if (existingId && typeof existingId === 'string') {
    return existingId;
  }
  
  // Generate new UUID using Node.js crypto
  return crypto.randomUUID();
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }
  
  return req.ip || 'unknown';
}

/**
 * Request logging middleware for production
 * Logs structured JSON with correlation IDs, timing, and sanitized data
 */
export function requestLogger(req: RequestWithStartTime, res: Response, next: NextFunction): void {
  // Generate or extract request ID
  req.requestId = getRequestId(req);
  req.startTime = Date.now();
  
  // Set request ID header for downstream services
  res.setHeader('X-Request-ID', req.requestId);
  
  // Capture response finish event
  const originalSend = res.send;
  res.send = function (data: unknown): Response {
    // Calculate response time
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;
    
    // Build log object
    const logData = {
      // Request identification
      requestId: req.requestId,
      correlationId: req.requestId,
      
      // HTTP details
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      query: req.query,
      protocol: req.protocol,
      
      // Client information
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      origin: req.headers['origin'],
      
      // Request headers (sanitized)
      headers: sanitizeObject({
        ...req.headers,
        authorization: req.headers['authorization'] ? '[PRESENT]' : undefined
      } as Record<string, unknown>),
      
      // Request body (sanitized)
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? sanitizeObject(req.body as Record<string, unknown> || {})
        : undefined,
      
      // Response information
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      
      // Performance
      responseTime: `${responseTime}ms`,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
      
      // Environment
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Determine log level based on status code
    let logLevel: 'error' | 'warn' | 'info' | 'debug' = 'info';
    
    if (res.statusCode >= 500) {
      logLevel = 'error';
    } else if (res.statusCode >= 400) {
      logLevel = 'warn';
    } else if (res.statusCode >= 300) {
      logLevel = 'debug';
    }
    
    // Log the request
    if (process.env.NODE_ENV === 'production') {
      // In production, always log as JSON object
      logger.log(logLevel, 'HTTP Request', logData);
    } else {
      // In development, log with more human-readable format
      const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const reset = '\x1b[0m';
      
      logger.log(
        logLevel,
        `${color}${req.method}${reset} ${req.originalUrl} ${color}${res.statusCode}${reset} ${responseTime}ms - ${req.requestId}`
      );
    }
    
    // Call original send method
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Error logging middleware - catches and logs errors with context
 */
export function errorLogger(err: Error, req: RequestWithStartTime, res: Response, next: NextFunction): void {
  const responseTime = req.startTime ? Date.now() - req.startTime : 0;
  
  const errorLogData = {
    // Request identification
    requestId: req.requestId || 'unknown',
    correlationId: req.requestId,
    
    // HTTP details
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    
    // Client information
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'],
    
    // Error information
    error: {
      name: err.name,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    
    // Response information
    statusCode: res.statusCode || 500,
    
    // Performance
    responseTime: `${responseTime}ms`,
    responseTimeMs: responseTime,
    timestamp: new Date().toISOString(),
    
    // Environment
    environment: process.env.NODE_ENV || 'development'
  };
  
  logger.error('Request error', errorLogData);
  
  // Pass to error handler
  next(err);
}

export default requestLogger;
