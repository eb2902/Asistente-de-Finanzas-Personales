import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string; // Category name (e.g., "Alimentación", "Transporte")

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number; // Monthly budget amount

  @Column({ type: 'varchar', length: 7, default: null })
  month?: string; // Month in YYYY-MM format (optional - if not set, applies to all months)

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;

  // Method to validate budget data
  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.category || this.category.trim().length === 0) {
      errors.push('Category is required');
    }
    
    if (!this.amount || this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    // Validate month format if provided
    if (this.month && !/^\d{4}-\d{2}$/.test(this.month)) {
      errors.push('Month must be in YYYY-MM format');
    }
    
    return errors;
  }

  // Remove sensitive information before sending to client
  toJSON() {
    return {
      id: this.id,
      category: this.category,
      amount: Number(this.amount),
      month: this.month || null,
      userId: this.userId,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString()
    };
  }
}
