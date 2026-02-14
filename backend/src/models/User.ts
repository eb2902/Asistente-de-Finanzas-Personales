import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import bcrypt from 'bcryptjs';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  currency: 'USD' | 'EUR' | 'ARS' | 'MXN';
  language: 'es' | 'en' | 'pt';
}

export interface UserNotifications {
  emailAlerts: boolean;
  goalReminders: boolean;
  weeklySummary: boolean;
  aiSuggestions: boolean;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  // Preferences
  @Column({ default: 'dark' })
  theme!: string;

  @Column({ default: 'USD' })
  currency!: string;

  @Column({ default: 'es' })
  language!: string;

  // Notifications
  @Column({ default: true })
  emailAlerts!: boolean;

  @Column({ default: true })
  goalReminders!: boolean;

  @Column({ default: true })
  weeklySummary!: boolean;

  @Column({ default: true })
  aiSuggestions!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // Method to hash password before saving
  async hashPassword(): Promise<void> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Method to compare password
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Remove sensitive information before sending to client
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      isActive: this.isActive,
      preferences: {
        theme: this.theme,
        currency: this.currency,
        language: this.language
      },
      notifications: {
        emailAlerts: this.emailAlerts,
        goalReminders: this.goalReminders,
        weeklySummary: this.weeklySummary,
        aiSuggestions: this.aiSuggestions
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
