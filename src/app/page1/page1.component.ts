// page1.component.ts
import { Component, OnInit } from '@angular/core';
import { Investment, Expense, MonthlyIncome, MonthlyBudget } from 'src/app/investment.model';
import { ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-page1',
  templateUrl: './page1.component.html',
  styleUrls: ['./page1.component.scss']
})
export class Page1Component implements OnInit {
  // Investment properties
  investmentTypes = ['FD', 'RD', 'PPF', 'Savings'];
  chartType: ChartType = 'pie';
  newInvestment: Investment = {
    type: 'FD',
    amount: 0,
    startDate: new Date(),
    durationMonths: 12,
    interestRate: 0
  };
  investments: Investment[] = [];
  totalByType: { [key: string]: number } = {};
  pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  // Edit mode properties
  editingInvestmentIndex: number = -1;
  editingInvestment: Investment = {
    type: 'FD',
    amount: 0,
    startDate: new Date(),
    durationMonths: 12,
    interestRate: 0
  };

  // Expense properties
  expenseCategories = [
    'Food & Dining',
    'Petrol',
    'Tea & Coffee ',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Insurance',
    'Rent/EMI',
    'Investment',
    'Others'
  ];
  newExpense: Expense = {
    id: '',
    category: 'Food & Dining',
    description: '',
    amount: 0,
    date: new Date(),
    type: 'one-time',
    paymentMethod: 'cash'
  };
  expenses: Expense[] = [];
  expensesByCategory: { [key: string]: number } = {};
  
  // Filter properties - Updated for current month default
  showFilters: boolean = false;
  expenseFilterMonth: string = new Date().toISOString().substring(0, 7);
  expenseFilterCategory: string = '';
  expenseFilterType: string = '';
  expenseFilterPayment: string = '';
  filteredExpenses: Expense[] = [];
  filteredExpensesByCategory: { [key: string]: number } = {};
  
  // NEW: Flag to track if custom filters are applied
  hasCustomFilters: boolean = false;

  // Income properties
  incomeSources = [
    'Salary',
    'Freelance',
    'Business',
    'Investment Returns',
    'Rental Income',
    'Bonus',
    'Commission',
    'Part-time Job',
    'Others'
  ];
  newIncome: MonthlyIncome = {
    id: '',
    source: 'Salary',
    description: '',
    amount: 0,
    date: new Date(),
    type: 'one-time'
  };
  incomes: MonthlyIncome[] = [];
  incomesBySource: { [key: string]: number } = {};

  // Budget and Savings properties
  activeTab: string = 'investments';
  selectedMonth: string = new Date().toISOString().substring(0, 7);
  savingsHistory: Array<{month: string, amount: number, source: string}> = [];
  
  budgetChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  ngOnInit() {
    this.loadFromLocal();
    
    // Add 'Investment' to expense categories if not present
    if (!this.expenseCategories.includes('Investment')) {
      this.expenseCategories.push('Investment');
    }
    
    this.generateAutomaticInvestmentExpenses();
    this.updateBudgetSummary();
    this.applyCurrentMonthFilter(); // Apply current month filter by default
    this.setupPeriodicExpenseCheck();
    this.autoSaveRemainingAmount();
  }

