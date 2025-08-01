// app/investment.model.ts
export type InvestmentType = 'FD' | 'RD' | 'PPF' | 'Savings';

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
  type: 'monthly' | 'one-time'; // monthly for recurring, one-time for single expenses
}

export interface MonthlyBudget {
  month: string; // Format: 'YYYY-MM'
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  remainingAmount: number;
  expenses: Expense[];
}


export interface MonthlyIncome {
  id: string;
  source: string;
  description: string;
  amount: number;
  date: Date;
  type: 'monthly' | 'one-time';
}