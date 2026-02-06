import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ nullable: true })
  category?: string; // AI-generated category

  @Column({ type: 'float', nullable: true })
  confidence?: number; // AI confidence score (0-1)

  @Column()
  type!: 'income' | 'expense'; // Transaction type

  @Column({ nullable: true })
  merchant?: string; // Optional merchant name

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  // Method to validate transaction data
  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }
    
    if (this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (!this.type || !['income', 'expense'].includes(this.type)) {
      errors.push('Type must be either "income" or "expense"');
    }
    
    if (this.category && this.category.trim().length === 0) {
      errors.push('Category cannot be empty if provided');
    }
    
    if (this.confidence !== null && this.confidence !== undefined) {
      if (this.confidence < 0 || this.confidence > 1) {
        errors.push('Confidence must be between 0 and 1');
      }
    }
    
    return errors;
  }

  // Remove sensitive information before sending to client
  toJSON() {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      category: this.category,
      confidence: this.confidence,
      type: this.type,
      merchant: this.merchant,
      userId: this.userId,
      createdAt: this.createdAt
    };
  }
}