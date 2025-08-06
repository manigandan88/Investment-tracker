// investment.model.ts

export interface Investment {
  type: string;
  amount: number;
  startDate: Date;
  durationMonths: number;
  interestRate: number;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  type: 'one-time' | 'monthly';
}

export interface MonthlyIncome {
  id: string;
  source: string;
  description: string;
  amount: number;
  date: Date;
  type: 'monthly' | 'one-time';
}

export interface MonthlyBudget {
  month: string;
  income: number;
  expenses: number;
  investments: number;
  remaining: number;
}

export interface SavingsEntry {
  month: string;
  amount: number;
  source: 'remaining' | 'manual' | 'bonus';
}