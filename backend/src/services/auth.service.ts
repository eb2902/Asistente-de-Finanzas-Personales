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
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
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
}