  // NEW: Method to apply current month filter by default
  applyCurrentMonthFilter() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    this.expenseFilterMonth = currentMonth;
    this.hasCustomFilters = false; // Reset custom filter flag
    this.filterExpensesByMonth();
  }

  // NEW: Check if any custom filters are applied
  checkForCustomFilters() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    this.hasCustomFilters = 
      this.expenseFilterMonth !== currentMonth ||
      this.expenseFilterCategory !== '' ||
      this.expenseFilterType !== '' ||
      this.expenseFilterPayment !== '';
  }

  // for table current month expense
  get currentMonthExpenses() {
    const now = new Date();
    return this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    });
  }

  // NEW: Get display expenses based on filter state
  get displayExpenses() {
    // If no custom filters are applied, show current month only
    if (!this.hasCustomFilters) {
      return this.currentMonthExpenses;
    }
    // If custom filters are applied, show filtered results
    return this.filteredExpenses;
  }

  // NEW: Get display expenses by category based on filter state
  get displayExpensesByCategory() {
    if (!this.hasCustomFilters) {
      return this.expensesByCategoryThisMonth;
    }
    return this.filteredExpensesByCategory;
  }

  // for template iteration
  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  get expensesByCategoryThisMonth() {
    const breakdown: { [key: string]: number } = {};
    this.currentMonthExpenses.forEach(exp => {
      if (!breakdown[exp.category]) {
        breakdown[exp.category] = 0;
      }
      breakdown[exp.category] += exp.amount;
    });
    return breakdown;
  }

  // Tab Management
  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'budget') {
      this.updateBudgetSummary();
    }
  }

  // Filter toggle methods - Updated
  toggleFilters() {
    this.showFilters = !this.showFilters;
    if (this.showFilters) {
      this.checkForCustomFilters();
    }
    this.saveFilterSettings();
  }

  clearFilters() {
    this.expenseFilterMonth = new Date().toISOString().substring(0, 7);
    this.expenseFilterCategory = '';
    this.expenseFilterType = '';
    this.expenseFilterPayment = '';
    this.hasCustomFilters = false;
    this.applyCurrentMonthFilter(); // Use the new method
    this.saveFilterSettings();
  }

  // NEW: Reset to current month only
  resetToCurrentMonth() {
    this.applyCurrentMonthFilter();
    this.saveFilterSettings();
  }

  // Investment Edit Methods
  startEditInvestment(index: number) {
    this.editingInvestmentIndex = index;
    this.editingInvestment = { ...this.investments[index] };
    console.log('Editing investment:', this.editingInvestment);
  }

  cancelEditInvestment() {
    this.editingInvestmentIndex = -1;
    this.editingInvestment = {
      type: 'FD',
      amount: 0,
      startDate: new Date(),
      durationMonths: 12,
      interestRate: 0
    };
  }

  saveEditInvestment() {
    if (this.editingInvestmentIndex >= 0 && this.editingInvestmentIndex < this.investments.length) {
      // Handle PPF duration
      if (this.editingInvestment.type === 'PPF') {
        this.editingInvestment.durationMonths = 180; // 15 years
      }

      // Update the investment
      this.investments[this.editingInvestmentIndex] = { ...this.editingInvestment };
      
      // Regenerate auto expenses if it's a monthly investment
      this.cleanupInactiveInvestmentExpenses();
      if (this.editingInvestment.type === 'RD' || this.editingInvestment.type === 'PPF') {
        this.generateAutomaticInvestmentExpenses();
      }
      
      this.saveToLocal();
      this.updateChart();
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
      
      // Reset edit mode
      this.cancelEditInvestment();
      
      alert('Investment updated successfully!');
    }
  }

  deleteInvestment(index: number) {
    const investment = this.investments[index];
    const confirmMessage = `Are you sure you want to delete this ${investment.type} investment of ₹${investment.amount.toLocaleString()}?`;
    
    if (confirm(confirmMessage)) {
      // Remove the investment
      this.investments.splice(index, 1);
      
      // Clean up related auto-generated expenses
      this.cleanupInactiveInvestmentExpenses();
      
      // Update everything
      this.saveToLocal();
      this.updateChart();
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
      
      // Reset edit mode if we were editing this investment
      if (this.editingInvestmentIndex === index) {
        this.cancelEditInvestment();
      } else if (this.editingInvestmentIndex > index) {
        this.editingInvestmentIndex--;
      }
      
      alert('Investment deleted successfully!');
    }
  }

  isEditingInvestment(index: number): boolean {
    return this.editingInvestmentIndex === index;
  }

  // Helper methods for investment editing
  getInvestmentTypes(): string[] {
    return this.investmentTypes;
  }

  isDurationEditable(investmentType: string): boolean {
    return investmentType !== 'PPF' && investmentType !== 'Savings';
  }

  getDurationDisplayForEdit(investment: Investment): string {
    if (investment.type === 'PPF') {
      return '180'; // 15 years in months
    }
    return investment.durationMonths?.toString() || '12';
  }

  // Payment Method Helper Methods - Updated for display context
  getTotalCashExpenses(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse
      .filter(expense => expense.paymentMethod === 'cash')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalAccountExpenses(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse
      .filter(expense => expense.paymentMethod === 'account')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getCashExpenseCount(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse.filter(expense => expense.paymentMethod === 'cash').length;
  }

  getAccountExpenseCount(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse.filter(expense => expense.paymentMethod === 'account').length;
  }

  // NEW: Get total expenses based on current display context
  getTotalDisplayExpenses(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse.reduce((sum, expense) => sum + expense.amount, 0);
  }

  // NEW: Get one-time expenses for current display
  getTotalDisplayOneTimeExpenses(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse
      .filter(expense => expense.type === 'one-time')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  // NEW: Get monthly expenses for current display
  getTotalDisplayMonthlyExpenses(): number {
    const expensesToUse = this.hasCustomFilters ? this.filteredExpenses : this.currentMonthExpenses;
    return expensesToUse
      .filter(expense => expense.type === 'monthly')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getFilteredCashExpenses(): number {
    return this.filteredExpenses
      .filter(expense => expense.paymentMethod === 'cash')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getFilteredAccountExpenses(): number {
    return this.filteredExpenses
      .filter(expense => expense.paymentMethod === 'account')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getMonthlyCashExpensesForMonth(month: string): number {
    return this.calculateMonthlyAmount(
      this.expenses.filter(exp => exp.paymentMethod === 'cash'), 
      month, 
      'expense'
    );
  }


  getNetAccountBalance(): number {
    return this.getTotalIncome() - this.getTotalAccountExpenses();
  }

  getNetAvailableAmount(): number {
    return this.getMonthlyIncomeForMonth(this.selectedMonth) - 
           this.getMonthlyAccountExpensesForMonth(this.selectedMonth);
  }

  // Savings Methods (updated to use net available amount)
  getSavingsFromInvestments(): number {
    return this.investments
      .filter(inv => inv.type === 'Savings')
      .reduce((sum: number, inv) => sum + inv.amount, 0);
  }

  getCurrentMonthSavings(): number {
    return this.savingsHistory
      .filter(entry => entry.month === this.selectedMonth)
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  getTotalSavings(): number {
    const allAdditions = this.savingsHistory.reduce((sum, entry) => sum + entry.amount, 0);
    return this.getSavingsFromInvestments() + allAdditions;
  }

  get savingsDisplay() {
    return {
      initial: this.getSavingsFromInvestments(),
      currentMonth: this.getCurrentMonthSavings(),
      total: this.getTotalSavings()
    };
  }

  autoSaveRemainingAmount() {
    const netAvailableAmount = this.getNetAvailableAmount();
    if (netAvailableAmount > 0) {
      const existingIndex = this.savingsHistory.findIndex(entry => entry.month === this.selectedMonth);
      const newEntry = {
        month: this.selectedMonth,
        amount: netAvailableAmount,
        source: 'remaining'
      };
      
      if (existingIndex >= 0) {
        this.savingsHistory[existingIndex] = newEntry;
      } else {
        this.savingsHistory.push(newEntry);
      }
      this.saveToLocal();
    } else if (netAvailableAmount <= 0) {
      this.savingsHistory = this.savingsHistory.filter(entry => entry.month !== this.selectedMonth);
      this.saveToLocal();
    }
  }

  addRemainingToSavings() {
    const netAvailableAmount = this.getNetAvailableAmount();
    if (netAvailableAmount > 0) {
      this.autoSaveRemainingAmount();
      alert(`₹${netAvailableAmount.toLocaleString()} has been added to your savings for ${this.getMonthDisplay(this.selectedMonth)}!`);
    } else {
      alert('No net surplus amount available to add to savings.');
    }
  }

  // Investment Methods
  addInvestment() {
    if (this.newInvestment.type === 'PPF') {
      this.newInvestment.durationMonths = 180; // 15 years
    }
    
    this.investments.push({ ...this.newInvestment });
    
    // Generate automatic expenses for the new investment if it's monthly
    if (this.newInvestment.type === 'RD' || this.newInvestment.type === 'PPF') {
      this.generateAutomaticInvestmentExpenses();
    }
    
    this.saveToLocal();
    console.log('New investment added:', this.newInvestment);
    this.updateChart();
    
    // Reset form
    this.newInvestment = {
      type: 'FD',
      amount: 0,
      startDate: new Date(),
      durationMonths: 12,
      interestRate: 0
    };
    this.updateBudgetSummary();
    this.autoSaveRemainingAmount();
  }

  // Expense Methods (updated)
  addExpense() {
    this.newExpense.id = this.generateId();
    
    // Ensure paymentMethod is set (default to 'cash' if undefined)
    if (!this.newExpense.paymentMethod) {
      this.newExpense.paymentMethod = 'cash';
    }
    
    this.expenses.push({ ...this.newExpense });
    this.saveToLocal();
    console.log('New expense added:', this.newExpense);
    this.updateExpenseSummary();
    this.applyCurrentFilterLogic(); // Updated to use new filter logic
    
    // Reset form
    this.newExpense = {
      id: '',
      category: 'Food & Dining',
      description: '',
      amount: 0,
      date: new Date(),
      type: 'one-time',
      paymentMethod: 'cash'
    };
    this.updateBudgetSummary();
    this.autoSaveRemainingAmount();
  }

  deleteExpense(expenseId: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
      this.saveToLocal();
      this.updateExpenseSummary();
      this.applyCurrentFilterLogic(); // Updated to use new filter logic
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
    }
  }

  // Income Methods
  addIncome() {
    this.newIncome.id = this.generateId();
    this.incomes.push({ ...this.newIncome });
    this.saveToLocal();
    console.log('New income added:', this.newIncome);
    this.updateIncomeSummary();
    
    // Reset form
    this.newIncome = {
      id: '',
      source: 'Salary',
      description: '',
      amount: 0,
      date: new Date(),
      type: 'monthly'
    };
    this.updateBudgetSummary();
    this.autoSaveRemainingAmount();
  }

  deleteIncome(incomeId: string) {
    if (confirm('Are you sure you want to delete this income?')) {
      this.incomes = this.incomes.filter(income => income.id !== incomeId);
      this.saveToLocal();
      this.updateIncomeSummary();
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
    }
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // NEW: Apply current filter logic based on state
  applyCurrentFilterLogic() {
    if (this.hasCustomFilters) {
      this.filterExpensesByMonth();
    } else {
      this.updateCurrentMonthSummary();
    }
  }

  // NEW: Update current month summary
  updateCurrentMonthSummary() {
    // Update the category breakdown for current month
    this.expensesByCategoryThisMonth;
  }

  // Expense filtering methods (updated)
  filterExpensesByMonth() {
    this.checkForCustomFilters(); // Check if custom filters are applied
    
    if (!this.hasCustomFilters) {
      // If no custom filters, use current month data
      this.filteredExpenses = this.currentMonthExpenses;
      this.updateFilteredExpenseSummary();
      return;
    }

    // Apply custom filters
    if (!this.expenseFilterMonth) {
      this.filteredExpenses = [...this.expenses];
    } else {
      const [year, month] = this.expenseFilterMonth.split('-').map(Number);
      
      this.filteredExpenses = this.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth() + 1;
        
        let dateMatch = false;
        
        dateMatch = expenseYear === year && expenseMonth === month;
        
        const categoryMatch = !this.expenseFilterCategory || expense.category === this.expenseFilterCategory;
        const typeMatch = !this.expenseFilterType || expense.type === this.expenseFilterType;
        const paymentMatch = !this.expenseFilterPayment || expense.paymentMethod === this.expenseFilterPayment;
        
        return dateMatch && categoryMatch && typeMatch && paymentMatch;
      });
    }
    
    this.updateFilteredExpenseSummary();
    this.saveFilterSettings();
  }

  updateFilteredExpenseSummary() {
    this.filteredExpensesByCategory = {};
    this.filteredExpenses.forEach(expense => {
      this.filteredExpensesByCategory[expense.category] = 
        (this.filteredExpensesByCategory[expense.category] || 0) + expense.amount;
    });
  }

  getFilteredExpenseTotal(): number {
    return this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  updateExpenseSummary() {
    this.expensesByCategory = {};
    this.expenses.forEach(expense => {
      this.expensesByCategory[expense.category] = 
        (this.expensesByCategory[expense.category] || 0) + expense.amount;
    });
  }

  updateIncomeSummary() {
    this.incomesBySource = {};
    this.incomes.forEach(income => {
      this.incomesBySource[income.source] = 
        (this.incomesBySource[income.source] || 0) + income.amount;
    });
  }

  // Consolidated total calculation methods - Updated for all-time totals

  private isCurrentMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

getTotalOneTimeExpenses(): number {
  return this.expenses
    .filter(expense => expense.type === 'one-time' && this.isCurrentMonth(new Date(expense.date)))
    .reduce((sum, expense) => sum + expense.amount, 0);
}

getTotalMonthlyExpenses(): number {
  return this.expenses
    .filter(expense => expense.type === 'monthly' && this.isCurrentMonth(new Date(expense.date)))
    .reduce((sum, expense) => sum + expense.amount, 0);
}

getTotalExpenses(): number {
  return this.expenses
    .filter(expense => this.isCurrentMonth(new Date(expense.date)))
    .reduce((sum, expense) => sum + expense.amount, 0);
}

getTotalMonthlyIncome(): number {
  return this.incomes
    .filter(income => income.type === 'monthly' && this.isCurrentMonth(new Date(income.date)))
    .reduce((sum, income) => sum + income.amount, 0);
}

getTotalOneTimeIncome(): number {
  return this.incomes
    .filter(income => income.type === 'one-time' && this.isCurrentMonth(new Date(income.date)))
    .reduce((sum, income) => sum + income.amount, 0);
}

getTotalIncome(): number {
  return this.incomes
    .filter(income => this.isCurrentMonth(new Date(income.date)))
    .reduce((sum, income) => sum + income.amount, 0);
}


get currentMonthIncomesBySource() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const filtered = this.incomes.filter(income => {
    const d = new Date(income.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return filtered.reduce((acc, income) => {
    acc[income.source] = (acc[income.source] || 0) + income.amount;
    return acc;
  }, {} as { [key: string]: number });
}

// objectKeys = Object.keys;





get currentMonthIncomes() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return this.incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return (
      incomeDate.getMonth() === currentMonth &&
      incomeDate.getFullYear() === currentYear
    );
  });
}


  // Budget Methods (updated for payment methods)
  updateBudgetSummary() {
    const monthlyIncome = this.getMonthlyIncomeForMonth(this.selectedMonth);
    const monthlyAccountExpenses = this.getMonthlyAccountExpensesForMonth(this.selectedMonth);
    const monthlyCashExpenses = this.getMonthlyCashExpensesForMonth(this.selectedMonth);
    const monthlyInvestments = this.getMonthlyInvestmentsForMonth(this.selectedMonth);
    const netAvailable = monthlyIncome - monthlyAccountExpenses;

    // Update budget chart - showing account vs cash expenses
    this.budgetChartData = {
      labels: ['Account Expenses', 'Cash Expenses', 'Investments', 'Net Available'],
      datasets: [{
        data: [monthlyAccountExpenses, monthlyCashExpenses, monthlyInvestments, Math.max(0, netAvailable)],
        backgroundColor: [
          '#FF6384', // Red for account expenses
          '#FF9F40', // Orange for cash expenses
          '#36A2EB', // Blue for investments
          '#4BC0C0'  // Teal for net available
        ]
      }]
    };

    // Update auto-savings based on net available
    this.autoSaveRemainingAmount();
  }

  private calculateMonthlyAmount(items: any[], month: string, type: 'income' | 'expense'): number {
    const [year, monthNum] = month.split('-').map(Number);
    
    return items
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === year && 
               itemDate.getMonth() === monthNum - 1;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getMonthlyIncomeForMonth(month: string): number {
    return this.calculateMonthlyAmount(this.incomes, month, 'income');
  }

getMonthlyExpensesForMonth(month: string): number {
  const accountExpenses = this.getMonthlyAccountExpensesForMonth(month);
  const cashExpenses = this.getMonthlyCashExpensesForMonth(month);
  return accountExpenses + cashExpenses;
}

  getMonthlyAccountExpensesForMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    
    return this.expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return exp.paymentMethod === 'account' &&
               expDate.getFullYear() === year &&
               expDate.getMonth() + 1 === monthNum;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  getMonthlyInvestmentsForMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    const selectedDate = new Date(year, monthNum - 1, 1);
    
    return this.investments
      .filter(investment => {
        if (investment.type === 'PPF' || investment.type === 'RD') {
          const startDate = new Date(investment.startDate);
          const endDate = this.invEndDate(startDate, investment.durationMonths);
          
          return selectedDate >= startDate && selectedDate <= endDate;
        }
        return false;
      })
      .reduce((sum, investment) => sum + investment.amount, 0);
  }

  getRemainingAmount(): number {
    return this.getMonthlyIncomeForMonth(this.selectedMonth) - 
           this.getMonthlyExpensesForMonth(this.selectedMonth);
  }

  getMonthDisplay(month: string): string {
    if (!month) return 'All Time';
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  // Storage Methods (updated)
  saveToLocal() {
    const data = {
      investments: this.investments,
      expenses: this.expenses,
      incomes: this.incomes,
      savingsHistory: this.savingsHistory,
      filterSettings: {
        showFilters: this.showFilters,
        expenseFilterMonth: this.expenseFilterMonth,
        expenseFilterCategory: this.expenseFilterCategory,
        expenseFilterType: this.expenseFilterType,
        expenseFilterPayment: this.expenseFilterPayment,
        hasCustomFilters: this.hasCustomFilters // NEW: Save custom filter state
      }
    };
    localStorage.setItem('financialData', JSON.stringify(data));
  }

  saveFilterSettings() {
    const data = JSON.parse(localStorage.getItem('financialData') || '{}');
    data.filterSettings = {
      showFilters: this.showFilters,
      expenseFilterMonth: this.expenseFilterMonth,
      expenseFilterCategory: this.expenseFilterCategory,
      expenseFilterType: this.expenseFilterType,
      expenseFilterPayment: this.expenseFilterPayment,
      hasCustomFilters: this.hasCustomFilters // NEW: Save custom filter state
    };
    localStorage.setItem('financialData', JSON.stringify(data));
  }

  loadFromLocal() {
    const saved = localStorage.getItem('financialData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Load investments
        if (parsed.investments) {
          this.investments = parsed.investments.map((inv: any) => ({
            ...inv,
            startDate: new Date(inv.startDate)
          }));
          this.updateChart();
        }
        
        // Load expenses (updated to handle paymentMethod)
        if (parsed.expenses) {
          this.expenses = parsed.expenses.map((exp: any) => ({
            ...exp,
            date: new Date(exp.date),
            paymentMethod: exp.paymentMethod || 'account'
          }));
          this.updateExpenseSummary();
        }
        
        // Load incomes
        if (parsed.incomes) {
          this.incomes = parsed.incomes.map((inc: any) => ({
            ...inc,
            date: new Date(inc.date)
          }));
          this.updateIncomeSummary();
        }

        // Load savings data (handle legacy currentSavings)
        if (parsed.currentSavings !== undefined) {
          if (this.getSavingsFromInvestments() === 0 && parsed.currentSavings > 0) {
            this.investments.push({
              type: 'Savings',
              amount: parsed.currentSavings,
              startDate: new Date(),
              durationMonths: 0,
              interestRate: 0
            });
            this.updateChart();
          }
        }
        if (parsed.savingsHistory) {
          this.savingsHistory = parsed.savingsHistory;
        }

        // Load filter settings (updated)
        if (parsed.filterSettings) {
          this.showFilters = parsed.filterSettings.showFilters || false;
          this.expenseFilterMonth = parsed.filterSettings.expenseFilterMonth || new Date().toISOString().substring(0, 7);
          this.expenseFilterCategory = parsed.filterSettings.expenseFilterCategory || '';
          this.expenseFilterType = parsed.filterSettings.expenseFilterType || '';
          this.expenseFilterPayment = parsed.filterSettings.expenseFilterPayment || '';
          this.hasCustomFilters = parsed.filterSettings.hasCustomFilters || false;
        }
        
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }

  // Clear methods
  clearAllInvestments() {
    if (confirm('Are you sure you want to clear all investments? This will also remove auto-generated expenses.')) {
      this.expenses = this.expenses.filter(expense => !expense.id.startsWith('auto_'));
      this.investments = [];
      this.saveToLocal();
      this.updateChart();
      this.updateExpenseSummary();
      this.applyCurrentFilterLogic();
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
    }
  }

  clearAllExpenses() {
    if (confirm('Are you sure you want to clear all expenses? This cannot be undone.')) {
      this.expenses = [];
      this.saveToLocal();
      this.updateExpenseSummary();
      this.applyCurrentFilterLogic();
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
    }
  }

  clearAllIncomes() {
    if (confirm('Are you sure you want to clear all incomes? This cannot be undone.')) {
      this.incomes = [];
      this.saveToLocal();
      this.updateIncomeSummary();
      this.updateBudgetSummary();
      this.autoSaveRemainingAmount();
    }
  }

  // Investment calculation methods
  invEndDate(start: Date, duration: number): Date {
    const result = new Date(start);
    result.setMonth(result.getMonth() + duration);
    return result;
  }

  getMonthsElapsed(startDate: Date): number {
    const now = new Date();
    const start = new Date(startDate);
    
    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months += now.getMonth() - start.getMonth();
    
    if (now.getDate() >= start.getDate()) {
      months += 1;
    }
    
    return Math.max(0, months);
  }

  getMaturityAndCurrentValue(investment: Investment): {
    currentValue: number;
    maturityValue: number;
    investedSoFar: number;
  } {
    const r = investment.interestRate / 100;
    const monthsElapsed = this.getMonthsElapsed(investment.startDate);
    const totalMonths = investment.type === 'PPF' ? 180 : investment.durationMonths;
    
    let current = 0, maturity = 0, invested = 0;

    switch (investment.type) {
      case 'FD':
        invested = investment.amount;
        const yearsElapsed = monthsElapsed / 12;
        const totalYears = totalMonths / 12;
        
        current = investment.amount * Math.pow(1 + r, yearsElapsed);
        maturity = investment.amount * Math.pow(1 + r, totalYears);
        break;

      case 'RD':
        invested = investment.amount * monthsElapsed;
        
        current = 0;
        for (let month = 1; month <= monthsElapsed; month++) {
          const monthsEarningInterest = monthsElapsed - month;
          current += investment.amount * Math.pow(1 + r/12, monthsEarningInterest);
        }
        
        maturity = 0;
        for (let month = 1; month <= totalMonths; month++) {
          const monthsEarningInterest = totalMonths - month + 1;
          maturity += investment.amount * Math.pow(1 + r/12, monthsEarningInterest - 1);
        }
        break;

      case 'PPF':
        const monthsElapsedPPF = Math.min(180, monthsElapsed);
        invested = investment.amount * monthsElapsedPPF;

        const yearlyContributions = investment.amount * 12;
        const yearsElapsedPPF = Math.floor(monthsElapsedPPF / 12);
        const remainingMonths = monthsElapsedPPF % 12;
        
        current = 0;
        
        for (let year = 1; year <= yearsElapsedPPF; year++) {
          const yearsEarningInterest = yearsElapsedPPF - year + 1;
          current += yearlyContributions * Math.pow(1 + r, yearsEarningInterest);
        }

        current += investment.amount * remainingMonths;
        
        maturity = 0;
        for (let year = 1; year <= 15; year++) {
          const yearsEarningInterest = 15 - year + 1;
          maturity += yearlyContributions * Math.pow(1 + r, yearsEarningInterest);
        }
        break;

      case 'Savings':
        invested = investment.amount;
        const savingsYears = monthsElapsed / 12;
        current = investment.amount * (1 + r * savingsYears);
        maturity = investment.amount * (1 + r * (totalMonths / 12));
        break;
    }

    return {
      currentValue: Math.round(current),
      maturityValue: Math.round(maturity),
      investedSoFar: Math.round(invested)
    };
  }

  updateChart() {
    const grouped: { [key: string]: number } = {};
    this.totalByType = {};

    this.investments.forEach(inv => {
      const { maturityValue, investedSoFar } = this.getMaturityAndCurrentValue(inv);
      grouped[inv.type] = (grouped[inv.type] || 0) + maturityValue;
      this.totalByType[inv.type] = (this.totalByType[inv.type] || 0) + investedSoFar;
    });

    this.pieChartData = {
      labels: Object.keys(grouped),
      datasets: [{
        data: Object.values(grouped),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ]
      }]
    };

    console.log('Updated pie data:', this.pieChartData);
    console.log('Total by type:', this.totalByType);
  }

  // Helper methods for display
  getEndDateDisplay(investment: Investment): string {
    if (investment.type === 'PPF') {
      return 'After 15 Years';
    }
    return this.invEndDate(investment.startDate, investment.durationMonths).toLocaleDateString('en-GB');
  }

  getAmountDisplay(investment: Investment): string {
    if (investment.type === 'FD' || investment.type === 'Savings') {
      return `₹${investment.amount.toLocaleString()}`;
    } else if (investment.type === 'PPF') {
      return `₹${investment.amount.toLocaleString()} / Month (₹${(investment.amount * 12).toLocaleString()} / Year)`;
    } else {
      return `₹${investment.amount.toLocaleString()} / Month`;
    }
  }

  getTotalInvested(): number {
    return Object.keys(this.totalByType).reduce((sum, key) => sum + this.totalByType[key], 0);
  }

  getTotalCurrentValue(): number {
    return this.investments.reduce((sum, inv) => sum + this.getMaturityAndCurrentValue(inv).currentValue, 0);
  }

  getTotalMaturityValue(): number {
    return this.investments.reduce((sum, inv) => sum + this.getMaturityAndCurrentValue(inv).maturityValue, 0);
  }

  getMonthlyBreakdown(investment: Investment): string[] {
    if (investment.type !== 'RD' && investment.type !== 'PPF') {
      return [];
    }

    const breakdown: string[] = [];
    const startDate = new Date(investment.startDate);
    const today = new Date();

    const dueDay = startDate.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let current = new Date(startDate);

    while (
      current.getFullYear() < today.getFullYear() ||
      (current.getFullYear() === today.getFullYear() && current.getMonth() < today.getMonth()) ||
      (current.getFullYear() === today.getFullYear() &&
       current.getMonth() === today.getMonth() &&
       dueDay <= today.getDate())
    ) {
      const monthName = monthNames[current.getMonth()];
      const year = current.getFullYear().toString().slice(-2);

      breakdown.push(`${monthName} ${year}: ₹${investment.amount.toLocaleString()}`);

      current.setMonth(current.getMonth() + 1);
    }

    return breakdown;
  }

  hasMonthlyBreakdown(investment: Investment): boolean {
    return (investment.type === 'RD' || investment.type === 'PPF') && 
           this.getMonthsElapsed(investment.startDate) > 0;
  }

  getTotalMonthlySpend(): number {
    return this.getMonthlyExpensesForMonth(this.selectedMonth);
  }

  // Auto-generated investment expense methods (updated for payment method)
  generateAutomaticInvestmentExpenses() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthlyInvestments = this.investments.filter(inv => 
      inv.type === 'RD' || inv.type === 'PPF'
    );

    monthlyInvestments.forEach(investment => {
      const startDate = new Date(investment.startDate);
      const endDate = this.invEndDate(startDate, investment.durationMonths);
      
      if (today >= startDate && today <= endDate) {
        const expenseId = `auto_${investment.type}_${currentYear}_${currentMonth}_${this.investments.indexOf(investment)}`;
        
        const existingExpense = this.expenses.find(exp => exp.id === expenseId);
        
        if (!existingExpense) {
          const autoExpense: Expense = {
            id: expenseId,
            category: 'Investment',
            description: `Auto: ${investment.type} Monthly Payment`,
            amount: investment.amount,
            date: new Date(currentYear, currentMonth, startDate.getDate()),
            type: 'monthly',
            paymentMethod: 'account'
          };
          
          this.expenses.push(autoExpense);
          console.log(`Auto-generated expense for ${investment.type}:`, autoExpense);
        }
      }
    });
    
    this.updateExpenseSummary();
    this.applyCurrentFilterLogic();
    this.saveToLocal();
  }

  generateHistoricalInvestmentExpenses() {
    const monthlyInvestments = this.investments.filter(inv => 
      inv.type === 'RD' || inv.type === 'PPF'
    );

    monthlyInvestments.forEach(investment => {
      const startDate = new Date(investment.startDate);
      const endDate = this.invEndDate(startDate, investment.durationMonths);
      const today = new Date();
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate && currentDate <= today) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const expenseId = `auto_${investment.type}_${year}_${month}_${this.investments.indexOf(investment)}`;
        const existingExpense = this.expenses.find(exp => exp.id === expenseId);
        
        if (!existingExpense) {
          const autoExpense: Expense = {
            id: expenseId,
            category: 'Investment',
            description: `Auto: ${investment.type} Monthly Payment`,
            amount: investment.amount,
            date: new Date(year, month, startDate.getDate()),
            type: 'monthly',
            paymentMethod: 'account'
          };
          
          this.expenses.push(autoExpense);
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    });
    
    this.updateExpenseSummary();
    this.applyCurrentFilterLogic();
    this.saveToLocal();
  }

  cleanupInactiveInvestmentExpenses() {
    // Get all auto-generated expenses
    const autoExpenses = this.expenses.filter(expense => expense.id.startsWith('auto_'));
    
    // Remove expenses that don't have corresponding investments
    this.expenses = this.expenses.filter(expense => {
      if (!expense.id.startsWith('auto_')) {
        return true; // Keep non-auto expenses
      }
      
      // For auto expenses, check if the source investment still exists
      const parts = expense.id.split('_');
      if (parts.length >= 4) {
        const investmentIndex = parseInt(parts[parts.length - 1]);
        const investment = this.investments[investmentIndex];
        
        if (!investment) {
          return false; // Remove if investment doesn't exist
        }
        
        // Check if investment type matches
        const expenseType = parts[1]; // RD or PPF
        return investment.type === expenseType;
      }
      
      return false; // Remove malformed auto expenses
    });
    
    this.updateExpenseSummary();
    this.applyCurrentFilterLogic();
  }

  checkAndGenerateInvestmentExpenses() {
    const today = new Date();
    
    this.investments.forEach(investment => {
      if (investment.type === 'RD' || investment.type === 'PPF') {
        const startDate = new Date(investment.startDate);
        const endDate = this.invEndDate(startDate, investment.durationMonths);
        
        const isDueToday = today.getDate() === startDate.getDate() && 
                          today >= startDate && today <= endDate;
        
        if (isDueToday) {
          const currentYear = today.getFullYear();
          const currentMonth = today.getMonth();
          const expenseId = `auto_${investment.type}_${currentYear}_${currentMonth}_${this.investments.indexOf(investment)}`;
          
          const existingExpense = this.expenses.find(exp => exp.id === expenseId);
          
          if (!existingExpense) {
            const autoExpense: Expense = {
              id: expenseId,
              category: 'Investment',
              description: `Auto: ${investment.type} Monthly Payment - Due Today`,
              amount: investment.amount,
              date: new Date(),
              type: 'monthly',
              paymentMethod: 'account'
            };
            
            this.expenses.push(autoExpense);
            this.updateExpenseSummary();
            this.applyCurrentFilterLogic();
            this.saveToLocal();
            
            alert(`Investment due today: ${investment.type} - ₹${investment.amount}`);
          }
        }
      }
    });
  }

  setupPeriodicExpenseCheck() {
    this.checkAndGenerateInvestmentExpenses();
    
    setInterval(() => {
      this.checkAndGenerateInvestmentExpenses();
    }, 24 * 60 * 60 * 1000);
  }

  manuallyGenerateInvestmentExpenses() {
    if (confirm('Generate automatic investment expenses for all active investments?')) {
      this.generateHistoricalInvestmentExpenses();
      alert('Investment expenses generated successfully!');
    }
  }

  // Helper methods for auto-generated expenses
  hasAutoGeneratedExpenses(): boolean {
    return this.expenses.some(expense => expense.id.startsWith('auto_'));
  }

  getAutoExpensesForCurrentMonth(): number {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return this.expenses
      .filter(expense => {
        if (!expense.id.startsWith('auto_')) return false;
        
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalAutoExpenses(): number {
    return this.expenses
      .filter(expense => expense.id.startsWith('auto_'))
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getUpcomingInvestmentDueDates(): Array<{investment: Investment, dueDate: Date, amount: number}> {
    const today = new Date();
    const upcomingDues: Array<{investment: Investment, dueDate: Date, amount: number}> = [];
    
    this.investments.forEach(investment => {
      if (investment.type === 'RD' || investment.type === 'PPF') {
        const startDate = new Date(investment.startDate);
        const endDate = this.invEndDate(startDate, investment.durationMonths);
        
        const nextDue = new Date(today.getFullYear(), today.getMonth(), startDate.getDate());
        
        if (nextDue < today) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }
        
        if (nextDue <= endDate) {
          upcomingDues.push({
            investment: investment,
            dueDate: nextDue,
            amount: investment.amount
          });
        }
      }
    });
    
    return upcomingDues.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  isAutoGeneratedExpense(expense: Expense): boolean {
    return expense.id.startsWith('auto_');
  }

  getSourceInvestmentForExpense(expense: Expense): Investment | null {
    if (!this.isAutoGeneratedExpense(expense)) return null;
    
    const parts = expense.id.split('_');
    if (parts.length >= 4) {
      const investmentIndex = parseInt(parts[parts.length - 1]);
      return this.investments[investmentIndex] || null;
    }
    
    return null;
  }
}