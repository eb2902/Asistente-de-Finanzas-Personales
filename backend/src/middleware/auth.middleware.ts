import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import logger from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);

export interface AuthRequest extends Request {
  user?: User;
}

interface JwtPayload {
  userId: string;
  email: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Find user in database
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'email', 'name', 'isActive', 'createdAt', 'updatedAt']
    });

    if (!user || !user.isActive) {
      res.status(403).json({ error: 'Token inválido o usuario inactivo.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        select: ['id', 'email', 'name', 'isActive', 'createdAt', 'updatedAt']
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch {
    // Si el token es inválido, simplemente continuamos sin autenticación
    next();
  }
};
