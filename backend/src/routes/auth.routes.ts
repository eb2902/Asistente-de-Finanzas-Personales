import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import Joi from 'joi';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validación fallida',
        details: error.details.map(detail => detail.message)
      });
      return;
    }

    const { email, password, name } = value;

    // Register user
    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result
    });

  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al registrar usuario'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validación fallida',
        details: error.details.map(detail => detail.message)
      });
      return;
    }

    const { email, password } = value;

    // Login user
    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Error al iniciar sesión'
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const user = await AuthService.getProfile(req.user.id);

    res.json({
      success: true,
      data: user.toJSON()
    });

  } catch (error: any) {
    console.error('Error en perfil:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al obtener perfil'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const result = await AuthService.refreshToken(req.user.id);

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: result
    });

  } catch (error: any) {
    console.error('Error en refresh:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al renovar token'
    });
  }
});

export default router;