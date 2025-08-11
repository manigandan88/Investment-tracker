// investment.model.ts

export interface Investment {
  type: string;
  amount: number;
  startDate: Date;
  durationMonths: number;
  interestRate: number;
}

export interface Expense {
  paymentMethod: string;
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
  totalIncome: number;
  totalExpenses: number;
  totalAccountExpenses: number; // NEW: Track account expenses separately
  totalCashExpenses: number; // NEW: Track cash expenses separately
  totalInvestments: number;
  netAvailable: number; // NEW: Net available after account expenses
  savingsAdded: number;
}

export interface SavingsEntry {
  month: string;
  amount: number;
  source: 'remaining' | 'manual' | 'bonus';
    type: 'income' | 'expense';
  date: Date;
}