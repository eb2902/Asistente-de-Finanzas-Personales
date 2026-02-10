import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  targetAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentAmount!: number;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'float', default: 0.05 })
  interestRate!: number;

  @Column({ default: 12 })
  compoundFrequency!: number; // 12 = monthly, 1 = annually, etc.

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  // Method to validate goal data
  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (this.targetAmount <= 0) {
      errors.push('Target amount must be greater than 0');
    }
    
    if (this.currentAmount < 0) {
      errors.push('Current amount cannot be negative');
    }
    
    if (!this.startDate) {
      errors.push('Start date is required');
    }
    
    if (!this.endDate) {
      errors.push('End date is required');
    }
    
    if (this.startDate && this.endDate && new Date(this.startDate) >= new Date(this.endDate)) {
      errors.push('End date must be after start date');
    }
    
    if (this.interestRate < 0 || this.interestRate > 1) {
      errors.push('Interest rate must be between 0 and 1');
    }
    
    if (this.compoundFrequency < 1) {
      errors.push('Compound frequency must be at least 1');
    }
    
    return errors;
  }

  // Calculate progress percentage
  getProgress(): number {
    if (this.targetAmount <= 0) {
      return 0;
    }
    return Math.min((Number(this.currentAmount) / Number(this.targetAmount)) * 100, 100);
  }

  // Remove sensitive information before sending to client
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      targetAmount: Number(this.targetAmount),
      currentAmount: Number(this.currentAmount),
      startDate: this.startDate,
      endDate: this.endDate,
      interestRate: this.interestRate,
      compoundFrequency: this.compoundFrequency,
      userId: this.userId,
      progress: this.getProgress(),
      createdAt: this.createdAt?.toISOString()
    };
  }
}
