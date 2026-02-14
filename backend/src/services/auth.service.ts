import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

const userRepository = AppDataSource.getRepository(User);

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
  expiresIn: string;
}

export class AuthService {
  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions & { expiresIn: string }
    );
  }

  /**
   * Register a new user
   */
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Create new user
    const user = new User();
    user.email = email;
    user.password = password;
    user.name = name;

    // Hash password
    await user.hashPassword();

    // Save user to database
    const savedUser = await userRepository.save(user);

    // Generate token
    const token = this.generateToken(savedUser);

    return {
      user: savedUser.toJSON(),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new Error('Cuenta inactiva. Por favor contacta al administrador.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }

  /**
   * Refresh token
   */
  static async refreshToken(userId: string): Promise<AuthResponse> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user || !user.isActive) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<User> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Update user profile (name and email)
   */
  static async updateProfile(userId: string, name: string, email: string): Promise<User> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('El correo electrónico ya está en uso');
      }
    }

    user.name = name;
    user.email = email;

    const updatedUser = await userRepository.save(user);
    return updatedUser;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Update password
    user.password = newPassword;
    await user.hashPassword();
    await userRepository.save(user);
  }

  /**
   * Update user preferences (theme, currency, language)
   */
  static async updatePreferences(userId: string, preferences: {
    theme?: string;
    currency?: string;
    language?: string;
  }): Promise<User> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (preferences.theme) {
      user.theme = preferences.theme;
    }
    if (preferences.currency) {
      user.currency = preferences.currency;
    }
    if (preferences.language) {
      user.language = preferences.language;
    }

    const updatedUser = await userRepository.save(user);
    return updatedUser;
  }

  /**
   * Update user notifications
   */
  static async updateNotifications(userId: string, notifications: {
    emailAlerts?: boolean;
    goalReminders?: boolean;
    weeklySummary?: boolean;
    aiSuggestions?: boolean;
  }): Promise<User> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (notifications.emailAlerts !== undefined) {
      user.emailAlerts = notifications.emailAlerts;
    }
    if (notifications.goalReminders !== undefined) {
      user.goalReminders = notifications.goalReminders;
    }
    if (notifications.weeklySummary !== undefined) {
      user.weeklySummary = notifications.weeklySummary;
    }
    if (notifications.aiSuggestions !== undefined) {
      user.aiSuggestions = notifications.aiSuggestions;
    }

    const updatedUser = await userRepository.save(user);
    return updatedUser;
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<void> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await userRepository.remove(user);
  }
}
