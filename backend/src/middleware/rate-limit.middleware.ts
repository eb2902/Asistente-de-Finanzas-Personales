import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../utils/logger';

/**
 * Middleware de rate limiting genérico para todas las rutas API
 * Límite: 100 solicitudes por 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, // Límite de 100 solicitudes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: (req: Request, res: Response) => {
    logger.warn(`Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Por favor, intenta más tarde.',
      retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
    });
  },
  skip: (_req) => {
    // No aplicar en entorno de desarrollo si está configurado
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  }
});

/**
 * Rate limiting específico para rutas de autenticación
 * Límite: 5 solicitudes por minuto para prevenir ataques de fuerza bruta
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 5, // Límite de 5 solicitudes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: (req: Request, res: Response) => {
    logger.warn(`Rate limit de auth excedido para IP: ${req.ip} - Posible ataque de fuerza bruta`);
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos',
      message: 'Has intentado demasiadas veces. Por seguridad, espera un minuto antes de intentar nuevamente.',
      retryAfter: 60
    });
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    // Usar ipKeyGenerator para manejar correctamente IPv4 e IPv6
    const ip = ipKeyGenerator(req.ip || '');
    const email = req.body?.email || '';
    return `${ip}-${email}`;
  }
});

/**
 * Rate limiting para rutas de transacciones
 * Límite: 30 solicitudes por minuto
 */
export const transactionsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 30, // Límite de 30 solicitudes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: (req: Request, res: Response) => {
    logger.warn(`Rate limit de transactions excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes para transacciones. Por favor, espera un momento.',
      retryAfter: 60
    });
  }
});

/**
 * Rate limiting para creación de recursos (POST/PUT)
 * Límite: 10 solicitudes por minuto
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 10, // Límite de 10 solicitudes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: (req: Request, res: Response) => {
    logger.warn(`Rate limit de creación excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes de creación. Por favor, espera un momento.',
      retryAfter: 60
    });
  }
});
