import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import Joi from 'joi';
import logger from '../utils/logger';

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

// Apply auth rate limiter to register and login routes
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
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

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar usuario'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
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

  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al iniciar sesión'
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

  } catch (error) {
    logger.error('Profile error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener perfil'
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

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al renovar token'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente. Por favor, elimina el token del cliente.'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al cerrar sesión'
    });
  }
});

// Validation schemas for profile updates
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('dark', 'light', 'system').optional(),
  currency: Joi.string().valid('USD', 'EUR', 'ARS', 'MXN').optional(),
  language: Joi.string().valid('es', 'en', 'pt').optional()
});

const updateNotificationsSchema = Joi.object({
  emailAlerts: Joi.boolean().optional(),
  goalReminders: Joi.boolean().optional(),
  weeklySummary: Joi.boolean().optional(),
  aiSuggestions: Joi.boolean().optional()
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name and email)
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Validate request body
    const { error, value } = updateProfileSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: error.details.map(detail => detail.message)
      });
      return;
    }

    const { name, email } = value;
    const updatedUser = await AuthService.updateProfile(req.user.id, name, email);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedUser.toJSON()
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar perfil'
    });
  }
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: error.details.map(detail => detail.message)
      });
      return;
    }

    const { currentPassword, newPassword } = value;
    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar contraseña'
    });
  }
});

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user preferences (theme, currency, language)
 * @access  Private
 */
router.put('/preferences', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Validate request body
    const { error, value } = updatePreferencesSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: error.details.map(detail => detail.message)
      });
      return;
    }

    const updatedUser = await AuthService.updatePreferences(req.user.id, value);

    res.json({
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      data: updatedUser.toJSON()
    });

  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar preferencias'
    });
  }
});

/**
 * @route   PUT /api/auth/notifications
 * @desc    Update user notifications
 * @access  Private
 */
router.put('/notifications', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Validate request body
    const { error, value } = updateNotificationsSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: error.details.map(detail => detail.message)
      });
      return;
    }

    const updatedUser = await AuthService.updateNotifications(req.user.id, value);

    res.json({
      success: true,
      message: 'Notificaciones actualizadas exitosamente',
      data: updatedUser.toJSON()
    });

  } catch (error) {
    logger.error('Update notifications error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar notificaciones'
    });
  }
});

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    await AuthService.deleteAccount(req.user.id);

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });

  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar cuenta'
    });
  }
});

export default router;
