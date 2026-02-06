import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

const userRepository = AppDataSource.getRepository(User);

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
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
    console.error('Error en autenticación:', error);
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        select: ['id', 'email', 'name', 'isActive', 'createdAt', 'updatedAt']
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Si el token es inválido, simplemente continuamos sin autenticación
    next();
  }
};